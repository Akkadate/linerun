// src/services/api.js
import axios from 'axios';
import config from '../config';

const API_URL = config.apiUrl;

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request headers
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  login: async (lineIdToken) => {
    try {
      const response = await apiClient.post('/auth/login', { lineIdToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateUserProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Running records API calls
export const runningAPI = {
  addRunningRecord: async (recordData) => {
    try {
      const response = await apiClient.post('/running/records', recordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getRunningRecords: async (params) => {
    try {
      const response = await apiClient.get('/running/records', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/running/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getRunningRecord: async (recordId) => {
    try {
      const response = await apiClient.get(`/running/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateRunningRecord: async (recordId, recordData) => {
    try {
      const response = await apiClient.put(`/running/records/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  deleteRunningRecord: async (recordId) => {
    try {
      const response = await apiClient.delete(`/running/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Leaderboard API calls
export const leaderboardAPI = {
  getDailyLeaderboard: async () => {
    try {
      const response = await apiClient.get('/leaderboard/daily');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getWeeklyLeaderboard: async () => {
    try {
      const response = await apiClient.get('/leaderboard/weekly');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getMonthlyLeaderboard: async () => {
    try {
      const response = await apiClient.get('/leaderboard/monthly');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getUserRank: async (period) => {
    try {
      const response = await apiClient.get(`/leaderboard/rank/${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Upload API calls
export const uploadAPI = {
  getUploadUrl: async () => {
    try {
      const response = await apiClient.get('/upload/url');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  uploadImage: async (file, uploadUrl) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
