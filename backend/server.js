const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const path = require('path');
const http = require('http');

dotenv.config();

const app = express();

app.disable('etag');

app.use((req, res, next) => {
  delete req.headers.upgrade;
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ COOP and COEP Headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Connection', 'keep-alive');
  res.removeHeader('Upgrade');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: false,
  safeFileNames: true,
  preserveExtension: true,
  parseNested: true
}));

// ✅ STATIC FILES - COMPLETE FIX (NO Content-Type override)
// Serve entire uploads folder
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.removeHeader('Upgrade');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ✅ Explicit routes for subfolders
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));
app.use('/uploads/profile-pics', express.static(path.join(__dirname, 'uploads/profile-pics')));
app.use('/uploads/company-logos', express.static(path.join(__dirname, 'uploads/company-logos')));

// ✅ Ensure upload directories exist
const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/resumes', 'uploads/profile-pics', 'uploads/company-logos'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${fullPath}`);
  }
});

require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/auth/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size too large. Maximum size is 10MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field.' });
  }
  console.error('❌ Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.get('/', (req, res) => {
  res.send('🚀 Backend Server is running successfully!');
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`);
  console.log(`✅ Admin Login: http://localhost:${PORT}/api/auth/admin/login`);
  console.log(`✅ Student Login: http://localhost:${PORT}/api/auth/student/login`);
  console.log(`✅ Company Login: http://localhost:${PORT}/api/auth/company/login`);
  console.log(`\n📋 Available API Endpoints:`);
  console.log(`  POST /api/auth/student/login`);
  console.log(`  POST /api/auth/company/login`);
  console.log(`  POST /api/auth/admin/login`);
  console.log(`  GET  /api/student/profile`);
  console.log(`  GET  /api/student/dashboard/stats`);
  console.log(`  GET  /api/student/activities`);
  console.log(`  GET  /api/student/deadlines`);
  console.log(`  GET  /api/student/notifications`);
  console.log(`  POST /api/student/profile/picture`);
  console.log(`  POST /api/student/profile/resume`);
  console.log(`\n✅ File upload enabled for company logo & profile picture`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📄 Resume directory: ${path.join(__dirname, 'uploads/resumes')}`);
  console.log(`🖼️  Profile pics directory: ${path.join(__dirname, 'uploads/profile-pics')}`);
});

server.keepAliveTimeout = 60000;
server.headersTimeout = 61000;

server.on('upgrade', (req, socket, head) => {
  socket.destroy();
});