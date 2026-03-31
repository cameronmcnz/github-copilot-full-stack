const state = {
    playerId: null,
    currentMatch: null,
};

const moveEmoji = {
    ROCK: "🪨",
    PAPER: "📄",
    SCISSORS: "✂️",
};

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const moveButtons = document.querySelectorAll(".move-btn");

const statusMessageEl = document.getElementById("statusMessage");
const roundNumberEl = document.getElementById("roundNumber");
const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");
const latestRoundEl = document.getElementById("latestRound");
const summaryEl = document.getElementById("summary");
const summaryTextEl = document.getElementById("summaryText");
const playerIdLabelEl = document.getElementById("playerIdLabel");
const historyListEl = document.getElementById("historyList");
const detailContainerEl = document.getElementById("matchDetailContainer");
const debugOutputEl = document.getElementById("debugOutput");

function setActiveTab(tabName) {
    tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
    panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === tabName);
    });
}

function wireTabs() {
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            setActiveTab(tab.dataset.tab);
        });
    });
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });
    const payload = await response.json();
    debugOutputEl.textContent = JSON.stringify(payload, null, 2);
    return { ok: response.ok, payload };
}

function renderPlayerId(playerId) {
    if (playerId) {
        state.playerId = playerId;
        playerIdLabelEl.textContent = playerId;
    }
}

function isMatchComplete(match) {
    let complete = false;
    if (match) {
        complete = !!match.is_complete;
    }
    return complete;
}

function renderMatch(match) {
    state.currentMatch = match;
    const hasMatch = !!match;
    let roundNumber = "-";
    let playerScore = 0;
    let computerScore = 0;
    let statusText = "Press Start New Match to begin.";
    let latestHtml = "";
    let summaryText = "";
    let latestClass = "latest-round";

    if (hasMatch) {
        roundNumber = match.current_round_number;
        playerScore = match.player_score;
        computerScore = match.computer_score;
        statusText = "Choose your move to play the next round.";

        if (match.rounds.length > 0) {
            const latest = match.rounds[match.rounds.length - 1];
            latestHtml = `Round ${latest.round_number}: You ${moveEmoji[latest.player_move]} ${latest.player_move} vs Computer ${moveEmoji[latest.computer_move]} ${latest.computer_move}`;
            if (latest.outcome === "PLAYER") {
                latestClass += " win";
                statusText = "You won the round. Keep it going!";
            } else if (latest.outcome === "COMPUTER") {
                latestClass += " loss";
                statusText = "Computer took that round. You can bounce back.";
            } else {
                latestClass += " tie";
                statusText = "Round tied. Next one decides momentum.";
            }
        }

        if (isMatchComplete(match)) {
            statusText = "Match complete. Start another whenever you are ready.";
            if (match.result === "PLAYER") {
                summaryText = "Final result: You won the best 2 out of 3 match!";
            } else if (match.result === "COMPUTER") {
                summaryText = "Final result: Computer won this match.";
            } else if (match.result === "ABANDONED") {
                summaryText = "Final result: Previous match was abandoned when a new one started.";
            } else {
                summaryText = "Final result: Match ended in a tie.";
            }
        }
    }

    roundNumberEl.textContent = roundNumber;
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    statusMessageEl.textContent = statusText;
    latestRoundEl.textContent = latestHtml;
    latestRoundEl.className = latestClass;

    const complete = isMatchComplete(match);
    moveButtons.forEach((button) => {
        button.disabled = !hasMatch || complete;
    });

    if (complete) {
        summaryTextEl.textContent = summaryText;
        summaryEl.classList.remove("hidden");
    } else {
        summaryEl.classList.add("hidden");
    }
}

async function refreshCurrentMatch() {
    const result = await apiRequest("/api/matches/current");
    renderPlayerId(result.payload.player_id);
    renderMatch(result.payload.match);
}

async function startMatch() {
    const result = await apiRequest("/api/matches/start", { method: "POST", body: "{}" });
    if (result.ok) {
        renderPlayerId(result.payload.player_id);
        renderMatch(result.payload.match);
        await loadHistory();
    } else {
        statusMessageEl.textContent = result.payload.error || "Unable to start match.";
    }
}

async function submitMove(move) {
    const result = await apiRequest("/api/matches/current/move", {
        method: "POST",
        body: JSON.stringify({ move }),
    });

    if (result.ok) {
        renderPlayerId(result.payload.player_id);
        renderMatch(result.payload.match);
        if (isMatchComplete(result.payload.match)) {
            await loadHistory();
        }
    } else {
        statusMessageEl.textContent = result.payload.error || "Unable to play move.";
    }
}

function historyItemHtml(match) {
    const started = new Date(match.started_at).toLocaleString();
    const roundCount = match.rounds.length;
    return `
        <div>
            <strong>Match #${match.id}</strong><br>
            <small>${started} | ${match.result || match.status} | Rounds: ${roundCount}</small>
        </div>
        <button data-match-id="${match.id}" class="secondary">View</button>
    `;
}

async function loadHistory() {
    const result = await apiRequest("/api/matches/history");
    renderPlayerId(result.payload.player_id);

    const matches = result.payload.matches || [];
    if (matches.length === 0) {
        historyListEl.innerHTML = "<p>No matches yet. Play one to create history.</p>";
    } else {
        historyListEl.innerHTML = "";
        matches.forEach((match) => {
            const wrapper = document.createElement("div");
            wrapper.className = "history-item";
            wrapper.innerHTML = historyItemHtml(match);
            historyListEl.appendChild(wrapper);
        });
    }

    document.querySelectorAll("[data-match-id]").forEach((button) => {
        button.addEventListener("click", async () => {
            const matchId = button.dataset.matchId;
            await loadMatchDetail(matchId);
            setActiveTab("detail");
        });
    });
}

function detailHtml(match) {
    const rows = match.rounds
        .map(
            (round) =>
                `<tr>
                    <td>${round.round_number}</td>
                    <td>${moveEmoji[round.player_move]} ${round.player_move}</td>
                    <td>${moveEmoji[round.computer_move]} ${round.computer_move}</td>
                    <td>${round.outcome}</td>
                </tr>`
        )
        .join("");

    return `
        <h3>Match #${match.id}</h3>
        <p>Status: ${match.status} | Result: ${match.result || "N/A"} | Score: ${match.player_score}-${match.computer_score}</p>
        <table class="detail-table">
            <thead>
                <tr><th>Round</th><th>Your Move</th><th>Computer Move</th><th>Outcome</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

async function loadMatchDetail(matchId) {
    const result = await apiRequest(`/api/matches/${matchId}`);
    if (result.ok) {
        detailContainerEl.innerHTML = detailHtml(result.payload.match);
    } else {
        detailContainerEl.innerHTML = `<p>${result.payload.error || "Match not found."}</p>`;
    }
}

function wireActions() {
    document.getElementById("startMatchBtn").addEventListener("click", startMatch);
    document.getElementById("playAgainBtn").addEventListener("click", startMatch);
    document.getElementById("refreshHistoryBtn").addEventListener("click", loadHistory);

    moveButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const move = button.dataset.move;
            submitMove(move);
        });
    });
}

async function bootstrap() {
    wireTabs();
    wireActions();
    await refreshCurrentMatch();
    await loadHistory();
}

bootstrap();