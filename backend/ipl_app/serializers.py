from rest_framework import serializers
from .models import Team, Player, Match, Delivery

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'short_name', 'city']

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'name', 'role']

class MatchSerializer(serializers.ModelSerializer):
    team1_name = serializers.CharField(source='team1.name', read_only=True)
    team2_name = serializers.CharField(source='team2.name', read_only=True)
    winner_name = serializers.CharField(source='winner.name', read_only=True)
    player_of_match_name = serializers.CharField(source='player_of_match.name', read_only=True)
    
    class Meta:
        model = Match
        fields = ['match_id', 'season', 'city', 'date', 'team1_name', 'team2_name', 
                 'winner_name', 'venue', 'player_of_match_name']

class DeliverySerializer(serializers.ModelSerializer):
    batsman_name = serializers.CharField(source='batsman.name', read_only=True)
    bowler_name = serializers.CharField(source='bowler.name', read_only=True)
    batting_team_name = serializers.CharField(source='batting_team.name', read_only=True)
    
    class Meta:
        model = Delivery
        fields = ['match', 'inning', 'over', 'ball', 'batsman_name', 'bowler_name', 
                 'batting_team_name', 'batsman_runs', 'extra_runs', 'total_runs']

# Chart Data Serializers
class MatchesPerYearSerializer(serializers.Serializer):
    year = serializers.CharField()
    matches_count = serializers.IntegerField()

class TeamWinsStackedSerializer(serializers.Serializer):
    team = serializers.CharField()
    year = serializers.CharField()
    wins = serializers.IntegerField()

class ExtraRunsPerTeamSerializer(serializers.Serializer):
    team = serializers.CharField()
    extra_runs = serializers.IntegerField()

class EconomicalBowlerSerializer(serializers.Serializer):
    bowler = serializers.CharField()
    economy_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    overs_bowled = serializers.DecimalField(max_digits=5, decimal_places=1)
    runs_conceded = serializers.IntegerField()
    wickets_taken = serializers.IntegerField()

class MatchesPlayedVsWonSerializer(serializers.Serializer):
    team = serializers.CharField()
    matches_played = serializers.IntegerField()
    matches_won = serializers.IntegerField()
    win_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)