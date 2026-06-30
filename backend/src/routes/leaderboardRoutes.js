const express = require('express');
const router = express.Router();
const { getLeaderboard, getCachedLeaderboard } = require('../controllers/leaderboardController');

// Public routes
router.get('/', getLeaderboard);
router.get('/cached', getCachedLeaderboard);

module.exports = router;
