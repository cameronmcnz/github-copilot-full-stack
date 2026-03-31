import express from 'express';
import {
  createMatch,
  getMatch,
  getMatchWithRounds,
  submitMove,
  getUserMatches,
  getMatchHistory,
  ensureUserExists
} from '../services/gameService.js';

const router = express.Router();

router.post('/matches', async (req, res) => {
  try {
    const userId = req.userId;
    await ensureUserExists(userId);
    const matchId = await createMatch(userId);
    const match = await getMatch(matchId);

    res.status(201).json({
      success: true,
      data: match
    });
  } catch (err) {
    console.error('Error creating match:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create match'
    });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const userId = req.userId;
    const matches = await getUserMatches(userId);

    res.json({
      success: true,
      data: matches
    });
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches'
    });
  }
});

router.get('/matches/:id', async (req, res) => {
  try {
    const matchId = req.params.id;
    const match = await getMatchWithRounds(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (err) {
    console.error('Error fetching match:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match'
    });
  }
});

router.post('/matches/:id/moves', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { playerChoice } = req.body;

    const match = await getMatch(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await submitMove(matchId, playerChoice);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error submitting move:', err);
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to submit move'
    });
  }
});

export default router;
