import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from ipl_app.models import Team, Player, Match, Delivery

class Command(BaseCommand):
    help = 'Load IPL data from CSV files (matches.csv and deliveries.csv)'

    def add_arguments(self, parser):
        parser.add_argument('--matches-file', type=str, required=True,
                          help='Path to matches.csv file')
        parser.add_argument('--deliveries-file', type=str, required=True,
                          help='Path to deliveries.csv file')

    def handle(self, *args, **options):
        matches_file = options['matches_file']
        deliveries_file = options['deliveries_file']

        # Validate file existence
        if not os.path.exists(matches_file):
            raise CommandError(f'Matches file "{matches_file}" does not exist.')
        
        if not os.path.exists(deliveries_file):
            raise CommandError(f'Deliveries file "{deliveries_file}" does not exist.')

        self.stdout.write('Starting IPL data loading process...')

        try:
            with transaction.atomic():
                # Load teams and matches first
                self.load_matches(matches_file)
                
                # Load deliveries (which depend on matches, teams, and players)
                self.load_deliveries(deliveries_file)
                
            self.stdout.write(
                self.style.SUCCESS('Successfully loaded IPL data!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading data: {str(e)}')
            )
            raise

    def load_matches(self, matches_file):
        self.stdout.write('Loading matches data...')
        
        with open(matches_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Create teams if they don't exist
                team1, _ = Team.objects.get_or_create(
                    name=row['team1'],
                    defaults={'short_name': row['team1'][:10]}
                )
                team2, _ = Team.objects.get_or_create(
                    name=row['team2'],
                    defaults={'short_name': row['team2'][:10]}
                )
                
                # Handle toss winner
                toss_winner = None
                if row.get('toss_winner'):
                    toss_winner, _ = Team.objects.get_or_create(
                        name=row['toss_winner'],
                        defaults={'short_name': row['toss_winner'][:10]}
                    )
                
                # Handle winner
                winner = None
                if row.get('winner'):
                    winner, _ = Team.objects.get_or_create(
                        name=row['winner'],
                        defaults={'short_name': row['winner'][:10]}
                    )
                
                # Handle player of match
                player_of_match = None
                if row.get('player_of_match'):
                    player_of_match, _ = Player.objects.get_or_create(
                        name=row['player_of_match']
                    )
                
                # Parse date - handle multiple date formats
                try:
                    if '/' in row['date']:
                        # Format: MM/DD/YYYY or DD/MM/YYYY
                        date_obj = datetime.strptime(row['date'], '%m/%d/%Y').date()
                    else:
                        # Format: YYYY-MM-DD
                        date_obj = datetime.strptime(row['date'], '%Y-%m-%d').date()
                except ValueError:
                    try:
                        # Try alternative format
                        date_obj = datetime.strptime(row['date'], '%d/%m/%Y').date()
                    except ValueError:
                        self.stdout.write(
                            self.style.WARNING(f'Could not parse date: {row["date"]}, using default')
                        )
                        date_obj = datetime.strptime('2008-01-01', '%Y-%m-%d').date()
                
                # Create match
                Match.objects.get_or_create(
                    match_id=int(row['id']),
                    defaults={
                        'season': row.get('season', '2008'),
                        'city': row.get('city', ''),
                        'date': date_obj,
                        'team1': team1,
                        'team2': team2,
                        'toss_winner': toss_winner,
                        'toss_decision': row.get('toss_decision', '').lower(),
                        'result': row.get('result', 'normal'),
                        'dl_applied': row.get('dl_applied', '0') == '1',
                        'winner': winner,
                        'win_by_runs': int(row.get('win_by_runs', 0) or 0),
                        'win_by_wickets': int(row.get('win_by_wickets', 0) or 0),
                        'player_of_match': player_of_match,
                        'venue': row.get('venue', ''),
                        'umpire1': row.get('umpire1', ''),
                        'umpire2': row.get('umpire2', ''),
                        'umpire3': row.get('umpire3', ''),
                    }
                )
        
        self.stdout.write(f'Loaded {Match.objects.count()} matches')

    def load_deliveries(self, deliveries_file):
        self.stdout.write('Loading deliveries data...')
        
        with open(deliveries_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            batch_size = 1000
            deliveries_batch = []
            
            for i, row in enumerate(reader):
                try:
                    # Get match
                    match = Match.objects.get(match_id=int(row['match_id']))
                    
                    # Get or create teams
                    batting_team, _ = Team.objects.get_or_create(
                        name=row['batting_team'],
                        defaults={'short_name': row['batting_team'][:10]}
                    )
                    bowling_team, _ = Team.objects.get_or_create(
                        name=row['bowling_team'],
                        defaults={'short_name': row['bowling_team'][:10]}
                    )
                    
                    # Get or create players
                    batsman, _ = Player.objects.get_or_create(name=row['batsman'])
                    non_striker, _ = Player.objects.get_or_create(name=row['non_striker'])
                    bowler, _ = Player.objects.get_or_create(name=row['bowler'])
                    
                    # Handle dismissed player
                    player_dismissed = None
                    if row.get('player_dismissed'):
                        player_dismissed, _ = Player.objects.get_or_create(
                            name=row['player_dismissed']
                        )
                    
                    # Handle fielder
                    fielder = None
                    if row.get('fielder'):
                        fielder, _ = Player.objects.get_or_create(name=row['fielder'])
                    
                    delivery = Delivery(
                        match=match,
                        inning=int(row['inning']),
                        batting_team=batting_team,
                        bowling_team=bowling_team,
                        over=int(row['over']),
                        ball=int(row['ball']),
                        batsman=batsman,
                        non_striker=non_striker,
                        bowler=bowler,
                        is_super_over=row.get('is_super_over', '0') == '1',
                        wide_runs=int(row.get('wide_runs', 0) or 0),
                        bye_runs=int(row.get('bye_runs', 0) or 0),
                        legbye_runs=int(row.get('legbye_runs', 0) or 0),
                        noball_runs=int(row.get('noball_runs', 0) or 0),
                        penalty_runs=int(row.get('penalty_runs', 0) or 0),
                        batsman_runs=int(row.get('batsman_runs', 0) or 0),
                        extra_runs=int(row.get('extra_runs', 0) or 0),
                        total_runs=int(row.get('total_runs', 0) or 0),
                        player_dismissed=player_dismissed,
                        dismissal_kind=row.get('dismissal_kind', ''),
                        fielder=fielder,
                    )
                    
                    deliveries_batch.append(delivery)
                    
                    # Bulk create in batches
                    if len(deliveries_batch) >= batch_size:
                        Delivery.objects.bulk_create(deliveries_batch)
                        deliveries_batch = []
                        self.stdout.write(f'Loaded {i + 1} deliveries...')
                
                except Match.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Match {row["match_id"]} not found, skipping delivery')
                    )
                    continue
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error processing delivery {i + 1}: {str(e)}')
                    )
                    continue
            
            # Create remaining deliveries
            if deliveries_batch:
                Delivery.objects.bulk_create(deliveries_batch)
        
        self.stdout.write(f'Loaded {Delivery.objects.count()} deliveries')