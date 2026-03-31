package com.example.rps.integration;

import com.example.rps.RockPaperScissorsApplication;
import com.example.rps.dto.MatchViewResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = RockPaperScissorsApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRenderHomePageAndPlayAFullMatch() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Rosette Rock Paper Scissors")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Troubleshooting")));

        MvcResult startResult = mockMvc.perform(post("/api/matches"))
                .andExpect(status().isCreated())
                .andReturn();

        String setCookie = startResult.getResponse().getHeader("Set-Cookie");
        assertThat(setCookie).contains("rps-user-id=");

        String cookieValue = setCookie.substring(setCookie.indexOf('=') + 1, setCookie.indexOf(';'));
        MockCookie cookie = new MockCookie("rps-user-id", cookieValue);

        MatchViewResponse match = objectMapper.readValue(startResult.getResponse().getContentAsByteArray(), MatchViewResponse.class);
        assertThat(match.complete()).isFalse();

        MatchViewResponse updated = match;
        for (int index = 0; index < 3 && !updated.complete(); index++) {
            MvcResult roundResult = mockMvc.perform(post("/api/matches/{matchId}/rounds", updated.matchId())
                            .cookie(cookie)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"playerMove":"ROCK"}
                                    """))
                    .andExpect(status().isOk())
                    .andReturn();

            updated = objectMapper.readValue(roundResult.getResponse().getContentAsByteArray(), MatchViewResponse.class);
        }

        assertThat(updated.rounds()).isNotEmpty();
        assertThat(updated.complete()).isTrue();

        mockMvc.perform(get("/api/matches/current").cookie(cookie))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/matches").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString(updated.matchId())));

        mockMvc.perform(get("/health/live"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("UP")));

        mockMvc.perform(get("/health/ready"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("database")));
    }
}