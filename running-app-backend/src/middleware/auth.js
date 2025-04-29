// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'ไม่พบ token หรือ token ไม่ถูกต้อง'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'ไม่พบผู้ใช้งาน'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token ไม่ถูกต้อง'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token หมดอายุ'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่'
    });
  }
};
