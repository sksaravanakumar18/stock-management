package com.stockmanagement.stock_management_api.master.common.exception;

import com.stockmanagement.stock_management_api.master.common.api.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleStatusException(
            ResponseStatusException exception,
            HttpServletRequest request) {
        var status = exception.getStatusCode();
        var body = new ApiError(
            Instant.now(),
            status.value(),
            status.toString(),
            exception.getReason(),
            request.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .findFirst()
            .orElse("Request validation failed");

        var body = new ApiError(
            Instant.now(),
            400,
            "Bad Request",
            message,
            request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }
}
