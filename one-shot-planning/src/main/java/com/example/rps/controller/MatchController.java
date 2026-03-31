package com.example.rps.controller;

import com.example.rps.dto.HistoryResponse;
import com.example.rps.dto.MatchViewResponse;
import com.example.rps.dto.SubmitMoveRequest;
import com.example.rps.entity.User;
import com.example.rps.service.MatchService;
import com.example.rps.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/matches")
@Tag(name = "Matches")
public class MatchController {

    private final MatchService matchService;
    private final UserService userService;

    public MatchController(MatchService matchService, UserService userService) {
        this.matchService = matchService;
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "Start a new match")
    public ResponseEntity<MatchViewResponse> startMatch(
            @CookieValue(name = "rps-user-id", required = false) String userCookie,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        User user = userService.resolveOrCreateUser(userCookie, request, response);
        MatchViewResponse match = matchService.startMatch(user);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{matchId}")
                .buildAndExpand(match.matchId())
                .toUri();
        return ResponseEntity.created(location).body(match);
    }

    @GetMapping("/current")
    @Operation(summary = "Get the current in-progress match")
    public MatchViewResponse getCurrentMatch(
            @CookieValue(name = "rps-user-id", required = false) String userCookie,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        User user = userService.resolveOrCreateUser(userCookie, request, response);
        return matchService.getCurrentMatch(user.getPublicId());
    }

    @GetMapping
    @Operation(summary = "List match history")
    public HistoryResponse getHistory(
            @CookieValue(name = "rps-user-id", required = false) String userCookie,
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User user = userService.resolveOrCreateUser(userCookie, request, response);
        return matchService.getHistory(user.getPublicId(), page, size);
    }

    @GetMapping("/{matchId}")
    @Operation(summary = "Get match details")
    public MatchViewResponse getMatch(
            @CookieValue(name = "rps-user-id", required = false) String userCookie,
            HttpServletRequest request,
            HttpServletResponse response,
            @PathVariable String matchId
    ) {
        User user = userService.resolveOrCreateUser(userCookie, request, response);
        return matchService.getMatch(user.getPublicId(), matchId);
    }

    @PostMapping("/{matchId}/rounds")
    @Operation(summary = "Submit a move for the current round")
    public MatchViewResponse submitMove(
            @CookieValue(name = "rps-user-id", required = false) String userCookie,
            HttpServletRequest request,
            HttpServletResponse response,
            @PathVariable String matchId,
            @Valid @RequestBody SubmitMoveRequest submitMoveRequest
    ) {
        User user = userService.resolveOrCreateUser(userCookie, request, response);
        return matchService.submitMove(user.getPublicId(), matchId, submitMoveRequest.playerMove());
    }
}