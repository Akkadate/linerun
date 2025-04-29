// src/routes/leaderboardRoutes.js
import express from 'express';
import { 
  getDailyLeaderboard, 
  getWeeklyLeaderboard, 
  getMonthlyLeaderboard,
  getUserRank
} from '../controllers/leaderboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get daily leaderboard
router.get('/daily', getDailyLeaderboard);

// Get weekly leaderboard
router.get('/weekly', getWeeklyLeaderboard);

// Get monthly leaderboard
router.get('/monthly', getMonthlyLeaderboard);

// Get user's rank (daily, weekly, monthly)
router.get('/rank/:period', getUserRank);

export default router;
