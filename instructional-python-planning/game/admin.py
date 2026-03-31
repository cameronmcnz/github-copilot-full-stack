from django.contrib import admin

from .models import Match, Player, Round


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
	list_display = ('id', 'public_id', 'created_at')
	search_fields = ('public_id',)


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
	list_display = ('id', 'player', 'status', 'result', 'player_score', 'computer_score', 'started_at', 'completed_at')
	list_filter = ('status', 'result')
	search_fields = ('player__public_id',)


@admin.register(Round)
class RoundAdmin(admin.ModelAdmin):
	list_display = ('id', 'match', 'round_number', 'player_move', 'computer_move', 'outcome', 'played_at')
	list_filter = ('outcome', 'player_move', 'computer_move')
