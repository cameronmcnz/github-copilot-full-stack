package com.example.rps.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record MatchViewResponse(
        String matchId,
        String status,
        String outcome,
        boolean complete,
        int currentRoundNumber,
        int playerWins,
        int computerWins,
        String summaryMessage,
        OffsetDateTime createdAt,
        OffsetDateTime completedAt,
        List<RoundViewResponse> rounds
) {
}