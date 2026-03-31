package com.example.rps.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiErrorResponse(
        String code,
        String message,
        OffsetDateTime timestamp,
        List<FieldValidationError> fieldErrors
) {

    public record FieldValidationError(String field, String message) {
    }
}