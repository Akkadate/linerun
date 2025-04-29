// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLiff } from '../services/liff';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { liffObject, isLoggedIn, profile, login: liffLogin, getIdToken } = useLiff();

  // Initialize user auth state when LIFF is ready
  useEffect(() => {
    const initializeAuth = async () => {
      if (!liffObject) return;
      
      try {
        if (isLoggedIn && profile) {
          const idToken = getIdToken();
          if (idToken) {
            // Login to backend with LINE ID token
            await handleLogin(idToken);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [liffObject, isLoggedIn, profile, getIdToken]);

  // Handle login with LINE
  const handleLogin = async (idToken) => {
    try {
      setLoading(true);
      setError(null);
      
      // Send ID token to backend
      const { user, token } = await authAPI.login(idToken);
      
      // Set token for API calls
      setAuthToken(token);
      
      // Save user data
      setCurrentUser(user);
      
      // Store token in local storage
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'การเข้าสู่ระบบล้มเหลว');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login with LINE
  const login = async () => {
    liffLogin();
  };

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, token } = await authAPI.register(userData);
      
      // Set token for API calls
      setAuthToken(token);
      
      // Save user data
      setCurrentUser(user);
      
      // Store token in local storage
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'การลงทะเบียนล้มเหลว');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    
    // If in LIFF browser, we don't want to log out from LINE
    if (liffObject && !liffObject.isInClient()) {
      liffObject.logout();
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authAPI.updateUserProfile(profileData);
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      setError(error.message || 'การอัปเดตโปรไฟล์ล้มเหลว');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if token exists on app load
  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setAuthToken(token);
          const user = await authAPI.getUserProfile();
          setCurrentUser(user);
        } catch (error) {
          console.error('Token invalid:', error);
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    
    loadUserFromToken();
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
