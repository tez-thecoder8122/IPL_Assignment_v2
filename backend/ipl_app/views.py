from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, F, Q
from .models import Team, Player, Match, Delivery
from .serializers import (
    TeamSerializer, PlayerSerializer, MatchSerializer, DeliverySerializer,
    MatchesPerYearSerializer, TeamWinsStackedSerializer, ExtraRunsPerTeamSerializer,
    EconomicalBowlerSerializer, MatchesPlayedVsWonSerializer
)

class TeamListCreateView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerListCreateView(generics.ListCreateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all().select_related('team1', 'team2', 'winner', 'player_of_match')
    serializer_class = MatchSerializer


@api_view(['GET'])
def matches_per_year(request):
    try:
        matches_data = Match.objects.values('season').annotate(
            matches_count=Count('match_id')
        ).order_by('season')
        formatted_data = []
        for item in matches_data:
            formatted_data.append({
                'year': item['season'],
                'matches_count': item['matches_count']
            })
        
        serializer = MatchesPerYearSerializer(formatted_data, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Matches per year data retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Task 2: For the Stacked Graph in the Landing Page..
@api_view(['GET'])
def team_wins_stacked(request):
    try:
        wins_data = Match.objects.filter(winner__isnull=False).values(
            'season', 'winner__name'
        ).annotate(
            wins=Count('match_id')
        ).order_by('season', 'winner__name')
        
        # Transform data for stacked bar chart
        formatted_data = []
        for item in wins_data:
            formatted_data.append({
                'team': item['winner__name'],
                'year': item['season'],
                'wins': item['wins']
            })
        
        serializer = TeamWinsStackedSerializer(formatted_data, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Team wins stacked data retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Task 3: For the year "YYYY" plot the extra runs conceded per team
@api_view(['GET'])
def extra_runs_per_team(request, year):
    try:
        extra_runs_data = Delivery.objects.filter(
            match__season=year
        ).values('bowling_team__name').annotate(
            extra_runs=Sum('extra_runs')
        ).order_by('-extra_runs')
        
        formatted_data = []
        for item in extra_runs_data:
            formatted_data.append({
                'team': item['bowling_team__name'],
                'extra_runs': item['extra_runs'] or 0
            })
        
        serializer = ExtraRunsPerTeamSerializer(formatted_data, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'year': year,
            'message': f'Extra runs per team for {year} retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Task 4: For the year "YYYY" plot the top economical bowlers
@api_view(['GET'])
def economical_bowlers(request, year):
    try:
        bowler_stats = Delivery.objects.filter(
            match__season=year
        ).values('bowler__name').annotate(
            total_runs=Sum('total_runs'),
            total_balls=Count('id'),
            wickets=Count('player_dismissed', filter=Q(player_dismissed__isnull=False))
        ).filter(total_balls__gte=60) 
        
        formatted_data = []
        for bowler in bowler_stats:
            overs = bowler['total_balls'] / 6.0
            economy = bowler['total_runs'] / overs if overs > 0 else 0
            
            formatted_data.append({
                'bowler': bowler['bowler__name'],
                'economy_rate': round(economy, 2),
                'overs_bowled': round(overs, 1),
                'runs_conceded': bowler['total_runs'],
                'wickets_taken': bowler['wickets']
            })
        formatted_data.sort(key=lambda x: x['economy_rate'])
        top_bowlers = formatted_data[:15]
        
        serializer = EconomicalBowlerSerializer(top_bowlers, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'year': year,
            'message': f'Top economical bowlers for {year} retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Task 5: For the year "YYYY" plot a chart for matches played vs matches won for each team
@api_view(['GET'])
def matches_played_vs_won(request, year):
    try:
        # Get all teams that played in the specified year
        teams_in_year = Match.objects.filter(season=year).values_list('team1', 'team2').distinct()
        team_ids = set()
        for match in teams_in_year:
            team_ids.add(match[0])
            team_ids.add(match[1])
        
        team_stats = []
        for team_id in team_ids:
            team = Team.objects.get(id=team_id)
            
            matches_played = Match.objects.filter(
                season=year
            ).filter(
                Q(team1=team) | Q(team2=team)
            ).count()
            
            matches_won = Match.objects.filter(
                season=year,
                winner=team
            ).count()
            
            win_percentage = (matches_won / matches_played * 100) if matches_played > 0 else 0
            
            team_stats.append({
                'team': team.name,
                'matches_played': matches_played,
                'matches_won': matches_won,
                'win_percentage': round(win_percentage, 2)
            })
        team_stats.sort(key=lambda x: x['matches_won'], reverse=True)
        
        serializer = MatchesPlayedVsWonSerializer(team_stats, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'year': year,
            'message': f'Matches played vs won for {year} retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Get all available years/seasons in the database
@api_view(['GET'])
def available_years(request):
    try:
        years = Match.objects.values_list('season', flat=True).distinct().order_by('season')
        return Response({
            'success': True,
            'data': list(years),
            'message': 'Available years retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def teams_list(request):
    try:
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Teams retrieved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)