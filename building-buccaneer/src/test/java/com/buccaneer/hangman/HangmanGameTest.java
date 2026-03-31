package com.buccaneer.hangman;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;

final class HangmanGameTest {
    @Test
    void revealsAllInstancesOfALetter() {
        HangmanGame game = new HangmanGame(List.of("LAMBDA"), new Random(0));

        HangmanGame.GuessOutcome outcome = game.guessLetter('A');

        assertTrue(outcome.accepted());
        assertTrue(outcome.correct());
        assertEquals("_ A _ _ _ A", game.getMaskedWord());
    }

    @Test
    void incrementsWrongGuessCountForIncorrectLetter() {
        HangmanGame game = new HangmanGame(List.of("SPRING"), new Random(0));

        HangmanGame.GuessOutcome outcome = game.guessLetter('Z');

        assertTrue(outcome.accepted());
        assertFalse(outcome.correct());
        assertEquals(1, game.getWrongGuesses());
        assertEquals(7, game.getRemainingTurns());
    }

    @Test
    void losesOnExactlyTheEighthWrongGuess() {
        HangmanGame game = new HangmanGame(List.of("JAVA"), new Random(0));

        for (char guess : new char[] {'B', 'C', 'D', 'E', 'F', 'G', 'H'}) {
            game.guessLetter(guess);
        }

        assertFalse(game.hasLost());

        HangmanGame.GuessOutcome outcome = game.guessLetter('I');

        assertTrue(outcome.lost());
        assertTrue(game.hasLost());
        assertEquals(8, game.getWrongGuesses());
    }

    @Test
    void winsWhenAllLettersAreRevealed() {
        HangmanGame game = new HangmanGame(List.of("AWS"), new Random(0));

        game.guessLetter('A');
        game.guessLetter('W');
        HangmanGame.GuessOutcome outcome = game.guessLetter('S');

        assertTrue(outcome.won());
        assertTrue(game.hasWon());
        assertEquals("A W S", game.getMaskedWord());
    }

    @Test
    void ignoresRepeatedGuessesWithoutPenalty() {
        HangmanGame game = new HangmanGame(List.of("GRADLE"), new Random(0));

        game.guessLetter('X');
        HangmanGame.GuessOutcome outcome = game.guessLetter('X');

        assertFalse(outcome.accepted());
        assertEquals(1, game.getWrongGuesses());
    }

    @Test
    void resetRoundClearsTransientState() {
        HangmanGame game = new HangmanGame(List.of("SERVLET"), new Random(0));

        game.guessLetter('S');
        game.guessLetter('Z');
        game.resetRound();

        assertEquals(0, game.getWrongGuesses());
        assertFalse(game.hasWon());
        assertFalse(game.hasLost());
        assertEquals("_ _ _ _ _ _ _", game.getMaskedWord());
        assertEquals("none yet", game.getGuessedLettersDisplay());
    }
}