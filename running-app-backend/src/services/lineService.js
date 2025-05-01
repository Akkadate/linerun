// src/services/lineService.js
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Verify LINE ID token
// เพิ่ม debug log ในฟังก์ชัน verifyIdToken
export const verifyIdToken = async (idToken) => {
  try {
    console.log('Verifying ID token with LINE API...');
    console.log('LINE_CHANNEL_ID:', process.env.LINE_CHANNEL_ID);
    
    const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', null, {
      params: {
        id_token: idToken,
        client_id: process.env.LINE_CHANNEL_ID
      }
    });
    
    console.log('LINE API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying LINE ID token:', error.response?.data || error.message);
    throw new Error('Token ไม่ถูกต้องหรือหมดอายุ');
  }
};

// Get user profile from LINE (if needed for additional data)
export const getUserProfile = async (accessToken) => {
  try {
    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting LINE user profile:', error);
    throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้จาก LINE ได้');
  }
};

// Create JWT token for our API
export const createJwtToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};
