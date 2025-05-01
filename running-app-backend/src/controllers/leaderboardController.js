// src/controllers/leaderboardController.js
import supabase from '../config/supabase.js';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/responseUtils.js';

// Get daily leaderboard
export const getDailyLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('daily_leaderboard')
      .select('*')
      .order('total_distance', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return successResponse(res, data);
  } catch (error) {
    console.error('Get daily leaderboard error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get weekly leaderboard
export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .order('total_distance', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return successResponse(res, data);
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get monthly leaderboard
export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monthly_leaderboard')
      .select('*')
      .order('total_distance', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return successResponse(res, data);
  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get user's rank
export const getUserRank = async (req, res) => {
  try {
    const { period } = req.params;
    const userId = req.user.id;
    
    let view;
    switch (period) {
      case 'daily':
        view = 'daily_leaderboard';
        break;
      case 'weekly':
        view = 'weekly_leaderboard';
        break;
      case 'monthly':
        view = 'monthly_leaderboard';
        break;
      default:
        view = 'monthly_leaderboard';
    }
    
    // Get all users sorted by distance
    const { data, error } = await supabase
      .from(view)
      .select('user_id, total_distance')
      .order('total_distance', { ascending: false });
    
    if (error) throw error;
    
    // Find user's position in the array
    const userIndex = data.findIndex(item => item.user_id === userId);
    
    // If user not found in leaderboard
    if (userIndex === -1) {
      return successResponse(res, { rank: null, totalDistance: 0 });
    }
    
    // Return rank (1-based) and total distance
    return successResponse(res, { 
      rank: userIndex + 1, 
      totalDistance: data[userIndex].total_distance 
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    return serverErrorResponse(res, error);
  }
};
