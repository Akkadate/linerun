// src/app.js - updated CORS configuration
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import runningRoutes from './routes/runningRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4800;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Updated CORS configuration to support both HTTP and HTTPS
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3250',
  'https://run.devapp.cc',
  'https://liff.line.me'  // Allow LINE LIFF
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.line.me', 'https://*.supabase.co'],
      imgSrc: ["'self'", 'data:', 'https://*.line-scdn.net', 'https://*.supabase.co'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://static.line-scdn.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/running', runningRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'เกิดข้อผิดพลาดในระบบ';
  
  res.status(statusCode).json({
    success: false,
    error: message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
