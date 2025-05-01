// src/services/lineService.js
// src/services/lineService.js
import axios from 'axios';
import jwt from 'jsonwebtoken';

// src/services/lineService.js
export const verifyIdToken = async (idToken) => {
  try {
    console.log('Debug: verifyIdToken called with token:', idToken ? `${idToken.substring(0, 10)}...` : 'null');
    console.log('Debug: LINE_CHANNEL_ID:', process.env.LINE_CHANNEL_ID);
    console.log('Debug: LINE_CHANNEL_SECRET:', process.env.LINE_CHANNEL_SECRET);
    
    const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', null, {
      params: {
        id_token: idToken,
        client_id: process.env.LINE_CHANNEL_ID
      }
    });
    
    console.log('Debug: LINE API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Debug: Error details:', error.response?.data || error.message);
    console.error('Debug: Error status:', error.response?.status);
    console.error('Debug: Full error:', error);
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
