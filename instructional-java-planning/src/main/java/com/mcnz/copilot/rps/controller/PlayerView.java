package com.mcnz.copilot.rps.controller;

import java.time.OffsetDateTime;

public record PlayerView(String playerId, OffsetDateTime createdAt) {
}