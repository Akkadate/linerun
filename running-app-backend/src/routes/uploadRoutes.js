// src/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/responseUtils.js';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('เฉพาะไฟล์รูปภาพเท่านั้น'));
    }
  }
});

// Upload file to Supabase
const uploadToSupabase = async (file, userId) => {
  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('running_evidence')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('running_evidence')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

// Route to upload image
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'กรุณาอัปโหลดไฟล์', 400);
    }
    
    const userId = req.user.id;
    const imageUrl = await uploadToSupabase(req.file, userId);
    
    return successResponse(res, { url: imageUrl }, 'อัปโหลดรูปภาพสำเร็จ');
  } catch (error) {
    if (error.message === 'เฉพาะไฟล์รูปภาพเท่านั้น') {
      return errorResponse(res, error.message, 400);
    }
    
    console.error('Upload error:', error);
    return serverErrorResponse(res, error);
  }
});

export default router;
