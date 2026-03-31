package com.example.rps.controller;

import com.example.rps.dto.HistoryResponse;
import com.example.rps.dto.MatchSummaryResponse;
import com.example.rps.dto.MatchViewResponse;
import com.example.rps.dto.RoundViewResponse;
import com.example.rps.entity.User;
import com.example.rps.exception.GlobalExceptionHandler;
import com.example.rps.service.MatchService;
import com.example.rps.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MatchController.class)
@Import(GlobalExceptionHandler.class)
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MatchService matchService;

    @MockBean
    private UserService userService;

    @Test
    void shouldStartMatch() throws Exception {
        User user = new User();
        user.setPublicId("user-1");

        MatchViewResponse response = new MatchViewResponse(
                "match-1",
                "IN_PROGRESS",
                null,
                false,
                1,
                0,
                0,
                "Round 1 is ready. Make your move.",
                OffsetDateTime.now(),
                null,
                List.of());

        when(userService.resolveOrCreateUser(any(), any(), any())).thenReturn(user);
        when(matchService.startMatch(user)).thenReturn(response);

        mockMvc.perform(post("/api/matches").cookie(new jakarta.servlet.http.Cookie("rps-user-id", "user-1")))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/matches/match-1"))
                .andExpect(jsonPath("$.matchId").value("match-1"));
    }

    @Test
    void shouldReturnHistory() throws Exception {
        User user = new User();
        user.setPublicId("user-1");

        HistoryResponse historyResponse = new HistoryResponse(
                List.of(new MatchSummaryResponse(
                        "match-1",
                        "COMPLETED",
                        "PLAYER_WIN",
                        2,
                        1,
                        3,
                        "Match complete. You won the series.",
                        OffsetDateTime.now(),
                        OffsetDateTime.now())),
                0,
                10,
                1,
                1);

        when(userService.resolveOrCreateUser(any(), any(), any())).thenReturn(user);
        when(matchService.getHistory(eq("user-1"), eq(0), eq(10))).thenReturn(historyResponse);

        mockMvc.perform(get("/api/matches").cookie(new jakarta.servlet.http.Cookie("rps-user-id", "user-1"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches[0].matchId").value("match-1"));
    }
}