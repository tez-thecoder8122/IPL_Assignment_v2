from django.contrib import admin
from .models import Team, Player, Match, Delivery

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'city', 'created_at')
    search_fields = ('name', 'short_name', 'city')
    list_filter = ('city',)

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'role')
    search_fields = ('name',)
    list_filter = ('role',)

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('match_id', 'season', 'team1', 'team2', 'winner', 'date', 'venue')
    list_filter = ('season', 'result', 'dl_applied')
    search_fields = ('venue', 'city')
    raw_id_fields = ('team1', 'team2', 'toss_winner', 'winner', 'player_of_match')
    date_hierarchy = 'date'

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('match', 'inning', 'over', 'ball', 'batsman', 'bowler', 'total_runs')
    list_filter = ('inning', 'is_super_over')
    raw_id_fields = ('match', 'batsman', 'non_striker', 'bowler', 'player_dismissed', 'fielder')
    search_fields = ('batsman__name', 'bowler__name')