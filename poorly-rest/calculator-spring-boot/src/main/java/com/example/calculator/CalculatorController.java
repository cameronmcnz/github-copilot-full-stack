package com.example.calculator;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalculatorController {

    @GetMapping("/operations/add")
    public Map<String, Double> add(@RequestParam double a, @RequestParam double b) {
        System.out.println("[spring] add invoked with a=" + a + ", b=" + b);
        return Map.of("result", a + b);
    }

    @GetMapping("/operations/subtract")
    public Map<String, Double> subtract(@RequestParam double a, @RequestParam double b) {
        System.out.println("[spring] subtract invoked with a=" + a + ", b=" + b);
        return Map.of("result", a - b);
    }

    @GetMapping("/operations/multiply")
    public Map<String, Double> multiply(@RequestParam double a, @RequestParam double b) {
        System.out.println("[spring] multiply invoked with a=" + a + ", b=" + b);
        return Map.of("result", a * b);
    }

    @GetMapping("/operations/divide")
    public ResponseEntity<Map<String, Object>> divide(@RequestParam double a, @RequestParam double b) {
        System.out.println("[spring] divide invoked with a=" + a + ", b=" + b);

        if (b == 0) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("message", "Division by zero is not allowed."));
        }

        return ResponseEntity.ok(Map.of("result", a / b));
    }

    @GetMapping("/operations/modulus")
    public ResponseEntity<Map<String, Object>> modulus(@RequestParam double a, @RequestParam double b) {
        System.out.println("[spring] modulus invoked with a=" + a + ", b=" + b);

        if (b == 0) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("message", "Division by zero is not allowed."));
        }

        return ResponseEntity.ok(Map.of("result", a % b));
    }
}