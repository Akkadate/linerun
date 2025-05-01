// src/services/lineService.js
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Verify LINE ID token
export const verifyIdToken = async (idToken) => {
  try {
    // Debug messages
    console.log('========== DEBUG LINE TOKEN VERIFICATION ==========');
    console.log('LINE_CHANNEL_ID:', process.env.LINE_CHANNEL_ID);
    console.log('Token length:', idToken ? idToken.length : 'no token');
    
    // ถ้าไม่มี Channel ID ให้แจ้งเตือน
    if (!process.env.LINE_CHANNEL_ID) {
      console.error('LINE_CHANNEL_ID is missing! Check your .env file.');
      throw new Error('LINE configuration missing');
    }
    
    // ทำการเรียก LINE API
    const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', null, {
      params: {
        id_token: idToken,
        client_id: process.env.LINE_CHANNEL_ID
      }
    });
    
    console.log('LINE API verification success!');
    console.log('User data:', response.data);
    return response.data;
  } catch (error) {
    console.error('========== LINE TOKEN VERIFICATION ERROR ==========');
    
    // ตรวจสอบประเภทของข้อผิดพลาด
    if (error.response) {
      // LINE API ตอบกลับด้วย error status
      console.error('LINE API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // ไม่ได้รับการตอบกลับจาก LINE API
      console.error('No response received from LINE API');
      console.error('Request:', error.request);
    } else {
      // ข้อผิดพลาดอื่นๆ
      console.error('Error message:', error.message);
    }
    
    // แสดงข้อมูลการตั้งค่าที่ใช้ (ไม่แสดง token เต็ม)
    console.error('Config used:', {
      'LINE_CHANNEL_ID': process.env.LINE_CHANNEL_ID,
      'has_LINE_CHANNEL_SECRET': !!process.env.LINE_CHANNEL_SECRET,
      'Token prefix': idToken ? idToken.substring(0, 10) + '...' : 'no token'
    });
    
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
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing! Check your .env file.');
    throw new Error('JWT configuration missing');
  }
  
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};
