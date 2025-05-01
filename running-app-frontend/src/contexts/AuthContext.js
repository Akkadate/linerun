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

  // ปรับปรุง useEffect ให้เรียกแค่ครั้งเดียวเมื่อ LIFF พร้อม
useEffect(() => {
  if (!liffObject) return;
  
  const initializeAuth = async () => {
    try {
      if (isLoggedIn && profile) {
        console.log('User is logged in with profile, getting ID token');
        const idToken = getIdToken();
        
        if (idToken) {
          // Log เพียงครั้งเดียว
          console.log('Got ID token, logging in to backend');
          await handleLogin(idToken);
        } else {
          console.error('Failed to get ID token');
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
}, [liffObject, isLoggedIn, profile, handleLogin]);

 // ใช้ useCallback สำหรับฟังก์ชัน handleLogin เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้ง
const handleLogin = useCallback(async (idToken) => {
  try {
    setLoading(true);
    setError(null);
    
    if (!idToken) {
      console.error('No ID token provided');
      setError('ไม่พบ ID token กรุณาลองใหม่อีกครั้ง');
      return null;
    }
    
    // Send ID token to backend
    const response = await authAPI.login(idToken);
    
    // Check if response contains token
    if (!response || !response.token) {
      console.error('Invalid response from server:', response);
      setError('การเข้าสู่ระบบล้มเหลว ไม่ได้รับ token จากเซิร์ฟเวอร์');
      return null;
    }
    
    const { user, token } = response;
    
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
}, []);

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

  // แก้ไขส่วน useEffect ของการโหลด token จาก localStorage
useEffect(() => {
  const loadUserFromToken = async () => {
    // ไม่เรียกใช้ถ้า user มีค่าแล้ว (อาจได้รับจาก LIFF)
    if (currentUser) {
      console.log('User already set, skipping token load');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Loading token from localStorage:', token ? 'token exists' : 'no token');
    
    if (token && token !== 'undefined') {
      try {
        setAuthToken(token);
        const user = await authAPI.getUserProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error('Token invalid or user profile fetch failed:', error);
        localStorage.removeItem('token');
        setAuthToken(null);
      }
    }
    setLoading(false);
  };
  
  loadUserFromToken();
}, [currentUser]);

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
