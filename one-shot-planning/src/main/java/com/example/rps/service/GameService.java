package com.example.rps.service;

import com.example.rps.entity.MatchOutcome;
import com.example.rps.entity.Move;
import com.example.rps.entity.RoundResult;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;

@Service
public class GameService {

    private static final List<Move> MOVES = List.of(Move.ROCK, Move.PAPER, Move.SCISSORS);

    private final SecureRandom random = new SecureRandom();

    public Move generateComputerMove() {
        return MOVES.get(random.nextInt(MOVES.size()));
    }

    public RoundResult evaluate(Move playerMove, Move computerMove) {
        if (playerMove == computerMove) {
            return RoundResult.TIE;
        }

        return switch (playerMove) {
            case ROCK -> computerMove == Move.SCISSORS ? RoundResult.WIN : RoundResult.LOSS;
            case PAPER -> computerMove == Move.ROCK ? RoundResult.WIN : RoundResult.LOSS;
            case SCISSORS -> computerMove == Move.PAPER ? RoundResult.WIN : RoundResult.LOSS;
        };
    }

    public String roundMessage(RoundResult result) {
        return switch (result) {
            case WIN -> "You won the round.";
            case LOSS -> "The computer won the round.";
            case TIE -> "This round was a tie.";
        };
    }

    public MatchOutcome determineMatchOutcome(int playerWins, int computerWins) {
        if (playerWins > computerWins) {
            return MatchOutcome.PLAYER_WIN;
        }
        if (computerWins > playerWins) {
            return MatchOutcome.COMPUTER_WIN;
        }
        return MatchOutcome.TIE;
    }

    public String summaryMessage(MatchOutcome outcome) {
        return switch (outcome) {
            case PLAYER_WIN -> "Match complete. You won the series.";
            case COMPUTER_WIN -> "Match complete. The computer won the series.";
            case TIE -> "Match complete. The series ended in a tie.";
            case ABANDONED -> "This match was replaced by a new one before it finished.";
        };
    }
}