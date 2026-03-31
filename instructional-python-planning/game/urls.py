from django.urls import path

from .api_views import (
    CurrentMatchApiView,
    MatchDetailApiView,
    MatchHistoryApiView,
    StartMatchApiView,
    SubmitMoveApiView,
)
from .web_views import HomeView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('api/matches/start', StartMatchApiView.as_view(), name='api-start-match'),
    path('api/matches/current', CurrentMatchApiView.as_view(), name='api-current-match'),
    path('api/matches/current/move', SubmitMoveApiView.as_view(), name='api-submit-move'),
    path('api/matches/history', MatchHistoryApiView.as_view(), name='api-match-history'),
    path('api/matches/<int:match_id>', MatchDetailApiView.as_view(), name='api-match-detail'),
]