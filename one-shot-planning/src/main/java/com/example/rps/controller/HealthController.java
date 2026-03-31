package com.example.rps.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/live")
    public Map<String, Object> live() {
        return Map.of(
                "status", "UP",
                "timestamp", OffsetDateTime.now(),
                "service", "rps-enterprise");
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "timestamp", OffsetDateTime.now(),
                    "database", result != null && result == 1 ? "UP" : "UNKNOWN"));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "status", "DOWN",
                            "timestamp", OffsetDateTime.now(),
                            "database", "DOWN"));
        }
    }
}