import express from 'express';

const router = express.Router();

router.get('/live', (req, res) => {
  res.json({
    status: 'live',
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

export default router;
