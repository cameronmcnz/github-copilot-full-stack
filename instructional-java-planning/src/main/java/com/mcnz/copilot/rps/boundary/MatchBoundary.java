package com.mcnz.copilot.rps.boundary;

import com.mcnz.copilot.rps.controller.MatchController;
import com.mcnz.copilot.rps.controller.MatchView;
import com.mcnz.copilot.rps.controller.MoveRequest;
import com.mcnz.copilot.rps.controller.PlayerController;
import com.mcnz.copilot.rps.controller.PlayerResolution;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;

@Path("matches")
@Produces(MediaType.APPLICATION_JSON)
public class MatchBoundary {

    @Inject
    private MatchController matchController;

    @Inject
    private PlayerController playerController;

    @POST
    public Response startMatch(@CookieParam(PlayerController.PLAYER_COOKIE_NAME) String playerIdCookie) {
        System.out.println("MatchBoundary.startMatch cookie=" + playerIdCookie);
        PlayerResolution resolution = playerController.resolvePlayer(playerIdCookie);
        MatchView view = matchController.startMatch(resolution.player());
        return Response.ok(view).cookie(buildCookie(resolution.playerId())).build();
    }

    @GET
    @Path("active")
    public Response activeMatch(@CookieParam(PlayerController.PLAYER_COOKIE_NAME) String playerIdCookie) {
        System.out.println("MatchBoundary.activeMatch cookie=" + playerIdCookie);
        PlayerResolution resolution = playerController.resolvePlayer(playerIdCookie);
        MatchView view = matchController.getActiveMatch(resolution.player());
        return Response.ok(view).cookie(buildCookie(resolution.playerId())).build();
    }

    @GET
    public Response listMatches(@CookieParam(PlayerController.PLAYER_COOKIE_NAME) String playerIdCookie) {
        System.out.println("MatchBoundary.listMatches cookie=" + playerIdCookie);
        PlayerResolution resolution = playerController.resolvePlayer(playerIdCookie);
        return Response.ok(matchController.listMatches(resolution.player())).cookie(buildCookie(resolution.playerId())).build();
    }

    @GET
    @Path("{matchId}")
    public Response getMatch(@CookieParam(PlayerController.PLAYER_COOKIE_NAME) String playerIdCookie, @PathParam("matchId") Long matchId) {
        System.out.println("MatchBoundary.getMatch cookie=" + playerIdCookie + " matchId=" + matchId);
        PlayerResolution resolution = playerController.resolvePlayer(playerIdCookie);
        MatchView view = matchController.getMatch(resolution.player(), matchId);
        Response response = null;

        if (view != null) {
            response = Response.ok(view).cookie(buildCookie(resolution.playerId())).build();
        }

        if (view == null) {
            throw new NotFoundException("Match not found");
        }

        return response;
    }

    @POST
    @Path("{matchId}/rounds")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response playRound(@CookieParam(PlayerController.PLAYER_COOKIE_NAME) String playerIdCookie,
                              @PathParam("matchId") Long matchId,
                              MoveRequest moveRequest) {
        System.out.println("MatchBoundary.playRound cookie=" + playerIdCookie + " matchId=" + matchId + " move=" + moveRequest);
        PlayerResolution resolution = playerController.resolvePlayer(playerIdCookie);
        MatchView view = matchController.playRound(resolution.player(), matchId, moveRequest == null ? null : moveRequest.move());
        Response response = null;

        if (view != null) {
            response = Response.ok(view).cookie(buildCookie(resolution.playerId())).build();
        }

        if (view == null) {
            throw new NotFoundException("Active match not found or move not allowed");
        }

        return response;
    }

    private NewCookie buildCookie(String playerId) {
        return new NewCookie.Builder(PlayerController.PLAYER_COOKIE_NAME)
                .value(playerId)
                .path("/")
                .maxAge(31536000)
                .httpOnly(false)
                .build();
    }
}