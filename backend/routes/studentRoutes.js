const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ Profile Routes
router.get('/profile', authMiddleware, studentController.getProfile);
router.put('/profile', authMiddleware, studentController.updateProfile);

// ✅ Profile Picture Upload - WITH FILE HANDLING MIDDLEWARE
router.post('/profile/picture', authMiddleware, (req, res, next) => {
  console.log('📸 [ROUTE] Profile picture upload hit');
  console.log('📸 Content-Type:', req.headers['content-type']);
  console.log('📸 req.files:', req.files ? Object.keys(req.files) : 'No files');
  next();
}, studentController.uploadProfilePic);

// ✅ Dashboard Routes
router.get('/dashboard/stats', authMiddleware, studentController.getDashboardStats);
router.get('/stats', authMiddleware, studentController.getStats);

// ✅ Activity Routes
router.get('/activities', authMiddleware, studentController.getRecentActivities);
router.get('/deadlines', authMiddleware, studentController.getUpcomingDeadlines);
router.get('/eligible-jobs', authMiddleware, studentController.getEligibleJobs);

// ✅ Job Routes - PUBLIC (No auth for viewing jobs)
router.get('/jobs/active', studentController.getActiveJobs);

// ✅ Application Routes
router.get('/applications', authMiddleware, studentController.getAppliedJobs);
router.post('/jobs/:jobId/apply', authMiddleware, studentController.applyForJob);

// ✅ Saved Jobs Routes
router.get('/saved-jobs', authMiddleware, studentController.getSavedJobs);
router.post('/saved-jobs/:jobId', authMiddleware, studentController.saveJob);
router.delete('/saved-jobs/:jobId', authMiddleware, studentController.removeSavedJob);

// ✅ Interview Routes
router.get('/interviews', authMiddleware, studentController.getInterviews);

// ✅ Offer Routes
router.get('/offer-letters', authMiddleware, studentController.getOfferLetters);
router.get('/offers', authMiddleware, studentController.getOfferLetters);
router.post('/offers/:offerId/accept', authMiddleware, studentController.acceptOffer);
router.post('/offers/:offerId/decline', authMiddleware, studentController.declineOffer);
router.get('/offers/:offerId/download', authMiddleware, studentController.downloadOfferLetter);

// ✅ Resource Routes
router.get('/resources', authMiddleware, studentController.getResources);

// ✅ Notification Routes
router.get('/notifications', authMiddleware, studentController.getNotifications);

// ✅ FIXED: Unread count route (MUST be before /:id routes)
router.get('/notifications/unread-count', authMiddleware, studentController.getUnreadCount);

router.put('/notifications/:id/read', authMiddleware, studentController.markNotificationRead);
router.put('/notifications/read-all', authMiddleware, studentController.markAllNotificationsRead);
router.delete('/notifications/:id', authMiddleware, studentController.deleteNotification);
router.delete('/notifications/clear-all', authMiddleware, studentController.clearAllNotifications);

// ✅ Settings Routes
router.get('/settings', authMiddleware, studentController.getSettings);
router.put('/settings/notifications', authMiddleware, studentController.updateNotificationSettings);
router.put('/settings/privacy', authMiddleware, studentController.updatePrivacySettings);
router.put('/settings/appearance', authMiddleware, studentController.updateAppearanceSettings);

// ✅ Saved Resources Routes
router.get('/saved-resources', authMiddleware, studentController.getSavedResources);
router.post('/saved-resources/:id', authMiddleware, studentController.saveResource);
router.delete('/saved-resources/:id', authMiddleware, studentController.removeSavedResource);

// ✅ Account Routes
router.delete('/account', authMiddleware, studentController.deleteAccount);

// ✅ Upload Resume Route
router.post('/profile/resume', authMiddleware, studentController.uploadResume);

module.exports = router;