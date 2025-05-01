// src/controllers/authController.js
import { verifyIdToken, createJwtToken } from '../services/lineService.js';
import User from '../models/User.js';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/responseUtils.js';

// Login with LINE ID token
export const login = async (req, res) => {
  try {
    console.log('Login endpoint called');
    const { lineIdToken } = req.body;
    
    if (!lineIdToken) {
      console.log('No lineIdToken provided in request body');
      return errorResponse(res, 'Token ไม่ถูกต้อง', 400);
    }
    
    // Verify LINE ID token
    try {
      console.log('Attempting to verify LINE token...');
      const lineUserData = await verifyIdToken(lineIdToken);
      
      if (!lineUserData || !lineUserData.sub) {
        console.log('Invalid user data returned from LINE verification');
        return errorResponse(res, 'ไม่สามารถยืนยันตัวตนได้', 401);
      }
      
      const lineId = lineUserData.sub;
      console.log('Verified LINE user with ID:', lineId);
      
      // Check if user exists
      console.log('Checking if user exists in database...');
      let user = await User.getByLineId(lineId);
      
      // If user doesn't exist, create a new one
      if (!user) {
        console.log('Creating new user...');
        user = await User.create({
          line_id: lineId,
          display_name: lineUserData.name || 'LINE User',
          profile_picture: lineUserData.picture || null
        });
        console.log('New user created with ID:', user.id);
      } else {
        console.log('Existing user found with ID:', user.id);
      }
      
      // Create JWT token
      console.log('Creating JWT token...');
      const token = createJwtToken(user.id);
      
      console.log('Login successful!');
      return successResponse(res, { 
        user, 
        token 
      }, 'เข้าสู่ระบบสำเร็จ');
      
    } catch (lineError) {
      console.error('LINE verification failed:', lineError);
      return errorResponse(res, 'การยืนยันตัวตนกับ LINE ล้มเหลว', 401);
    }
  } catch (error) {
    console.error('General error in login controller:', error);
    return serverErrorResponse(res, error);
  }
};

// Register or update user profile
export const register = async (req, res) => {
  try {
    const { phoneNumber, birthDate } = req.body;
    const userId = req.user.id;
    
    // Update user profile
    const updatedUser = await User.update(userId, {
      phone_number: phoneNumber,
      birth_date: birthDate,
      updated_at: new Date()
    });
    
    return successResponse(res, { user: updatedUser }, 'บันทึกข้อมูลสำเร็จ');
  } catch (error) {
    console.error('Register error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.getById(userId);
    
    if (!user) {
      return errorResponse(res, 'ไม่พบผู้ใช้งาน', 404);
    }
    
    return successResponse(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    return serverErrorResponse(res, error);
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, birthDate } = req.body;
    const userId = req.user.id;
    
    // Update fields that are provided
    const updateData = {};
    
    if (phoneNumber !== undefined) {
      updateData.phone_number = phoneNumber;
    }
    
    if (birthDate !== undefined) {
      updateData.birth_date = birthDate;
    }
    
    updateData.updated_at = new Date();
    
    // Update user profile
    const updatedUser = await User.update(userId, updateData);
    
    return successResponse(res, updatedUser, 'อัปเดตข้อมูลสำเร็จ');
  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse(res, error);
  }
};
