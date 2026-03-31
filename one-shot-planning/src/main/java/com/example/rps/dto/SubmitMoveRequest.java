package com.example.rps.dto;

import com.example.rps.entity.Move;
import jakarta.validation.constraints.NotNull;

public record SubmitMoveRequest(@NotNull Move playerMove) {
}