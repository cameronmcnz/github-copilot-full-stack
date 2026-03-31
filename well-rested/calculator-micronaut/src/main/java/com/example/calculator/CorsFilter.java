package com.example.calculator;

import io.micronaut.http.HttpHeaders;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ResponseFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.http.filter.FilterContinuation;
import jakarta.annotation.Nullable;

@ServerFilter("/**")
public class CorsFilter {

    private static final String UI_ORIGIN = "http://localhost:3004";

    @RequestFilter
    @Nullable
    public HttpResponse<?> filterRequest(HttpRequest<?> request) {
        if (request.getMethod().name().equals("OPTIONS")) {
            MutableHttpResponse<?> response = HttpResponse.ok();
            applyCorsHeaders(response);
            return response;
        }
        return null;
    }

    @ResponseFilter
    public void filterResponse(HttpRequest<?> request, MutableHttpResponse<?> response) {
        if (request.getHeaders().contains(HttpHeaders.ORIGIN)) {
            applyCorsHeaders(response);
        }
    }

    private void applyCorsHeaders(MutableHttpResponse<?> response) {
        response.header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, UI_ORIGIN);
        response.header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS");
        response.header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Content-Type");
        response.header(HttpHeaders.VARY, HttpHeaders.ORIGIN);
    }
}