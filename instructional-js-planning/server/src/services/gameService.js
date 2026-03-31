import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db/database.js';

const CHOICES = ['rock', 'paper', 'scissors'];
const MATCHES_TO_WIN = 2;

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function determineRoundWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return 'tie';
  }

  const wins = {
    'rock': 'scissors',
    'paper': 'rock',
    'scissors': 'paper'
  };

  return wins[playerChoice] === computerChoice ? 'player' : 'computer';
}

async function ensureUserExists(userId) {
  const existing = await getAsync('SELECT id FROM users WHERE id = ?', [userId]);
  if (!existing) {
    await runAsync('INSERT INTO users (id) VALUES (?)', [userId]);
  }
}

async function createMatch(userId) {
  await ensureUserExists(userId);
  const matchId = uuidv4();
  await runAsync(
    'INSERT INTO matches (id, user_id, player_score, computer_score, status) VALUES (?, ?, 0, 0, ?)',
    [matchId, userId, 'in_progress']
  );
  return matchId;
}

async function getMatch(matchId) {
  return await getAsync('SELECT * FROM matches WHERE id = ?', [matchId]);
}

async function getMatchWithRounds(matchId) {
  const match = await getMatch(matchId);
  if (!match) {
    return null;
  }

  const rounds = await allAsync(
    'SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number ASC',
    [matchId]
  );

  return {
    ...match,
    rounds
  };
}

async function submitMove(matchId, playerChoice) {
  const match = await getMatch(matchId);

  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status !== 'in_progress') {
    throw new Error('Match is already complete');
  }

  if (!CHOICES.includes(playerChoice)) {
    throw new Error('Invalid choice');
  }

  const roundCount = await getAsync(
    'SELECT COUNT(*) as count FROM rounds WHERE match_id = ?',
    [matchId]
  );

  const roundNumber = roundCount.count + 1;

  if (roundNumber > 3) {
    throw new Error('Match already has 3 rounds');
  }

  const computerChoice = getComputerChoice();
  const roundWinner = determineRoundWinner(playerChoice, computerChoice);

  const roundId = uuidv4();
  await runAsync(
    'INSERT INTO rounds (id, match_id, round_number, player_choice, computer_choice, winner) VALUES (?, ?, ?, ?, ?, ?)',
    [roundId, matchId, roundNumber, playerChoice, computerChoice, roundWinner]
  );

  let newPlayerScore = match.player_score;
  let newComputerScore = match.computer_score;
  let matchStatus = 'in_progress';
  let matchWinner = null;

  if (roundWinner === 'player') {
    newPlayerScore++;
  } else if (roundWinner === 'computer') {
    newComputerScore++;
  }

  if (newPlayerScore === MATCHES_TO_WIN) {
    matchStatus = 'completed';
    matchWinner = 'player';
  } else if (newComputerScore === MATCHES_TO_WIN) {
    matchStatus = 'completed';
    matchWinner = 'computer';
  }

  await runAsync(
    'UPDATE matches SET player_score = ?, computer_score = ?, status = ?, winner = ?, completed_at = CASE WHEN status = ? THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?',
    [newPlayerScore, newComputerScore, matchStatus, matchWinner, 'completed', matchId]
  );

  return {
    roundId,
    roundNumber,
    playerChoice,
    computerChoice,
    roundWinner,
    playerScore: newPlayerScore,
    computerScore: newComputerScore,
    matchStatus,
    matchWinner
  };
}

async function getUserMatches(userId, limit = 50) {
  const matches = await allAsync(
    'SELECT * FROM matches WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );

  return matches;
}

async function getMatchHistory(matchId) {
  const match = await getMatchWithRounds(matchId);
  if (!match) {
    return null;
  }
  return match;
}

export {
  createMatch,
  getMatch,
  getMatchWithRounds,
  submitMove,
  getUserMatches,
  getMatchHistory,
  ensureUserExists
};
