package com.example.rps.dto;

import java.time.OffsetDateTime;

public record RoundViewResponse(
        int roundNumber,
        String playerMove,
        String computerMove,
        String result,
        String message,
        OffsetDateTime createdAt
) {
}