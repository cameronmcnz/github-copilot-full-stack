package com.example.rps.service;

import com.example.rps.dto.HistoryResponse;
import com.example.rps.dto.MatchSummaryResponse;
import com.example.rps.dto.MatchViewResponse;
import com.example.rps.dto.RoundViewResponse;
import com.example.rps.entity.Match;
import com.example.rps.entity.MatchOutcome;
import com.example.rps.entity.MatchStatus;
import com.example.rps.entity.Move;
import com.example.rps.entity.Round;
import com.example.rps.entity.RoundResult;
import com.example.rps.entity.User;
import com.example.rps.exception.MatchConflictException;
import com.example.rps.exception.MatchNotFoundException;
import com.example.rps.repository.MatchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final GameService gameService;

    public MatchService(MatchRepository matchRepository, GameService gameService) {
        this.matchRepository = matchRepository;
        this.gameService = gameService;
    }

    @Transactional
    public MatchViewResponse startMatch(User user) {
        abandonActiveMatches(user.getPublicId());

        Match match = new Match();
        match.setPublicId(UUID.randomUUID().toString());
        match.setUser(user);
        match.setStatus(MatchStatus.IN_PROGRESS);
        match.setCurrentRoundNumber(1);
        match.setPlayerWins(0);
        match.setComputerWins(0);
        match.setSummaryMessage("Round 1 is ready. Make your move.");

        return toView(matchRepository.save(match));
    }

    @Transactional(readOnly = true)
    public MatchViewResponse getMatch(String userPublicId, String matchPublicId) {
        return toView(getOwnedMatch(userPublicId, matchPublicId));
    }

    @Transactional(readOnly = true)
    public MatchViewResponse getCurrentMatch(String userPublicId) {
        Match match = matchRepository.findFirstByUser_PublicIdAndStatusOrderByCreatedAtDesc(userPublicId, MatchStatus.IN_PROGRESS)
                .orElseThrow(() -> new MatchNotFoundException("No active match was found for this user."));
        return toView(match);
    }

    @Transactional(readOnly = true)
    public HistoryResponse getHistory(String userPublicId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Page<Match> result = matchRepository.findByUser_PublicIdOrderByCreatedAtDesc(userPublicId, PageRequest.of(safePage, safeSize));

        List<MatchSummaryResponse> matches = result.getContent().stream()
                .map(this::toSummary)
                .toList();

        return new HistoryResponse(matches, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public MatchViewResponse submitMove(String userPublicId, String matchPublicId, Move playerMove) {
        Match match = getOwnedMatch(userPublicId, matchPublicId);
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new MatchConflictException("This match is already complete.");
        }
        if (match.getRounds().size() >= 3) {
            throw new MatchConflictException("No more rounds can be played in this match.");
        }

        Move computerMove = gameService.generateComputerMove();
        RoundResult result = gameService.evaluate(playerMove, computerMove);

        Round round = new Round();
        round.setRoundNumber(match.getRounds().size() + 1);
        round.setPlayerMove(playerMove);
        round.setComputerMove(computerMove);
        round.setResult(result);
        round.setMessage(gameService.roundMessage(result));
        match.addRound(round);

        if (result == RoundResult.WIN) {
            match.setPlayerWins(match.getPlayerWins() + 1);
        } else if (result == RoundResult.LOSS) {
            match.setComputerWins(match.getComputerWins() + 1);
        }

        boolean complete = match.getPlayerWins() == 2 || match.getComputerWins() == 2 || match.getRounds().size() == 3;
        if (complete) {
            MatchOutcome outcome = gameService.determineMatchOutcome(match.getPlayerWins(), match.getComputerWins());
            match.setStatus(MatchStatus.COMPLETED);
            match.setOutcome(outcome);
            match.setCompletedAt(OffsetDateTime.now());
            match.setSummaryMessage(gameService.summaryMessage(outcome));
        } else {
            match.setCurrentRoundNumber(match.getRounds().size() + 1);
            match.setSummaryMessage("Round %d is ready. Make your move.".formatted(match.getCurrentRoundNumber()));
        }

        return toView(matchRepository.save(match));
    }

    private void abandonActiveMatches(String userPublicId) {
        List<Match> activeMatches = matchRepository.findByUser_PublicIdAndStatus(userPublicId, MatchStatus.IN_PROGRESS);
        activeMatches.forEach(match -> {
            match.setStatus(MatchStatus.COMPLETED);
            match.setOutcome(MatchOutcome.ABANDONED);
            match.setCompletedAt(OffsetDateTime.now());
            match.setSummaryMessage(gameService.summaryMessage(MatchOutcome.ABANDONED));
        });
    }

    private Match getOwnedMatch(String userPublicId, String matchPublicId) {
        return matchRepository.findByPublicIdAndUser_PublicId(matchPublicId, userPublicId)
                .orElseThrow(() -> new MatchNotFoundException("The requested match was not found."));
    }

    private MatchViewResponse toView(Match match) {
        List<RoundViewResponse> rounds = match.getRounds().stream()
                .map(round -> new RoundViewResponse(
                        round.getRoundNumber(),
                        round.getPlayerMove().name(),
                        round.getComputerMove().name(),
                        round.getResult().name(),
                        round.getMessage(),
                        round.getCreatedAt()))
                .toList();

        return new MatchViewResponse(
                match.getPublicId(),
                match.getStatus().name(),
                match.getOutcome() == null ? null : match.getOutcome().name(),
                match.getStatus() == MatchStatus.COMPLETED,
                match.getCurrentRoundNumber(),
                match.getPlayerWins(),
                match.getComputerWins(),
                match.getSummaryMessage(),
                match.getCreatedAt(),
                match.getCompletedAt(),
                rounds);
    }

    private MatchSummaryResponse toSummary(Match match) {
        return new MatchSummaryResponse(
                match.getPublicId(),
                match.getStatus().name(),
                match.getOutcome() == null ? null : match.getOutcome().name(),
                match.getPlayerWins(),
                match.getComputerWins(),
                match.getRounds().size(),
                match.getSummaryMessage(),
                match.getCreatedAt(),
                match.getCompletedAt());
    }
}