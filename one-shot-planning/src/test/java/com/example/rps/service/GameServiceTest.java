package com.example.rps.service;

import com.example.rps.entity.MatchOutcome;
import com.example.rps.entity.Move;
import com.example.rps.entity.RoundResult;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GameServiceTest {

    private final GameService gameService = new GameService();

    @Test
    void shouldIdentifyWinningRound() {
        assertThat(gameService.evaluate(Move.ROCK, Move.SCISSORS)).isEqualTo(RoundResult.WIN);
        assertThat(gameService.evaluate(Move.PAPER, Move.ROCK)).isEqualTo(RoundResult.WIN);
        assertThat(gameService.evaluate(Move.SCISSORS, Move.PAPER)).isEqualTo(RoundResult.WIN);
    }

    @Test
    void shouldIdentifyLossAndTie() {
        assertThat(gameService.evaluate(Move.ROCK, Move.PAPER)).isEqualTo(RoundResult.LOSS);
        assertThat(gameService.evaluate(Move.SCISSORS, Move.SCISSORS)).isEqualTo(RoundResult.TIE);
    }

    @Test
    void shouldDetermineMatchOutcome() {
        assertThat(gameService.determineMatchOutcome(2, 1)).isEqualTo(MatchOutcome.PLAYER_WIN);
        assertThat(gameService.determineMatchOutcome(1, 2)).isEqualTo(MatchOutcome.COMPUTER_WIN);
        assertThat(gameService.determineMatchOutcome(1, 1)).isEqualTo(MatchOutcome.TIE);
    }
}