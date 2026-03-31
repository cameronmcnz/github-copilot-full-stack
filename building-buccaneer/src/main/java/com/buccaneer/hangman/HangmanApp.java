package com.buccaneer.hangman;

import java.util.ArrayList;
import java.util.List;

import javafx.animation.Animation;
import javafx.animation.FadeTransition;
import javafx.animation.ScaleTransition;
import javafx.animation.SequentialTransition;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.effect.DropShadow;
import javafx.scene.effect.Glow;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.TilePane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.LinearGradient;
import javafx.scene.paint.Stop;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.shape.Rectangle;
import javafx.scene.shape.Shape;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import javafx.util.Duration;

public final class HangmanApp extends Application {
    private final HangmanGame game = new HangmanGame();
    private final List<Button> letterButtons = new ArrayList<>();
    private final List<Node> hangmanSteps = new ArrayList<>();

    private Label wordLabel;
    private Label statusLabel;
    private Label usedLettersLabel;
    private Label bannerLabel;
    private Label answerLabel;
    private Button restartButton;

    @Override
    public void start(Stage stage) {
        BorderPane root = new BorderPane();
        root.getStyleClass().add("app-root");
        root.setPadding(new Insets(20));
        root.setTop(buildHeader());
        root.setCenter(buildGameArea());
        root.setBottom(buildKeyboard());

        Scene scene = new Scene(root, 1220, 860);
        scene.getStylesheets().add(getClass().getResource("/com/buccaneer/hangman/app.css").toExternalForm());
        scene.addEventHandler(KeyEvent.KEY_PRESSED, this::handleKeyPress);

        stage.setTitle("Building Buccaneer Hangman");
        stage.setMinWidth(1080);
        stage.setMinHeight(780);
        stage.setScene(scene);
        stage.show();

        refreshUi("Punch keys and save your dev reputation.");
    }

    private Node buildHeader() {
        Label titleLabel = new Label("BROGRAMMER HANGMAN");
        titleLabel.getStyleClass().add("title-label");
        titleLabel.setFont(Font.font("Impact", FontWeight.BLACK, 40));
        titleLabel.setEffect(new DropShadow(24, Color.web("#16f2d1")));

        Label subtitleLabel = new Label("AWS + Java buzzwords. Eight mistakes and the platform team laughs at you.");
        subtitleLabel.getStyleClass().add("subtitle-label");

        StackPane warningChip = new StackPane(new Label("LOUD MODE ENABLED"));
        warningChip.getStyleClass().add("warning-chip");

        VBox textStack = new VBox(8, titleLabel, subtitleLabel);
        HBox header = new HBox(20, textStack, warningChip);
        header.setAlignment(Pos.CENTER_LEFT);
        header.getStyleClass().add("header-card");
        HBox.setMargin(warningChip, new Insets(0, 0, 0, 20));

        ScaleTransition titlePulse = new ScaleTransition(Duration.seconds(1.8), titleLabel);
        titlePulse.setFromX(1.0);
        titlePulse.setFromY(1.0);
        titlePulse.setToX(1.035);
        titlePulse.setToY(1.035);
        titlePulse.setCycleCount(Animation.INDEFINITE);
        titlePulse.setAutoReverse(true);
        titlePulse.play();

        return header;
    }

    private Node buildGameArea() {
        StackPane gallowsCard = new StackPane(buildDrawingPane());
        gallowsCard.getStyleClass().add("game-card");
        gallowsCard.setPadding(new Insets(18));

        wordLabel = new Label();
        wordLabel.getStyleClass().add("word-label");
        wordLabel.setWrapText(true);

        bannerLabel = new Label();
        bannerLabel.getStyleClass().add("banner-label");
        bannerLabel.setWrapText(true);

        answerLabel = new Label();
        answerLabel.getStyleClass().add("answer-label");
        answerLabel.setWrapText(true);

        statusLabel = new Label();
        statusLabel.getStyleClass().add("status-label");

        usedLettersLabel = new Label();
        usedLettersLabel.getStyleClass().add("used-letters-label");
        usedLettersLabel.setWrapText(true);

        restartButton = new Button("New Word");
        restartButton.getStyleClass().addAll("action-button", "restart-button");
        restartButton.setOnAction(event -> {
            game.resetRound();
            enableKeyboard();
            refreshUi("Fresh round. Same swagger.");
        });

        VBox infoCard = new VBox(14,
                sectionLabel("Word"),
                wordLabel,
                bannerLabel,
                answerLabel,
                sectionLabel("Round Status"),
                statusLabel,
                sectionLabel("Used Letters"),
                usedLettersLabel,
                restartButton);
        infoCard.getStyleClass().add("info-card");
        infoCard.setAlignment(Pos.TOP_LEFT);
        infoCard.setPrefWidth(380);

        HBox topRow = new HBox(22, gallowsCard, infoCard);
        topRow.setAlignment(Pos.CENTER);

        VBox centerBox = new VBox(18, topRow);
        centerBox.setPadding(new Insets(20, 0, 20, 0));
        centerBox.setAlignment(Pos.CENTER);
        return centerBox;
    }

    private Label sectionLabel(String text) {
        Label label = new Label(text);
        label.getStyleClass().add("section-label");
        return label;
    }

    private Node buildDrawingPane() {
        Pane drawingPane = new Pane();
        drawingPane.setPrefSize(560, 440);

        Rectangle backdrop = new Rectangle(560, 440);
        backdrop.setArcHeight(28);
        backdrop.setArcWidth(28);
        backdrop.setFill(new LinearGradient(
                0,
                0,
                1,
                1,
                true,
                CycleMethod.NO_CYCLE,
                new Stop(0, Color.web("#091017")),
                new Stop(1, Color.web("#1d2635"))));

        Circle neonHalo = new Circle(415, 120, 82, Color.rgb(233, 101, 43, 0.12));
        neonHalo.setEffect(new Glow(0.85));
        Circle cyanHalo = new Circle(150, 305, 100, Color.rgb(22, 242, 209, 0.1));
        cyanHalo.setEffect(new Glow(0.75));

        Line slashOne = new Line(25, 40, 235, 215);
        slashOne.getStyleClass().add("accent-line");
        Line slashTwo = new Line(325, 395, 540, 225);
        slashTwo.getStyleClass().add("accent-line");

        drawingPane.getChildren().addAll(backdrop, neonHalo, cyanHalo, slashOne, slashTwo);
        drawingPane.getChildren().addAll(buildHangmanSteps());
        return drawingPane;
    }

    private List<Node> buildHangmanSteps() {
        hangmanSteps.clear();

        Rectangle base = new Rectangle(95, 358, 210, 14);
        Rectangle pole = new Rectangle(130, 92, 14, 270);
        Rectangle beam = new Rectangle(130, 92, 190, 14);
        Rectangle rope = new Rectangle(292, 106, 8, 48);
        Circle head = new Circle(296, 187, 34);
        Line torso = new Line(296, 220, 296, 304);
        Line arms = new Line(248, 250, 344, 250);
        Line legs = new Line(252, 344, 296, 304);

        Line rightLeg = new Line(296, 304, 340, 344);
        applyHangmanStyle(base, pole, beam, rope, head, torso, arms, legs, rightLeg);

        Group legGroup = new Group(legs, rightLeg);
        List<Node> steps = List.of(base, pole, beam, rope, head, torso, arms, legGroup);
        for (Node step : steps) {
            step.setVisible(false);
            hangmanSteps.add(step);
        }

        return hangmanSteps;
    }

    private void applyHangmanStyle(Shape... shapes) {
        for (Shape shape : shapes) {
            shape.getStyleClass().add("hangman-stroke");
        }
    }

    private Node buildKeyboard() {
        TilePane keyboard = new TilePane();
        keyboard.setHgap(10);
        keyboard.setVgap(10);
        keyboard.setPrefColumns(7);
        keyboard.setAlignment(Pos.CENTER);
        keyboard.setPadding(new Insets(10, 0, 0, 0));

        for (char letter = 'A'; letter <= 'Z'; letter++) {
            Button keyButton = new Button(String.valueOf(letter));
            keyButton.getStyleClass().addAll("action-button", "letter-button");
            keyButton.setOnAction(event -> handleGuess(keyButton.getText().charAt(0)));
            keyButton.setPrefSize(74, 54);
            letterButtons.add(keyButton);
            keyboard.getChildren().add(keyButton);
        }

        VBox keyboardBox = new VBox(12, sectionLabel("Keyboard"), keyboard);
        keyboardBox.setAlignment(Pos.CENTER);
        keyboardBox.getStyleClass().add("keyboard-card");
        return keyboardBox;
    }

    private void handleGuess(char letter) {
        HangmanGame.GuessOutcome outcome = game.guessLetter(letter);
        if (!outcome.accepted()) {
            if (game.isGameOver()) {
                refreshUi("Round is over. Hit New Word or press Enter.");
            }
            return;
        }

        disableLetter(letter);

        if (outcome.correct()) {
            if (outcome.won()) {
                disableKeyboard();
                refreshUi("You won. Somewhere a cloud architect nods approvingly.");
            } else {
                refreshUi(letter + " was right. Keep flexing.");
            }
            return;
        }

        if (outcome.lost()) {
            disableKeyboard();
            refreshUi(letter + " was wrong. Eight strikes. Shipwreck.");
        } else {
            refreshUi(letter + " was wrong. The dramatic graphics have been notified.");
        }
    }

    private void refreshUi(String message) {
        wordLabel.setText(game.getMaskedWord());
        statusLabel.setText("Wrong guesses: " + game.getWrongGuesses()
                + " / " + HangmanGame.MAX_WRONG_GUESSES
                + "\nGuesses left: " + game.getRemainingTurns());
        usedLettersLabel.setText(game.getGuessedLettersDisplay());
        bannerLabel.setText(message);

        for (int index = 0; index < hangmanSteps.size(); index++) {
            hangmanSteps.get(index).setVisible(index < game.getWrongGuesses());
        }

        if (game.hasWon()) {
            bannerLabel.getStyleClass().removeAll("banner-loss", "banner-neutral");
            bannerLabel.getStyleClass().add("banner-win");
            answerLabel.setText("Word cracked: " + game.getCurrentWord());
        } else if (game.hasLost()) {
            bannerLabel.getStyleClass().removeAll("banner-win", "banner-neutral");
            bannerLabel.getStyleClass().add("banner-loss");
            answerLabel.setText("The answer was " + game.getCurrentWord());
        } else {
            bannerLabel.getStyleClass().removeAll("banner-win", "banner-loss");
            bannerLabel.getStyleClass().add("banner-neutral");
            answerLabel.setText("Hint vibe: everything here sounds like a certification cram session.");
        }

        playBannerAnimation();
    }

    private void playBannerAnimation() {
        FadeTransition fadeOut = new FadeTransition(Duration.millis(110), bannerLabel);
        fadeOut.setFromValue(1.0);
        fadeOut.setToValue(0.35);

        FadeTransition fadeIn = new FadeTransition(Duration.millis(200), bannerLabel);
        fadeIn.setFromValue(0.35);
        fadeIn.setToValue(1.0);

        ScaleTransition punch = new ScaleTransition(Duration.millis(260), bannerLabel);
        punch.setFromX(0.98);
        punch.setFromY(0.98);
        punch.setToX(1.0);
        punch.setToY(1.0);

        SequentialTransition sequence = new SequentialTransition(fadeOut, fadeIn, punch);
        sequence.play();
    }

    private void handleKeyPress(KeyEvent event) {
        if (event.getCode() == KeyCode.ENTER) {
            game.resetRound();
            enableKeyboard();
            refreshUi("Fresh round. Keyboard warriors welcome.");
            return;
        }

        String text = event.getText();
        if (text == null || text.isBlank()) {
            return;
        }

        char character = Character.toUpperCase(text.charAt(0));
        if (character >= 'A' && character <= 'Z') {
            handleGuess(character);
        }
    }

    private void disableLetter(char letter) {
        for (Button letterButton : letterButtons) {
            if (letterButton.getText().charAt(0) == letter) {
                letterButton.setDisable(true);
                return;
            }
        }
    }

    private void disableKeyboard() {
        for (Button letterButton : letterButtons) {
            letterButton.setDisable(true);
        }
    }

    private void enableKeyboard() {
        for (Button letterButton : letterButtons) {
            letterButton.setDisable(false);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}