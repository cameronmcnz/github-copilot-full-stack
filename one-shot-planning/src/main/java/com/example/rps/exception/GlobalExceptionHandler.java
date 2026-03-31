package com.example.rps.exception;

import com.example.rps.dto.ApiErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MatchNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(MatchNotFoundException exception) {
        return build(HttpStatus.NOT_FOUND, "MATCH_NOT_FOUND", exception.getMessage(), List.of());
    }

    @ExceptionHandler({MatchConflictException.class, InvalidMoveException.class})
    public ResponseEntity<ApiErrorResponse> handleConflict(RuntimeException exception) {
        return build(HttpStatus.CONFLICT, "MATCH_CONFLICT", exception.getMessage(), List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<ApiErrorResponse.FieldValidationError> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .toList();
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed.", fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraint(ConstraintViolationException exception) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", exception.getMessage(), List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected server error.", List.of());
    }

    private ApiErrorResponse.FieldValidationError toFieldError(FieldError fieldError) {
        return new ApiErrorResponse.FieldValidationError(fieldError.getField(), fieldError.getDefaultMessage());
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            String code,
            String message,
            List<ApiErrorResponse.FieldValidationError> fieldErrors
    ) {
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(code, message, OffsetDateTime.now(), fieldErrors));
    }
}