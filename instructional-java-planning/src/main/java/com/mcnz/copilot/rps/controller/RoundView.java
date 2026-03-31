package com.mcnz.copilot.rps.controller;

import com.mcnz.copilot.rps.entity.Move;

public record RoundView(int roundNumber, Move playerMove, Move computerMove, String outcomeLabel) {
}