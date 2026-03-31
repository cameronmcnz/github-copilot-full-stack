# Building Buccaneer Hangman

Single-screen JavaFX hangman with a dark, loud theme and a hardcoded word list focused on AWS and Java terms.

## Requirements

- Java 17+
- Maven 3.9+

## Run

```bash
mvn javafx:run
```

## Test

```bash
mvn test
```

## Notes

- Everything runs client-side in one window.
- The round ends after 8 wrong guesses.
- The UI is built with JavaFX shapes, gradients, and effects only.