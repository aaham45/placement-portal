const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================

// ✅ Admin Login
router.post('/login', adminController.adminLogin);

// =============================================
// PROTECTED ROUTES (Authentication required)
// =============================================

// ✅ Dashboard Routes
router.get('/stats', authMiddleware, adminController.getStats);
router.get('/dashboard/overview', authMiddleware, adminController.getDashboardOverview);

// ✅ Profile Routes
router.get('/profile', authMiddleware, adminController.getAdminProfile);
router.put('/profile', authMiddleware, adminController.updateAdminProfile);
router.post('/change-password', authMiddleware, adminController.changePassword);

// ✅ Company Routes
router.get('/companies', authMiddleware, adminController.getCompanies);
router.get('/companies/:id', authMiddleware, adminController.getCompanyDetails);
router.put('/companies/:id/verify', authMiddleware, adminController.updateCompanyStatus);
router.put('/companies/:id', authMiddleware, adminController.updateCompany);
router.delete('/companies/:id', authMiddleware, adminController.deleteCompany);
router.post('/companies', authMiddleware, adminController.createCompany);

// ✅ Student Routes
router.get('/students', authMiddleware, adminController.getStudents);
router.get('/students/:id', authMiddleware, adminController.getStudentDetails);
router.post('/students', authMiddleware, adminController.createStudent);      // ✅ ADD THIS
router.put('/students/:id', authMiddleware, adminController.updateStudent);
router.delete('/students/:id', authMiddleware, adminController.deleteStudent);

// ✅ Job Routes
router.get('/jobs', authMiddleware, adminController.getJobs);
router.post('/jobs', authMiddleware, adminController.createJob);
router.put('/jobs/:id/status', authMiddleware, adminController.updateJobStatus);
router.put('/jobs/:id', authMiddleware, adminController.updateJob);
router.delete('/jobs/:id', authMiddleware, adminController.deleteJob);

// ✅ Notification Routes
router.get('/notifications', authMiddleware, adminController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, adminController.markNotificationRead);
router.delete('/notifications/:id', authMiddleware, adminController.deleteNotification);
router.delete('/notifications/clear-all', authMiddleware, adminController.deleteAllNotifications);

// ✅ Placement Drive Routes
router.get('/placement-drives', authMiddleware, adminController.getPlacementDrives);
router.post('/placement-drives', authMiddleware, adminController.createPlacementDrive);
router.put('/placement-drives/:id', authMiddleware, adminController.updatePlacementDrive);
router.delete('/placement-drives/:id', authMiddleware, adminController.deletePlacementDrive);

// ✅ Analytics Route
router.get('/analytics', authMiddleware, adminController.getAnalytics);

// ✅ Reports Routes
router.get('/reports/:type', authMiddleware, adminController.getReports);
router.post('/reports/send-email', authMiddleware, adminController.sendReportEmail);

// ✅ Settings Routes
router.get('/settings', authMiddleware, adminController.getSettings);
router.put('/settings/general', authMiddleware, adminController.updateGeneralSettings);
router.put('/settings/notifications', authMiddleware, adminController.updateNotificationSettings);
router.put('/settings/security', authMiddleware, adminController.updateSecuritySettings);
router.put('/settings/appearance', authMiddleware, adminController.updateAppearanceSettings);
router.post('/settings/reset', authMiddleware, adminController.resetSettings);

module.exports = router;