package com.example.rps.service;

import com.example.rps.dto.MatchViewResponse;
import com.example.rps.entity.Match;
import com.example.rps.entity.MatchStatus;
import com.example.rps.entity.Move;
import com.example.rps.entity.User;
import com.example.rps.repository.MatchRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private GameService gameService;

    @InjectMocks
    private MatchService matchService;

    @Test
    void shouldStartNewMatchAndAbandonExistingOne() {
        User user = new User();
        user.setPublicId("user-1");

        Match activeMatch = new Match();
        activeMatch.setStatus(MatchStatus.IN_PROGRESS);

        when(matchRepository.findByUser_PublicIdAndStatus("user-1", MatchStatus.IN_PROGRESS)).thenReturn(List.of(activeMatch));
        when(matchRepository.save(any(Match.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MatchViewResponse response = matchService.startMatch(user);

        assertThat(response.status()).isEqualTo(MatchStatus.IN_PROGRESS.name());
        assertThat(response.currentRoundNumber()).isEqualTo(1);
        assertThat(activeMatch.getStatus()).isEqualTo(MatchStatus.COMPLETED);
    }

    @Test
    void shouldCompleteMatchAfterSecondWin() {
        Match match = new Match();
        match.setPublicId("match-1");
        match.setStatus(MatchStatus.IN_PROGRESS);
        match.setCurrentRoundNumber(2);
        match.setPlayerWins(1);
        match.setComputerWins(0);

        User user = new User();
        user.setPublicId("user-1");
        match.setUser(user);

        when(matchRepository.findByPublicIdAndUser_PublicId("match-1", "user-1")).thenReturn(Optional.of(match));
        when(gameService.generateComputerMove()).thenReturn(Move.SCISSORS);
        when(gameService.evaluate(Move.ROCK, Move.SCISSORS)).thenReturn(com.example.rps.entity.RoundResult.WIN);
        when(gameService.roundMessage(com.example.rps.entity.RoundResult.WIN)).thenReturn("You won the round.");
        when(gameService.determineMatchOutcome(2, 0)).thenReturn(com.example.rps.entity.MatchOutcome.PLAYER_WIN);
        when(gameService.summaryMessage(com.example.rps.entity.MatchOutcome.PLAYER_WIN)).thenReturn("Match complete. You won the series.");
        when(matchRepository.save(any(Match.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MatchViewResponse response = matchService.submitMove("user-1", "match-1", Move.ROCK);

        assertThat(response.complete()).isTrue();
        assertThat(response.outcome()).isEqualTo("PLAYER_WIN");
        assertThat(response.playerWins()).isEqualTo(2);
        assertThat(response.rounds()).hasSize(1);
    }
}