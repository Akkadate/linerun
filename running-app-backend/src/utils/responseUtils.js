// src/utils/responseUtils.js

// Success response
export const successResponse = (res, data, message = 'สำเร็จ', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};


// Error response
export const errorResponse = (res, message = 'เกิดข้อผิดพลาด', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

// Not found response
export const notFoundResponse = (res, message = 'ไม่พบข้อมูล') => {
  return res.status(404).json({
    success: false,
    error: message
  });
};

// Server error response
export const serverErrorResponse = (res, error) => {
  console.error('Server error:', error);
  
  return res.status(500).json({
    success: false,
    error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'
  });
};
