import {
    getCurrentMatch,
    getHistory,
    getLiveHealth,
    getMatch,
    getReadyHealth,
    startMatch,
    submitMove
} from "/js/api.js";

const emojiByMove = {
    ROCK: "🪨",
    PAPER: "📄",
    SCISSORS: "✂️"
};

const appState = {
    currentMatch: null,
    selectedMatch: null,
    activeTab: "play"
};

const elements = {
    tabButtons: Array.from(document.querySelectorAll(".tab-button")),
    tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
    playEmpty: document.getElementById("play-empty"),
    playContent: document.getElementById("play-content"),
    playerScore: document.getElementById("player-score"),
    computerScore: document.getElementById("computer-score"),
    roundNumber: document.getElementById("round-number"),
    statusBanner: document.getElementById("status-banner"),
    latestRound: document.getElementById("latest-round"),
    roundHistory: document.getElementById("round-history"),
    roundCountBadge: document.getElementById("round-count-badge"),
    summaryCard: document.getElementById("summary-card"),
    summaryTitle: document.getElementById("summary-title"),
    summaryMessage: document.getElementById("summary-message"),
    historyList: document.getElementById("history-list"),
    detailEmpty: document.getElementById("detail-empty"),
    detailContent: document.getElementById("detail-content"),
    healthStatus: document.getElementById("health-status"),
    apiPreview: document.getElementById("api-preview"),
    moveButtons: Array.from(document.querySelectorAll(".move-button"))
};

function formatOutcome(outcome) {
    if (!outcome) {
        return "In progress";
    }
    return outcome.toLowerCase().replaceAll("_", " ");
}

function formatMove(move) {
    return `${emojiByMove[move] || "❔"} ${move.toLowerCase()}`;
}

function formatDate(value) {
    if (!value) {
        return "Still active";
    }
    return new Date(value).toLocaleString();
}

function switchTab(tabId) {
    appState.activeTab = tabId;
    window.location.hash = tabId;
    elements.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabId);
    });
    elements.tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === tabId);
    });
}

function setStatusBanner(message, style = "neutral") {
    elements.statusBanner.textContent = message;
    elements.statusBanner.className = `status-banner ${style}`;
}

function setMoveButtonsDisabled(disabled) {
    elements.moveButtons.forEach((button) => {
        button.disabled = disabled;
    });
}

function renderRoundHistory(rounds) {
    elements.roundCountBadge.textContent = `${rounds.length} round${rounds.length === 1 ? "" : "s"}`;
    if (!rounds.length) {
        elements.roundHistory.innerHTML = '<div class="round-entry">No rounds played yet.</div>';
        return;
    }

    elements.roundHistory.innerHTML = rounds.map((round) => `
        <div class="round-entry">
            <strong>Round ${round.roundNumber}</strong>
            <div>You: ${formatMove(round.playerMove)}</div>
            <div>Computer: ${formatMove(round.computerMove)}</div>
            <div>Result: ${round.result.toLowerCase()}</div>
            <div>${round.message}</div>
        </div>
    `).join("");
}

function renderLatestRound(match) {
    const latestRound = match.rounds.at(-1);
    if (!latestRound) {
        elements.latestRound.classList.add("hidden");
        return;
    }

    const style = latestRound.result.toLowerCase();
    elements.latestRound.className = `round-callout ${style}`;
    elements.latestRound.innerHTML = `
        <strong>Latest round</strong>
        <p>${latestRound.message}</p>
        <p>You chose ${formatMove(latestRound.playerMove)} and the computer chose ${formatMove(latestRound.computerMove)}.</p>
    `;
}

function renderSummary(match) {
    if (!match.complete) {
        elements.summaryCard.classList.add("hidden");
        return;
    }

    elements.summaryCard.classList.remove("hidden");
    elements.summaryTitle.textContent = formatOutcome(match.outcome);
    elements.summaryMessage.textContent = match.summaryMessage;
}

function renderPlay(match) {
    appState.currentMatch = match;
    const hasMatch = Boolean(match);
    elements.playEmpty.classList.toggle("hidden", hasMatch);
    elements.playContent.classList.toggle("hidden", !hasMatch);

    if (!hasMatch) {
        setStatusBanner("Start a match to begin.");
        return;
    }

    elements.playerScore.textContent = match.playerWins;
    elements.computerScore.textContent = match.computerWins;
    elements.roundNumber.textContent = match.currentRoundNumber;
    renderRoundHistory(match.rounds);
    renderLatestRound(match);
    renderSummary(match);

    const latestRound = match.rounds.at(-1);
    const bannerStyle = latestRound ? latestRound.result.toLowerCase() : "neutral";
    setStatusBanner(match.summaryMessage, bannerStyle);
    setMoveButtonsDisabled(match.complete);
}

function renderHistory(history) {
    if (!history.matches.length) {
        elements.historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-emoji">🗂️</div>
                <h3>No matches yet</h3>
                <p>Finish a match and it will appear here.</p>
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = history.matches.map((match) => `
        <article class="history-item">
            <strong>${formatOutcome(match.outcome)}</strong>
            <div>Played: ${formatDate(match.createdAt)}</div>
            <div>Score: You ${match.playerWins} - ${match.computerWins} Computer</div>
            <div>Rounds: ${match.roundsPlayed}</div>
            <div>${match.summaryMessage}</div>
            <button class="ghost-button" data-detail-id="${match.matchId}">View details</button>
        </article>
    `).join("");

    elements.historyList.querySelectorAll("[data-detail-id]").forEach((button) => {
        button.addEventListener("click", async () => {
            await loadMatchDetail(button.dataset.detailId, true);
        });
    });
}

function renderMatchDetail(match) {
    appState.selectedMatch = match;
    elements.detailEmpty.classList.add("hidden");
    elements.detailContent.classList.remove("hidden");
    elements.detailContent.innerHTML = `
        <div class="detail-panel">
            <h3>${formatOutcome(match.outcome)}</h3>
            <div class="detail-score">
                <span>You ${match.playerWins}</span>
                <span>Computer ${match.computerWins}</span>
                <span>${match.complete ? "Complete" : "In progress"}</span>
            </div>
            <p>${match.summaryMessage}</p>
            <p>Created ${formatDate(match.createdAt)}</p>
            <div class="round-history">
                ${match.rounds.map((round) => `
                    <div class="detail-round">
                        <strong>Round ${round.roundNumber}</strong>
                        <div>You: ${formatMove(round.playerMove)}</div>
                        <div>Computer: ${formatMove(round.computerMove)}</div>
                        <div>Result: ${round.result.toLowerCase()}</div>
                        <div>${round.message}</div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function renderHealth(live, ready) {
    elements.healthStatus.innerHTML = `
        <div class="health-pill">
            <strong>Live</strong>
            <div>Status: ${live.status}</div>
            <div>Checked: ${formatDate(live.timestamp)}</div>
        </div>
        <div class="health-pill">
            <strong>Ready</strong>
            <div>Status: ${ready.status}</div>
            <div>Database: ${ready.database}</div>
            <div>Checked: ${formatDate(ready.timestamp)}</div>
        </div>
    `;
    elements.apiPreview.textContent = JSON.stringify({ live, ready }, null, 2);
}

async function loadCurrentMatch() {
    try {
        const match = await getCurrentMatch();
        renderPlay(match);
    } catch (error) {
        if (error.status === 404) {
            renderPlay(null);
            return;
        }
        setStatusBanner(error.message, "loss");
    }
}

async function loadHistory() {
    const history = await getHistory();
    renderHistory(history);
}

async function loadMatchDetail(matchId, activateTab = false) {
    const match = await getMatch(matchId);
    renderMatchDetail(match);
    if (activateTab) {
        switchTab("detail");
    }
}

async function loadHealth() {
    const [live, ready] = await Promise.all([getLiveHealth(), getReadyHealth()]);
    renderHealth(live, ready);
}

async function createNewMatch() {
    setMoveButtonsDisabled(true);
    const match = await startMatch();
    renderPlay(match);
    await loadHistory();
    switchTab("play");
}

async function onMoveClick(event) {
    const move = event.currentTarget.dataset.move;
    if (!appState.currentMatch || appState.currentMatch.complete) {
        return;
    }

    setMoveButtonsDisabled(true);
    try {
        const updatedMatch = await submitMove(appState.currentMatch.matchId, move);
        renderPlay(updatedMatch);
        if (updatedMatch.complete) {
            await loadHistory();
        }
    } catch (error) {
        setStatusBanner(error.message, "loss");
        setMoveButtonsDisabled(false);
    }
}

function registerEvents() {
    elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab));
    });

    ["new-match-header", "new-match-play", "start-empty-match", "play-again"].forEach((id) => {
        document.getElementById(id)?.addEventListener("click", createNewMatch);
    });

    document.getElementById("refresh-history").addEventListener("click", loadHistory);
    document.getElementById("refresh-health").addEventListener("click", loadHealth);
    elements.moveButtons.forEach((button) => button.addEventListener("click", onMoveClick));
}

async function init() {
    registerEvents();
    const initialTab = window.location.hash.replace("#", "") || "play";
    switchTab(["play", "history", "detail", "troubleshooting"].includes(initialTab) ? initialTab : "play");

    await Promise.allSettled([loadCurrentMatch(), loadHistory(), loadHealth()]);
}

init();