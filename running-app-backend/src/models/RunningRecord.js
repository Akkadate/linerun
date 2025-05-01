// src/models/RunningRecord.js
import supabase from '../config/supabase.js';

class RunningRecord {
  // Get running records by user ID
  static async getByUserId(userId, options = {}) {
    try {
      const {
        limit = 10,
        page = 1,
        sortBy = 'run_date',
        sortOrder = 'desc'
      } = options;
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Get records with pagination
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
  }
  
  // Get a single running record by ID
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('running_records')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting running record:', error);
      throw error;
    }
  }
  
  // Create a new running record
  static async create(recordData) {
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
  }
  
  // Update a running record
  static async update(id, recordData) {
    try {
      const { data, error } = await supabase
        .from('running_records')
        .update(recordData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating running record:', error);
      throw error;
    }
  }
  
  // Delete a running record
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('running_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting running record:', error);
      throw error;
    }
  }
  
  // Get user statistics
  static async getUserStats(userId) {
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
      const daysCount = dailyData.length;
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
  }
}

export default RunningRecord;
