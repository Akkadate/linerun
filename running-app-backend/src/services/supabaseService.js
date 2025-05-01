// src/services/supabaseService.js
import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Database operations
export const getUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getUserByLineId = async (lineId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('line_id', lineId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data || null;
  } catch (error) {
    console.error('Error getting user by LINE ID:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getRunningRecords = async (userId, options = {}) => {
  try {
    const {
      limit = 10,
      page = 1,
      sortBy = 'run_date',
      sortOrder = 'desc'
    } = options;
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('running_records')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      records: data,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    console.error('Error getting running records:', error);
    throw error;
  }
};

export const getRunningRecord = async (recordId) => {
  try {
    const { data, error } = await supabase
      .from('running_records')
      .select('*')
      .eq('id', recordId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting running record:', error);
    throw error;
  }
};

export const createRunningRecord = async (recordData) => {
  try {
    const { data, error } = await supabase
      .from('running_records')
      .insert([recordData])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating running record:', error);
    throw error;
  }
};

export const updateRunningRecord = async (recordId, recordData) => {
  try {
    const { data, error } = await supabase
      .from('running_records')
      .update(recordData)
      .eq('id', recordId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating running record:', error);
    throw error;
  }
};

export const deleteRunningRecord = async (recordId) => {
  try {
    const { error } = await supabase
      .from('running_records')
      .delete()
      .eq('id', recordId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting running record:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    // Get total distance
    const { data: totalData, error: totalError } = await supabase
      .rpc('get_total_distance', { user_id_param: userId });
    
    if (totalError) throw totalError;
    
    const totalDistance = totalData || 0;
    
    // Get daily running data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: dailyData, error: dailyError } = await supabase
      .from('running_records')
      .select('run_date, distance')
      .eq('user_id', userId)
      .gte('run_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('run_date', { ascending: true });
    
    if (dailyError) throw dailyError;
    
    // Get weekly running data
    const { data: weeklyData, error: weeklyError } = await supabase
      .rpc('get_weekly_distance', { user_id_param: userId });
    
    if (weeklyError) throw weeklyError;
    
    // Calculate additional stats
    const daysCount = new Set(dailyData.map(item => item.run_date)).size;
    const averageDistance = daysCount > 0 ? totalDistance / daysCount : 0;
    
    return {
      totalDistance,
      averageDistance,
      daysCount,
      dailyDistance: dailyData,
      weeklyDistance: weeklyData || []
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export const getDailyLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('daily_leaderboard')
      .select('*')
      .order('total_distance', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting daily leaderboard:', error);
    throw error;
  }
};

export const getWeeklyLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .order('total_distance', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting weekly leaderboard:', error);
    throw error;
  }
};

export const getMonthlyLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('monthly_leaderboard')
      .select('*')
      .order('total_distance', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting monthly leaderboard:', error);
    throw error;
  }
};

export const getUserRank = async (userId, period) => {
  try {
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
      return { rank: null, totalDistance: 0 };
    }
    
    // Return rank (1-based) and total distance
    return { 
      rank: userIndex + 1, 
      totalDistance: data[userIndex].total_distance 
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
};

// File upload operations
export const uploadImage = async (file, userId) => {
  try {
    if (!file) throw new Error('ไม่พบไฟล์');
    
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('running_evidence')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('running_evidence')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (url) => {
  try {
    if (!url) return true;
    
    // Extract path from URL
    const urlParts = url.split('/');
    const bucket = urlParts[urlParts.length - 2];
    const path = urlParts[urlParts.length - 1];
    
    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
