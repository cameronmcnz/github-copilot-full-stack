package com.example.rps.exception;

public class MatchConflictException extends RuntimeException {

    public MatchConflictException(String message) {
        super(message);
    }
}