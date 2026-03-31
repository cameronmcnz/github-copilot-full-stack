package com.example.rps.dto;

import java.time.OffsetDateTime;

public record MatchSummaryResponse(
        String matchId,
        String status,
        String outcome,
        int playerWins,
        int computerWins,
        int roundsPlayed,
        String summaryMessage,
        OffsetDateTime createdAt,
        OffsetDateTime completedAt
) {
}