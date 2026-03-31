from rest_framework import serializers

from .models import Match, Round


class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = [
            'round_number',
            'player_move',
            'computer_move',
            'outcome',
            'played_at',
        ]


class MatchSerializer(serializers.ModelSerializer):
    rounds = RoundSerializer(many=True, read_only=True)
    is_complete = serializers.SerializerMethodField()
    current_round_number = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            'id',
            'status',
            'result',
            'player_score',
            'computer_score',
            'started_at',
            'completed_at',
            'is_complete',
            'current_round_number',
            'rounds',
        ]

    def get_is_complete(self, obj):
        return obj.status == Match.STATUS_COMPLETED

    def get_current_round_number(self, obj):
        return obj.rounds.count() + 1