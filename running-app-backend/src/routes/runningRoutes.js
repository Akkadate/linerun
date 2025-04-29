// src/routes/runningRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { 
  addRunningRecord, 
  getRunningRecords, 
  getRunningRecord, 
  updateRunningRecord, 
  deleteRunningRecord,
  getUserStats
} from '../controllers/runningController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Add new running record
router.post(
  '/records',
  [
    body('runDate')
      .notEmpty().withMessage('กรุณาระบุวันที่วิ่ง')
      .isDate().withMessage('กรุณาระบุวันที่ให้ถูกต้อง'),
    body('distance')
      .notEmpty().withMessage('กรุณาระบุระยะทาง')
      .isFloat({ min: 0.01, max: 200 }).withMessage('กรุณาระบุระยะทางให้ถูกต้อง (0.01-200 กม.)'),
    body('duration')
      .optional()
      .isInt({ min: 0 }).withMessage('เวลาต้องเป็นจำนวนเต็มบวกหรือศูนย์'),
    body('evidenceImageUrl')
      .optional()
      .isURL().withMessage('URL ไม่ถูกต้อง')
  ],
  validateRequest,
  addRunningRecord
);

// Get all running records for the authenticated user
router.get('/records', getRunningRecords);

// Get single running record
router.get('/records/:id', getRunningRecord);

// Update running record
router.put(
  '/records/:id',
  [
    body('runDate')
      .optional()
      .isDate().withMessage('กรุณาระบุวันที่ให้ถูกต้อง'),
    body('distance')
      .optional()
      .isFloat({ min: 0.01, max: 200 }).withMessage('กรุณาระบุระยะทางให้ถูกต้อง (0.01-200 กม.)'),
    body('duration')
      .optional()
      .isInt({ min: 0 }).withMessage('เวลาต้องเป็นจำนวนเต็มบวกหรือศูนย์'),
    body('evidenceImageUrl')
      .optional()
      .isURL().withMessage('URL ไม่ถูกต้อง')
  ],
  validateRequest,
  updateRunningRecord
);

// Delete running record
router.delete('/records/:id', deleteRunningRecord);

// Get user stats
router.get('/stats', getUserStats);

export default router;
