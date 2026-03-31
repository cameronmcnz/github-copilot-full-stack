const state = {
    player: null,
    activeMatch: null,
    history: [],
    selectedMatch: null
};

const emojiByMove = {
    ROCK: "🪨",
    PAPER: "📄",
    SCISSORS: "✂️"
};

const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const moveButtons = Array.from(document.querySelectorAll(".move-button"));

document.getElementById("newMatchButton").addEventListener("click", () => startMatch());
document.getElementById("refreshMatchButton").addEventListener("click", () => loadActiveMatch());
document.getElementById("refreshHistoryButton").addEventListener("click", () => loadHistory());
document.getElementById("checkHealthButton").addEventListener("click", () => refreshHealth());
document.getElementById("copyPlayerButton").addEventListener("click", copyPlayerId);
document.getElementById("runApiButton").addEventListener("click", runManualRequest);

tabButtons.forEach((button) => {
    button.addEventListener("click", () => showTab(button.dataset.tab));
});

moveButtons.forEach((button) => {
    button.addEventListener("click", () => submitMove(button.dataset.move));
});

initialize();

async function initialize() {
    await loadPlayer();
    await Promise.all([loadActiveMatch(), loadHistory(), refreshHealth()]);
}

async function loadPlayer() {
    const player = await apiCall("GET", "api/players/current");
    state.player = player;
    const label = player ? player.playerId : "Unavailable";
    document.getElementById("playerIdDisplay").textContent = label;
    document.getElementById("persistentPlayerChip").textContent = `Player ${label}`;
}

async function startMatch() {
    const created = await apiCall("POST", "api/matches");
    state.activeMatch = created;
    renderActiveMatch();
    await loadHistory();
}

async function loadActiveMatch() {
    const match = await apiCall("GET", "api/matches/active");
    state.activeMatch = match;
    renderActiveMatch();
}

async function submitMove(move) {
    const activeMatch = state.activeMatch;
    let updatedMatch = null;

    if (activeMatch && !activeMatch.complete) {
        updatedMatch = await apiCall("POST", `api/matches/${activeMatch.matchId}/rounds`, { move });
    }

    state.activeMatch = updatedMatch;
    renderActiveMatch();
    await loadHistory();
}

async function loadHistory() {
    const history = await apiCall("GET", "api/matches");
    state.history = Array.isArray(history) ? history : [];
    renderHistory();
}

async function loadMatchDetail(matchId) {
    const detail = await apiCall("GET", `api/matches/${matchId}`);
    state.selectedMatch = detail;
    renderDetail();
    showTab("detail");
}

async function refreshHealth() {
    const [liveResponse, readyResponse] = await Promise.all([
        fetch("health/live"),
        fetch("health/ready")
    ]);
    document.getElementById("liveHealthDisplay").textContent = liveResponse.ok ? "UP" : "DOWN";
    document.getElementById("readyHealthDisplay").textContent = readyResponse.ok ? "UP" : "DOWN";
}

function renderActiveMatch() {
    const match = state.activeMatch;
    const status = document.getElementById("statusMessage");
    const matchSummary = document.getElementById("matchSummary");
    const currentRoundList = document.getElementById("currentRoundList");
    const moveEnabled = Boolean(match) && !match.complete;
    const latestRound = match && Array.isArray(match.rounds) && match.rounds.length > 0 ? match.rounds[match.rounds.length - 1] : null;

    document.getElementById("heroStatus").textContent = match ? (match.complete ? "Match complete" : "Match in progress") : "Ready for a new match";
    document.getElementById("matchHeadline").textContent = match ? `Match ${match.matchId}` : "No active match";
    document.getElementById("playerScore").textContent = match ? match.playerScore : 0;
    document.getElementById("computerScore").textContent = match ? match.computerScore : 0;
    document.getElementById("roundNumber").textContent = match ? match.nextRoundNumber : 1;
    document.getElementById("playerMoveDisplay").textContent = latestRound ? emojiByMove[latestRound.playerMove] : "❔";
    document.getElementById("computerMoveDisplay").textContent = latestRound ? emojiByMove[latestRound.computerMove] : "❔";
    document.getElementById("activeMatchDisplay").textContent = match ? match.matchId : "None";
    document.getElementById("matchCompletionBadge").textContent = match ? (match.complete ? "Completed" : "In progress") : "Awaiting start";

    status.className = "status-banner";

    if (match) {
        status.textContent = match.statusMessage;
        if (match.lastRoundOutcome) {
            status.classList.add(match.lastRoundOutcome.toLowerCase());
        }
        matchSummary.innerHTML = `
            <h3>${match.summaryTitle}</h3>
            <p>${match.summaryBody}</p>
        `;
        currentRoundList.innerHTML = match.rounds.map((round) => `
            <div class="round-entry">
                <strong>Round ${round.roundNumber}</strong>
                <div class="round-meta">You ${emojiByMove[round.playerMove]} vs Computer ${emojiByMove[round.computerMove]} · ${round.outcomeLabel}</div>
            </div>
        `).join("");
    } else {
        status.textContent = "Start a match to begin.";
        matchSummary.innerHTML = "<p>Play a round to see the latest result and full match summary.</p>";
        currentRoundList.innerHTML = "<div class=\"round-entry\">No rounds have been played yet.</div>";
    }

    moveButtons.forEach((button) => {
        button.disabled = !moveEnabled;
    });
}

function renderHistory() {
    const historyList = document.getElementById("historyList");
    const activeMatchId = state.selectedMatch ? state.selectedMatch.matchId : null;
    let markup = "";

    if (state.history.length === 0) {
        markup = '<div class="history-item">No matches recorded yet.</div>';
    } else {
        markup = state.history.map((match) => `
            <button class="history-item ${activeMatchId === match.matchId ? "selected" : ""}" data-match-id="${match.matchId}">
                <strong>${match.summaryTitle}</strong>
                <div class="history-meta">${formatDate(match.startedAt)} · ${match.summaryBody}</div>
            </button>
        `).join("");
    }

    historyList.innerHTML = markup;
    historyList.querySelectorAll("[data-match-id]").forEach((button) => {
        button.addEventListener("click", () => loadMatchDetail(button.dataset.matchId));
    });
}

function renderDetail() {
    const detail = state.selectedMatch;
    const headline = document.getElementById("detailHeadline");
    const content = document.getElementById("matchDetailContent");

    if (detail) {
        headline.textContent = `Match ${detail.matchId}`;
        content.innerHTML = `
            <div class="detail-round">
                <strong>${detail.summaryTitle}</strong>
                <div class="detail-summary">Started ${formatDate(detail.startedAt)} · Finished ${detail.completedAt ? formatDate(detail.completedAt) : "Still active"}</div>
            </div>
            ${detail.rounds.map((round) => `
                <div class="detail-round">
                    <strong>Round ${round.roundNumber}</strong>
                    <div class="detail-summary">You ${emojiByMove[round.playerMove]} vs Computer ${emojiByMove[round.computerMove]} · ${round.outcomeLabel}</div>
                </div>
            `).join("")}
        `;
    } else {
        headline.textContent = "Pick a match from history";
        content.innerHTML = "<div class=\"detail-round\">Match details will appear here.</div>";
    }
}

function showTab(tabName) {
    tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
    });
    tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === `panel-${tabName}`);
    });
}

async function runManualRequest() {
    const method = document.getElementById("apiMethod").value;
    const path = document.getElementById("apiPath").value;
    const bodyText = document.getElementById("apiBody").value;
    const output = document.getElementById("apiOutput");
    let requestBody = null;

    if (method !== "GET" && bodyText.trim().length > 0) {
        requestBody = JSON.parse(bodyText);
    }

    try {
        const result = await apiCall(method, path, requestBody);
        output.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        output.textContent = error.message;
    }
}

async function apiCall(method, path, body) {
    const options = {
        method,
        headers: {
            Accept: "application/json"
        }
    };

    if (body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(path, options);
    const text = await response.text();
    const hasJson = response.headers.get("content-type") && response.headers.get("content-type").includes("application/json");
    const payload = hasJson && text ? JSON.parse(text) : text;

    if (!response.ok) {
        throw new Error(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
    }

    return payload;
}

function formatDate(value) {
    let formatted = "Unknown";

    if (value) {
        formatted = new Date(value).toLocaleString();
    }

    return formatted;
}

async function copyPlayerId() {
    if (state.player && navigator.clipboard) {
        await navigator.clipboard.writeText(state.player.playerId);
    }
}