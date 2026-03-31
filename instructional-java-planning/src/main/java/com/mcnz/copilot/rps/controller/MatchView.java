package com.mcnz.copilot.rps.controller;

import java.time.OffsetDateTime;
import java.util.List;

public record MatchView(
        Long matchId,
        OffsetDateTime startedAt,
        OffsetDateTime completedAt,
        int playerScore,
        int computerScore,
        int nextRoundNumber,
        boolean complete,
        String lastRoundOutcome,
        String statusMessage,
        String summaryTitle,
        String summaryBody,
        List<RoundView> rounds) {
}