// src/models/User.js
import supabase from '../config/supabase.js';

class User {
  // Get user by LINE ID
  static async getByLineId(lineId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('line_id', lineId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting user by LINE ID:', error);
      return null;
    }
  }
  
  // Get user by ID
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
  
  // Create new user
  static async create(userData) {
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
  }
  
  // Update user
  static async update(id, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Check if user exists
  static async exists(lineId) {
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('line_id', lineId);
      
      if (error) throw error;
      
      return count > 0;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }
}

export default User;
