package com.mcnz.copilot.rps.boundary;

import com.mcnz.copilot.rps.controller.PlayerController;
import com.mcnz.copilot.rps.controller.PlayerResolution;

import jakarta.inject.Inject;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;

@Path("players")
@Produces(MediaType.APPLICATION_JSON)
public class PlayerBoundary {

    @Inject
    private PlayerController playerController;

    @GET
    @Path("current")
    public Response currentPlayer(@CookieParam(PlayerController.PLAYER_COOKIE_NAME) String playerIdCookie) {
        System.out.println("PlayerBoundary.currentPlayer cookie=" + playerIdCookie);
        PlayerResolution resolution = playerController.resolvePlayer(playerIdCookie);
        NewCookie playerCookie = new NewCookie.Builder(PlayerController.PLAYER_COOKIE_NAME)
                .value(resolution.playerId())
                .path("/")
                .maxAge(31536000)
                .httpOnly(false)
                .build();
        return Response.ok(playerController.toView(resolution.player())).cookie(playerCookie).build();
    }
}