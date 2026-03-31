package com.mcnz.copilot.rps.boundary;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Liveness;

@Liveness
public class LiveHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        System.out.println("LiveHealthCheck.call");
        return HealthCheckResponse.named("rps-live").up().build();
    }
}