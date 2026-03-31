from django.db import connection
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MatchSerializer
from .services import GameService

PLAYER_COOKIE_NAME = 'rps_player_id'
COOKIE_AGE_SECONDS = 60 * 60 * 24 * 365


class PlayerCookieMixin:
    def resolve_player_and_cookie(self, request):
        cookie_value = request.COOKIES.get(PLAYER_COOKIE_NAME)
        player = GameService.resolve_player(cookie_value)
        return player

    def with_cookie(self, response, player):
        response.set_cookie(
            PLAYER_COOKIE_NAME,
            str(player.public_id),
            max_age=COOKIE_AGE_SECONDS,
            httponly=True,
            samesite='Lax',
        )
        return response


class StartMatchApiView(PlayerCookieMixin, APIView):
    def post(self, request):
        player = self.resolve_player_and_cookie(request)
        match = GameService.start_new_match(player)
        payload = {
            'player_id': str(player.public_id),
            'match': MatchSerializer(match).data,
            'message': 'New best 2 out of 3 match started.',
        }
        response = Response(payload, status=status.HTTP_201_CREATED)
        response = self.with_cookie(response, player)
        return response


class SubmitMoveApiView(PlayerCookieMixin, APIView):
    def post(self, request):
        player = self.resolve_player_and_cookie(request)
        move = request.data.get('move', '')
        try:
            match = GameService.submit_move(player, move)
            payload = {
                'player_id': str(player.public_id),
                'match': MatchSerializer(match).data,
            }
            response = Response(payload, status=status.HTTP_200_OK)
        except ValueError as exc:
            payload = {
                'error': str(exc),
                'player_id': str(player.public_id),
            }
            response = Response(payload, status=status.HTTP_400_BAD_REQUEST)
        response = self.with_cookie(response, player)
        return response


class CurrentMatchApiView(PlayerCookieMixin, APIView):
    def get(self, request):
        player = self.resolve_player_and_cookie(request)
        match = GameService.get_current_match(player)
        payload = {
            'player_id': str(player.public_id),
            'match': MatchSerializer(match).data if match else None,
        }
        response = Response(payload, status=status.HTTP_200_OK)
        response = self.with_cookie(response, player)
        return response


class MatchHistoryApiView(PlayerCookieMixin, APIView):
    def get(self, request):
        player = self.resolve_player_and_cookie(request)
        matches = GameService.get_history(player)
        payload = {
            'player_id': str(player.public_id),
            'matches': MatchSerializer(matches, many=True).data,
        }
        response = Response(payload, status=status.HTTP_200_OK)
        response = self.with_cookie(response, player)
        return response


class MatchDetailApiView(PlayerCookieMixin, APIView):
    def get(self, request, match_id):
        player = self.resolve_player_and_cookie(request)
        match = GameService.get_match_by_id(player, match_id)
        if match is None:
            payload = {
                'error': 'Match not found for this user.',
                'player_id': str(player.public_id),
            }
            response = Response(payload, status=status.HTTP_404_NOT_FOUND)
        else:
            payload = {
                'player_id': str(player.public_id),
                'match': MatchSerializer(match).data,
            }
            response = Response(payload, status=status.HTTP_200_OK)
        response = self.with_cookie(response, player)
        return response


class HealthLiveApiView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({'status': 'live'}, status=status.HTTP_200_OK)


class HealthReadyApiView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        db_ok = False
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            row = cursor.fetchone()
            db_ok = bool(row and row[0] == 1)

        status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        state = 'ready' if db_ok else 'not_ready'
        return Response({'status': state, 'database': db_ok}, status=status_code)