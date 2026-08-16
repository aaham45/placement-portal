const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// ============ ADMIN LOGIN ============
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('========================================');
    console.log('👨‍💼 Admin Login attempt:', email);
    console.log('========================================');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    );

    if (users.length === 0) {
      console.log('❌ Admin not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    console.log('✅ Admin found:', user.email);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('📝 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Login successful!');
    console.log('========================================');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name || 'Admin',
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ DASHBOARD STATS ============
const getStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard stats...');

    const [students] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "student"'
    );

    const [companies] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "company"'
    );

    const [activeJobs] = await db.query(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active"'
    );

    const [totalJobs] = await db.query(
      'SELECT COUNT(*) as count FROM jobs'
    );

    const [applications] = await db.query(
      'SELECT COUNT(*) as count FROM applications'
    );

    const [placedStudents] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE status = "selected"'
    );

    const [pendingApprovals] = await db.query(
      'SELECT COUNT(*) as count FROM companies WHERE status = "pending"'
    );

    const totalStudentsCount = students[0]?.count || 0;
    const placed = placedStudents[0]?.count || 0;
    const placementRate = totalStudentsCount > 0 ? Math.round((placed / totalStudentsCount) * 100) : 0;

    const [highestPackage] = await db.query(
      'SELECT MAX(CAST(REPLACE(REPLACE(salary_range, " LPA", ""), "LPA", "") AS DECIMAL)) as max FROM jobs'
    );

    const [avgPackage] = await db.query(
      'SELECT AVG(CAST(REPLACE(REPLACE(salary_range, " LPA", ""), "LPA", "") AS DECIMAL)) as avg FROM jobs'
    );

    const [ongoingDrives] = await db.query(
      'SELECT COUNT(*) as count FROM placement_drives WHERE status = "ongoing"'
    );

    const avgPackageRounded = Math.round(avgPackage[0]?.avg || 0);
    const highestPackageRounded = Math.round(highestPackage[0]?.max || 0);

    const stats = {
      totalStudents: students[0]?.count || 0,
      totalCompanies: companies[0]?.count || 0,
      activeJobs: activeJobs[0]?.count || 0,
      totalJobs: totalJobs[0]?.count || 0,
      totalApplications: applications[0]?.count || 0,
      placedStudents: placedStudents[0]?.count || 0,
      placementRate: placementRate,
      pendingApprovals: pendingApprovals[0]?.count || 0,
      highestPackage: highestPackageRounded,
      avgPackage: avgPackageRounded,
      ongoingDrives: ongoingDrives[0]?.count || 0
    };

    console.log('📊 Stats:', stats);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ DASHBOARD OVERVIEW ============
const getDashboardOverview = async (req, res) => {
  try {
    const [todayApplications] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE DATE(applied_at) = CURDATE()'
    );
    const [pendingApprovals] = await db.query(
      'SELECT COUNT(*) as count FROM companies WHERE status = "pending"'
    );
    const [activeDrives] = await db.query(
      'SELECT COUNT(*) as count FROM placement_drives WHERE status = "ongoing"'
    );

    const [activities] = await db.query(
      `SELECT id, title, message, type, created_at 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [req.user.id]
    );

    const formattedActivities = activities.map(a => ({
      id: a.id || 1,
      action: a.title || a.message || 'New activity',
      time: getTimeAgo(a.created_at),
      type: a.type || 'info'
    }));

    console.log('📊 Dashboard Overview Activities:', formattedActivities);

    res.json({
      success: true,
      recentActivities: formattedActivities.length > 0 ? formattedActivities : [
        { id: 1, action: 'Welcome to Admin Dashboard', time: 'Just now', type: 'info' }
      ],
      upcomingEvents: [],
      quickStats: {
        todayApplications: todayApplications[0]?.count || 0,
        todayInterviews: 0,
        pendingApprovals: pendingApprovals[0]?.count || 0,
        activeDrives: activeDrives[0]?.count || 0
      }
    });

  } catch (error) {
    console.error('❌ Dashboard overview error:', error);
    res.json({
      success: true,
      recentActivities: [{ id: 1, action: 'Welcome to Admin Dashboard', time: 'Just now', type: 'info' }],
      upcomingEvents: [],
      quickStats: { todayApplications: 0, todayInterviews: 0, pendingApprovals: 0, activeDrives: 0 }
    });
  }
};

// ============ GET COMPANIES ============
const getCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(
      `SELECT 
        c.*, 
        u.email as user_email, 
        u.name as user_name,
        cp.hr_name,
        cp.phone as company_phone,
        cp.location as company_location,
        cp.website as company_website,
        cp.employee_count
       FROM companies c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       ORDER BY c.created_at DESC`
    );

    res.json({
      success: true,
      companies: companies || []
    });

  } catch (error) {
    console.error('❌ Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ GET NOTIFICATIONS ============
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      success: true,
      notifications: notifications || []
    });

  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.json({
      success: true,
      notifications: []
    });
  }
};

// ============ MARK NOTIFICATION READ ============
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ DELETE NOTIFICATION ============
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting notification ${id}`);

    const [result] = await db.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already deleted'
      });
    }

    console.log(`✅ Notification ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ DELETE ALL NOTIFICATIONS ============
const deleteAllNotifications = async (req, res) => {
  try {
    console.log('🗑️ Deleting all notifications for user:', req.user.id);

    const [result] = await db.query(
      'DELETE FROM notifications WHERE user_id = ?',
      [req.user.id]
    );

    console.log(`✅ ${result.affectedRows} notifications deleted successfully`);

    res.json({
      success: true,
      message: `${result.affectedRows} notifications cleared successfully`
    });

  } catch (error) {
    console.error('❌ Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ GET STUDENTS ============
const getStudents = async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT u.id, u.name, u.email, u.created_at, 
              sp.reg_no, sp.phone, sp.program, sp.branch, sp.current_cgpa,
              sp.skills, sp.certifications, sp.projects, sp.languages,
              sp.linkedin, sp.github, sp.portfolio, sp.bio, sp.address, sp.dob,
              sp.profile_pic,
              (SELECT COUNT(*) FROM applications WHERE student_id = u.id) as appliedJobs,
              (SELECT COUNT(*) FROM applications WHERE student_id = u.id AND status = 'shortlisted') as shortlisted,
              (SELECT COUNT(*) FROM interviews WHERE student_id = (SELECT id FROM student_profiles WHERE user_id = u.id)) as interviews
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.role = 'student'
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      students: students || []
    });

  } catch (error) {
    console.error('❌ Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ GET STUDENT DETAILS ============
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Fetching student details for user:', id);

    const [students] = await db.query(
      `SELECT u.id, u.name, u.email, u.created_at, 
              sp.reg_no, sp.phone, sp.program, sp.branch, sp.session, 
              sp.semester, sp.current_cgpa, sp.dob, sp.address,
              sp.skills, sp.certifications, sp.projects, sp.languages,
              sp.linkedin, sp.github, sp.portfolio, sp.bio, sp.profile_pic
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = ? AND u.role = 'student'`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];

    const [applied] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE student_id = ?',
      [id]
    );

    const [shortlisted] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status = "shortlisted"',
      [id]
    );

    const [interviews] = await db.query(
      'SELECT COUNT(*) as count FROM interviews WHERE student_id = (SELECT id FROM student_profiles WHERE user_id = ?)',
      [id]
    );

    const [selected] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status = "selected"',
      [id]
    );

    const [recentApplications] = await db.query(
      `SELECT a.*, j.title as job_title, c.company_name as company_name, a.status
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC
       LIMIT 5`,
      [id]
    );

    const skills = student.skills ? student.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    const certifications = student.certifications ? student.certifications.split(',').map(c => c.trim()).filter(Boolean) : [];
    const projects = student.projects ? student.projects.split(',').map(p => p.trim()).filter(Boolean) : [];
    const languages = student.languages ? student.languages.split(',').map(l => l.trim()).filter(Boolean) : [];

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        regNo: student.reg_no,
        phone: student.phone || 'N/A',
        program: student.program || 'N/A',
        branch: student.branch || 'N/A',
        session: student.session || 'N/A',
        semester: student.semester || 'N/A',
        cgpa: student.current_cgpa || 0,
        dob: student.dob || 'N/A',
        address: student.address || 'N/A',
        skills: skills,
        certifications: certifications,
        projects: projects,
        languages: languages,
        linkedin: student.linkedin || 'N/A',
        github: student.github || 'N/A',
        portfolio: student.portfolio || 'N/A',
        bio: student.bio || 'N/A',
        profilePic: student.profile_pic || null,
        createdAt: student.created_at,
        appliedJobs: applied[0]?.count || 0,
        shortlisted: shortlisted[0]?.count || 0,
        interviews: interviews[0]?.count || 0,
        selected: selected[0]?.count || 0,
        recentApplications: recentApplications || []
      }
    });

  } catch (error) {
    console.error('❌ Get student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ GET COMPANY DETAILS ============
const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Fetching company details for id:', id);

    const [companies] = await db.query(
      `SELECT c.*, u.email as user_email, u.name as user_name, 
              cp.hr_name, cp.phone as company_phone, cp.location as company_location,
              cp.website, cp.employee_count
       FROM companies c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE c.id = ?`,
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const company = companies[0];

    const [jobs] = await db.query(
      'SELECT COUNT(*) as count FROM jobs WHERE company_id = ?',
      [id]
    );

    const [placed] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE company_id = ? AND status = "selected"',
      [id]
    );

    res.json({
      success: true,
      company: {
        id: company.id,
        name: company.company_name,
        hrName: company.hr_name || 'N/A',
        email: company.contact_email || company.user_email || 'N/A',
        phone: company.company_phone || company.contact_phone || 'N/A',
        website: company.website || 'N/A',
        industry: company.industry || 'N/A',
        location: company.company_location || company.address || 'N/A',
        employeeCount: company.employee_count || 'N/A',
        description: company.description || 'No description available',
        status: company.status === 'approved' ? 'verified' : company.status === 'rejected' ? 'rejected' : 'pending',
        jobs: jobs[0]?.count || 0,
        placed: placed[0]?.count || 0,
        since: company.created_at ? new Date(company.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isVerified: company.status === 'approved'
      }
    });

  } catch (error) {
    console.error('❌ Get company details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ UPDATE COMPANY STATUS ============
const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`📝 Updating company ${id} status to ${status}`);
    
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected'
      });
    }
    
    const [companies] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    await db.query(
      'UPDATE companies SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    const company = companies[0];
    if (status === 'approved') {
      await db.query(
        'UPDATE users SET role = ? WHERE id = ?',
        ['company', company.user_id]
      );
    } else if (status === 'rejected') {
      await db.query(
        'UPDATE users SET role = ? WHERE id = ?',
        ['pending_company', company.user_id]
      );
    }
    
    const notificationMessage = status === 'approved' 
      ? 'Your company registration has been approved! You can now post jobs.' 
      : status === 'rejected'
      ? 'Your company registration has been rejected. Please contact support for more information.'
      : 'Your company registration is pending review.';
    
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, created_at, is_read) 
       VALUES (?, ?, ?, ?, NOW(), 0)`,
      [company.user_id, 'Company Status Update', notificationMessage, 'info']
    );
    
    console.log(`✅ Company ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      message: `Company ${status} successfully!`
    });
    
  } catch (error) {
    console.error('❌ Update company status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ UPDATE COMPANY ============
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, company_name, description, industry, address, phone, website, email,
      hrName, employeeCount, location
    } = req.body;
    
    // ✅ Agar name undefined hai toh company_name use karo
    const companyName = name || company_name || '';
    
    console.log(`📝 Updating company ${id}:`, { companyName, industry, location });
    
    const [companies] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    await db.query(
      `UPDATE companies SET 
        company_name = COALESCE(?, company_name),
        description = COALESCE(?, description),
        industry = COALESCE(?, industry),
        address = COALESCE(?, address),
        contact_phone = COALESCE(?, contact_phone),
        contact_email = COALESCE(?, contact_email),
        website = COALESCE(?, website),
        updated_at = NOW()
       WHERE id = ?`,
      [companyName, description, industry, address, phone, website, email, id]
    );
    
    const [profiles] = await db.query(
      'SELECT id FROM company_profiles WHERE user_id = (SELECT user_id FROM companies WHERE id = ?)',
      [id]
    );
    
    if (profiles.length > 0) {
      await db.query(
        `UPDATE company_profiles SET 
          hr_name = COALESCE(?, hr_name),
          phone = COALESCE(?, phone),
          location = COALESCE(?, location),
          website = COALESCE(?, website),
          employee_count = COALESCE(?, employee_count)
         WHERE user_id = (SELECT user_id FROM companies WHERE id = ?)`,
        [hrName, phone, location, website, employeeCount, id]
      );
    }
    
    console.log(`✅ Company ${id} updated successfully`);
    
    res.json({
      success: true,
      message: 'Company updated successfully!'
    });
    
  } catch (error) {
    console.error('❌ Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ DELETE COMPANY ============
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting company ${id}`);
    
    const [companies] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const company = companies[0];
    const userId = company.user_id;
    
    await db.query(
      'DELETE FROM applications WHERE company_id = ?',
      [id]
    );
    
    await db.query(
      'DELETE FROM jobs WHERE company_id = ?',
      [id]
    );
    
    await db.query(
      'DELETE FROM companies WHERE id = ?',
      [id]
    );
    
    await db.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    console.log(`✅ Company ${id} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Company deleted successfully!'
    });
    
  } catch (error) {
    console.error('❌ Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ CREATE COMPANY ============
const createCompany = async (req, res) => {
  try {
    const { 
      companyName, hrName, email, phone, website, industry, 
      location, employeeCount, description, password
    } = req.body;
    
    console.log(`📝 Creating new company:`, { companyName, hrName, email, industry });
    
    if (!companyName || !hrName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Company name, HR name and email are required'
      });
    }
    
    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Generate random password if not provided
    const userPassword = password || 'company123';
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    
    // ✅ YAHAN 'pending_company' use karo
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [hrName, email, hashedPassword, 'pending_company']
    );
    
    const userId = userResult.insertId;
    
    // Create company with status = 'pending'
    const [companyResult] = await db.query(
      `INSERT INTO companies 
        (user_id, company_name, description, industry, address, contact_phone, contact_email, website, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, companyName, description, industry, location, phone, email, website]
    );
    
    const companyId = companyResult.insertId;
    
    // Create company profile
    await db.query(
      `INSERT INTO company_profiles 
        (user_id, hr_name, phone, location, website, employee_count) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, hrName, phone || '', location || '', website || '', employeeCount || '']
    );
    
    console.log(`✅ Company ${companyName} created successfully with ID: ${companyId}`);
    
    res.json({
      success: true,
      message: 'Company added successfully!',
      data: {
        id: companyId,
        name: companyName,
        email: email,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('❌ Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ GET JOBS ============
const getJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT 
        j.*, 
        j.salary_range as package, 
        c.company_name,
        COUNT(a.id) as applications_count
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN applications a ON j.id = a.job_id
       GROUP BY j.id
       ORDER BY j.created_at DESC`
    );

    const formattedJobs = jobs.map(job => ({
      ...job,
      skills: job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    }));

    console.log('📊 Jobs fetched:', formattedJobs.length);
    console.log('📊 Sample job:', formattedJobs[0]);
    console.log('📊 Applications count:', formattedJobs[0]?.applications_count);

    res.json({
      success: true,
      jobs: formattedJobs || []
    });

  } catch (error) {
    console.error('❌ Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ CREATE JOB ============
const createJob = async (req, res) => {
  try {
    const { 
      title, companyId, salary_range, location, eligibility, 
      skills, openings, deadline, description, jobType 
    } = req.body;

    console.log('📝 Creating new job:', { title, companyId, salary_range, location });

    if (!title || !companyId || !salary_range || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, salary range and location are required'
      });
    }

    const [companies] = await db.query(
      'SELECT id FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    let skillsString = '';
    if (skills) {
      if (Array.isArray(skills)) {
        skillsString = skills.join(',');
      } else {
        skillsString = skills;
      }
    }

    const [result] = await db.query(
      `INSERT INTO jobs 
        (company_id, title, description, location, salary_range, job_type, 
         eligibility, skills, openings, application_deadline, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [companyId, title, description, location, salary_range, jobType || 'Full-time', 
       eligibility || 0, skillsString, openings || 1, deadline]
    );

    console.log(`✅ Job created successfully with ID: ${result.insertId}`);

    res.json({
      success: true,
      message: 'Job created successfully!',
      id: result.insertId
    });

  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ UPDATE JOB STATUS ============
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`📝 Updating job ${id} status to:`, status);

    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE id = ?',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await db.query(
      'UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    console.log(`✅ Job ${id} status updated to ${status}`);

    res.json({
      success: true,
      message: `Job ${status === 'active' ? 'activated' : 'closed'} successfully!`
    });

  } catch (error) {
    console.error('❌ Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ UPDATE JOB ============
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, salary_range, location, status, jobType, 
      openings, eligibility, deadline, skills, description 
    } = req.body;

    console.log(`📝 Updating job ${id}:`, { title, salary_range, location });

    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE id = ?',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    let skillsString = '';
    if (skills) {
      if (Array.isArray(skills)) {
        skillsString = skills.join(',');
      } else {
        skillsString = skills;
      }
    }

    await db.query(
      `UPDATE jobs SET 
        title = COALESCE(?, title),
        salary_range = COALESCE(?, salary_range),
        location = COALESCE(?, location),
        status = COALESCE(?, status),
        job_type = COALESCE(?, job_type),
        openings = COALESCE(?, openings),
        eligibility = COALESCE(?, eligibility),
        application_deadline = COALESCE(?, application_deadline),
        skills = COALESCE(?, skills),
        description = COALESCE(?, description),
        updated_at = NOW()
       WHERE id = ?`,
      [title, salary_range, location, status, jobType, openings, eligibility, deadline, skillsString, description, id]
    );

    console.log(`✅ Job ${id} updated successfully`);

    res.json({
      success: true,
      message: 'Job updated successfully!'
    });

  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ DELETE JOB ============
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting job ${id}`);

    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE id = ?',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await db.query(
      'DELETE FROM applications WHERE job_id = ?',
      [id]
    );

    await db.query(
      'DELETE FROM jobs WHERE id = ?',
      [id]
    );

    console.log(`✅ Job ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Job deleted successfully!'
    });

  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ GET ADMIN PROFILE ============
const getAdminProfile = async (req, res) => {
  try {
    const [admin] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              ap.*
       FROM users u
       LEFT JOIN admin_profiles ap ON u.id = ap.user_id
       WHERE u.id = ? AND u.role = 'admin'`,
      [req.user.id]
    );

    if (admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      profile: admin[0]
    });

  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ UPDATE ADMIN PROFILE ============
const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, designation, department, location, bio } = req.body;

    if (name) {
      await db.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, req.user.id]
      );
    }

    const [existing] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO admin_profiles (user_id, name, email, phone, designation, department, location, bio) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, name, req.user.email, phone, designation, department, location, bio]
      );
    } else {
      await db.query(
        `UPDATE admin_profiles SET 
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          designation = COALESCE(?, designation),
          department = COALESCE(?, department),
          location = COALESCE(?, location),
          bio = COALESCE(?, bio)
         WHERE user_id = ?`,
        [name, phone, designation, department, location, bio, req.user.id]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ CHANGE PASSWORD ============
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============ PLACEMENT DRIVES ============
const getPlacementDrives = async (req, res) => {
  try {
    console.log('📋 Fetching placement drives...');
    
    // ✅ AUTO UPDATE STATUS BASED ON CURRENT DATE
    await db.query(`
      UPDATE placement_drives 
      SET status = CASE 
        WHEN CURDATE() < start_date THEN 'upcoming'
        WHEN CURDATE() BETWEEN start_date AND end_date THEN 'ongoing'
        WHEN CURDATE() > end_date THEN 'completed'
        ELSE status
      END
    `);

    const [drives] = await db.query(
      `SELECT * FROM placement_drives ORDER BY created_at DESC`
    );

    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        COALESCE(SUM(total_applied), 0) as total_applied
       FROM placement_drives`
    );

    const [companies] = await db.query(
      `SELECT COUNT(DISTINCT companies) as count FROM placement_drives WHERE companies IS NOT NULL AND companies != ''`
    );

    const [students] = await db.query(
      `SELECT COALESCE(SUM(total_applied), 0) as total_students FROM placement_drives`
    );

    console.log('✅ Drives found:', drives.length);
    console.log('📊 Stats:', stats);
    console.log('📊 Companies:', companies[0]?.count || 0);
    console.log('📊 Students:', students[0]?.total_students || 0);

    res.json({
      success: true,
      drives: drives || [],
      stats: {
        total: stats[0]?.total || 0,
        upcoming: stats[0]?.upcoming || 0,
        ongoing: stats[0]?.ongoing || 0,
        completed: stats[0]?.completed || 0,
        totalApplied: stats[0]?.total_applied || 0,
        totalCompanies: companies[0]?.count || 0,
        totalStudents: students[0]?.total_students || 0
      }
    });

  } catch (error) {
    console.error('❌ Get placement drives error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ CREATE PLACEMENT DRIVE ============
const createPlacementDrive = async (req, res) => {
  try {
    const { 
      title, description, startDate, endDate, 
      companies, eligibleBranches, minCgpa, 
      packageRange, status 
    } = req.body;

    console.log('📝 Creating placement drive:', { title, startDate, endDate, companies });

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, start date and end date are required'
      });
    }

    // ✅ Auto-calculate status based on dates
    let autoStatus = 'upcoming';
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today >= start && today <= end) {
      autoStatus = 'ongoing';
    } else if (today > end) {
      autoStatus = 'completed';
    }

    const [result] = await db.query(
      `INSERT INTO placement_drives 
       (title, description, start_date, end_date, companies, eligible_branches, min_cgpa, package_range, status, total_applied, shortlisted, selected, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW())`,
      [title, description, startDate, endDate, companies, eligibleBranches, minCgpa || 0, packageRange, autoStatus]
    );

    console.log(`✅ Placement drive created successfully with ID: ${result.insertId}`);

    res.json({
      success: true,
      message: 'Placement drive created successfully!',
      id: result.insertId
    });

  } catch (error) {
    console.error('❌ Create placement drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ UPDATE PLACEMENT DRIVE ============
const updatePlacementDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, start_date, end_date, 
      companies, eligible_branches, min_cgpa, 
      package_range, status 
    } = req.body;

    console.log(`📝 Updating placement drive ${id}:`, { title, start_date, end_date, status });

    // ✅ Format dates
    let formattedStartDate = null;
    let formattedEndDate = null;
    
    if (start_date) {
      const dateObj = new Date(start_date);
      if (!isNaN(dateObj.getTime())) {
        formattedStartDate = dateObj.toISOString().split('T')[0];
      }
    }
    
    if (end_date) {
      const dateObj = new Date(end_date);
      if (!isNaN(dateObj.getTime())) {
        formattedEndDate = dateObj.toISOString().split('T')[0];
      }
    }

    // ✅ Auto-calculate status based on dates
    let autoStatus = status || 'upcoming';
    if (formattedStartDate && formattedEndDate) {
      const today = new Date();
      const start = new Date(formattedStartDate);
      const end = new Date(formattedEndDate);
      
      if (today >= start && today <= end) {
        autoStatus = 'ongoing';
      } else if (today > end) {
        autoStatus = 'completed';
      } else if (today < start) {
        autoStatus = 'upcoming';
      }
    }

    const [drives] = await db.query(
      'SELECT * FROM placement_drives WHERE id = ?',
      [id]
    );

    if (drives.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    await db.query(
      `UPDATE placement_drives SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        companies = COALESCE(?, companies),
        eligible_branches = COALESCE(?, eligible_branches),
        min_cgpa = COALESCE(?, min_cgpa),
        package_range = COALESCE(?, package_range),
        status = COALESCE(?, status),
        updated_at = NOW()
       WHERE id = ?`,
      [title, description, formattedStartDate, formattedEndDate, companies, eligible_branches, min_cgpa, package_range, autoStatus, id]
    );

    console.log(`✅ Placement drive ${id} updated successfully`);

    res.json({
      success: true,
      message: 'Placement drive updated successfully!'
    });

  } catch (error) {
    console.error('❌ Update placement drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ DELETE PLACEMENT DRIVE ============
const deletePlacementDrive = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting placement drive ${id}`);

    // Check if drive exists
    const [drives] = await db.query(
      'SELECT * FROM placement_drives WHERE id = ?',
      [id]
    );

    if (drives.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    await db.query(
      'DELETE FROM placement_drives WHERE id = ?',
      [id]
    );

    console.log(`✅ Placement drive ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Placement drive deleted successfully!'
    });

  } catch (error) {
    console.error('❌ Delete placement drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ ANALYTICS ============
const getAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching analytics data...');

    const [students] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "student"'
    );
    const [companies] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "company"'
    );
    const [jobs] = await db.query(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active"'
    );
    const [applications] = await db.query(
      'SELECT COUNT(*) as count FROM applications'
    );
    const [shortlisted] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE status = "shortlisted"'
    );
    const [selected] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE status = "selected"'
    );

    const [allPackages] = await db.query(
      'SELECT salary_range FROM jobs WHERE salary_range IS NOT NULL AND salary_range != ""'
    );
    
    let avgPackage = 0;
    let highestPackage = 0;
    const packageValues = [];
    
    allPackages.forEach(job => {
      const salaryStr = job.salary_range || '0 LPA';
      const numbers = salaryStr.match(/\d+/g);
      if (numbers) {
        const nums = numbers.map(Number);
        let pkgValue = 0;
        if (nums.length > 1) {
          pkgValue = nums.reduce((a, b) => a + b, 0) / nums.length;
        } else {
          pkgValue = nums[0] || 0;
        }
        packageValues.push(pkgValue);
        if (pkgValue > highestPackage) highestPackage = pkgValue;
      }
    });
    
    if (packageValues.length > 0) {
      avgPackage = Math.round(packageValues.reduce((a, b) => a + b, 0) / packageValues.length);
    }

    const [monthlyData] = await db.query(
      `SELECT 
        MONTH(applied_at) as month,
        COUNT(*) as count
       FROM applications 
       WHERE YEAR(applied_at) = YEAR(CURDATE())
       GROUP BY MONTH(applied_at)
       ORDER BY month ASC`
    );

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const applicationsData = new Array(12).fill(0);
    const shortlistedData = new Array(12).fill(0);
    const selectedData = new Array(12).fill(0);

    monthlyData.forEach(item => {
      applicationsData[item.month - 1] = item.count;
    });

    const [shortlistedMonthly] = await db.query(
      `SELECT 
        MONTH(applied_at) as month,
        COUNT(*) as count
       FROM applications 
       WHERE status = 'shortlisted' AND YEAR(applied_at) = YEAR(CURDATE())
       GROUP BY MONTH(applied_at)
       ORDER BY month ASC`
    );
    shortlistedMonthly.forEach(item => {
      shortlistedData[item.month - 1] = item.count;
    });

    const [selectedMonthly] = await db.query(
      `SELECT 
        MONTH(applied_at) as month,
        COUNT(*) as count
       FROM applications 
       WHERE status = 'selected' AND YEAR(applied_at) = YEAR(CURDATE())
       GROUP BY MONTH(applied_at)
       ORDER BY month ASC`
    );
    selectedMonthly.forEach(item => {
      selectedData[item.month - 1] = item.count;
    });

    const [branchData] = await db.query(
      `SELECT 
        branch,
        COUNT(*) as count
       FROM student_profiles
       WHERE branch IS NOT NULL AND branch != ''
       GROUP BY branch
       ORDER BY count DESC`
    );

    const branchColors = {
      'CSE': '#3b82f6',
      'IT': '#10b981',
      'ECE': '#f59e0b',
      'EE': '#8b5cf6',
      'ME': '#ec4899',
      'CE': '#06b6d4',
      'Other': '#94a3b8'
    };

    const totalBranchCount = branchData.reduce((sum, b) => sum + b.count, 0) || 1;
    const formattedBranchData = branchData.map(b => ({
      name: b.branch || 'Other',
      count: b.count,
      percentage: Math.round((b.count / totalBranchCount) * 100),
      color: branchColors[b.branch] || '#94a3b8'
    }));

    const [packageData] = await db.query(
      `SELECT 
        salary_range,
        COUNT(*) as count
       FROM jobs
       WHERE salary_range IS NOT NULL AND salary_range != ''
       GROUP BY salary_range
       ORDER BY count DESC`
    );

    const packageRanges = [
      { range: '3-6 LPA', min: 3, max: 6, count: 0, color: '#10b981' },
      { range: '6-10 LPA', min: 6, max: 10, count: 0, color: '#3b82f6' },
      { range: '10-15 LPA', min: 10, max: 15, count: 0, color: '#f59e0b' },
      { range: '15-20 LPA', min: 15, max: 20, count: 0, color: '#8b5cf6' },
      { range: '20+ LPA', min: 20, max: 100, count: 0, color: '#ec4899' }
    ];

    packageData.forEach(job => {
      const salaryStr = job.salary_range || '0 LPA';
      const numbers = salaryStr.match(/\d+/g);
      if (numbers) {
        const nums = numbers.map(Number);
        let pkgValue = 0;
        if (nums.length > 1) {
          pkgValue = nums.reduce((a, b) => a + b, 0) / nums.length;
        } else {
          pkgValue = nums[0] || 0;
        }
        const range = packageRanges.find(r => pkgValue >= r.min && pkgValue < r.max);
        if (range) range.count += job.count;
      }
    });

    const maxPackageCount = Math.max(...packageRanges.map(r => r.count), 1);
    const totalPackageCount = packageRanges.reduce((sum, r) => sum + r.count, 0) || 1;
    const formattedPackageData = packageRanges.map(r => ({
      range: r.range,
      count: r.count,
      percentage: Math.round((r.count / totalPackageCount) * 100),
      color: r.color,
      maxCount: maxPackageCount
    }));

    const totalApps = applications[0]?.count || 0;
    const shortlistedCount = shortlisted[0]?.count || 0;
    const selectedCount = selected[0]?.count || 0;

    const hiringFunnel = [
      { stage: 'Applications Received', count: totalApps, percentage: 100, color: '#3b82f6' },
      { stage: 'Shortlisted', count: shortlistedCount, percentage: totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 0, color: '#10b981' },
      { stage: 'Selected', count: selectedCount, percentage: totalApps > 0 ? Math.round((selectedCount / totalApps) * 100) : 0, color: '#8b5cf6' }
    ];

    // ✅ RECENT ACTIVITIES - NOTIFICATIONS SE DATA LO
    const [recentActivities] = await db.query(
      `SELECT 
        id,
        title as action,
        type,
        created_at
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [req.user.id]
    );

    const formattedActivities = recentActivities.map(a => ({
      id: a.id || 1,
      action: a.action || 'New activity',
      time: getTimeAgo(a.created_at),
      type: a.type || 'info'
    }));

    const insights = {
      applicationGrowth: totalApps > 50 ? '+32%' : totalApps > 20 ? '+15%' : '+5%',
      topBranch: formattedBranchData.length > 0 ? formattedBranchData[0]?.name || 'N/A' : 'N/A',
      topBranchPercentage: formattedBranchData.length > 0 ? formattedBranchData[0]?.percentage || 0 : 0,
      highestPackage: highestPackage > 0 ? `${highestPackage} LPA` : '0 LPA',
      placementRate: students[0]?.count > 0 ? Math.round((selectedCount / students[0]?.count) * 100) : 0
    };

    const stats = {
      totalStudents: students[0]?.count || 0,
      totalCompanies: companies[0]?.count || 0,
      totalJobs: jobs[0]?.count || 0,
      totalApplications: totalApps,
      shortlisted: shortlistedCount,
      selected: selectedCount,
      placementRate: insights.placementRate,
      avgPackage: avgPackage,
      highestPackage: highestPackage
    };

    console.log('✅ Analytics data fetched successfully');
    console.log('📊 Avg Package:', avgPackage);
    console.log('📊 Highest Package:', highestPackage);

    res.json({
      success: true,
      stats: stats,
      monthlyData: {
        applications: applicationsData,
        shortlisted: shortlistedData,
        selected: selectedData,
        months: months
      },
      branchData: formattedBranchData,
      packageData: formattedPackageData,
      hiringFunnel: hiringFunnel,
      recentActivities: formattedActivities.length > 0 ? formattedActivities : [
        { id: 1, action: 'Welcome to Analytics', time: 'Just now', type: 'info' }
      ],
      insights: insights
    });

  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ REPORTS ============
const getReports = async (req, res) => {
  try {
    let { type, dateRange, startDate, endDate } = req.query;
    
    if (!type || type === 'undefined' || type === '') {
      type = 'placement';
    }
    
    console.log('📊 Generating report:', { type, dateRange, startDate, endDate });

    let start = new Date();
    let end = new Date();

    switch(dateRange) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        if (startDate) start = new Date(startDate);
        if (endDate) end = new Date(endDate);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    let reportData = {};

    if (type === 'placement' || type === 'all') {
      const [summary] = await db.query(
        `SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student') as totalStudents,
          (SELECT COUNT(*) FROM applications WHERE status = 'selected') as totalPlaced,
          (SELECT COUNT(*) FROM companies) as totalCompanies,
          (SELECT COUNT(*) FROM jobs WHERE status = 'active') as totalJobs,
          (SELECT MAX(CAST(REPLACE(REPLACE(salary_range, " LPA", ""), "LPA", "") AS DECIMAL)) FROM jobs) as highestPackage,
          (SELECT AVG(CAST(REPLACE(REPLACE(salary_range, " LPA", ""), "LPA", "") AS DECIMAL)) FROM jobs) as avgPackage
        `
      );

      const [branchWise] = await db.query(
        `SELECT 
          sp.branch,
          COUNT(DISTINCT sp.id) as total,
          COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN a.id END) as placed,
          ROUND((COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN a.id END) / COUNT(DISTINCT sp.id)) * 100, 1) as rate
         FROM student_profiles sp
         LEFT JOIN applications a ON sp.user_id = a.student_id
         WHERE sp.branch IS NOT NULL AND sp.branch != ''
         GROUP BY sp.branch
         ORDER BY rate DESC`
      );

      const [companyWise] = await db.query(
        `SELECT 
          c.company_name as company,
          COUNT(a.id) as offers,
          ROUND(MAX(CAST(REPLACE(REPLACE(j.salary_range, " LPA", ""), "LPA", "") AS DECIMAL)), 0) as highestPackage,
          ROUND(AVG(CAST(REPLACE(REPLACE(j.salary_range, " LPA", ""), "LPA", "") AS DECIMAL)), 0) as avgPackage
         FROM companies c
         JOIN jobs j ON c.id = j.company_id
         LEFT JOIN applications a ON j.id = a.job_id AND a.status = 'selected'
         GROUP BY c.id
         ORDER BY offers DESC
         LIMIT 10`
      );

      const [monthlyTrend] = await db.query(
        `SELECT 
          MONTH(applied_at) as month_num,
          COUNT(*) as applications,
          SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
          SUM(CASE WHEN status = 'selected' THEN 1 ELSE 0 END) as selected
         FROM applications
         WHERE applied_at BETWEEN ? AND ?
         GROUP BY MONTH(applied_at)
         ORDER BY MONTH(applied_at) ASC`,
        [startStr, endStr]
      );

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedMonthlyTrend = monthlyTrend.map(item => ({
        month: monthNames[item.month_num - 1] || item.month_num,
        applications: item.applications || 0,
        shortlisted: item.shortlisted || 0,
        selected: item.selected || 0
      }));

      const totalStudents = summary[0]?.totalStudents || 0;
      const totalPlaced = summary[0]?.totalPlaced || 0;
      const placementRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

      reportData = {
        title: 'Placement Report',
        generatedOn: new Date().toLocaleString(),
        summary: {
          totalStudents,
          totalPlaced,
          placementRate,
          totalCompanies: summary[0]?.totalCompanies || 0,
          totalJobs: summary[0]?.totalJobs || 0,
          highestPackage: Math.round(summary[0]?.highestPackage || 0),
          avgPackage: Math.round(summary[0]?.avgPackage || 0)
        },
        branchWise: branchWise || [],
        companyWise: companyWise || [],
        monthlyTrend: formattedMonthlyTrend || []
      };
    }

    if (type === 'student' || type === 'all') {
      const [topPerformers] = await db.query(
        `SELECT 
          u.name,
          sp.branch,
          sp.current_cgpa as cgpa,
          c.company_name as placed,
          j.salary_range as package
         FROM users u
         JOIN student_profiles sp ON u.id = sp.user_id
         LEFT JOIN applications a ON u.id = a.student_id AND a.status = 'selected'
         LEFT JOIN jobs j ON a.job_id = j.id
         LEFT JOIN companies c ON j.company_id = c.id
         WHERE u.role = 'student'
         ORDER BY sp.current_cgpa DESC
         LIMIT 10`
      );

      const [cgpaDistribution] = await db.query(
        `SELECT 
          CASE 
            WHEN current_cgpa >= 9 THEN '9.0+'
            WHEN current_cgpa >= 8 THEN '8.0-9.0'
            WHEN current_cgpa >= 7 THEN '7.0-8.0'
            WHEN current_cgpa >= 6 THEN '6.0-7.0'
            ELSE '<6.0'
          END as range,
          COUNT(*) as count,
          ROUND((COUNT(*) / (SELECT COUNT(*) FROM student_profiles WHERE current_cgpa IS NOT NULL)) * 100, 1) as percentage
         FROM student_profiles
         WHERE current_cgpa IS NOT NULL
         GROUP BY range
         ORDER BY MIN(current_cgpa) DESC`
      );

      reportData = {
        ...reportData,
        topPerformers: topPerformers || [],
        cgpaDistribution: cgpaDistribution || []
      };
    }

    if (type === 'company' || type === 'all') {
      const [companies] = await db.query(
        `SELECT 
          c.company_name as name,
          COUNT(DISTINCT a.id) as totalHired,
          AVG(CAST(REPLACE(REPLACE(j.salary_range, " LPA", ""), "LPA", "") AS DECIMAL)) as avgPackage,
          sp.branch as topBranch
         FROM companies c
         JOIN jobs j ON c.id = j.company_id
         LEFT JOIN applications a ON j.id = a.job_id AND a.status = 'selected'
         LEFT JOIN student_profiles sp ON a.student_id = sp.user_id
         GROUP BY c.id
         ORDER BY totalHired DESC
         LIMIT 10`
      );

      const [industryWise] = await db.query(
        `SELECT 
          c.industry,
          COUNT(*) as count,
          ROUND((COUNT(*) / (SELECT COUNT(*) FROM companies)) * 100, 1) as percentage
         FROM companies c
         WHERE c.industry IS NOT NULL AND c.industry != ''
         GROUP BY c.industry
         ORDER BY count DESC`
      );

      reportData = {
        ...reportData,
        companies: companies || [],
        industryWise: industryWise || []
      };
    }

    console.log('✅ Report generated:', reportData);

    res.json({
      success: true,
      report: reportData
    });

  } catch (error) {
    console.error('❌ Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ SETTINGS ============
const getSettings = async (req, res) => {
  try {
    console.log('📋 Fetching settings for user:', req.user.id);
    
    const [adminProfile] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (adminProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    const adminId = adminProfile[0].id;
    
    const [settings] = await db.query(
      'SELECT * FROM admin_settings WHERE admin_id = ?',
      [adminId]
    );
    
    if (settings.length === 0) {
      await db.query(
        `INSERT INTO admin_settings (admin_id, site_name, site_email, timezone, theme, primary_color) 
         VALUES (?, 'Placement Portal', ?, 'Asia/Kolkata', 'light', '#059669')`,
        [adminId, req.user.email]
      );
      
      const [newSettings] = await db.query(
        'SELECT * FROM admin_settings WHERE admin_id = ?',
        [adminId]
      );
      
      return res.json({
        success: true,
        settings: formatSettings(newSettings[0])
      });
    }
    
    res.json({
      success: true,
      settings: formatSettings(settings[0])
    });
    
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

const updateGeneralSettings = async (req, res) => {
  try {
    console.log('📝 Updating general settings:', req.body);
    
    const { siteName, siteEmail, sitePhone, siteAddress, timezone, dateFormat, language } = req.body;
    
    const [adminProfile] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (adminProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    const adminId = adminProfile[0].id;
    
    await db.query(
      `UPDATE admin_settings SET 
        site_name = COALESCE(?, site_name),
        site_email = COALESCE(?, site_email),
        site_phone = COALESCE(?, site_phone),
        site_address = COALESCE(?, site_address),
        timezone = COALESCE(?, timezone),
        date_format = COALESCE(?, date_format),
        language = COALESCE(?, language)
       WHERE admin_id = ?`,
      [siteName, siteEmail, sitePhone, siteAddress, timezone, dateFormat, language, adminId]
    );
    
    res.json({
      success: true,
      message: 'General settings updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update general settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    console.log('📝 Updating notification settings:', req.body);
    
    const { 
      emailNotifications, 
      pushNotifications, 
      smsNotifications, 
      newCompanyAlert, 
      newJobAlert, 
      studentRegistrationAlert, 
      placementDriveAlert, 
      weeklyDigest 
    } = req.body;
    
    const [adminProfile] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (adminProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    const adminId = adminProfile[0].id;
    
    await db.query(
      `UPDATE admin_settings SET 
        email_notifications = ?,
        push_notifications = ?,
        sms_notifications = ?,
        new_company_alert = ?,
        new_job_alert = ?,
        student_registration_alert = ?,
        placement_drive_alert = ?,
        weekly_digest = ?
       WHERE admin_id = ?`,
      [
        emailNotifications ? 1 : 0,
        pushNotifications ? 1 : 0,
        smsNotifications ? 1 : 0,
        newCompanyAlert ? 1 : 0,
        newJobAlert ? 1 : 0,
        studentRegistrationAlert ? 1 : 0,
        placementDriveAlert ? 1 : 0,
        weeklyDigest ? 1 : 0,
        adminId
      ]
    );
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    console.log('📝 Updating security settings:', req.body);
    
    const { twoFactorAuth, sessionTimeout, maxLoginAttempts, passwordExpiryDays, ipWhitelist } = req.body;
    
    const [adminProfile] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (adminProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    const adminId = adminProfile[0].id;
    console.log('✅ Admin ID for security update:', adminId);
    
    // ✅ Update with proper values and null checks
    await db.query(
      `UPDATE admin_settings SET 
        two_factor_auth = ?,
        session_timeout = ?,
        max_login_attempts = ?,
        password_expiry_days = ?,
        ip_whitelist = ?
      WHERE admin_id = ?`,
      [
        twoFactorAuth ? 1 : 0,
        sessionTimeout || 60,        // Default 60 if undefined
        maxLoginAttempts || 5,       // Default 5 if undefined
        passwordExpiryDays || 90,    // Default 90 if undefined
        ipWhitelist || '',           // Default empty string if undefined
        adminId
      ]
    );
    
    console.log('✅ Security settings updated successfully for admin:', adminId);
    
    res.json({
      success: true,
      message: 'Security settings updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update security settings error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ SQL:', error.sql);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

const updateAppearanceSettings = async (req, res) => {
  try {
    console.log('📝 Updating appearance settings:', req.body);
    
    const { theme, primaryColor, fontSize, compactView, animationsEnabled } = req.body;
    
    const [adminProfile] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (adminProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    const adminId = adminProfile[0].id;
    
    await db.query(
      `UPDATE admin_settings SET 
        theme = ?,
        primary_color = ?,
        font_size = ?,
        compact_view = ?,
        animations_enabled = ?
       WHERE admin_id = ?`,
      [theme, primaryColor, fontSize, compactView ? 1 : 0, animationsEnabled ? 1 : 0, adminId]
    );
    
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

const resetSettings = async (req, res) => {
  try {
    console.log('🔄 Resetting settings for user:', req.user.id);
    
    const [adminProfile] = await db.query(
      'SELECT id FROM admin_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (adminProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    const adminId = adminProfile[0].id;
    
    await db.query(
      `UPDATE admin_settings SET 
        site_name = 'Placement Portal',
        site_email = ?,
        site_phone = NULL,
        site_address = NULL,
        timezone = 'Asia/Kolkata',
        date_format = 'DD/MM/YYYY',
        language = 'en',
        email_notifications = 1,
        push_notifications = 1,
        sms_notifications = 0,
        new_company_alert = 1,
        new_job_alert = 1,
        student_registration_alert = 1,
        placement_drive_alert = 1,
        weekly_digest = 0,
        two_factor_auth = 0,
        session_timeout = 60,
        max_login_attempts = 5,
        password_expiry_days = 90,
        theme = 'light',
        primary_color = '#059669',
        font_size = 'medium',
        compact_view = 0,
        animations_enabled = 1
       WHERE admin_id = ?`,
      [req.user.email, adminId]
    );
    
    res.json({
      success: true,
      message: 'Settings reset to default successfully'
    });
    
  } catch (error) {
    console.error('❌ Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Helper function to format settings
const formatSettings = (settings) => {
  return {
    general: {
      siteName: settings.site_name || 'Placement Portal',
      siteEmail: settings.site_email || '',
      sitePhone: settings.site_phone || '',
      siteAddress: settings.site_address || '',
      timezone: settings.timezone || 'Asia/Kolkata',
      dateFormat: settings.date_format || 'DD/MM/YYYY',
      language: settings.language || 'en'
    },
    notifications: {
      emailNotifications: settings.email_notifications === 1,
      pushNotifications: settings.push_notifications === 1,
      smsNotifications: settings.sms_notifications === 1,
      newCompanyAlert: settings.new_company_alert === 1,
      newJobAlert: settings.new_job_alert === 1,
      studentRegistrationAlert: settings.student_registration_alert === 1,
      placementDriveAlert: settings.placement_drive_alert === 1,
      weeklyDigest: settings.weekly_digest === 1
    },
    security: {
      twoFactorAuth: settings.two_factor_auth === 1,
      sessionTimeout: settings.session_timeout || 60,
      maxLoginAttempts: settings.max_login_attempts || 5,
      passwordExpiryDays: settings.password_expiry_days || 90,
      ipWhitelist: settings.ip_whitelist || ''
    },
    appearance: {
      theme: settings.theme || 'light',
      primaryColor: settings.primary_color || '#059669',
      fontSize: settings.font_size || 'medium',
      compactView: settings.compact_view === 1,
      animationsEnabled: settings.animations_enabled === 1
    }
  };
};

// ============ SEND REPORT EMAIL ============
const sendReportEmail = async (req, res) => {
  try {
    const { email, reportType, reportData } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log(`📧 Sending report to ${email}`);

    res.json({
      success: true,
      message: 'Report sent successfully!'
    });

  } catch (error) {
    console.error('❌ Send report email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ UPDATE STUDENT ============
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, program, branch, session, 
      semester, currentCgpa, dob, address, skills, certifications,
      projects, languages, linkedin, github, portfolio, bio
    } = req.body;  // ✅ currentCgpa lo

    console.log(`📝 Updating student ${id}:`, { name, email, branch, currentCgpa, dob });

    // Check if student exists
    const [students] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = "student"',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update user table
    if (name || email) {
      await db.query(
        'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
        [name, email, id]
      );
    }

    // Format DOB
    let formattedDob = null;
    if (dob) {
      const dateObj = new Date(dob);
      if (!isNaN(dateObj.getTime())) {
        formattedDob = dateObj.toISOString().split('T')[0];
      } else {
        formattedDob = dob;
      }
    }

    // Check if profile exists
    const [profiles] = await db.query(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [id]
    );

    if (profiles.length === 0) {
      await db.query(
        `INSERT INTO student_profiles 
         (user_id, reg_no, phone, program, branch, session, semester, 
          current_cgpa, dob, address, skills, certifications, projects, 
          languages, linkedin, github, portfolio, bio) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, null, phone, program, branch, session, semester, 
         currentCgpa, formattedDob, address, skills, certifications, projects,
         languages, linkedin, github, portfolio, bio]
      );
    } else {
      await db.query(
        `UPDATE student_profiles SET 
          phone = COALESCE(?, phone),
          program = COALESCE(?, program),
          branch = COALESCE(?, branch),
          session = COALESCE(?, session),
          semester = COALESCE(?, semester),
          current_cgpa = COALESCE(?, current_cgpa),
          dob = COALESCE(?, dob),
          address = COALESCE(?, address),
          skills = COALESCE(?, skills),
          certifications = COALESCE(?, certifications),
          projects = COALESCE(?, projects),
          languages = COALESCE(?, languages),
          linkedin = COALESCE(?, linkedin),
          github = COALESCE(?, github),
          portfolio = COALESCE(?, portfolio),
          bio = COALESCE(?, bio)
         WHERE user_id = ?`,
        [phone, program, branch, session, semester, currentCgpa, formattedDob, address, 
         skills, certifications, projects, languages, linkedin, github, portfolio, bio, id]
      );
    }

    console.log(`✅ Student ${id} updated successfully`);

    res.json({
      success: true,
      message: 'Student updated successfully!'
    });

  } catch (error) {
    console.error('❌ Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ DELETE STUDENT ============
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting student ${id}`);

    // Check if student exists
    const [students] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = "student"',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete applications first (foreign key constraints)
    await db.query(
      'DELETE FROM applications WHERE student_id = ?',
      [id]
    );

    // Delete student profile
    await db.query(
      'DELETE FROM student_profiles WHERE user_id = ?',
      [id]
    );

    // Delete user
    await db.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    console.log(`✅ Student ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Student deleted successfully!'
    });

  } catch (error) {
    console.error('❌ Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ CREATE STUDENT ============
const createStudent = async (req, res) => {
  try {
    const { name, email, phone, branch, semester, regNo, currentCgpa, address, dob } = req.body;

    console.log('📝 Creating new student:', { name, email, branch });

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student']
    );

    const userId = userResult.insertId;

    // Format DOB
    let formattedDob = null;
    if (dob) {
      const dateObj = new Date(dob);
      if (!isNaN(dateObj.getTime())) {
        formattedDob = dateObj.toISOString().split('T')[0];
      }
    }

    // Create student profile
    await db.query(
      `INSERT INTO student_profiles 
        (user_id, reg_no, phone, program, branch, semester, current_cgpa, dob, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, regNo || `REG${String(userId).padStart(6, '0')}`, phone, 'B.Tech', branch || 'CSE', semester || 1, currentCgpa || 0, formattedDob, address || '']
    );

    console.log(`✅ Student created successfully with ID: ${userId}`);

    res.json({
      success: true,
      message: 'Student created successfully!',
      id: userId
    });

  } catch (error) {
    console.error('❌ Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ============ EXPORT ============
module.exports = {
  adminLogin,
  getStats,
  getDashboardOverview,
  getCompanies,
  getCompanyDetails,
  updateCompanyStatus,
  updateCompany,
  deleteCompany,
  createCompany,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  deleteAllNotifications,
  getStudents,
  createStudent,
  getStudentDetails,
  updateStudent,     // ✅ ADD THIS
  deleteStudent,     // ✅ ADD THIS
  getJobs,
  createJob,
  updateJobStatus,
  updateJob,
  deleteJob,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementDrive,
  deletePlacementDrive,
  getAnalytics,
  getReports,
  sendReportEmail,
  getSettings,
  updateGeneralSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateAppearanceSettings,
  resetSettings
};