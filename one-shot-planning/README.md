# Rosette Rock Paper Scissors

Rosette Rock Paper Scissors is a Spring Boot 3 full-stack sample that implements a layered enterprise web application with a REST-driven browser UI, service-layer game logic, H2 persistence, Swagger API exploration, and live/ready health endpoints.

## Stack

- Java 21
- Spring Boot 3
- Spring MVC + Thymeleaf
- Spring Data JPA
- Flyway
- H2
- Springdoc OpenAPI

## Features

- Best two out of three Rock Paper Scissors against the server
- Durable anonymous user cookie issued by the backend
- In-progress match recovery after browser refresh
- Match history and full match detail views
- REST API consumed by the page JavaScript
- Swagger UI at `/swagger-ui.html`
- Health endpoints at `/health/live`, `/health/ready`, and `/actuator/health`

## Run

1. Ensure Java 21 and Maven are installed.
2. From the workspace root, run `mvn spring-boot:run`.
3. Open `http://localhost:8080`.

## Test

Run `mvn test`.

## Project Layout

- `src/main/java/com/example/rps/controller`: web page, REST API, and health endpoints
- `src/main/java/com/example/rps/service`: business rules and session handling
- `src/main/java/com/example/rps/entity`: persisted domain model
- `src/main/java/com/example/rps/repository`: data access layer
- `src/main/resources/templates`: HTML shell
- `src/main/resources/static`: CSS and JavaScript assets
- `src/main/resources/db/migration`: Flyway schema migrations

## Notes

- Starting a new match abandons any unfinished active match and records that state in history.
- The browser never computes game outcomes locally; it only renders REST responses.
- The local development database is stored under `./data/rps-enterprise.mv.db`.