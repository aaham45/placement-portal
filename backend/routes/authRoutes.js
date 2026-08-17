const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ Student Routes
router.post('/student/register', authController.studentRegister);
router.post('/student/login', authController.studentLogin);

// ✅ Company Routes
router.post('/company/register', authController.companyRegister);
router.post('/company/login', authController.companyLogin);

// ✅ Admin Routes
router.post('/admin/login', authController.adminLogin);

// ✅ Google Login
router.post('/google', authController.googleLogin);

// ✅ Forgot & Reset Password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;