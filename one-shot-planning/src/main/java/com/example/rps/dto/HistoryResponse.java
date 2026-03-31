package com.example.rps.dto;

import java.util.List;

public record HistoryResponse(
        List<MatchSummaryResponse> matches,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}