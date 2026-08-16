const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log('✅ Company Controller loaded:', Object.keys(companyController));

// ==================== PROFILE ====================
router.get('/profile', authMiddleware, companyController.getProfile);
router.put('/profile', authMiddleware, companyController.updateProfile);
router.post('/profile/logo', authMiddleware, companyController.uploadLogo);

// ==================== DASHBOARD STATS ====================
router.get('/stats/dashboard', authMiddleware, companyController.getDashboardStats);

// ==================== JOBS ====================
router.get('/jobs', authMiddleware, companyController.getJobs);
router.post('/jobs', authMiddleware, companyController.createJob);
router.put('/jobs/:id/status', authMiddleware, companyController.updateJobStatus);
router.delete('/jobs/:id', authMiddleware, companyController.deleteJob);
router.put('/jobs/:id', authMiddleware, companyController.updateJob);

// ==================== APPLICATIONS ====================
router.get('/applications', authMiddleware, companyController.getApplications);
router.put('/applications/:id/status', authMiddleware, companyController.updateApplicationStatus);

// ==================== INTERVIEWS ====================
router.post('/interviews/schedule', authMiddleware, companyController.scheduleInterview);
router.get('/interviews', authMiddleware, companyController.getInterviews);
router.put('/interviews/:id/status', authMiddleware, companyController.updateInterviewStatus);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authMiddleware, companyController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, companyController.markNotificationRead);
router.delete('/notifications/:id', authMiddleware, companyController.deleteNotification);
router.delete('/notifications/clear-all', authMiddleware, companyController.deleteAllNotifications);

// ==================== ELIGIBLE STUDENTS ====================
router.get('/students', authMiddleware, companyController.getStudents);

// ==================== AUTO-SHORTLIST ROUTES ====================
router.post('/jobs/:jobId/shortlist-preview', authMiddleware, companyController.getShortlistPreview);
router.post('/jobs/:jobId/auto-shortlist', authMiddleware, companyController.autoShortlist);

// ✅ Get shortlisted students (both from applications and shortlisted_students)
router.get('/shortlisted-students', authMiddleware, companyController.getShortlistedStudents);

// ✅ Get shortlisted student IDs
router.get('/shortlisted-ids', authMiddleware, companyController.getShortlistedIds);

// ✅ Remove from shortlist
router.delete('/students/:studentId/shortlist', authMiddleware, companyController.removeShortlist);

// ✅ Shortlist student route
router.post('/students/:studentId/shortlist', authMiddleware, companyController.shortlistStudent);

// ==================== TEST ROUTE ====================
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Company routes working!',
    controllers: Object.keys(companyController)
  });
});

module.exports = router;