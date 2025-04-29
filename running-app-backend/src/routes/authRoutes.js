// src/routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { login, register, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Login route
router.post(
  '/login',
  [
    body('lineIdToken').notEmpty().withMessage('LINE ID Token is required')
  ],
  validateRequest,
  login
);

// Register route (requires authentication)
router.post(
  '/register',
  authenticate,
  [
    body('phoneNumber')
      .notEmpty().withMessage('กรุณากรอกเบอร์โทรศัพท์')
      .matches(/^[0-9]{10}$/).withMessage('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)'),
    body('birthDate')
      .notEmpty().withMessage('กรุณาระบุวันเกิด')
      .isDate().withMessage('กรุณาระบุวันเกิดให้ถูกต้อง')
  ],
  validateRequest,
  register
);

// Get user profile (requires authentication)
router.get('/profile', authenticate, getProfile);

// Update user profile (requires authentication)
router.put(
  '/profile',
  authenticate,
  [
    body('phoneNumber')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)'),
    body('birthDate')
      .optional()
      .isDate().withMessage('กรุณาระบุวันเกิดให้ถูกต้อง')
  ],
  validateRequest,
  updateProfile
);

export default router;
