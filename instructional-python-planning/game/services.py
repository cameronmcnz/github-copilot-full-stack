import random
import uuid

from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone

from .models import Match, Player, Round

WIN_MAP = {
    Round.MOVE_ROCK: Round.MOVE_SCISSORS,
    Round.MOVE_PAPER: Round.MOVE_ROCK,
    Round.MOVE_SCISSORS: Round.MOVE_PAPER,
}


class GameService:
    @staticmethod
    @transaction.atomic
    def resolve_player(public_id_str=None):
        player = None
        parsed_uuid = None
        if public_id_str:
            try:
                parsed_uuid = uuid.UUID(public_id_str)
            except ValueError:
                parsed_uuid = None
        if parsed_uuid is None:
            player = Player.objects.create()
        else:
            player, _created = Player.objects.get_or_create(public_id=parsed_uuid)
        return player

    @staticmethod
    @transaction.atomic
    def start_new_match(player):
        now = timezone.now()
        active_matches = Match.objects.filter(player=player, status=Match.STATUS_IN_PROGRESS)
        active_matches.update(status=Match.STATUS_COMPLETED, result=Match.RESULT_ABANDONED, completed_at=now)
        match = Match.objects.create(player=player)
        return match

    @staticmethod
    @transaction.atomic
    def submit_move(player, player_move):
        match = (
            Match.objects.select_for_update()
            .filter(player=player, status=Match.STATUS_IN_PROGRESS)
            .first()
        )
        if match is None:
            raise ValueError('No active match. Start a new match first.')

        if match.player_score >= 2 or match.computer_score >= 2:
            raise ValueError('Match is already complete.')

        player_move_normalized = player_move.upper()
        if player_move_normalized not in WIN_MAP:
            raise ValueError('Move must be ROCK, PAPER, or SCISSORS.')

        computer_move = random.choice(list(WIN_MAP.keys()))

        outcome = Round.OUTCOME_TIE
        if WIN_MAP[player_move_normalized] == computer_move:
            outcome = Round.OUTCOME_PLAYER
        elif WIN_MAP[computer_move] == player_move_normalized:
            outcome = Round.OUTCOME_COMPUTER

        next_round_number = match.rounds.count() + 1
        Round.objects.create(
            match=match,
            round_number=next_round_number,
            player_move=player_move_normalized,
            computer_move=computer_move,
            outcome=outcome,
        )

        if outcome == Round.OUTCOME_PLAYER:
            match.player_score += 1
        elif outcome == Round.OUTCOME_COMPUTER:
            match.computer_score += 1

        if match.player_score >= 2 or match.computer_score >= 2:
            match.status = Match.STATUS_COMPLETED
            match.completed_at = timezone.now()
            if match.player_score > match.computer_score:
                match.result = Match.RESULT_PLAYER
            elif match.computer_score > match.player_score:
                match.result = Match.RESULT_COMPUTER
            else:
                match.result = Match.RESULT_TIE

        match.save()
        match.refresh_from_db()
        return match

    @staticmethod
    def get_current_match(player):
        match = (
            Match.objects.filter(player=player)
            .prefetch_related('rounds')
            .order_by('-started_at')
            .first()
        )
        return match

    @staticmethod
    def get_history(player):
        matches = (
            Match.objects.filter(player=player)
            .prefetch_related(Prefetch('rounds', queryset=Round.objects.order_by('round_number')))
            .order_by('-started_at')
        )
        return matches

    @staticmethod
    def get_match_by_id(player, match_id):
        match = (
            Match.objects.filter(player=player, id=match_id)
            .prefetch_related(Prefetch('rounds', queryset=Round.objects.order_by('round_number')))
            .first()
        )
        return match