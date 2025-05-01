// src/services/liff.js
import { useState, useEffect } from 'react';
import liff from '@line/liff';
import config from '../config';

export const useLiff = () => {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize LIFF
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        console.log('Initializing LIFF with ID:', config.liffId);
        await liff.init({ liffId: config.liffId });
        console.log('LIFF initialized successfully');
        setLiffObject(liff);
        
        // Check if user is logged in
        if (liff.isLoggedIn()) {
          console.log('User is logged in to LINE');
          setIsLoggedIn(true);
          const userProfile = await liff.getProfile();
          console.log('Got LINE profile:', userProfile);
          setProfile(userProfile);
        } else {
          console.log('User is not logged in to LINE');
        }
      } catch (error) {
        console.error('LIFF initialization failed', error);
        setLiffError(error);
      }
    };

    initializeLiff();
  }, []);

  // Login function
  const login = () => {
    console.log('Attempting LINE login...');
    if (!liffObject) {
      console.error('LIFF is not initialized yet');
      return;
    }
    liffObject.login();
  };
  
  // Logout function
  const logout = () => {
    if (!liffObject) return;
    liffObject.logout();
    setIsLoggedIn(false);
    setProfile(null);
  };

  // Get ID Token for API authentication
  const getIdToken = () => {
    if (!liffObject || !isLoggedIn) {
      console.error('Cannot get ID token - user not logged in or LIFF not initialized');
      return null;
    }
    
    try {
      const token = liffObject.getIDToken();
      
      if (!token) {
        console.error('ID token is undefined or empty');
        return null;
      }
      
      // ไม่ log ทุกครั้ง ป้องกันการแสดงซ้ำๆ
      return token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  // Get user profile - ฟังก์ชันนี้หายไปจากโค้ดเดิม
  const getProfile = async () => {
    if (!liffObject || !isLoggedIn) return null;
    try {
      const userProfile = await liffObject.getProfile();
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Failed to get user profile', error);
      return null;
    }
  };

  // Share message to LINE
  const shareMessage = async (text) => {
    if (!liffObject || !liffObject.isApiAvailable('shareTargetPicker')) {
      console.error('ShareTargetPicker is not available');
      return false;
    }

    try {
      const result = await liffObject.shareTargetPicker([
        {
          type: 'text',
          text: text
        }
      ]);
      return result;
    } catch (error) {
      console.error('Failed to share message', error);
      return false;
    }
  };

  return {
    liffObject,
    liffError,
    isLoggedIn,
    profile,
    login,
    logout,
    getIdToken,
    getProfile,  // เพิ่มฟังก์ชันนี้เข้าไปในรายการ return
    shareMessage
  };
};
