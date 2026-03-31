package com.mcnz.copilot.rps.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import com.mcnz.copilot.rps.entity.MatchEntity;
import com.mcnz.copilot.rps.entity.MatchStatus;
import com.mcnz.copilot.rps.entity.Move;
import com.mcnz.copilot.rps.entity.PlayerEntity;
import com.mcnz.copilot.rps.entity.RoundEntity;
import com.mcnz.copilot.rps.entity.RoundOutcome;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MatchController {

    @PersistenceContext(unitName = "rpsPersistence")
    private EntityManager entityManager;

    @Transactional
    public MatchView startMatch(PlayerEntity player) {
        MatchEntity existingMatch = findActiveMatchEntity(player);
        MatchEntity createdMatch = existingMatch;

        if (existingMatch != null) {
            existingMatch.setStatus(MatchStatus.COMPUTER_WON);
            existingMatch.setCompletedAt(OffsetDateTime.now());
        }

        createdMatch = new MatchEntity();
        createdMatch.setPlayer(player);
        createdMatch.setStartedAt(OffsetDateTime.now());
        createdMatch.setStatus(MatchStatus.IN_PROGRESS);
        createdMatch.setPlayerScore(0);
        createdMatch.setComputerScore(0);
        entityManager.persist(createdMatch);
        entityManager.flush();

        return toView(createdMatch);
    }

    public MatchView getActiveMatch(PlayerEntity player) {
        MatchEntity activeMatch = findActiveMatchEntity(player);
        MatchView view = null;

        if (activeMatch != null) {
            view = toView(activeMatch);
        }

        return view;
    }

    @Transactional
    public MatchView playRound(PlayerEntity player, Long matchId, Move move) {
        MatchEntity match = entityManager.find(MatchEntity.class, matchId);
        MatchView view = null;

        if (match != null && match.getPlayer().getId().equals(player.getId()) && match.getStatus() == MatchStatus.IN_PROGRESS && move != null) {
            RoundEntity round = new RoundEntity();
            round.setMatch(match);
            round.setRoundNumber(match.getRounds().size() + 1);
            round.setPlayerMove(move);
            round.setComputerMove(randomMove());
            round.setOutcome(determineOutcome(round.getPlayerMove(), round.getComputerMove()));
            entityManager.persist(round);
            match.getRounds().add(round);

            if (round.getOutcome() == RoundOutcome.WIN) {
                match.setPlayerScore(match.getPlayerScore() + 1);
            }

            if (round.getOutcome() == RoundOutcome.LOSS) {
                match.setComputerScore(match.getComputerScore() + 1);
            }

            if (match.getPlayerScore() >= 2) {
                match.setStatus(MatchStatus.PLAYER_WON);
                match.setCompletedAt(OffsetDateTime.now());
            }

            if (match.getComputerScore() >= 2) {
                match.setStatus(MatchStatus.COMPUTER_WON);
                match.setCompletedAt(OffsetDateTime.now());
            }

            view = toView(match);
        }

        return view;
    }

    public List<MatchView> listMatches(PlayerEntity player) {
        List<MatchEntity> matches = entityManager.createQuery(
                        "select distinct m from MatchEntity m left join fetch m.rounds where m.player = :player order by m.startedAt desc",
                        MatchEntity.class)
                .setParameter("player", player)
                .getResultList();
        List<MatchView> views = new ArrayList<>();
        int index = 0;

        while (index < matches.size()) {
            views.add(toView(matches.get(index)));
            index++;
        }

        return views;
    }

    public MatchView getMatch(PlayerEntity player, Long matchId) {
        MatchEntity match = findMatchEntity(player, matchId);
        MatchView view = null;

        if (match != null) {
            view = toView(match);
        }

        return view;
    }

    private MatchEntity findActiveMatchEntity(PlayerEntity player) {
        MatchEntity match = null;

        try {
            match = entityManager.createQuery(
                            "select distinct m from MatchEntity m left join fetch m.rounds where m.player = :player and m.status = :status order by m.startedAt desc",
                            MatchEntity.class)
                    .setParameter("player", player)
                    .setParameter("status", MatchStatus.IN_PROGRESS)
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (NoResultException ignored) {
            match = null;
        }

        return match;
    }

    private MatchEntity findMatchEntity(PlayerEntity player, Long matchId) {
        MatchEntity match = null;

        try {
            match = entityManager.createQuery(
                            "select distinct m from MatchEntity m left join fetch m.rounds where m.player = :player and m.id = :matchId",
                            MatchEntity.class)
                    .setParameter("player", player)
                    .setParameter("matchId", matchId)
                    .getSingleResult();
        } catch (NoResultException ignored) {
            match = null;
        }

        return match;
    }

    private Move randomMove() {
        Move[] moves = Move.values();
        return moves[ThreadLocalRandom.current().nextInt(moves.length)];
    }

    private RoundOutcome determineOutcome(Move playerMove, Move computerMove) {
        RoundOutcome outcome = RoundOutcome.TIE;

        if (playerMove != computerMove) {
            if ((playerMove == Move.ROCK && computerMove == Move.SCISSORS)
                    || (playerMove == Move.PAPER && computerMove == Move.ROCK)
                    || (playerMove == Move.SCISSORS && computerMove == Move.PAPER)) {
                outcome = RoundOutcome.WIN;
            } else {
                outcome = RoundOutcome.LOSS;
            }
        }

        return outcome;
    }

    private MatchView toView(MatchEntity match) {
        List<RoundView> rounds = new ArrayList<>();
        int nextRoundNumber = match.getRounds().size() + 1;
        String lastRoundOutcome = null;
        String statusMessage = "Start the first round.";
        String summaryTitle = "Fresh match ready";
        String summaryBody = "Pick rock, paper, or scissors to begin.";
        boolean complete = match.getStatus() != MatchStatus.IN_PROGRESS;
        int index = 0;

        while (index < match.getRounds().size()) {
            RoundEntity round = match.getRounds().get(index);
            rounds.add(new RoundView(round.getRoundNumber(), round.getPlayerMove(), round.getComputerMove(), toOutcomeLabel(round.getOutcome())));
            index++;
        }

        if (!rounds.isEmpty()) {
            RoundView latestRound = rounds.get(rounds.size() - 1);
            lastRoundOutcome = latestRound.outcomeLabel().toUpperCase();
            statusMessage = toStatusMessage(latestRound.outcomeLabel(), match);
            summaryTitle = complete ? toCompletedTitle(match) : "Match still live";
            summaryBody = complete ? toCompletedBody(match) : "Next round decides the momentum. Keep going.";
        }

        if (rounds.isEmpty() && complete) {
            summaryTitle = toCompletedTitle(match);
            summaryBody = toCompletedBody(match);
            statusMessage = summaryBody;
        }

        return new MatchView(
                match.getId(),
                match.getStartedAt(),
                match.getCompletedAt(),
                match.getPlayerScore(),
                match.getComputerScore(),
                nextRoundNumber,
                complete,
                lastRoundOutcome,
                statusMessage,
                summaryTitle,
                summaryBody,
                rounds);
    }

    private String toOutcomeLabel(RoundOutcome outcome) {
        String label = "Tie";

        if (outcome == RoundOutcome.WIN) {
            label = "Win";
        }

        if (outcome == RoundOutcome.LOSS) {
            label = "Loss";
        }

        return label;
    }

    private String toStatusMessage(String latestOutcomeLabel, MatchEntity match) {
        String message = "Round tied. The score stays even.";

        if ("Win".equals(latestOutcomeLabel)) {
            message = "You won the round. Keep the pressure on.";
        }

        if ("Loss".equals(latestOutcomeLabel)) {
            message = "The computer took the round. Time to answer back.";
        }

        if (match.getStatus() == MatchStatus.PLAYER_WON) {
            message = "Match complete. You won the best of three.";
        }

        if (match.getStatus() == MatchStatus.COMPUTER_WON) {
            message = "Match complete. The computer won this set.";
        }

        return message;
    }

    private String toCompletedTitle(MatchEntity match) {
        String title = "Computer wins the set";

        if (match.getStatus() == MatchStatus.PLAYER_WON) {
            title = "You won the set";
        }

        return title;
    }

    private String toCompletedBody(MatchEntity match) {
        String body = "Start another match whenever you want a rematch.";

        if (match.getStatus() == MatchStatus.PLAYER_WON) {
            body = "Two round wins sealed the match. Start another match whenever you want a rematch.";
        }

        if (match.getStatus() == MatchStatus.COMPUTER_WON) {
            body = "The server-side opponent reached two round wins first. Start another match whenever you want a rematch.";
        }

        return body;
    }
}