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

 // แก้ไขฟังก์ชัน handleLogin ในไฟล์ src/contexts/AuthContext.js
const handleLogin = async (idToken) => {
  try {
    setLoading(true);
    setError(null);
    
    if (!idToken) {
      console.error('No ID token provided');
      setError('ไม่พบ ID token กรุณาลองใหม่อีกครั้ง');
      return null;
    }
    
    // ส่ง ID token ไปยัง backend
    console.log('Sending login request to backend with token');
    const response = await authAPI.login(idToken);
    
    console.log('Login response received:', response);
    
    // ตรวจสอบโครงสร้างของ response
    let user, token;
    
    if (response.data && response.data.user && response.data.token) {
      // กรณีที่ response มีโครงสร้าง { data: { user, token } }
      user = response.data.user;
      token = response.data.token;
    } else if (response.user && response.token) {
      // กรณีที่ response มีโครงสร้าง { user, token }
      user = response.user;
      token = response.token;
    } else {
      console.error('Unexpected response structure:', response);
      setError('โครงสร้างข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง');
      return null;
    }
    
    if (!token) {
      console.error('No token in response:', response);
      setError('ไม่ได้รับ token จากเซิร์ฟเวอร์');
      return null;
    }
    
    console.log('Login successful, setting token and user');
    
    // ตั้งค่า token สำหรับการเรียก API
    setAuthToken(token);
    
    // บันทึกข้อมูลผู้ใช้
    setCurrentUser(user);
    
    // บันทึก token ใน localStorage
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

  // Initialize user auth state when LIFF is ready
  useEffect(() => {
    const initializeAuth = async () => {
      if (!liffObject) return;
      
      try {
        if (isLoggedIn && profile) {
          console.log('User is logged in with profile, attempting to get ID token');
          const idToken = getIdToken();
          if (idToken) {
            // Login to backend with LINE ID token
            console.log('Got valid ID token, proceeding with backend login');
            await handleLogin(idToken);
          } else {
            console.error('Failed to get valid ID token');
            setLoading(false);
          }
        } else {
          console.log('User not logged in or no profile');
          setLoading(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [liffObject, isLoggedIn, profile, getIdToken]);

  // Login with LINE
  const login = async () => {
    console.log('Initiating LINE login process');
    liffLogin();
  };

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (!response || !response.token) {
        console.error('Invalid registration response:', response);
        setError('การลงทะเบียนล้มเหลว ไม่ได้รับ token จากเซิร์ฟเวอร์');
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

  // Check if token exists on app load - วางไว้ด้านล่าง handleLogin
  useEffect(() => {
    // ไม่เรียกใช้ถ้า user มีค่าแล้ว
    if (currentUser) {
      console.log('User already set, skipping token load from localStorage');
      return;
    }
    
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      console.log('Checking token in localStorage:', token ? 'token exists' : 'no token');
      
      if (token && token !== 'undefined') {
        try {
          setAuthToken(token);
          const user = await authAPI.getUserProfile();
          if (user) {
            console.log('Successfully loaded user from token');
            setCurrentUser(user);
          } else {
            console.error('No user returned from getUserProfile');
            localStorage.removeItem('token');
            setAuthToken(null);
          }
        } catch (error) {
          console.error('Token invalid or user fetch failed:', error);
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
