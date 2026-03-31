import uuid

from django.db import models


class Player(models.Model):
	public_id = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return str(self.public_id)


class Match(models.Model):
	STATUS_IN_PROGRESS = 'IN_PROGRESS'
	STATUS_COMPLETED = 'COMPLETED'
	STATUS_CHOICES = [
		(STATUS_IN_PROGRESS, 'In Progress'),
		(STATUS_COMPLETED, 'Completed'),
	]

	RESULT_PLAYER = 'PLAYER'
	RESULT_COMPUTER = 'COMPUTER'
	RESULT_TIE = 'TIE'
	RESULT_ABANDONED = 'ABANDONED'
	RESULT_CHOICES = [
		(RESULT_PLAYER, 'Player Won'),
		(RESULT_COMPUTER, 'Computer Won'),
		(RESULT_TIE, 'Tie'),
		(RESULT_ABANDONED, 'Abandoned'),
	]

	player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches')
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_IN_PROGRESS)
	result = models.CharField(max_length=20, choices=RESULT_CHOICES, null=True, blank=True)
	player_score = models.PositiveSmallIntegerField(default=0)
	computer_score = models.PositiveSmallIntegerField(default=0)
	started_at = models.DateTimeField(auto_now_add=True)
	completed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ['-started_at']


class Round(models.Model):
	MOVE_ROCK = 'ROCK'
	MOVE_PAPER = 'PAPER'
	MOVE_SCISSORS = 'SCISSORS'
	MOVE_CHOICES = [
		(MOVE_ROCK, 'Rock'),
		(MOVE_PAPER, 'Paper'),
		(MOVE_SCISSORS, 'Scissors'),
	]

	OUTCOME_PLAYER = 'PLAYER'
	OUTCOME_COMPUTER = 'COMPUTER'
	OUTCOME_TIE = 'TIE'
	OUTCOME_CHOICES = [
		(OUTCOME_PLAYER, 'Player Won'),
		(OUTCOME_COMPUTER, 'Computer Won'),
		(OUTCOME_TIE, 'Tie'),
	]

	match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='rounds')
	round_number = models.PositiveSmallIntegerField()
	player_move = models.CharField(max_length=20, choices=MOVE_CHOICES)
	computer_move = models.CharField(max_length=20, choices=MOVE_CHOICES)
	outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES)
	played_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['round_number']
		constraints = [
			models.UniqueConstraint(fields=['match', 'round_number'], name='unique_round_per_match'),
		]
