async function request(path, options = {}) {
    const response = await fetch(path, {
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
        const error = new Error(typeof body === "string" ? body : body.message || "Request failed");
        error.status = response.status;
        error.body = body;
        throw error;
    }

    return body;
}

export function startMatch() {
    return request("/api/matches", { method: "POST", body: "{}" });
}

export function getCurrentMatch() {
    return request("/api/matches/current");
}

export function submitMove(matchId, playerMove) {
    return request(`/api/matches/${matchId}/rounds`, {
        method: "POST",
        body: JSON.stringify({ playerMove })
    });
}

export function getHistory(page = 0, size = 12) {
    return request(`/api/matches?page=${page}&size=${size}`);
}

export function getMatch(matchId) {
    return request(`/api/matches/${matchId}`);
}

export function getLiveHealth() {
    return request("/health/live");
}

export function getReadyHealth() {
    return request("/health/ready");
}