from django.urls import path
from . import views

urlpatterns = [
    # Basic CRUD endpoints
    path('teams/', views.TeamListCreateView.as_view(), name='team-list-create'),
    path('players/', views.PlayerListCreateView.as_view(), name='player-list-create'),
    path('matches/', views.MatchListCreateView.as_view(), name='match-list-create'),
    
    # Chart API endpoints for assignment tasks
    path('matches-per-year/', views.matches_per_year, name='matches-per-year'),
    path('team-wins-stacked/', views.team_wins_stacked, name='team-wins-stacked'),
    path('extra-runs-per-team/<str:year>/', views.extra_runs_per_team, name='extra-runs-per-team'),
    path('economical-bowlers/<str:year>/', views.economical_bowlers, name='economical-bowlers'),
    path('matches-played-vs-won/<str:year>/', views.matches_played_vs_won, name='matches-played-vs-won'),
    
    # Utility endpoints
    path('available-years/', views.available_years, name='available-years'),
    path('teams-list/', views.teams_list, name='teams-list'),
]