// src/controllers/runningController.js
import RunningRecord from '../models/RunningRecord.js';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '../utils/responseUtils.js';

// Add new running record
export const addRunningRecord = async (req, res) => {
  try {
    const { runDate, distance, duration, evidenceImageUrl } = req.body;
    const userId = req.user.id;
    
    if (!runDate || !distance) {
      return errorResponse(res, 'กรุณาระบุวันที่และระยะทาง', 400);
    }
    
    // Create record data
    const recordData = {
      user_id: userId,
      run_date: runDate,
      distance: parseFloat(distance),
      evidence_image_url: evidenceImageUrl || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Add duration if provided
    if (duration) {
      recordData.duration = parseInt(duration) * 60; // Convert minutes to seconds
    }
    
    // Create record
    const newRecord = await RunningRecord.create(recordData);
    
    return successResponse(res, newRecord, 'บันทึกข้อมูลสำเร็จ', 201);
  } catch (error) {
    console.error('Add running record error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get user's running records
export const getRunningRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, sortBy, sortOrder } = req.query;
    
    // Convert query params
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy: sortBy || 'run_date',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await RunningRecord.getByUserId(userId, options);
    
    return successResponse(res, result);
  } catch (error) {
    console.error('Get running records error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get single running record
export const getRunningRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const record = await RunningRecord.getById(id);
    
    if (!record) {
      return notFoundResponse(res, 'ไม่พบข้อมูลการวิ่ง');
    }
    
    // Check if record belongs to user
    if (record.user_id !== userId) {
      return errorResponse(res, 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้', 403);
    }
    
    return successResponse(res, record);
  } catch (error) {
    console.error('Get running record error:', error);
    return serverErrorResponse(res, error);
  }
};

// Update running record
export const updateRunningRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { runDate, distance, duration, evidenceImageUrl } = req.body;
    const userId = req.user.id;
    
    // Check if record exists
    const existingRecord = await RunningRecord.getById(id);
    
    if (!existingRecord) {
      return notFoundResponse(res, 'ไม่พบข้อมูลการวิ่ง');
    }
    
    // Check if record belongs to user
    if (existingRecord.user_id !== userId) {
      return errorResponse(res, 'ไม่มีสิทธิ์แก้ไขข้อมูลนี้', 403);
    }
    
    // Create update data
    const updateData = {
      updated_at: new Date()
    };
    
    if (runDate !== undefined) {
      updateData.run_date = runDate;
    }
    
    if (distance !== undefined) {
      updateData.distance = parseFloat(distance);
    }
    
    if (duration !== undefined) {
      updateData.duration = parseInt(duration) * 60; // Convert minutes to seconds
    }
    
    if (evidenceImageUrl !== undefined) {
      updateData.evidence_image_url = evidenceImageUrl;
    }
    
    // Update record
    const updatedRecord = await RunningRecord.update(id, updateData);
    
    return successResponse(res, updatedRecord, 'อัปเดตข้อมูลสำเร็จ');
  } catch (error) {
    console.error('Update running record error:', error);
    return serverErrorResponse(res, error);
  }
};

// Delete running record
export const deleteRunningRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if record exists
    const existingRecord = await RunningRecord.getById(id);
    
    if (!existingRecord) {
      return notFoundResponse(res, 'ไม่พบข้อมูลการวิ่ง');
    }
    
    // Check if record belongs to user
    if (existingRecord.user_id !== userId) {
      return errorResponse(res, 'ไม่มีสิทธิ์ลบข้อมูลนี้', 403);
    }
    
    // Delete record
    await RunningRecord.delete(id);
    
    return successResponse(res, null, 'ลบข้อมูลสำเร็จ');
  } catch (error) {
    console.error('Delete running record error:', error);
    return serverErrorResponse(res, error);
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await RunningRecord.getUserStats(userId);
    
    return successResponse(res, stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    return serverErrorResponse(res, error);
  }
};
