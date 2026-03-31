package com.buccaneer.hangman;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

public final class HangmanGame {
    public static final int MAX_WRONG_GUESSES = 8;

    private static final List<String> DEFAULT_WORDS = List.of(
            "LAMBDA",
            "SPRING",
            "HIBERNATE",
            "JACKSON",
            "MICROSERVICE",
            "CLOUDWATCH",
            "DYNAMODB",
            "REDSHIFT",
            "CLOUDFRONT",
            "CODEBUILD",
            "SQSQUEUE",
            "KUBERNETES",
            "BYTECODE",
            "SERVLET",
            "GRADLE"
    );

    private final List<String> words;
    private final Random random;
    private final Set<Character> guessedLetters = new LinkedHashSet<>();

    private String currentWord;
    private int wrongGuesses;
    private boolean won;
    private boolean lost;

    public HangmanGame() {
        this(DEFAULT_WORDS, new Random());
    }

    HangmanGame(List<String> words, Random random) {
        this.words = List.copyOf(words).stream()
                .map(word -> Objects.requireNonNull(word, "word").trim().toUpperCase())
                .filter(word -> !word.isBlank())
                .toList();
        this.random = Objects.requireNonNull(random, "random");

        if (this.words.isEmpty()) {
            throw new IllegalArgumentException("At least one word is required");
        }

        resetRound();
    }

    public GuessOutcome guessLetter(char letter) {
        char normalizedLetter = Character.toUpperCase(letter);
        if (lost || won || !Character.isLetter(normalizedLetter) || guessedLetters.contains(normalizedLetter)) {
            return new GuessOutcome(false, false, won, lost);
        }

        guessedLetters.add(normalizedLetter);
        boolean correct = currentWord.indexOf(normalizedLetter) >= 0;
        if (!correct) {
            wrongGuesses++;
        }

        won = currentWord.chars()
                .mapToObj(codePoint -> (char) codePoint)
                .allMatch(character -> guessedLetters.contains(character));
        lost = !won && wrongGuesses >= MAX_WRONG_GUESSES;

        return new GuessOutcome(true, correct, won, lost);
    }

    public void resetRound() {
        currentWord = words.get(random.nextInt(words.size()));
        guessedLetters.clear();
        wrongGuesses = 0;
        won = false;
        lost = false;
    }

    public String getMaskedWord() {
        return currentWord.chars()
                .mapToObj(codePoint -> {
                    char character = (char) codePoint;
                    return guessedLetters.contains(character) ? String.valueOf(character) : "_";
                })
                .collect(Collectors.joining(" "));
    }

    public String getCurrentWord() {
        return currentWord;
    }

    public int getWrongGuesses() {
        return wrongGuesses;
    }

    public int getRemainingTurns() {
        return MAX_WRONG_GUESSES - wrongGuesses;
    }

    public boolean hasWon() {
        return won;
    }

    public boolean hasLost() {
        return lost;
    }

    public boolean isGameOver() {
        return won || lost;
    }

    public Set<Character> getGuessedLetters() {
        return Set.copyOf(guessedLetters);
    }

    public String getGuessedLettersDisplay() {
        if (guessedLetters.isEmpty()) {
            return "none yet";
        }

        return guessedLetters.stream()
                .map(String::valueOf)
                .collect(Collectors.joining("  "));
    }

    public record GuessOutcome(boolean accepted, boolean correct, boolean won, boolean lost) {
    }
}