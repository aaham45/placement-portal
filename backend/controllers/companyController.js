const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// ==================== PROFILE ====================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📋 Fetching profile for user:', userId);
    
    const [rows] = await db.execute(
      `SELECT 
        u.id, u.name, u.email, 
        c.id as company_id, c.company_name, c.description, c.industry, c.address, c.website, c.status,
        cp.hr_name, cp.phone, cp.location as company_location, cp.employee_count, cp.logo
       FROM users u 
       JOIN companies c ON u.id = c.user_id
       LEFT JOIN company_profiles cp ON u.id = cp.user_id
       WHERE u.id = ? AND u.role = 'company'`,
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company profile not found' 
      });
    }
    
    const profile = rows[0];
    const companyId = profile.company_id;
    
    // ✅ Calculate stats for this company
    const [activeJobs] = await db.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = "active"',
      [companyId]
    );
    
    const [applications] = await db.execute(
      `SELECT COUNT(*) as count FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?)`,
      [companyId]
    );
    
    const [shortlisted] = await db.execute(
      `SELECT COUNT(*) as count FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?) 
       AND status = 'shortlisted'`,
      [companyId]
    );
    
    // ✅ Build full logo URL
    let logoUrl = null;
    if (profile.logo) {
      if (profile.logo.startsWith('http://') || profile.logo.startsWith('https://')) {
        logoUrl = profile.logo;
      } else {
        logoUrl = `${req.protocol}://${req.get('host')}/${profile.logo}`;
      }
    }
    
    res.json({ 
      success: true, 
      companyName: profile.company_name || profile.name,
      hrName: profile.hr_name || profile.name,
      email: profile.email,
      phone: profile.phone || '',
      website: profile.website || '',
      industry: profile.industry || '',
      location: profile.company_location || profile.address || '',
      employeeCount: profile.employee_count || 0,
      logo: logoUrl,
      status: profile.status || 'pending',
      description: profile.description || '',
      // ✅ ADD THESE
      activeJobs: activeJobs[0]?.count || 0,
      applications: applications[0]?.count || 0,
      shortlisted: shortlisted[0]?.count || 0
    });
  } catch (error) {
    console.error('❌ Error fetching company profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== DASHBOARD STATS ====================
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 Fetching dashboard stats for user:', userId);
    
    // ✅ Get company id
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    const companyId = company[0].id;
    console.log('✅ Company ID:', companyId);

    // ✅ Get employee count from company_profiles
    const [profile] = await db.execute(
      'SELECT employee_count FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    const employeeCount = profile[0]?.employee_count || 0;

    // ✅ Get total jobs
    const [jobs] = await db.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE company_id = ?',
      [companyId]
    );
    
    // ✅ Get active jobs
    const [activeJobs] = await db.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = "active"',
      [companyId]
    );
    
    // ✅ Get total applications
    const [applications] = await db.execute(
      `SELECT COUNT(*) as count FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?)`,
      [companyId]
    );
    
    // ✅ Get shortlisted
    const [shortlisted] = await db.execute(
      `SELECT COUNT(*) as count FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?) 
       AND status = 'shortlisted'`,
      [companyId]
    );
    
    // ✅ Get selected/offers
    const [offers] = await db.execute(
      `SELECT COUNT(*) as count FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?) 
       AND status = 'selected'`,
      [companyId]
    );

    // ✅ Get rejected
    const [rejected] = await db.execute(
      `SELECT COUNT(*) as count FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?) 
       AND status = 'rejected'`,
      [companyId]
    );

    const totalApps = applications[0]?.count || 0;
    const totalOffers = offers[0]?.count || 0;
    const hiringRate = totalApps > 0 ? Math.round((totalOffers / totalApps) * 100) : 0;

    const stats = {
      totalJobs: jobs[0]?.count || 0,
      activeJobs: activeJobs[0]?.count || 0,
      totalApplications: totalApps,
      shortlisted: shortlisted[0]?.count || 0,
      offersSent: totalOffers,
      rejected: rejected[0]?.count || 0,
      hiringRate: hiringRate,
      employeeCount: employeeCount
    };

    console.log('📊 Stats calculated:', stats);

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error fetching company stats:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ==================== JOBS ====================
const getJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    const companyId = company[0].id;
    
    const [jobs] = await db.execute(
      `SELECT 
        j.*,
        (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
       FROM jobs j
       WHERE j.company_id = ?
       ORDER BY j.created_at DESC`,
      [companyId]
    );
    
    res.json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('❌ Error fetching company jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CREATE JOB ====================
const createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      salary_range, 
      location, 
      job_type, 
      eligibility, 
      skills, 
      openings, 
      application_deadline 
    } = req.body;
    
    const userId = req.user.id;
    
    console.log('📝 Creating new job:', { title, salary_range, location, application_deadline });
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    let skillsString = '';
    if (skills) {
      if (Array.isArray(skills)) {
        skillsString = skills.join(',');
      } else {
        skillsString = skills;
      }
    }
    
    const [result] = await db.execute(
      `INSERT INTO jobs (
        company_id, 
        title, 
        description, 
        salary_range, 
        location, 
        job_type, 
        eligibility, 
        skills, 
        openings, 
        application_deadline, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [
        companyId,
        title,
        description || '',
        salary_range || 'N/A',
        location || '',
        job_type || 'Full-time',
        eligibility || 0,
        skillsString,
        openings || 1,
        application_deadline || null
      ]
    );
    
    console.log(`✅ Job created successfully with ID: ${result.insertId}`);
    
    const [newJob] = await db.execute(
      `SELECT 
        j.*,
        (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
       FROM jobs j
       WHERE j.id = ?`,
      [result.insertId]
    );
    
    res.json({
      success: true,
      message: 'Job posted successfully!',
      job: newJob[0]
    });
    
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

// ==================== UPDATE JOB (FIXED) ====================
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      salary_range, 
      location, 
      job_type, 
      eligibility, 
      openings, 
      application_deadline, 
      description, 
      skills,
      department,
      experience,
      working_days,
      work_timings,
      min_backlogs,
      max_backlogs,
      year_gap_allowed,
      preferred_branches,
      bond_years,
      bond_amount,
      interview_rounds,
      selection_process,
      contact_person,
      contact_email,
      contact_phone,
      documents_required,
      responsibilities,
      requirements,
      benefits
    } = req.body;
    
    const userId = req.user.id;

    // ✅ Get company
    const [company] = await db.execute('SELECT id FROM companies WHERE user_id = ?', [userId]);
    if (company.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    const companyId = company[0].id;

    // ✅ Check if job exists
    const [job] = await db.execute('SELECT * FROM jobs WHERE id = ? AND company_id = ?', [id, companyId]);
    if (job.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // ✅ FIX: Format application_deadline correctly
    let formattedDeadline = null;
    if (application_deadline) {
      // If it's already in YYYY-MM-DD format
      if (application_deadline.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDeadline = application_deadline;
      } else {
        // Convert ISO string to YYYY-MM-DD
        const date = new Date(application_deadline);
        if (!isNaN(date.getTime())) {
          formattedDeadline = date.toISOString().split('T')[0];
        }
      }
    }

    console.log('📝 Updating job:', { 
      id, 
      title, 
      formattedDeadline,
      skills 
    });

    // ✅ Update query with formatted deadline
    await db.execute(
      `UPDATE jobs SET 
        title = ?, 
        salary_range = ?, 
        location = ?, 
        job_type = ?, 
        eligibility = ?, 
        openings = ?, 
        application_deadline = ?, 
        description = ?, 
        skills = ?, 
        updated_at = NOW() 
      WHERE id = ?`,
      [
        title, 
        salary_range, 
        location, 
        job_type, 
        eligibility, 
        openings, 
        formattedDeadline,  // ✅ FIXED: formatted deadline
        description || '', 
        skills || '', 
        id
      ]
    );

    // ✅ Update extra fields if they exist in table
    try {
      // Check if department column exists
      const [columns] = await db.execute('SHOW COLUMNS FROM jobs');
      const columnNames = columns.map(c => c.Field);
      
      if (columnNames.includes('department') && department) {
        await db.execute('UPDATE jobs SET department = ? WHERE id = ?', [department, id]);
      }
      if (columnNames.includes('experience') && experience) {
        await db.execute('UPDATE jobs SET experience = ? WHERE id = ?', [experience, id]);
      }
      if (columnNames.includes('working_days') && working_days) {
        await db.execute('UPDATE jobs SET working_days = ? WHERE id = ?', [working_days, id]);
      }
      if (columnNames.includes('work_timings') && work_timings) {
        await db.execute('UPDATE jobs SET work_timings = ? WHERE id = ?', [work_timings, id]);
      }
      if (columnNames.includes('min_backlogs') && min_backlogs !== undefined) {
        await db.execute('UPDATE jobs SET min_backlogs = ? WHERE id = ?', [min_backlogs, id]);
      }
      if (columnNames.includes('max_backlogs') && max_backlogs !== undefined) {
        await db.execute('UPDATE jobs SET max_backlogs = ? WHERE id = ?', [max_backlogs, id]);
      }
      if (columnNames.includes('year_gap_allowed') && year_gap_allowed !== undefined) {
        await db.execute('UPDATE jobs SET year_gap_allowed = ? WHERE id = ?', [year_gap_allowed, id]);
      }
      if (columnNames.includes('preferred_branches') && preferred_branches) {
        await db.execute('UPDATE jobs SET preferred_branches = ? WHERE id = ?', [preferred_branches, id]);
      }
      if (columnNames.includes('bond_years') && bond_years !== undefined) {
        await db.execute('UPDATE jobs SET bond_years = ? WHERE id = ?', [bond_years, id]);
      }
      if (columnNames.includes('bond_amount') && bond_amount) {
        await db.execute('UPDATE jobs SET bond_amount = ? WHERE id = ?', [bond_amount, id]);
      }
      if (columnNames.includes('interview_rounds') && interview_rounds !== undefined) {
        await db.execute('UPDATE jobs SET interview_rounds = ? WHERE id = ?', [interview_rounds, id]);
      }
      if (columnNames.includes('selection_process') && selection_process) {
        await db.execute('UPDATE jobs SET selection_process = ? WHERE id = ?', [selection_process, id]);
      }
      if (columnNames.includes('contact_person') && contact_person) {
        await db.execute('UPDATE jobs SET contact_person = ? WHERE id = ?', [contact_person, id]);
      }
      if (columnNames.includes('contact_email') && contact_email) {
        await db.execute('UPDATE jobs SET contact_email = ? WHERE id = ?', [contact_email, id]);
      }
      if (columnNames.includes('contact_phone') && contact_phone) {
        await db.execute('UPDATE jobs SET contact_phone = ? WHERE id = ?', [contact_phone, id]);
      }
      if (columnNames.includes('documents_required') && documents_required) {
        await db.execute('UPDATE jobs SET documents_required = ? WHERE id = ?', [documents_required, id]);
      }
      if (columnNames.includes('responsibilities') && responsibilities) {
        await db.execute('UPDATE jobs SET responsibilities = ? WHERE id = ?', [responsibilities, id]);
      }
      if (columnNames.includes('requirements') && requirements) {
        await db.execute('UPDATE jobs SET requirements = ? WHERE id = ?', [requirements, id]);
      }
      if (columnNames.includes('benefits') && benefits) {
        await db.execute('UPDATE jobs SET benefits = ? WHERE id = ?', [benefits, id]);
      }
    } catch (extraError) {
      console.log('⚠️ Some extra fields may not exist in database:', extraError.message);
    }

    console.log(`✅ Job ${id} updated successfully`);

    res.json({ 
      success: true, 
      message: 'Job updated successfully' 
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ==================== UPDATE JOB STATUS ====================
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    console.log(`📝 Updating job ${id} status to:`, status);
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    const [job] = await db.execute(
      'SELECT * FROM jobs WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (job.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }
    
    await db.execute(
      'UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    console.log(`✅ Job ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      message: `Job ${status === 'active' ? 'activated' : 'closed'} successfully`
    });
    
  } catch (error) {
    console.error('❌ Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== DELETE JOB ====================
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`🗑️ Deleting job ${id}`);
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    const [job] = await db.execute(
      'SELECT * FROM jobs WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (job.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }
    
    await db.execute(
      'DELETE FROM applications WHERE job_id = ?',
      [id]
    );
    
    await db.execute(
      'DELETE FROM jobs WHERE id = ?',
      [id]
    );
    
    console.log(`✅ Job ${id} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

// ==================== APPLICATIONS (FIXED - with profile pic & resume) ====================
const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    const companyId = company[0].id;
    
    const [applications] = await db.execute(
      `SELECT 
        a.*,
        j.title as job_title,
        j.salary_range as job_salary,
        j.job_type,
        u.name as student_name,
        u.email as student_email,
        sp.phone as student_phone,
        sp.branch as student_branch,
        sp.current_cgpa as student_cgpa,
        sp.profile_pic as student_profile_pic,
        sp.profile_pic as profile_pic,
        sp.skills as student_skills,
        sp.reg_no as student_reg_no,
        sp.resume_url as resume_url
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.student_id = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE j.company_id = ?
       ORDER BY a.applied_at DESC`,
      [companyId]
    );
    
    // ✅ Build full image URLs
    const protocol = req.protocol;
    const host = req.get('host');
    
    const applicationsWithImage = applications.map(app => {
      let imageUrl = null;
      
      if (app.profile_pic) {
        if (app.profile_pic.startsWith('http://') || app.profile_pic.startsWith('https://')) {
          imageUrl = app.profile_pic;
        } else if (app.profile_pic.startsWith('/uploads/')) {
          imageUrl = `${protocol}://${host}${app.profile_pic}`;
        } else {
          imageUrl = `${protocol}://${host}/uploads/profile-pics/${app.profile_pic}`;
        }
      }
      
      // ✅ Build full resume URL
      let resumeUrl = null;
      if (app.resume_url) {
        if (app.resume_url.startsWith('http://') || app.resume_url.startsWith('https://')) {
          resumeUrl = app.resume_url;
        } else if (app.resume_url.startsWith('/uploads/')) {
          resumeUrl = `${protocol}://${host}${app.resume_url}`;
        } else if (app.resume_url.startsWith('uploads/')) {
          resumeUrl = `${protocol}://${host}/${app.resume_url}`;
        } else {
          resumeUrl = `${protocol}://${host}/uploads/resumes/${app.resume_url}`;
        }
      }
      
      console.log(`📸 Student: ${app.student_name}, Resume: ${resumeUrl}`);
      
      return {
        ...app,
        profile_pic: imageUrl,
        student_profile_pic: imageUrl,
        resume_url: resumeUrl,
        reg_no: app.student_reg_no || app.reg_no || '',
        skills: app.student_skills || app.skills || '',
        salary_range: app.job_salary || app.salary_range || ''
      };
    });
    
    res.json({
      success: true,
      applications: applicationsWithImage
    });
  } catch (error) {
    console.error('❌ Error fetching company applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UPDATE APPLICATION STATUS ====================
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'shortlisted', 'interview', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, shortlisted, interview, selected, rejected'
      });
    }
    
    await db.execute(
      'UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// backend/controllers/companyController.js
// ==================== SCHEDULE INTERVIEW (COMPLETE FIXED) ====================

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, studentId, date, time, mode, type, meetingLink, venue, notes } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Scheduling interview:', { applicationId, studentId, date, time, mode, type, meetingLink });
    
    // ✅ Get company
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    // ✅ Verify application belongs to this company
    const [application] = await db.execute(
      'SELECT * FROM applications WHERE id = ? AND job_id IN (SELECT id FROM jobs WHERE company_id = ?)',
      [applicationId, companyId]
    );
    
    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }
    
    // ✅ Process meeting link
    let finalMeetingLink = meetingLink;
    let finalVenue = venue;
    
    if (mode === 'Online' || mode === 'online') {
      // ✅ If no meeting link provided, auto-generate
      if (!finalMeetingLink || finalMeetingLink === '' || finalMeetingLink === 'https://meet.google.com/') {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let code = '';
        for (let i = 0; i < 10; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        finalMeetingLink = `https://meet.google.com/${code}`;
        console.log('🔗 Auto-generated meeting link:', finalMeetingLink);
      }
      
      // ✅ Clean meeting link - extract only URL
      if (finalMeetingLink) {
        const urlMatch = finalMeetingLink.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          finalMeetingLink = urlMatch[0];
        }
        // If still not valid, try to find meet.google.com
        if (!finalMeetingLink.startsWith('http')) {
          const meetMatch = finalMeetingLink.match(/meet\.google\.com\/[a-z-]+/i);
          if (meetMatch) {
            finalMeetingLink = `https://${meetMatch[0]}`;
          }
        }
      }
      finalVenue = 'Online Meeting';
    } else {
      finalMeetingLink = null;
      finalVenue = venue || 'Offline Interview';
    }
    
    // ✅ Combine date and time
    const scheduledDateTime = new Date(`${date}T${time}`);
    if (isNaN(scheduledDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date or time format'
      });
    }
    const formattedDateTime = scheduledDateTime.toISOString().slice(0, 19).replace('T', ' ');
    
    // ✅ Check if interview already exists
    const [existing] = await db.execute(
      'SELECT * FROM interviews WHERE application_id = ?',
      [applicationId]
    );
    
    if (existing.length > 0) {
      // ✅ Update existing interview
      await db.execute(
        `UPDATE interviews SET 
          scheduled_date = ?,
          scheduled_time = ?,
          mode = ?,
          interview_type = ?,
          meeting_link = ?,
          venue = ?,
          notes = ?,
          status = 'scheduled',
          updated_at = NOW()
        WHERE application_id = ?`,
        [
          formattedDateTime,
          time,
          mode || 'online',
          type || 'Technical',
          finalMeetingLink,
          finalVenue,
          notes || `Interview Type: ${type || 'Technical'}`,
          applicationId
        ]
      );
      console.log('✅ Existing interview updated');
    } else {
      // ✅ Insert new interview
      await db.execute(
        `INSERT INTO interviews 
          (application_id, student_id, company_id, scheduled_date, scheduled_time, 
           mode, interview_type, meeting_link, venue, notes, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())`,
        [
          applicationId,
          studentId,
          companyId,
          formattedDateTime,
          time,
          mode || 'online',
          type || 'Technical',
          finalMeetingLink,
          finalVenue,
          notes || `Interview Type: ${type || 'Technical'}`,
        ]
      );
      console.log('✅ New interview inserted');
    }
    
    // ✅ Update application status
    await db.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      ['interview', applicationId]
    );
    
    // ✅ Send notification to student with clean meeting link
    const notificationMessage = finalMeetingLink 
      ? `Your interview has been scheduled on ${date} at ${time}. Join here: ${finalMeetingLink}`
      : `Your interview has been scheduled on ${date} at ${time} at ${finalVenue}`;
    
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, created_at, is_read) 
       VALUES (?, ?, ?, ?, NOW(), 0)`,
      [
        studentId,
        'Interview Scheduled',
        notificationMessage,
        'interview'
      ]
    );
    
    console.log('✅ Interview scheduled successfully');
    console.log('📎 Meeting Link:', finalMeetingLink);
    
    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      meetingLink: finalMeetingLink,
    });
    
  } catch (error) {
    console.error('❌ Error scheduling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js
// ✅ FIXED - Remove 'result' column from query

const getInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    const [interviews] = await db.execute(
      `SELECT 
        i.id,
        i.application_id,
        i.student_id,
        i.company_id,
        i.scheduled_date,
        i.scheduled_time,
        i.mode,
        i.interview_type,
        i.meeting_link,
        i.venue,
        i.notes,
        i.status,
        i.feedback,
        -- i.result,  ❌ REMOVE THIS - Column doesn't exist
        i.created_at,
        i.updated_at,
        u.name as student_name,
        u.email as student_email,
        j.title as job_title,
        a.status as application_status,
        c.company_name as companyName,
        cp.logo as company_logo
       FROM interviews i
       JOIN users u ON i.student_id = u.id
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       LEFT JOIN company_profiles cp ON c.user_id = cp.user_id
       WHERE i.company_id = ?
       ORDER BY i.scheduled_date DESC, i.scheduled_time DESC`,
      [companyId]
    );
    
    // ✅ Clean meeting links and format data
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
      
      let formattedDate = 'TBD';
      let formattedTime = 'TBD';
      if (interview.scheduled_date) {
        const dateObj = new Date(interview.scheduled_date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          formattedTime = dateObj.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
      }
      
      return {
        id: interview.id,
        application_id: interview.application_id,
        student_id: interview.student_id,
        company_id: interview.company_id,
        scheduled_date: interview.scheduled_date,
        scheduled_time: interview.scheduled_time,
        formatted_date: formattedDate,
        formatted_time: formattedTime,
        mode: interview.mode || 'Online',
        interview_type: interview.interview_type || 'Technical',
        meeting_link: cleanLink,
        venue: interview.venue || 'Online Meeting',
        notes: interview.notes,
        status: interview.status || 'scheduled',
        feedback: interview.feedback,
        // result: interview.result,  ❌ REMOVE THIS
        created_at: interview.created_at,
        updated_at: interview.updated_at,
        student_name: interview.student_name || 'Unknown',
        student_email: interview.student_email || 'N/A',
        job_title: interview.job_title || 'Unknown',
        application_status: interview.application_status || 'pending',
        companyName: interview.companyName || 'Company',
        company_logo: interview.company_logo || null
      };
    });
    
    console.log(`✅ Found ${cleanedInterviews.length} interviews for company ${companyId}`);
    
    res.json({
      success: true,
      interviews: cleanedInterviews
    });
    
  } catch (error) {
    console.error('❌ Error fetching interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // ✅ Check if interview exists with full details
    const [interview] = await db.execute(
      `SELECT 
        i.*,
        a.job_id,
        a.student_id,
        a.id as application_id,
        j.company_id,
        j.title,
        j.salary_range,
        j.location as job_location,
        j.description as job_description,
        j.job_type,
        c.company_name,
        c.description as company_description
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    
    if (interview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }
    
    const interviewData = interview[0];
    console.log('📊 Interview Data:', interviewData);
    
    // ✅ Update interview status
    await db.execute(
      `UPDATE interviews SET 
        status = ?,
        feedback = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [status, feedback || null, id]
    );
    
    console.log(`✅ Interview ${id} status updated to ${status}`);
    
    // ✅ If status is 'completed', update application AND create offer
    if (status === 'completed') {
      // ✅ Update application status
      await db.execute(
        `UPDATE applications SET 
          status = 'selected',
          updated_at = NOW()
        WHERE id = ?`,
        [interviewData.application_id]
      );
      console.log(`✅ Application ${interviewData.application_id} status updated to 'selected'`);
      
      // ✅ Check if offer already exists
      const [existingOffer] = await db.execute(
        'SELECT id FROM offers WHERE application_id = ?',
        [interviewData.application_id]
      );
      
      if (existingOffer.length === 0) {
        // ✅ Calculate joining date (30 days from now)
        const joiningDate = new Date();
        joiningDate.setDate(joiningDate.getDate() + 30);
        const formattedJoiningDate = joiningDate.toISOString().split('T')[0];
        
        // ✅ Parse salary range
        let baseSalary = 'N/A';
        let bonus = 'N/A';
        let stocks = 'N/A';
        let joiningBonus = 'N/A';
        let totalPackage = interviewData.salary_range || '0 LPA';
        
        // ✅ Try to extract details from salary_range
        if (interviewData.salary_range) {
          const salaryStr = interviewData.salary_range;
          // Example: "12 LPA + 2 LPA Bonus + 1 LPA Stocks"
          const baseMatch = salaryStr.match(/(\d+(?:\.\d+)?)\s*LPA/i);
          if (baseMatch) {
            baseSalary = `${baseMatch[1]} LPA`;
          }
          const bonusMatch = salaryStr.match(/Bonus[:\s]*(\d+(?:\.\d+)?)\s*LPA/i);
          if (bonusMatch) {
            bonus = `${bonusMatch[1]} LPA`;
          }
          const stocksMatch = salaryStr.match(/Stocks[:\s]*(\d+(?:\.\d+)?)\s*LPA/i);
          if (stocksMatch) {
            stocks = `${stocksMatch[1]} LPA`;
          }
          const joiningMatch = salaryStr.match(/Joining[:\s]*(\d+(?:\.\d+)?)\s*LPA/i);
          if (joiningMatch) {
            joiningBonus = `${joiningMatch[1]} LPA`;
          }
        }
        
        const location = interviewData.job_location || interviewData.location || 'N/A';
        
        // ✅ Insert offer with ALL details
        await db.execute(
          `INSERT INTO offers (
            student_id,
            company_id,
            job_id,
            application_id,
            package_offered,
            base_salary,
            bonus,
            stocks,
            joining_bonus,
            status,
            offer_date,
            created_at,
            joining_date,
            location,
            recruiter,
            recruiter_email,
            description,
            probation_period,
            notice_period,
            team_size,
            perks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            interviewData.student_id,
            interviewData.company_id,
            interviewData.job_id,
            interviewData.application_id,
            totalPackage,
            baseSalary,
            bonus,
            stocks,
            joiningBonus,
            formattedJoiningDate,
            location,
            interviewData.company_name || 'HR Team',
            'hr@company.com',
            `Congratulations! You have been selected for the position of ${interviewData.title} at ${interviewData.company_name}.`,
            '3 months',   // probation_period
            '1 month',    // notice_period
            '10-15',      // team_size
            'Health Insurance, Paid Time Off, Remote Work Options' // perks
          ]
        );
        console.log(`✅ Offer letter created for student ${interviewData.student_id}`);
        
        // ✅ Send notification to student
        await db.execute(
          `INSERT INTO notifications (user_id, title, message, type, created_at, is_read) 
           VALUES (?, ?, ?, ?, NOW(), 0)`,
          [
            interviewData.student_id,
            '🎉 Congratulations! You have an Offer Letter!',
            `You have been selected by ${interviewData.company_name} for the position of ${interviewData.title} with package ${totalPackage}. Please check your dashboard for the offer letter.`,
            'offer'
          ]
        );
        console.log(`✅ Notification sent to student ${interviewData.student_id}`);
      } else {
        console.log(`⚠️ Offer already exists for application ${interviewData.application_id}`);
      }
    }
    
    res.json({
      success: true,
      message: `Interview ${status} successfully`
    });
    
  } catch (error) {
    console.error('❌ Error updating interview:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

// ==================== AUTO-SHORTLIST PREVIEW (FLEXIBLE) ====================
const getShortlistPreview = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      minCGPA = 7.0,
      branches = [],
      maxBacklogs = 0,
      maxYearGap = 0,
      minExperience = 0,
      resumeRequired = false,
      matchMode = 'all'
    } = req.body;

    console.log('📊 Getting shortlist preview for job:', jobId);
    console.log('📊 Match Mode:', matchMode);

    // ✅ Check if job exists
    const [jobCheck] = await db.execute(
      'SELECT id FROM jobs WHERE id = ?',
      [jobId]
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // ✅ Count total applied
    const [totalApplied] = await db.execute(
      'SELECT COUNT(*) as count FROM applications WHERE job_id = ? AND status = "applied"',
      [jobId]
    );

    // ✅ Count each criteria
    const [cgpaPass] = await db.execute(
      `SELECT COUNT(*) as count FROM applications a 
       JOIN student_profiles sp ON a.student_id = sp.user_id 
       WHERE a.job_id = ? AND a.status = 'applied' AND sp.current_cgpa >= ?`,
      [jobId, minCGPA]
    );

    let branchQuery = `
      SELECT COUNT(*) as count FROM applications a 
      JOIN student_profiles sp ON a.student_id = sp.user_id 
      WHERE a.job_id = ? AND a.status = 'applied'
    `;
    let branchParams = [jobId];

    if (branches && branches.length > 0) {
      const placeholders = branches.map(() => '?').join(',');
      branchQuery += ` AND sp.branch IN (${placeholders})`;
      branchParams = [...branchParams, ...branches];
    }
    const [branchPass] = await db.execute(branchQuery, branchParams);

    const [backlogsPass] = await db.execute(
      `SELECT COUNT(*) as count FROM applications a 
       JOIN student_profiles sp ON a.student_id = sp.user_id 
       WHERE a.job_id = ? AND a.status = 'applied' AND sp.backlogs <= ?`,
      [jobId, maxBacklogs]
    );

    const [yearGapPass] = await db.execute(
      `SELECT COUNT(*) as count FROM applications a 
       JOIN student_profiles sp ON a.student_id = sp.user_id 
       WHERE a.job_id = ? AND a.status = 'applied' AND sp.year_gap <= ?`,
      [jobId, maxYearGap]
    );

    const [experiencePass] = await db.execute(
      `SELECT COUNT(*) as count FROM applications a 
       JOIN student_profiles sp ON a.student_id = sp.user_id 
       WHERE a.job_id = ? AND a.status = 'applied' AND sp.experience_years >= ?`,
      [jobId, minExperience]
    );

    let resumeQuery = `
      SELECT COUNT(*) as count FROM applications a 
      JOIN student_profiles sp ON a.student_id = sp.user_id 
      WHERE a.job_id = ? AND a.status = 'applied'
    `;
    let resumeParams = [jobId];
    if (resumeRequired) {
      resumeQuery += ` AND sp.resume_url IS NOT NULL AND sp.resume_url != ''`;
    }
    const [resumePass] = await db.execute(resumeQuery, resumeParams);

    // ✅ Count eligible based on mode
    let allQuery = `
      SELECT COUNT(*) as count FROM applications a 
      JOIN student_profiles sp ON a.student_id = sp.user_id 
      WHERE a.job_id = ? AND a.status = 'applied'
    `;
    let allParams = [jobId];

    let allConditions = [];
    let allConditionParams = [];

    allConditions.push(`sp.current_cgpa >= ?`);
    allConditionParams.push(minCGPA);

    if (branches && branches.length > 0) {
      const placeholders = branches.map(() => '?').join(',');
      allConditions.push(`sp.branch IN (${placeholders})`);
      allConditionParams.push(...branches);
    }

    allConditions.push(`sp.backlogs <= ?`);
    allConditionParams.push(maxBacklogs);

    allConditions.push(`sp.year_gap <= ?`);
    allConditionParams.push(maxYearGap);

    allConditions.push(`sp.experience_years >= ?`);
    allConditionParams.push(minExperience);

    if (resumeRequired) {
      allConditions.push(`sp.resume_url IS NOT NULL AND sp.resume_url != ''`);
    }

    if (matchMode === 'any') {
      allQuery += ` AND (${allConditions.join(' OR ')})`;
      allParams = [...allParams, ...allConditionParams];
    } else {
      allQuery += ` AND ${allConditions.join(' AND ')}`;
      allParams = [...allParams, ...allConditionParams];
    }

    const [allCriteriaPass] = await db.execute(allQuery, allParams);

    res.json({
      success: true,
      total_applied: totalApplied[0]?.count || 0,
      cgpaPass: cgpaPass[0]?.count || 0,
      branchPass: branchPass[0]?.count || 0,
      backlogsPass: backlogsPass[0]?.count || 0,
      yearGapPass: yearGapPass[0]?.count || 0,
      experiencePass: experiencePass[0]?.count || 0,
      resumePass: resumePass[0]?.count || 0,
      eligible: allCriteriaPass[0]?.count || 0,
      mode: matchMode
    });

  } catch (error) {
    console.error('❌ Error getting preview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

// ==================== AUTO-SHORTLIST (FLEXIBLE) ====================
const autoShortlist = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      minCGPA = 7.0,
      branches = [],
      maxBacklogs = 0,
      maxYearGap = 0,
      minExperience = 0,
      requiredSkills = [],
      resumeRequired = false,
      matchMode = 'all' // ✅ 'all' OR 'any'
    } = req.body;

    console.log('🚀 Auto-shortlisting for job:', jobId);
    console.log('📊 Match Mode:', matchMode);

    // ✅ Check if job exists
    const [jobCheck] = await db.execute(
      'SELECT id, skills FROM jobs WHERE id = ?',
      [jobId]
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const jobSkills = jobCheck[0]?.skills 
      ? jobCheck[0].skills.split(',').map(s => s.trim()).filter(Boolean)
      : requiredSkills;

    // ✅ Build base query
    let query = `
      SELECT 
        a.id as application_id,
        a.student_id,
        sp.current_cgpa,
        sp.branch,
        sp.backlogs,
        sp.year_gap,
        sp.experience_years,
        sp.skills,
        sp.resume_url,
        u.name as student_name,
        u.email as student_email
      FROM applications a
      JOIN student_profiles sp ON a.student_id = sp.user_id
      JOIN users u ON a.student_id = u.id
      WHERE a.job_id = ? 
        AND a.status = 'applied'
    `;

    let params = [jobId];

    // ✅ Build conditions based on mode
    let conditions = [];
    let conditionParams = [];

    // Condition 1: CGPA
    conditions.push(`sp.current_cgpa >= ?`);
    conditionParams.push(minCGPA);

    // Condition 2: Branch
    if (branches && branches.length > 0) {
      const placeholders = branches.map(() => '?').join(',');
      conditions.push(`sp.branch IN (${placeholders})`);
      conditionParams.push(...branches);
    }

    // Condition 3: Backlogs
    conditions.push(`sp.backlogs <= ?`);
    conditionParams.push(maxBacklogs);

    // Condition 4: Year Gap
    conditions.push(`sp.year_gap <= ?`);
    conditionParams.push(maxYearGap);

    // Condition 5: Experience
    conditions.push(`sp.experience_years >= ?`);
    conditionParams.push(minExperience);

    // Condition 6: Resume
    if (resumeRequired) {
      conditions.push(`sp.resume_url IS NOT NULL AND sp.resume_url != ''`);
    }

    // ✅ Apply conditions based on mode
    if (matchMode === 'any') {
      // ✅ ANY condition (OR)
      query += ` AND (${conditions.join(' OR ')})`;
      params = [...params, ...conditionParams];
    } else {
      // ✅ ALL conditions (AND) - Default
      query += ` AND ${conditions.join(' AND ')}`;
      params = [...params, ...conditionParams];
    }

    console.log('🔍 Executing query...');
    console.log('📊 Query:', query);
    console.log('📊 Params:', params);
    
    const [eligibleStudents] = await db.execute(query, params);

    console.log(`📊 Found ${eligibleStudents.length} potential candidates`);

    let shortlistedCount = 0;
    let shortlistedIds = [];
    let skippedStudents = [];

    for (const student of eligibleStudents) {
      // ✅ Skills match check
      let skillMatchPercent = 100;
      let matchedSkills = [];

      if (jobSkills.length > 0 && student.skills) {
        const studentSkillArray = student.skills.split(',').map(s => s.trim().toLowerCase());
        
        jobSkills.forEach(skill => {
          const skillTrim = skill.trim().toLowerCase();
          const found = studentSkillArray.some(ss => ss.includes(skillTrim));
          if (found) {
            matchedSkills.push(skillTrim);
          }
        });

        skillMatchPercent = (matchedSkills.length / jobSkills.length) * 100;
        
        // ✅ Minimum 40% skills match
        if (skillMatchPercent < 40) {
          skippedStudents.push({
            name: student.student_name,
            reason: `Skills match ${Math.round(skillMatchPercent)}% < 40%`
          });
          continue;
        }
      }

      console.log(`✅ Student ${student.student_name} eligible - Skills match: ${Math.round(skillMatchPercent)}%`);

      // ✅ Update application to shortlisted
      await db.execute(
        `UPDATE applications SET 
          status = 'shortlisted',
          updated_at = NOW()
        WHERE id = ?`,
        [student.application_id]
      );

      shortlistedCount++;
      shortlistedIds.push(student.application_id);

      // ✅ Send notification to student
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, created_at, is_read) 
         VALUES (?, ?, ?, ?, NOW(), 0)`,
        [
          student.student_id,
          '🎉 Congratulations! You have been Shortlisted!',
          `You have been shortlisted for the position. Please check your dashboard for further updates.`,
          'shortlist'
        ]
      );
    }

    console.log(`✅ ${shortlistedCount} students shortlisted successfully`);

    res.json({
      success: true,
      total_eligible: eligibleStudents.length,
      shortlisted: shortlistedCount,
      shortlisted_ids: shortlistedIds,
      skipped: skippedStudents,
      mode: matchMode,
      message: `${shortlistedCount} students shortlisted successfully!`
    });

  } catch (error) {
    console.error('❌ Error auto-shortlisting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

// backend/controllers/companyController.js

// ==================== GET ALL STUDENTS FOR COMPANY (FIXED) ====================
const getStudents = async (req, res) => {
  try {
    console.log('📋 Fetching all students for company...');
    console.log('📋 User ID:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // ✅ Use existing column names only
    const [students] = await db.execute(
      `SELECT 
        u.id, 
        u.name, 
        u.email,
        u.created_at as user_created_at,
        sp.current_cgpa, 
        sp.branch, 
        sp.skills, 
        sp.phone,
        sp.reg_no, 
        sp.program, 
        sp.semester,
        sp.address,
        sp.projects,
        sp.certifications,
        sp.achievements,
        sp.experience,
        sp.experience_years,
        sp.resume_url,
        sp.profile_pic,
        sp.backlogs,
        sp.year_gap,
        sp.linkedin,
        sp.github,
        sp.portfolio,
        sp.bio,
        sp.languages,
        sp.session,
        sp.location  -- ✅ Now exists
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.role = 'student'
       ORDER BY sp.current_cgpa DESC`
    );
    
    console.log('📊 Students found:', students.length);
    
    if (!students || students.length === 0) {
      return res.json({
        success: true,
        students: []
      });
    }
    
    // ✅ Format the data
    const formattedStudents = students.map(student => {
      // ✅ Safe split function
      const safeSplit = (str) => {
        if (!str) return [];
        if (Array.isArray(str)) return str;
        if (typeof str === 'string') {
          return str.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
      };
      
      // ✅ Build full resume URL
      let resumeUrl = null;
      if (student.resume_url) {
        if (student.resume_url.startsWith('http://') || student.resume_url.startsWith('https://')) {
          resumeUrl = student.resume_url;
        } else if (student.resume_url.startsWith('/uploads/')) {
          resumeUrl = `${req.protocol}://${req.get('host')}${student.resume_url}`;
        } else if (student.resume_url.startsWith('uploads/')) {
          resumeUrl = `${req.protocol}://${req.get('host')}/${student.resume_url}`;
        } else {
          resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${student.resume_url}`;
        }
      }
      
      // ✅ Build full profile pic URL
      let profilePic = null;
      if (student.profile_pic) {
        if (student.profile_pic.startsWith('http://') || student.profile_pic.startsWith('https://')) {
          profilePic = student.profile_pic;
        } else if (student.profile_pic.startsWith('/uploads/')) {
          profilePic = `${req.protocol}://${req.get('host')}${student.profile_pic}`;
        } else if (student.profile_pic.startsWith('uploads/')) {
          profilePic = `${req.protocol}://${req.get('host')}/${student.profile_pic}`;
        } else {
          profilePic = `${req.protocol}://${req.get('host')}/uploads/profile-pics/${student.profile_pic}`;
        }
      }
      
      return {
        id: student.id,
        name: student.name || 'Unknown',
        email: student.email || '',
        current_cgpa: parseFloat(student.current_cgpa) || 0,
        branch: student.branch || 'N/A',
        skills: safeSplit(student.skills),
        phone: student.phone || 'N/A',
        reg_no: student.reg_no || 'N/A',
        program: student.program || 'B.Tech',
        semester: student.semester || 8,
        location: student.location || student.address || 'Not specified',
        projects: safeSplit(student.projects),
        certifications: safeSplit(student.certifications),
        achievements: safeSplit(student.achievements),
        languages: safeSplit(student.languages),
        experience: student.experience || (student.experience_years ? `${student.experience_years} years` : 'Fresher'),
        experience_years: parseFloat(student.experience_years) || 0,
        resume_url: resumeUrl,
        profile_pic: profilePic,
        backlogs: parseInt(student.backlogs) || 0,
        year_gap: parseInt(student.year_gap) || 0,
        linkedin: student.linkedin || '',
        github: student.github || '',
        portfolio: student.portfolio || '',
        bio: student.bio || '',
        session: student.session || ''
      };
    });
    
    console.log('✅ Formatted students count:', formattedStudents.length);
    
    res.json({
      success: true,
      students: formattedStudents
    });
    
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      details: error.sqlMessage || 'No SQL details'
    });
  }
};

// backend/controllers/companyController.js

// ==================== SHORTLIST STUDENT FROM ELIGIBLE (COMPLETE FIXED) ====================
const shortlistStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    
    console.log('📝 Shortlisting student:', studentId, 'by company:', userId);
    
    // ✅ Check if studentId is valid
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }
    
    // ✅ Get company details
    const [company] = await db.execute(
      `SELECT id, company_name FROM companies WHERE user_id = ?`,
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    const companyName = company[0].company_name || 'a company';
    
    // ✅ Check if student exists
    const [student] = await db.execute(
      'SELECT id, name, email FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // ✅ Check if shortlisted_students table exists
    try {
      const [tableCheck] = await db.execute('SHOW TABLES LIKE "shortlisted_students"');
      if (tableCheck.length === 0) {
        // ✅ Create table if not exists
        await db.execute(`
          CREATE TABLE IF NOT EXISTS shortlisted_students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            company_id INT NOT NULL,
            status VARCHAR(50) DEFAULT 'shortlisted',
            shortlisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            UNIQUE KEY unique_shortlist (student_id, company_id)
          )
        `);
        console.log('✅ shortlisted_students table created');
      }
    } catch (tableError) {
      console.log('⚠️ Table check error:', tableError.message);
    }
    
    // ✅ Check if already shortlisted
    const [existing] = await db.execute(
      `SELECT id FROM shortlisted_students 
       WHERE student_id = ? AND company_id = ?`,
      [studentId, companyId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student already shortlisted'
      });
    }
    
    // ✅ Add to shortlisted_students table
    await db.execute(
      `INSERT INTO shortlisted_students 
        (student_id, company_id, status, shortlisted_at) 
       VALUES (?, ?, 'shortlisted', NOW())`,
      [studentId, companyId]
    );
    
    console.log('✅ Student shortlisted successfully');
    
    // ✅ Send notification to student
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, created_at, is_read) 
       VALUES (?, ?, ?, ?, NOW(), 0)`,
      [
        studentId,
        '🎉 You have been Shortlisted!',
        `You have been shortlisted by ${companyName}. Please check your dashboard for further updates.`,
        'shortlist'
      ]
    );
    
    // ✅ Also update applications table if student has applied
    try {
      const [application] = await db.execute(
        `SELECT a.id FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.student_id = ? AND j.company_id = ?
         AND a.status = 'pending'
         LIMIT 1`,
        [studentId, companyId]
      );
      
      if (application.length > 0) {
        await db.execute(
          `UPDATE applications SET status = 'shortlisted', updated_at = NOW()
           WHERE id = ?`,
          [application[0].id]
        );
        console.log('✅ Application status updated to shortlisted');
      }
    } catch (appError) {
      console.log('⚠️ Application update skipped:', appError.message);
    }
    
    res.json({
      success: true,
      message: 'Student shortlisted successfully',
      student: student[0]
    });
    
  } catch (error) {
    console.error('❌ Error shortlisting student:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== GET SHORTLISTED STUDENTS (FIXED) ====================
const getShortlistedStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // ✅ Get company ID
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    // ✅ Get shortlisted from BOTH tables
    const [shortlisted] = await db.execute(
      `SELECT 
        ss.id as shortlist_id,
        ss.student_id,
        ss.company_id,
        ss.status,
        ss.shortlisted_at,
        u.id as student_user_id,
        u.name as student_name,
        u.email as student_email,
        sp.phone as student_phone,
        sp.branch as student_branch,
        sp.current_cgpa as student_cgpa,
        sp.skills as student_skills,
        sp.reg_no as student_reg_no,
        sp.resume_url,
        sp.profile_pic,
        j.id as job_id,
        j.title as job_title,
        j.job_type
       FROM shortlisted_students ss
       JOIN users u ON ss.student_id = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN applications a ON a.student_id = u.id AND a.company_id = ss.company_id
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE ss.company_id = ?
       GROUP BY ss.id
       ORDER BY ss.shortlisted_at DESC`,
      [companyId]
    );
    
    console.log('📊 Shortlisted students from both tables:', shortlisted.length);
    
    // ✅ Build full URLs
    const protocol = req.protocol;
    const host = req.get('host');
    
    const formattedShortlisted = shortlisted.map(student => {
      let profilePic = null;
      if (student.profile_pic) {
        if (student.profile_pic.startsWith('http://') || student.profile_pic.startsWith('https://')) {
          profilePic = student.profile_pic;
        } else if (student.profile_pic.startsWith('/uploads/')) {
          profilePic = `${protocol}://${host}${student.profile_pic}`;
        } else {
          profilePic = `${protocol}://${host}/uploads/profile-pics/${student.profile_pic}`;
        }
      }
      
      let resumeUrl = null;
      if (student.resume_url) {
        if (student.resume_url.startsWith('http://') || student.resume_url.startsWith('https://')) {
          resumeUrl = student.resume_url;
        } else if (student.resume_url.startsWith('/uploads/')) {
          resumeUrl = `${protocol}://${host}${student.resume_url}`;
        } else if (student.resume_url.startsWith('uploads/')) {
          resumeUrl = `${protocol}://${host}/${student.resume_url}`;
        } else {
          resumeUrl = `${protocol}://${host}/uploads/resumes/${student.resume_url}`;
        }
      }
      
      return {
        id: student.student_id,
        student_id: student.student_id,
        name: student.student_name || 'Unknown',
        email: student.student_email || '',
        phone: student.student_phone || 'N/A',
        branch: student.student_branch || 'N/A',
        cgpa: parseFloat(student.student_cgpa) || 0,
        skills: student.student_skills ? 
          (typeof student.student_skills === 'string' ? 
            student.student_skills.split(',').map(s => s.trim()) : 
            student.student_skills) : 
          [],
        appliedFor: student.job_title || 'Shortlisted',
        job_type: student.job_type || 'Full-time',
        shortlistedDate: student.shortlisted_at ? 
          new Date(student.shortlisted_at).toLocaleDateString() : 
          'N/A',
        status: student.status || 'shortlisted',
        resumeUrl: resumeUrl || '#',
        profilePic: profilePic,
        reg_no: student.student_reg_no || 'N/A',
        shortlist_id: student.shortlist_id
      };
    });
    
    res.json({
      success: true,
      applications: formattedShortlisted  // ✅ Keep same key for frontend compatibility
    });
    
  } catch (error) {
    console.error('❌ Error fetching shortlisted students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};


// ==================== GET NOTIFICATIONS ====================
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.execute(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.user.id]
    );
    
    console.log('📊 Notifications from DB:', notifications.length);
    console.log('📊 First notification is_read:', notifications[0]?.is_read);
    
    res.json({ 
      success: true, 
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title || 'Notification',
        message: n.message,
        created_at: n.created_at,
        read: n.is_read === 1,
        type: n.type || 'info'
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fetching company notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UPDATE PROFILE ====================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyName, hrName, phone, website, industry, location, employeeCount, description } = req.body;
    
    console.log('📝 Updating company profile for user:', userId);
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // ✅ Update companies table - has updated_at
    await db.execute(
      `UPDATE companies SET 
        company_name = ?,
        description = ?,
        industry = ?,
        address = ?,
        website = ?,
        updated_at = NOW()
      WHERE user_id = ?`,
      [
        companyName || null,
        description || null,
        industry || null,
        location || null,
        website || null,
        userId
      ]
    );
    
    const [profile] = await db.execute(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profile.length === 0) {
      // ✅ Insert - NO timestamps
      await db.execute(
        `INSERT INTO company_profiles 
          (user_id, hr_name, phone, location, employee_count) 
        VALUES (?, ?, ?, ?, ?)`,
        [userId, hrName || null, phone || null, location || null, employeeCount || null]
      );
    } else {
      // ✅ Update - NO timestamps
      await db.execute(
        `UPDATE company_profiles SET 
          hr_name = ?,
          phone = ?,
          location = ?,
          employee_count = ?
        WHERE user_id = ?`,
        [hrName || null, phone || null, location || null, employeeCount || null, userId]
      );
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== MARK NOTIFICATION AS READ ====================
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`📝 Marking notification ${id} as read for user ${userId}`);
    
    const [notification] = await db.execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const [result] = await db.execute(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    console.log(`✅ Notification ${id} marked as read. Affected rows: ${result.affectedRows}`);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('❌ Error marking notification read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== DELETE NOTIFICATION ====================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`🗑️ Deleting notification ${id} for user ${userId}`);
    
    const [notification] = await db.execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const [result] = await db.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    console.log(`✅ Notification ${id} deleted. Affected rows: ${result.affectedRows}`);
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// backend/controllers/companyController.js

// ==================== GET SHORTLISTED STUDENT IDs ====================
const getShortlistedIds = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    const [shortlisted] = await db.execute(
      `SELECT student_id FROM shortlisted_students 
       WHERE company_id = ?`,
      [companyId]
    );
    
    const ids = shortlisted.map(s => s.student_id);
    console.log('📊 Shortlisted IDs:', ids);
    
    res.json({
      success: true,
      shortlistedIds: ids
    });
    
  } catch (error) {
    console.error('❌ Error fetching shortlisted IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== REMOVE FROM SHORTLIST ====================
const removeShortlist = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    
    const [company] = await db.execute(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyId = company[0].id;
    
    // ✅ Remove from shortlisted_students
    await db.execute(
      'DELETE FROM shortlisted_students WHERE student_id = ? AND company_id = ?',
      [studentId, companyId]
    );
    
    // ✅ Update application status if exists
    await db.execute(
      `UPDATE applications SET status = 'pending' 
       WHERE student_id = ? AND company_id = ? AND status = 'shortlisted'`,
      [studentId, companyId]
    );
    
    res.json({
      success: true,
      message: 'Removed from shortlist'
    });
    
  } catch (error) {
    console.error('❌ Error removing shortlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== DELETE ALL NOTIFICATIONS ====================
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`🗑️ Deleting all notifications for user ${userId}`);
    
    const [result] = await db.execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
    
    console.log(`✅ All notifications deleted. Affected rows: ${result.affectedRows}`);
    
    res.json({
      success: true,
      message: 'All notifications cleared successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== UPLOAD LOGO ====================
const uploadLogo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📤 Uploading logo for user:', userId);
    console.log('📁 req.files:', req.files);
    
    if (!req.files || !req.files.logo) {
      console.log('❌ No logo file found in request');
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
    }
    
    const logo = req.files.logo;
    console.log('📁 File received:', logo.name, logo.size, logo.mimetype);
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(logo.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload JPEG, PNG, GIF, WEBP or SVG'
      });
    }
    
    if (logo.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed'
      });
    }
    
    const uploadDir = path.join(__dirname, '../uploads/company-logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created directory:', uploadDir);
    }
    
    const ext = path.extname(logo.name);
    const filename = `company_logo_${userId}_${Date.now()}${ext}`;
    const uploadPath = path.join(uploadDir, filename);
    
    console.log('📁 Saving to:', uploadPath);
    
    await logo.mv(uploadPath);
    console.log('✅ File saved successfully');
    
    const logoUrl = `uploads/company-logos/${filename}`;
    
    // ✅ Check if company_profiles exists
    const [profile] = await db.execute(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profile.length === 0) {
      // ✅ Insert new profile - NO timestamps
      await db.execute(
        `INSERT INTO company_profiles (user_id, logo) 
         VALUES (?, ?)`,
        [userId, logoUrl]
      );
      console.log('✅ Company profile created with logo');
    } else {
      // ✅ Update existing profile - NO timestamps
      await db.execute(
        'UPDATE company_profiles SET logo = ? WHERE user_id = ?',
        [logoUrl, userId]
      );
      console.log('✅ Company profile updated with logo');
    }
    
    const fullUrl = `${req.protocol}://${req.get('host')}/${logoUrl}`;
    console.log('✅ Full URL:', fullUrl);
    
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: logoUrl,
      fullUrl: fullUrl
    });
    
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ==================== FINAL EXPORTS ====================
module.exports = {
  getProfile,
  getDashboardStats,
  createJob,
  updateJobStatus,
  updateJob,
  deleteJob,
  getJobs,
  getApplications,
  updateApplicationStatus,
  scheduleInterview,
  getInterviews,
  updateInterviewStatus,
  getStudents,
  getNotifications,
  markNotificationRead,
  updateProfile,
  deleteNotification,
  deleteAllNotifications,
  getShortlistPreview,   // 👈 Add this
  autoShortlist,
  shortlistStudent,
  getShortlistedStudents,      // 👈 Add this
  getShortlistedIds,
  removeShortlist,
  uploadLogo
};