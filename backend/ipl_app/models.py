from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    short_name = models.CharField(max_length=10)
    city = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Player(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=[
        ('batsman', 'Batsman'),
        ('bowler', 'Bowler'),   
        ('allrounder', 'All-rounder'),
        ('wicketkeeper', 'Wicket-keeper')
    ], default='batsman')
    
    def __str__(self):
        return self.name

class Match(models.Model):
    match_id = models.IntegerField(unique=True)
    season = models.CharField(max_length=10)
    city = models.CharField(max_length=50, blank=True)
    date = models.DateField()
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team1_matches')
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team2_matches')
    toss_winner = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='toss_wins', null=True)
    toss_decision = models.CharField(max_length=10, choices=[
        ('bat', 'Bat'),
        ('field', 'Field')
    ], blank=True)
    result = models.CharField(max_length=10, default='normal')
    dl_applied = models.BooleanField(default=False)
    winner = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='wins', null=True, blank=True)
    win_by_runs = models.IntegerField(default=0)
    win_by_wickets = models.IntegerField(default=0)
    player_of_match = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True)
    venue = models.CharField(max_length=200)
    umpire1 = models.CharField(max_length=100, blank=True)
    umpire2 = models.CharField(max_length=100, blank=True)
    umpire3 = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Match {self.match_id}: {self.team1} vs {self.team2}"

class Delivery(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='deliveries')
    inning = models.IntegerField()
    batting_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='batting_deliveries')
    bowling_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='bowling_deliveries')
    over = models.IntegerField()
    ball = models.IntegerField()
    batsman = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='batting_deliveries')
    non_striker = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='non_striker_deliveries')
    bowler = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='bowling_deliveries')
    is_super_over = models.BooleanField(default=False)
    wide_runs = models.IntegerField(default=0)
    bye_runs = models.IntegerField(default=0)
    legbye_runs = models.IntegerField(default=0)
    noball_runs = models.IntegerField(default=0)
    penalty_runs = models.IntegerField(default=0)
    batsman_runs = models.IntegerField(default=0)
    extra_runs = models.IntegerField(default=0)
    total_runs = models.IntegerField(default=0)
    player_dismissed = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True, related_name='dismissals')
    dismissal_kind = models.CharField(max_length=20, blank=True)
    fielder = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True, related_name='fielding')
    
    def __str__(self):
        return f"{self.match.match_id} - {self.over}.{self.ball}: {self.batsman} vs {self.bowler}"