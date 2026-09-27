const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

/**
 * Xây dựng Express app (không gọi listen()) để `server.js` (chạy thật) và các
 * file test (supertest) có thể dùng chung, thay vì phải bind cổng/connect DB
 * mỗi khi chạy test.
 */
function createApp() {
  const app = express();

  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/assets', require('./routes/assets'));
  app.use('/api/assignments', require('./routes/assignments'));
  app.use('/api/maintenance', require('./routes/maintenance'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/reports', require('./routes/reports'));
  app.use('/api/chat', require('./routes/chat'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'IT Asset Management API is running' });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Không tìm thấy endpoint này' });
  });

  app.use(require('./middleware/errorHandler'));

  return app;
}

module.exports = createApp;
