package com.mcnz.copilot.rps.controller;

import com.mcnz.copilot.rps.entity.PlayerEntity;

public record PlayerResolution(PlayerEntity player, String playerId) {
}