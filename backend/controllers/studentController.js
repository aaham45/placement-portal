const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Helper function to get time ago
const getTimeAgo = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

// Helper function to get days left
const getDaysLeft = (deadline) => {
  if (!deadline) return 0;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============ PROFILE MANAGEMENT ============

// backend/controllers/studentController.js

const getProfile = async (req, res) => {
  try {
    console.log('📝 Fetching profile for user:', req.user.id);
    
    const [students] = await db.query(
      `SELECT 
        sp.*, 
        u.email, 
        u.name,
        sp.backlogs,
        sp.year_gap,
        sp.experience_years,
        sp.resume_url
       FROM student_profiles sp 
       JOIN users u ON sp.user_id = u.id 
       WHERE sp.user_id = ?`,
      [req.user.id]
    );
    
    if (students.length === 0) {
      console.log('❌ Student not found for user:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found. Please complete your profile.' 
      });
    }
    
    const profile = students[0];
    console.log('✅ Profile found:', profile.email);
    console.log('📊 Backlogs:', profile.backlogs);
    console.log('📊 Year Gap:', profile.year_gap);
    console.log('📊 Experience:', profile.experience_years);
    
    // ✅ Convert comma-separated strings to arrays
    if (profile.skills && typeof profile.skills === 'string') {
      profile.skills = profile.skills.split(',').filter(s => s.trim());
    }
    if (profile.certifications && typeof profile.certifications === 'string') {
      profile.certifications = profile.certifications.split(',').filter(c => c.trim());
    }
    if (profile.projects && typeof profile.projects === 'string') {
      profile.projects = profile.projects.split(',').filter(p => p.trim());
    }
    if (profile.languages && typeof profile.languages === 'string') {
      profile.languages = profile.languages.split(',').filter(l => l.trim());
    }
    
    res.json({ 
      success: true, 
      profile: profile 
    });
    
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// backend/controllers/studentController.js

const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      regNo,
      phone, 
      address, 
      program, 
      branch, 
      session, 
      semester, 
      currentCgpa, 
      skills, 
      certifications,
      projects,
      languages,
      linkedin, 
      github, 
      portfolio, 
      bio,
      // ✅ Auto-shortlist fields
      backlogs,
      yearGap,
      experienceYears
    } = req.body;
    
    console.log('📝 Updating profile for user:', req.user.id);
    console.log('📊 Data received:', { 
      name, regNo, phone, program, branch, currentCgpa, 
      backlogs, yearGap, experienceYears 
    });
    
    // ✅ Convert arrays to comma-separated strings
    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills || '';
    const certsStr = Array.isArray(certifications) ? certifications.join(',') : certifications || '';
    const projectsStr = Array.isArray(projects) ? projects.join(',') : projects || '';
    const languagesStr = Array.isArray(languages) ? languages.join(',') : languages || '';
    
    const userId = req.user.id;
    
    // ✅ Update user name if provided
    if (name) {
      await db.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId]
      );
    }
    
    // ✅ Check if student profile exists
    const [existingStudent] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existingStudent.length === 0) {
      // ✅ INSERT new profile with all fields
      await db.query(
        `INSERT INTO student_profiles 
          (user_id, reg_no, phone, address, program, branch, session, semester, 
           current_cgpa, skills, certifications, projects, languages, 
           linkedin, github, portfolio, bio,
           backlogs, year_gap, experience_years) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          regNo || null, 
          phone || null, 
          address || null, 
          program || null, 
          branch || null, 
          session || null, 
          semester || null, 
          currentCgpa || 0,
          skillsStr || null, 
          certsStr || null, 
          projectsStr || null, 
          languagesStr || null,
          linkedin || null, 
          github || null, 
          portfolio || null, 
          bio || null,
          backlogs || 0, 
          yearGap || 0, 
          experienceYears || 0
        ]
      );
      console.log('✅ New student profile created');
    } else {
      // ✅ UPDATE existing profile with all fields
      await db.query(
        `UPDATE student_profiles SET 
          reg_no = COALESCE(?, reg_no),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          program = COALESCE(?, program),
          branch = COALESCE(?, branch),
          session = COALESCE(?, session),
          semester = COALESCE(?, semester),
          current_cgpa = COALESCE(?, current_cgpa),
          skills = COALESCE(?, skills),
          certifications = COALESCE(?, certifications),
          projects = COALESCE(?, projects),
          languages = COALESCE(?, languages),
          linkedin = COALESCE(?, linkedin),
          github = COALESCE(?, github),
          portfolio = COALESCE(?, portfolio),
          bio = COALESCE(?, bio),
          backlogs = COALESCE(?, backlogs),
          year_gap = COALESCE(?, year_gap),
          experience_years = COALESCE(?, experience_years)
         WHERE user_id = ?`,
        [
          regNo || null, 
          phone || null, 
          address || null, 
          program || null, 
          branch || null, 
          session || null, 
          semester || null, 
          currentCgpa || 0,
          skillsStr || null, 
          certsStr || null, 
          projectsStr || null, 
          languagesStr || null,
          linkedin || null, 
          github || null, 
          portfolio || null, 
          bio || null,
          backlogs || 0, 
          yearGap || 0, 
          experienceYears || 0,
          userId
        ]
      );
      console.log('✅ Student profile updated');
    }
    
    // ✅ Fetch updated profile
    const [updatedProfile] = await db.query(
      `SELECT 
        sp.*, 
        u.email, 
        u.name,
        sp.backlogs,
        sp.year_gap,
        sp.experience_years
       FROM student_profiles sp 
       JOIN users u ON sp.user_id = u.id 
       WHERE sp.user_id = ?`,
      [userId]
    );
    
    if (updatedProfile.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found after update' 
      });
    }
    
    console.log('✅ Profile updated successfully for user:', userId);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: updatedProfile[0]
    });
    
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message,
      error: error.message
    });
  }
};

// backend/controllers/studentController.js

// backend/controllers/studentController.js

const uploadProfilePic = async (req, res) => {
  try {
    console.log('📸 Upload Profile Pic');
    console.log('📸 req.files:', req.files);
    
    if (!req.files || !req.files.profile_pic) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const file = req.files.profile_pic;
    console.log('📸 File:', file.name, file.size, file.mimetype);
    
    // ✅ Allowed types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only images allowed' });
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
    }
    
    // ✅ Get correct extension from MIME type
    const getExtensionFromMime = (mimeType) => {
      const mimeMap = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
      };
      return mimeMap[mimeType] || '.jpg';
    };
    
    const uploadDir = path.join(__dirname, '../uploads/profile-pics');
    console.log('📁 Upload Directory:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created directory:', uploadDir);
    }
    
    const timestamp = Date.now();
    const ext = getExtensionFromMime(file.mimetype);
    const filename = `profile_${req.user.id}_${timestamp}${ext}`;
    const uploadPath = path.join(uploadDir, filename);
    
    console.log('📁 Saving to:', uploadPath);
    
    await file.mv(uploadPath);
    console.log('✅ File saved successfully');
    
    if (fs.existsSync(uploadPath)) {
      console.log('✅ File verified at:', uploadPath);
    } else {
      console.log('❌ File not found after save!');
      return res.status(500).json({ 
        success: false, 
        message: 'File save failed' 
      });
    }
    
    const profilePicUrl = `/uploads/profile-pics/${filename}`;
    const fullImageUrl = `${req.protocol}://${req.get('host')}${profilePicUrl}`;
    
    console.log('✅ Full URL:', fullImageUrl);
    
    const [existing] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO student_profiles (user_id, profile_pic) VALUES (?, ?)',
        [req.user.id, profilePicUrl]
      );
    } else {
      await db.query(
        'UPDATE student_profiles SET profile_pic = ? WHERE user_id = ?',
        [profilePicUrl, req.user.id]
      );
    }
    
    res.json({ 
      success: true, 
      profile_pic: fullImageUrl,
      profilePic: fullImageUrl,
      message: 'Profile picture updated' 
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ============ DASHBOARD STATS ============

const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for user:', req.user.id);
    
    const userId = req.user.id;
    
    // ✅ Available Jobs
    const [availableJobs] = await db.query(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active"'
    );
    
    // ✅ My Applications
    const [myApplications] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE student_id = ?',
      [userId]
    );
    
    // ✅ Saved Jobs
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    const studentProfileId = student.length > 0 ? student[0].id : userId;
    
    const [savedJobs] = await db.query(
      'SELECT COUNT(*) as count FROM saved_jobs WHERE student_id = ?',
      [studentProfileId]
    );
    
    // ✅ Interviews
    const [interviews] = await db.query(
      'SELECT COUNT(*) as count FROM interviews WHERE student_id = ? AND status = "scheduled"',
      [userId]
    );
    
    // ✅ Shortlisted
    const [shortlisted] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status = "shortlisted"',
      [userId]
    );
    
    // ✅ Applied Jobs (same as myApplications)
    const [appliedJobs] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE student_id = ?',
      [userId]
    );
    
    // ✅ Offers Received
    const [offers] = await db.query(
      'SELECT COUNT(*) as count FROM offers WHERE student_id = ?',
      [userId]
    );
    
    console.log('📊 Stats:', {
      availableJobs: availableJobs[0]?.count || 0,
      myApplications: myApplications[0]?.count || 0,
      savedJobs: savedJobs[0]?.count || 0,
      interviews: interviews[0]?.count || 0,
      shortlisted: shortlisted[0]?.count || 0,
      offers: offers[0]?.count || 0
    });
    
    res.json({
      success: true,
      stats: {
        availableJobs: availableJobs[0]?.count || 0,
        myApplications: myApplications[0]?.count || 0,
        savedJobs: savedJobs[0]?.count || 0,
        interviews: interviews[0]?.count || 0,
        appliedJobs: appliedJobs[0]?.count || 0,
        shortlisted: shortlisted[0]?.count || 0,
        offersReceived: offers[0]?.count || 0,
        profileComplete: 65
      }
    });
    
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let appliedCount = 0, shortlistedCount = 0, interviewsCount = 0, offersCount = 0;
    
    const [applied] = await db.query('SELECT COUNT(*) as count FROM applications WHERE student_id = ?', [userId]);
    appliedCount = applied[0]?.count || 0;
    
    const [shortlisted] = await db.query('SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status = "shortlisted"', [userId]);
    shortlistedCount = shortlisted[0]?.count || 0;
    
    try {
      const [interviews] = await db.query('SELECT COUNT(*) as count FROM interviews WHERE student_id = ?', [userId]);
      interviewsCount = interviews[0]?.count || 0;
    } catch (err) {}
    
    const [offers] = await db.query('SELECT COUNT(*) as count FROM offers WHERE student_id = ?', [userId]);
    offersCount = offers[0]?.count || 0;
    
    res.json({
      success: true,
      stats: {
        appliedJobs: appliedCount,
        shortlisted: shortlistedCount,
        interviews: interviewsCount,
        offersReceived: offersCount,
        profileComplete: 65
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ RECENT ACTIVITIES ============

const getRecentActivities = async (req, res) => {
  try {
    console.log('📋 Fetching recent activities for user:', req.user.id);
    
    const userId = req.user.id;
    
    const [activities] = await db.query(
      `SELECT a.*, j.title as job_title, c.company_name as company_name, a.applied_at
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC
       LIMIT 5`,
      [userId]
    );
    
    const formattedActivities = activities.map(app => ({
      id: app.id,
      text: `Applied to ${app.company_name || 'Company'} for ${app.job_title || 'Job'}`,
      time: getTimeAgo(app.applied_at),
      type: 'applied'
    }));
    
    console.log('✅ Activities found:', formattedActivities.length);
    
    res.json({ success: true, activities: formattedActivities });
  } catch (error) {
    console.error('❌ Recent activities error:', error);
    res.json({
      success: true,
      activities: []
    });
  }
};

// ============ UPCOMING DEADLINES ============

const getUpcomingDeadlines = async (req, res) => {
  try {
    console.log('📅 Fetching upcoming deadlines');
    
    const [deadlines] = await db.query(
      `SELECT j.id, j.title, j.application_deadline as deadline, c.company_name as company
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.application_deadline >= CURDATE() AND j.status = 'active'
       ORDER BY j.application_deadline ASC
       LIMIT 5`,
      []
    );
    
    const formattedDeadlines = deadlines.map(d => ({
      company: d.company || 'Company',
      role: d.title || 'Job',
      deadline: d.deadline,
      daysLeft: getDaysLeft(d.deadline)
    }));
    
    console.log('✅ Deadlines found:', formattedDeadlines.length);
    
    res.json({ success: true, deadlines: formattedDeadlines });
  } catch (error) {
    console.error('❌ Upcoming deadlines error:', error);
    res.json({
      success: true,
      deadlines: []
    });
  }
};

// ============ ELIGIBLE JOBS ============

const getEligibleJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [student] = await db.query(
      'SELECT current_cgpa FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    const studentCgpa = student[0]?.current_cgpa || 0;
    
    console.log('📊 Student CGPA:', studentCgpa);
    
    const [jobs] = await db.query(
      `SELECT 
        j.id,
        j.title,
        j.description,
        j.salary_range as package,
        j.location,
        j.job_type,
        j.application_deadline as deadline,
        j.eligibility,
        j.openings,
        j.created_at,
        j.status,
        c.company_name as companyName,
        cp.logo as company_logo
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE j.status = 'active' 
       ORDER BY j.created_at DESC`,
      []
    );
    
    console.log('📊 Total Jobs Found:', jobs.length);
    console.log('📊 First job logo:', jobs[0]?.company_logo);
    
    const eligibleJobs = jobs.filter(job => {
      const jobEligibility = parseFloat(job.eligibility) || 0;
      return studentCgpa >= jobEligibility;
    });
    
    console.log('📊 Eligible Jobs:', eligibleJobs.length);
    
    res.json({ 
      success: true, 
      jobs: eligibleJobs 
    });
  } catch (error) {
    console.error('❌ Eligible jobs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ============ ACTIVE JOBS ============
const getActiveJobs = async (req, res) => {
  try {
    console.log('📋 Fetching active jobs');
    
    const [jobs] = await db.query(
      `SELECT 
        j.id,
        j.title,
        j.description,
        j.salary_range as package,
        j.location,
        j.job_type,
        j.application_deadline as deadline,
        j.eligibility,
        j.openings,
        j.created_at,
        j.status,
        c.company_name as companyName,
        cp.logo as company_logo
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE j.status = 'active' 
       ORDER BY j.created_at DESC`,
      []
    );
    
    console.log('✅ Jobs found:', jobs.length);
    console.log('📊 First job logo:', jobs[0]?.company_logo);
    
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      company_logo: job.company_logo || null,
      package: job.package || '0 LPA',
      location: job.location || 'Remote',
      job_type: job.job_type || 'Full-time',
      deadline: job.deadline,
      description: job.description || 'No description available',
      eligibility: job.eligibility || 0,
      openings: job.openings || 1,
      created_at: job.created_at,
      status: job.status
    }));
    
    res.json({ success: true, jobs: formattedJobs });
  } catch (error) {
    console.error('❌ Get active jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// ✅ FIXED: NOTIFICATIONS WITH UNREAD COUNT
// ============================================

const getNotifications = async (req, res) => {
  try {
    console.log('🔔 Fetching notifications for user:', req.user.id);
    
    const userId = req.user.id;
    
    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    console.log('✅ Notifications found:', notifications.length);
    
    if (!notifications || notifications.length === 0) {
      return res.json({ success: true, notifications: [] });
    }
    
    const formattedNotifs = notifications.map(notif => ({
      id: notif.id,
      title: notif.title || 'Notification',
      message: notif.message || '',
      time: getTimeAgo(notif.created_at),
      is_read: notif.is_read === 1,
      type: notif.type || 'info',
      created_at: notif.created_at
    }));
    
    res.json({ success: true, notifications: formattedNotifs });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.json({ success: true, notifications: [] });
  }
};

// ✅ NEW: GET UNREAD NOTIFICATION COUNT
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📊 Fetching unread count for user:', userId);
    
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    
    const count = rows[0]?.count || 0;
    console.log('✅ Unread count:', count);
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('📝 Marking notification as read:', id, 'User:', userId);
    
    const [existing] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    console.log('✅ Notification marked as read:', id);
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📝 Marking all notifications as read for user:', userId);
    
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ Deleting notification:', id, 'User:', userId);
    
    const [existing] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await db.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    console.log('✅ Notification deleted:', id);
    
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🗑️ Clearing all notifications for user:', userId);
    
    await db.query(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
    
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('❌ Clear notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ SAVED JOBS ============

const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }
    
    const studentProfileId = student[0].id;
    console.log('📝 Student Profile ID for saved jobs:', studentProfileId);
    
    const [savedJobs] = await db.query(
      `SELECT 
        sj.*, 
        j.title, 
        j.salary_range as package, 
        j.location, 
        j.job_type, 
        j.application_deadline as deadline, 
        j.description,
        c.company_name as companyName,
        cp.logo as company_logo
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE sj.student_id = ?
       ORDER BY sj.saved_at DESC`,
      [studentProfileId]
    );
    
    console.log('📊 Saved Jobs Found:', savedJobs.length);
    console.log('📊 First job logo:', savedJobs[0]?.company_logo);
    
    const [applied] = await db.query(
      'SELECT job_id FROM applications WHERE student_id = ?',
      [userId]
    );
    const appliedJobIds = applied.map(a => a.job_id);
    
    const formattedJobs = savedJobs.map(job => ({
      id: job.job_id,
      company: job.companyName,
      companyLogo: job.company_logo || null,
      role: job.title,
      package: job.package || '0 LPA',
      location: job.location,
      type: job.job_type,
      savedDate: job.saved_at,
      deadline: job.deadline,
      description: job.description,
      hasApplied: appliedJobIds.includes(job.job_id)
    }));
    
    res.json({ success: true, savedJobs: formattedJobs });
  } catch (error) {
    console.error('❌ Get saved jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    console.log('📝 Saving job:', jobId, 'User:', userId);
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found. Please complete your profile first.' 
      });
    }
    
    const studentProfileId = student[0].id;
    console.log('✅ Student Profile ID:', studentProfileId);
    
    const [existing] = await db.query(
      'SELECT id FROM saved_jobs WHERE student_id = ? AND job_id = ?',
      [studentProfileId, jobId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }
    
    await db.query(
      'INSERT INTO saved_jobs (student_id, job_id, saved_at) VALUES (?, ?, NOW())',
      [studentProfileId, jobId]
    );
    
    console.log('✅ Job saved successfully with student_profile_id:', studentProfileId);
    
    res.json({ success: true, message: 'Job saved successfully' });
  } catch (error) {
    console.error('❌ Save job error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ Removing saved job:', jobId, 'User:', userId);
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }
    
    const studentProfileId = student[0].id;
    
    await db.query(
      'DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?',
      [studentProfileId, jobId]
    );
    
    console.log('✅ Saved job removed successfully');
    
    res.json({ success: true, message: 'Job removed from saved' });
  } catch (error) {
    console.error('❌ Remove saved job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ SETTINGS MANAGEMENT ============

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found. Please complete your profile first.' 
      });
    }
    
    const studentProfileId = student[0].id;
    console.log('📝 Student Profile ID for settings:', studentProfileId);
    
    let [settings] = await db.query(
      'SELECT * FROM student_settings WHERE student_id = ?',
      [studentProfileId]
    );
    
    if (settings.length === 0) {
      await db.query(
        'INSERT INTO student_settings (student_id) VALUES (?)',
        [studentProfileId]
      );
      [settings] = await db.query(
        'SELECT * FROM student_settings WHERE student_id = ?',
        [studentProfileId]
      );
    }
    
    const [profile] = await db.query(
      `SELECT sp.*, u.email, u.name 
       FROM student_profiles sp 
       JOIN users u ON sp.user_id = u.id 
       WHERE sp.user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      settings: {
        profile: profile[0],
        notifications: {
          emailNotifications: settings[0].email_notifications === 1,
          pushNotifications: settings[0].push_notifications === 1,
          smsNotifications: settings[0].sms_notifications === 1,
          jobAlerts: settings[0].job_alerts === 1,
          interviewReminders: settings[0].interview_reminders === 1,
          offerUpdates: settings[0].offer_updates === 1,
          newsletter: settings[0].newsletter === 1
        },
        privacy: {
          profileVisibility: settings[0].profile_visibility,
          showResume: settings[0].show_resume === 1,
          showContact: settings[0].show_contact === 1,
          showSkills: settings[0].show_skills === 1,
          dataSharing: settings[0].data_sharing === 1
        },
        appearance: {
          theme: settings[0].theme,
          fontSize: settings[0].font_size,
          compactView: settings[0].compact_view === 1
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      jobAlerts,
      interviewReminders,
      offerUpdates,
      newsletter
    } = req.body;
    
    const userId = req.user.id;
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }
    
    const studentProfileId = student[0].id;
    
    const [existingSettings] = await db.query(
      'SELECT id FROM student_settings WHERE student_id = ?',
      [studentProfileId]
    );
    
    if (existingSettings.length === 0) {
      await db.query(
        'INSERT INTO student_settings (student_id) VALUES (?)',
        [studentProfileId]
      );
    }
    
    await db.query(
      `UPDATE student_settings SET 
        email_notifications = ?,
        push_notifications = ?,
        sms_notifications = ?,
        job_alerts = ?,
        interview_reminders = ?,
        offer_updates = ?,
        newsletter = ?
       WHERE student_id = ?`,
      [
        emailNotifications === true ? 1 : 0,
        pushNotifications === true ? 1 : 0,
        smsNotifications === true ? 1 : 0,
        jobAlerts === true ? 1 : 0,
        interviewReminders === true ? 1 : 0,
        offerUpdates === true ? 1 : 0,
        newsletter === true ? 1 : 0,
        studentProfileId
      ]
    );
    
    res.json({ success: true, message: 'Notification settings updated' });
    
  } catch (error) {
    console.error('❌ Update notification settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updatePrivacySettings = async (req, res) => {
  try {
    const {
      profileVisibility,
      showResume,
      showContact,
      showSkills,
      dataSharing
    } = req.body;
    
    console.log('📝 Updating privacy settings:', req.body);
    
    const userId = req.user.id;
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }
    
    const studentProfileId = student[0].id;
    
    const visibilityMap = {
      'public': 'public',
      'private': 'private',
      'only-me': 'company_only'
    };
    
    const dbVisibility = visibilityMap[profileVisibility] || 'public';
    
    const [existingSettings] = await db.query(
      'SELECT id FROM student_settings WHERE student_id = ?',
      [studentProfileId]
    );
    
    if (existingSettings.length === 0) {
      await db.query(
        `INSERT INTO student_settings 
          (student_id, profile_visibility, show_resume, show_contact, show_skills, data_sharing) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          studentProfileId,
          dbVisibility,
          showResume === true ? 1 : 0,
          showContact === true ? 1 : 0,
          showSkills === true ? 1 : 0,
          dataSharing === true ? 1 : 0
        ]
      );
    } else {
      await db.query(
        `UPDATE student_settings SET 
          profile_visibility = ?,
          show_resume = ?,
          show_contact = ?,
          show_skills = ?,
          data_sharing = ?
         WHERE student_id = ?`,
        [
          dbVisibility,
          showResume === true ? 1 : 0,
          showContact === true ? 1 : 0,
          showSkills === true ? 1 : 0,
          dataSharing === true ? 1 : 0,
          studentProfileId
        ]
      );
    }
    
    console.log('✅ Privacy settings updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Privacy settings updated successfully' 
    });
    
  } catch (error) {
    console.error('❌ Update privacy settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

const updateAppearanceSettings = async (req, res) => {
  try {
    const { theme, fontSize, compactView } = req.body;
    
    console.log('📝 Updating appearance settings:', req.body);
    
    const userId = req.user.id;
    
    const [student] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }
    
    const studentProfileId = student[0].id;
    
    const [existingSettings] = await db.query(
      'SELECT id FROM student_settings WHERE student_id = ?',
      [studentProfileId]
    );
    
    if (existingSettings.length === 0) {
      await db.query(
        `INSERT INTO student_settings 
          (student_id, theme, font_size, compact_view) 
         VALUES (?, ?, ?, ?)`,
        [
          studentProfileId,
          theme || 'light',
          fontSize || 'medium',
          compactView === true ? 1 : 0
        ]
      );
    } else {
      await db.query(
        `UPDATE student_settings SET 
          theme = ?,
          font_size = ?,
          compact_view = ?
         WHERE student_id = ?`,
        [
          theme || 'light',
          fontSize || 'medium',
          compactView === true ? 1 : 0,
          studentProfileId
        ]
      );
    }
    
    console.log('✅ Appearance settings updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Appearance settings updated successfully' 
    });
    
  } catch (error) {
    console.error('❌ Update appearance settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ============ DELETE ACCOUNT ============

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🗑️ Deleting account for user:', userId);
    
    await db.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    console.log('✅ Account deleted successfully');
    
    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// backend/controllers/studentController.js

// ============ GET APPLIED JOBS (FIXED - WITH RESUME URL) ============
const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 Fetching applied jobs for user:', userId);
    
    const [applications] = await db.query(
      `SELECT 
        a.id,
        a.job_id,
        a.student_id,
        a.student_name,
        a.registration_number,
        a.student_email,
        a.program,
        a.branch,
        a.cgpa,
        a.status,
        a.applied_at,
        a.cover_letter,
        j.title as job_title,
        j.salary_range as package,
        j.location,
        c.company_name,
        cp.logo as company_logo,
        sp.resume_url as resume_url  -- ✅ ADD THIS
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       LEFT JOIN student_profiles sp ON a.student_id = sp.user_id  -- ✅ ADD THIS JOIN
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [userId]
    );
    
    console.log('📊 Applied Jobs Found:', applications.length);
    console.log('📊 First app resume_url:', applications[0]?.resume_url);
    
    res.json({ 
      success: true, 
      applications: applications 
    });
  } catch (error) {
    console.error('❌ Get applied jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// backend/controllers/studentController.js
// ✅ FIXED - Remove 'result' column from query

const getInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [interviews] = await db.query(
      `SELECT 
        i.*, 
        j.title as job_title,
        c.company_name as companyName,
        cp.logo as company_logo
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE i.student_id = ?
       ORDER BY i.scheduled_date DESC`,
      [userId]
    );
    
    // ✅ Clean meeting links
    const cleanedInterviews = interviews.map(interview => {
      let cleanLink = interview.meeting_link;
      if (cleanLink) {
        const urlMatch = cleanLink.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          cleanLink = urlMatch[0];
        }
        if (!cleanLink.startsWith('http')) {
          const meetMatch = cleanLink.match(/meet\.google\.com\/[a-z-]+/i);
          if (meetMatch) {
            cleanLink = `https://${meetMatch[0]}`;
          }
        }
        if (cleanLink && !cleanLink.startsWith('http')) {
          cleanLink = null;
        }
      }
      
      return {
        ...interview,
        meeting_link: cleanLink
      };
    });
    
    console.log('📊 Interviews Found:', cleanedInterviews.length);
    
    res.json({ success: true, interviews: cleanedInterviews });
  } catch (error) {
    console.error('❌ Get interviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ OFFER LETTERS ============

const getOfferLetters = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 Fetching offer letters for user:', userId);
    
    const [offers] = await db.query(
      `SELECT 
        o.id,
        o.student_id,
        o.application_id,
        o.company_id,
        o.job_id,
        o.offer_date,
        o.package_offered as package,
        o.status,
        o.joining_date,
        o.description,
        o.base_salary,
        o.bonus,
        o.stocks,
        o.joining_bonus,
        o.location,
        o.perks,
        o.recruiter,
        o.recruiter_email,
        o.probation_period,
        o.notice_period,
        o.team_size,
        o.created_at,
        o.updated_at,
        j.title as job_title,
        c.company_name as companyName,
        cp.logo as company_logo
       FROM offers o
       JOIN jobs j ON o.job_id = j.id
       JOIN companies c ON o.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE o.student_id = ?
       ORDER BY o.offer_date DESC`,
      [userId]
    );
    
    console.log('📊 Offers Found:', offers.length);
    
    res.json({ 
      success: true, 
      offers: offers 
    });
  } catch (error) {
    console.error('❌ Get offer letters error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ============ ACCEPT OFFER ============

const acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    
    console.log('📝 Accepting offer:', offerId, 'User:', userId);
    
    const [existing] = await db.query(
      'SELECT id FROM offers WHERE id = ? AND student_id = ?',
      [offerId, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }
    
    await db.query(
      'UPDATE offers SET status = "accepted", updated_at = NOW() WHERE id = ?',
      [offerId]
    );
    
    console.log('✅ Offer accepted successfully:', offerId);
    
    res.json({ 
      success: true, 
      message: 'Offer accepted successfully' 
    });
  } catch (error) {
    console.error('❌ Accept offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ============ DECLINE OFFER ============

const declineOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    
    console.log('📝 Declining offer:', offerId, 'User:', userId);
    
    const [existing] = await db.query(
      'SELECT id FROM offers WHERE id = ? AND student_id = ?',
      [offerId, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }
    
    await db.query(
      'UPDATE offers SET status = "declined", updated_at = NOW() WHERE id = ?',
      [offerId]
    );
    
    console.log('✅ Offer declined successfully:', offerId);
    
    res.json({ 
      success: true, 
      message: 'Offer declined successfully' 
    });
  } catch (error) {
    console.error('❌ Decline offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// backend/controllers/studentController.js

// ✅ Upload Resume - COMPLETE WORKING CODE
const uploadResume = async (req, res) => {
  try {
    console.log('📄 Uploading resume for user:', req.user.id);
    
    // ✅ Check if file exists
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ 
        success: false, 
        message: 'No resume file uploaded' 
      });
    }
    
    const file = req.files.resume;
    console.log('📄 File:', file.name, file.size, file.mimetype);
    
    // ✅ Allowed file types
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only PDF, DOC, DOCX files are allowed' 
      });
    }
    
    // ✅ File size check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'File size too large. Maximum 5MB allowed' 
      });
    }
    
    // ✅ Create upload directory if not exists
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created directory:', uploadDir);
    }
    
    // ✅ Generate unique filename
    const ext = path.extname(file.name);
    const filename = `resume_${req.user.id}_${Date.now()}${ext}`;
    const uploadPath = path.join(uploadDir, filename);
    
    console.log('📁 Saving to:', uploadPath);
    
    // ✅ Move file to upload directory
    await file.mv(uploadPath);
    console.log('✅ File saved successfully');
    
    // ✅ Generate resume URL (relative path)
    const resumeUrl = `/uploads/resumes/${filename}`;
    console.log('📄 Resume URL:', resumeUrl);
    
    // ✅ Check if student profile exists
    const [existing] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (existing.length === 0) {
      // ✅ Insert new profile with resume
      await db.query(
        'INSERT INTO student_profiles (user_id, resume_url) VALUES (?, ?)',
        [req.user.id, resumeUrl]
      );
      console.log('✅ New student profile created with resume');
    } else {
      // ✅ Update existing profile with resume
      await db.query(
        'UPDATE student_profiles SET resume_url = ? WHERE user_id = ?',
        [resumeUrl, req.user.id]
      );
      console.log('✅ Student profile updated with resume');
    }
    
    // ✅ Generate full URL for frontend
    const fullUrl = `${req.protocol}://${req.get('host')}${resumeUrl}`;
    console.log('✅ Full URL:', fullUrl);
    
    // ✅ Send response
    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      resume_url: resumeUrl,
      resumeUrl: fullUrl,
      fullUrl: fullUrl
    });
    
  } catch (error) {
    console.error('❌ Upload resume error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// backend/controllers/studentController.js

const downloadOfferLetter = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    
    console.log(`📥 Downloading offer letter ${offerId} for user ${userId}`);
    
    // ✅ Fetch offer details
    const [offers] = await db.execute(
      `SELECT 
        o.*,
        j.title as job_title,
        j.description as job_description,
        c.company_name as companyName,
        u.name as student_name,
        u.email as student_email
       FROM offers o
       JOIN jobs j ON o.job_id = j.id
       JOIN companies c ON o.company_id = c.id
       JOIN users u ON o.student_id = u.id
       WHERE o.id = ? AND o.student_id = ?`,
      [offerId, userId]
    );
    
    if (offers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    const offer = offers[0];
    
    // ✅ Format dates
    const offerDate = offer.offer_date ? new Date(offer.offer_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : 'N/A';
    
    const joiningDate = offer.joining_date ? new Date(offer.joining_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : 'N/A';
    
    // ✅ Status badge class
    const statusClass = offer.status === 'accepted' ? 'accepted' : 
                        offer.status === 'declined' ? 'declined' : 'pending';
    
    const statusEmoji = offer.status === 'accepted' ? '✅' : 
                    (offer.status === 'declined' ? '❌' : '⏳');
    
    // ✅ Perks array
    const perks = offer.perks ? 
      (Array.isArray(offer.perks) ? offer.perks : offer.perks.split(',').map(p => p.trim())) : 
      ['Health Insurance', 'Paid Time Off'];
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Offer Letter - ${offer.companyName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            padding: 40px;
        }
        .letter {
            max-width: 800px;
            width: 100%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 50px;
            position: relative;
        }
        .letter-header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .letter-header .company {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
        }
        .letter-header .title {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 6px 30px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
            letter-spacing: 2px;
        }
        .letter-header .ref {
            float: right;
            font-size: 12px;
            color: #94a3b8;
            margin-top: -40px;
        }
        .clear { clear: both; }
        .date { font-size: 14px; color: #475569; margin-bottom: 25px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .greeting .name { font-size: 18px; font-weight: bold; color: #1e293b; }
        .message { font-size: 15px; line-height: 1.8; color: #334155; margin-bottom: 30px; }
        .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
        }
        .details .item .label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
        .details .item .value { font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 2px; }
        .details .item .value .package { color: #059669; font-size: 18px; }
        .status-badge {
            display: inline-block;
            padding: 3px 14px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-badge.accepted { background: #d1fae5; color: #065f46; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.declined { background: #fee2e2; color: #991b1b; }
        .perks {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 15px 0;
        }
        .perks .tag {
            background: #f1f5f9;
            padding: 4px 14px;
            border-radius: 50px;
            font-size: 12px;
            color: #475569;
            border: 1px solid #e2e8f0;
        }
        .terms {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            background: #f8fafc;
            padding: 15px 20px;
            border-radius: 10px;
            margin: 15px 0;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        .terms .term .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
        .terms .term .value { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px; }
        .signature {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
        }
        .signature .left .company-name { font-size: 16px; font-weight: bold; color: #1e293b; }
        .signature .left .address { font-size: 13px; color: #64748b; }
        .signature .right { text-align: right; }
        .signature .right .line {
            width: 180px;
            border-top: 2px solid #1e293b;
            margin: 10px 0 5px auto;
        }
        .signature .right .name { font-weight: bold; color: #1e293b; }
        .signature .right .title { font-size: 13px; color: #64748b; }
        .signature .right .email { font-size: 13px; color: #2563eb; }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
        }
        @media print {
            body { background: white; padding: 0; }
            .letter { box-shadow: none; border-radius: 0; }
        }
        @media (max-width: 600px) {
            .letter { padding: 25px; }
            .details { grid-template-columns: 1fr; }
            .terms { grid-template-columns: 1fr; }
            .signature { flex-direction: column; gap: 20px; }
            .signature .right { text-align: left; }
            .signature .right .line { width: 100%; }
            .letter-header .ref { float: none; display: block; margin-top: 10px; }
        }
    </style>
</head>
<body>
    <div class="letter">
        <div class="letter-header">
            <div class="ref">Ref: OFF-${String(offer.id).padStart(4, '0')}</div>
            <div class="company">${offer.companyName}</div>
            <div class="title">🎉 OFFER LETTER</div>
        </div>
        <div class="clear"></div>
        
        <div class="date"><strong>Date:</strong> ${offerDate}</div>
        
        <div class="greeting">
            Dear <span class="name">${offer.student_name}</span>,
        </div>
        
        <div class="message">
            <p>We are pleased to offer you the position of <strong>${offer.job_title}</strong> at <strong>${offer.companyName}</strong>.</p>
            <p style="margin-top: 10px;">We believe your skills and experience will be a valuable addition to our team. We look forward to working with you.</p>
        </div>
        
        <div class="details">
            <div class="item">
                <div class="label">📌 Position</div>
                <div class="value">${offer.job_title}</div>
            </div>
            <div class="item">
                <div class="label">💰 Package</div>
                <div class="value"><span class="package">${offer.package_offered || '0 LPA'}</span></div>
            </div>
            <div class="item">
                <div class="label">📍 Location</div>
                <div class="value">${offer.location || 'N/A'}</div>
            </div>
            <div class="item">
                <div class="label">📅 Joining Date</div>
                <div class="value">${joiningDate}</div>
            </div>
            <div class="item">
                <div class="label">📊 Status</div>
                <div class="value"><span class="status-badge ${statusClass}">${statusEmoji} ${offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</span></div>
            </div>
            <div class="item">
                <div class="label">📄 Type</div>
                <div class="value">Full-Time</div>
            </div>
        </div>
        
        <div style="margin: 15px 0;">
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">💰 Compensation Breakdown</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Base</div>
                    <div style="font-size: 16px; font-weight: 700; color: #1e293b;">${offer.base_salary || 'N/A'}</div>
                </div>
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Bonus</div>
                    <div style="font-size: 16px; font-weight: 700; color: #059669;">${offer.bonus || 'N/A'}</div>
                </div>
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Stocks</div>
                    <div style="font-size: 16px; font-weight: 700; color: #2563eb;">${offer.stocks || 'N/A'}</div>
                </div>
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Joining</div>
                    <div style="font-size: 16px; font-weight: 700; color: #d97706;">${offer.joining_bonus || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="perks">
            ${perks.map(perk => `<span class="tag">✦ ${perk}</span>`).join('')}
        </div>
        
        <div class="terms">
            <div class="term">
                <div class="label">⏱️ Probation</div>
                <div class="value">${offer.probation_period || '3 Months'}</div>
            </div>
            <div class="term">
                <div class="label">📋 Notice</div>
                <div class="value">${offer.notice_period || '1 Month'}</div>
            </div>
            <div class="term">
                <div class="label">👥 Team</div>
                <div class="value">${offer.team_size || 'N/A'}</div>
            </div>
        </div>
        
        <div class="signature">
            <div class="left">
                <div class="company-name">${offer.companyName}</div>
                <div class="address">${offer.location || 'India'}</div>
                <div style="margin-top: 5px; font-size: 13px; color: #64748b;">📧 ${offer.recruiter_email || 'hr@company.com'}</div>
            </div>
            <div class="right">
                <div style="font-size: 13px; color: #64748b;">For ${offer.companyName} HR Team</div>
                <div class="line"></div>
                <div class="name">${offer.recruiter || 'HR Team'}</div>
                <div class="title">HR Manager</div>
                <div class="email">📧 ${offer.recruiter_email || 'hr@company.com'}</div>
            </div>
        </div>
        
        <div class="footer">
            This is a system-generated offer letter. For any queries, contact HR.
        </div>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=Offer_Letter_${offer.companyName.replace(/\s/g, '_')}.html`);
    res.send(htmlContent);
    
  } catch (error) {
    console.error('❌ Error downloading offer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ RESOURCES ============

const getResources = async (req, res) => {
  try {
    const [resources] = await db.query(
      `SELECT * FROM resources WHERE status = 'active' ORDER BY created_at DESC`
    );
    
    res.json({ success: true, resources: resources || [] });
  } catch (error) {
    console.error('Get resources error:', error);
    res.json({ success: true, resources: [] });
  }
};

// ============ APPLY FOR JOB ============
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Applying for job:', jobId, 'User:', userId);
    
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
      [jobId, userId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied for this job' 
      });
    }
    
    const [job] = await db.query(
      'SELECT id, title, company_id FROM jobs WHERE id = ? AND status = "active"',
      [jobId]
    );
    
    if (job.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or no longer active' 
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO applications 
        (job_id, student_id, company_id, status, cover_letter, applied_at) 
       VALUES (?, ?, ?, 'pending', ?, NOW())`,
      [jobId, userId, job[0].company_id, coverLetter || null]
    );
    
    console.log('✅ Application created successfully, ID:', result.insertId);
    
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, created_at) 
       VALUES (?, 'application', 'Application Submitted', 
       'You have successfully applied for ${job[0].title}', NOW())`,
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      applicationId: result.insertId
    });
    
  } catch (error) {
    console.error('❌ Apply for job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ============ SAVED RESOURCES ============

const getSavedResources = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [saved] = await db.query(
      'SELECT resource_id FROM saved_resources WHERE student_id = ?',
      [userId]
    );
    
    const savedIds = saved.map(s => s.resource_id);
    
    res.json({ success: true, savedResources: savedIds });
  } catch (error) {
    console.error('❌ Get saved resources error:', error);
    res.json({ success: true, savedResources: [] });
  }
};

const saveResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await db.query(
      'INSERT INTO saved_resources (student_id, resource_id) VALUES (?, ?)',
      [userId, id]
    );
    
    res.json({ success: true, message: 'Resource saved' });
  } catch (error) {
    console.error('❌ Save resource error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeSavedResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await db.query(
      'DELETE FROM saved_resources WHERE student_id = ? AND resource_id = ?',
      [userId, id]
    );
    
    res.json({ success: true, message: 'Resource removed' });
  } catch (error) {
    console.error('❌ Remove saved resource error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ EXPORT ============

module.exports = { 
  getProfile, 
  updateProfile, 
  uploadProfilePic,
  getStats, 
  getDashboardStats,
  getRecentActivities,
  getUpcomingDeadlines,
  getEligibleJobs,
  getActiveJobs,
  getNotifications,
  getUnreadCount, // ✅ NEW: Added this
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  deleteNotification,
  getSavedJobs,
  saveJob,
  removeSavedJob,
  getSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAppearanceSettings,
  getAppliedJobs,
  getInterviews,
  getOfferLetters,
  acceptOffer,
  declineOffer,
  downloadOfferLetter,
  getResources,
  getSavedResources,
  saveResource,
  removeSavedResource,
  deleteAccount,
  uploadResume,
  applyForJob
};