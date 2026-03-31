package com.mcnz.copilot.rps.boundary;

import com.mcnz.copilot.rps.controller.PlayerController;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

import jakarta.inject.Inject;

@Readiness
public class ReadyHealthCheck implements HealthCheck {

    @Inject
    private PlayerController playerController;

    @Override
    public HealthCheckResponse call() {
        System.out.println("ReadyHealthCheck.call");
        int knownPlayers = playerController.listPlayers().size();
        return HealthCheckResponse.named("rps-ready").up().withData("knownPlayers", knownPlayers).build();
    }
}