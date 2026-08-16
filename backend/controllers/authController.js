const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Import email service
const { sendOTPEmail } = require('../services/emailService');

// ✅ Student Register (Hash karna band)
const studentRegister = async (req, res) => {
    console.log('📥 Received Student Data:', req.body);
    try {
        const { fullName, regNo, email, phone, program, branch, session, semester, currentCgpa, password } = req.body;

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: '❌ This email is already registered. Please login instead.' });
        }

        // ✅ Plain password store karo
        const [userResult] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [fullName, email, password, 'student']);
        const userId = userResult.insertId;

        const cleanCgpa = parseFloat(currentCgpa) || 0.0;
        const cleanProgram = String(program || '').trim();
        const cleanBranch = String(branch || '').trim();

        await db.execute(`INSERT INTO student_profiles (user_id, reg_no, phone, program, branch, session, semester, current_cgpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, regNo, phone, cleanProgram, cleanBranch, session, semester, cleanCgpa]);

        res.status(201).json({ success: true, message: '🎉 Registration Successful! Please login to continue.' });
    } catch (error) {
        console.error('❌ Critical Error in studentRegister:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// ✅ Student Login - PLAIN PASSWORD COMPARE
const studentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('=================================');
        console.log('📝 STUDENT LOGIN');
        console.log('📝 Email:', email);
        console.log('=================================');

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'student']);
        if (rows.length === 0) {
            console.log('❌ Student not found');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0];
        console.log('✅ Student found:', user.email);

        // ✅ DIRECT PLAIN PASSWORD COMPARE
        const isMatch = (password === user.password);
        console.log('📝 Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch!');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ Login successful!');

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('❌ Error in studentLogin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ Company Register
const companyRegister = async (req, res) => {
    console.log('📥 Received Company Data:', req.body);
    try {
        const { companyName, hrName, email, phone, website, industry, location, employeeCount, password } = req.body;

        const cleanCompanyName = String(companyName || '').trim();
        const cleanHrName = String(hrName || '').trim();
        const cleanEmail = String(email || '').trim().toLowerCase();

        if (!cleanCompanyName || !cleanHrName || !cleanEmail || !password) {
            return res.status(400).json({ success: false, message: '❌ Please fill all required fields.' });
        }

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [cleanEmail]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: '❌ This email is already registered. Please login instead.' });
        }

        // ✅ Plain password store karo
        const [userResult] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [cleanCompanyName, cleanEmail, password, 'company']);
        const userId = userResult.insertId;

        await db.execute(`INSERT INTO company_profiles (user_id, hr_name, phone, website, industry, location, employee_count) VALUES (?, ?, ?, ?, ?, ?, ?)`, [userId, cleanHrName, phone, website, industry, location, employeeCount]);

        res.status(201).json({ success: true, message: '🏢 Company registered successfully! Please login.' });
    } catch (error) {
        console.error('❌ Error in companyRegister:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// ✅ Company Login - PLAIN PASSWORD COMPARE
const companyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('=================================');
        console.log('📝 COMPANY LOGIN');
        console.log('📝 Email:', email);
        console.log('=================================');

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'company']);
        if (rows.length === 0) {
            console.log('❌ Company not found');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0];
        console.log('✅ Company found:', user.email);

        // ✅ DIRECT PLAIN PASSWORD COMPARE
        const isMatch = (password === user.password);
        console.log('📝 Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch!');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ Login successful!');

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('❌ Error in companyLogin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ Admin Login - PLAIN PASSWORD COMPARE
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('=================================');
        console.log('📝 ADMIN LOGIN');
        console.log('📝 Email:', email);
        console.log('📝 Password:', password);
        console.log('=================================');

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin']);
        if (rows.length === 0) {
            console.log('❌ Admin not found');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0];
        console.log('✅ Admin found:', user.email);
        console.log('📝 Stored password:', user.password);

        // ✅ DIRECT PLAIN PASSWORD COMPARE
        const isMatch = (password === user.password);
        console.log('📝 Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch!');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ Login successful!');

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('❌ Error in adminLogin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// backend/controllers/authController.js
// ✅ Google Login - Fixed

const googleLogin = async (req, res) => {
    try {
        const { email, name, role } = req.body;
        
        console.log('📝 Google Login Request:', { email, name, role });
        
        // ✅ Pehle user exist karta hai ya nahi check karo
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;
        
        if (rows.length === 0) {
            // ✅ User exists nahi karta - Auto Register
            console.log('📝 New user, registering...');
            
            const randomPassword = Math.random().toString(36).slice(-8);
            
            // ✅ User create karo
            const [userResult] = await db.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name || email.split('@')[0], email, randomPassword, role || 'student']
            );
            const userId = userResult.insertId;
            
            // ✅ Student profile create karo (agar student hai)
            if (role === 'student' || !role) {
                await db.execute(
                    `INSERT INTO student_profiles (user_id, reg_no, phone, program, branch, session, semester, current_cgpa) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, '', '', '', '', '', '', 0]
                );
                console.log('✅ Student profile created for:', email);
            }
            
            // ✅ User object banao
            user = { 
                id: userId, 
                name: name || email.split('@')[0], 
                email: email, 
                role: role || 'student' 
            };
            
        } else {
            // ✅ User exists - Login kar do
            user = rows[0];
            console.log('✅ Existing user logged in:', email);
        }
        
        // ✅ JWT Token Generate karo
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );
        
        // ✅ Remove password from response
        delete user.password;
        
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
        
    } catch (error) {
        console.error('❌ Error in googleLogin:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during Google login: ' + error.message 
        });
    }
};

// ✅ Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;
        let user, contactInfo;

        if (email) {
            const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) return res.status(404).json({ success: false, message: 'Email not registered' });
            user = rows[0];
            contactInfo = email;
        } else if (phone) {
            const [profileRows] = await db.execute('SELECT user_id FROM student_profiles WHERE phone = ?', [phone]);
            if (profileRows.length === 0) return res.status(404).json({ success: false, message: 'Phone number not registered' });
            const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [profileRows[0].user_id]);
            if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
            user = userRows[0];
            contactInfo = phone;
        } else return res.status(400).json({ success: false, message: 'Please provide email or phone' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await db.execute(`INSERT INTO password_resets (email, phone, otp, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE otp=?, expires_at=?`, [email || null, phone || null, otp, expiresAt, otp, expiresAt]);

        if (email) {
            const emailResult = await sendOTPEmail(email, otp);
            if (!emailResult.success) {
                console.error('Email sending failed:', emailResult.error);
            }
        } else if (phone) {
            console.log(`📧 OTP for phone ${phone}: ${otp}`);
        }

        res.json({ success: true, message: `OTP sent to your ${email ? 'email' : 'phone'}` });
    } catch (error) {
        console.error('❌ Error in forgotPassword:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, phone, otp, newPassword } = req.body;
        const [rows] = await db.execute(`SELECT * FROM password_resets WHERE (email = ? OR phone = ?) AND otp = ? AND expires_at > NOW()`, [email || null, phone || null, otp]);
        if (rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        let updateQuery, params;

        if (email) {
            updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
            params = [newPassword, email];
        } else if (phone) {
            const [profileRows] = await db.execute('SELECT user_id FROM student_profiles WHERE phone = ?', [phone]);
            if (profileRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
            updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
            params = [newPassword, profileRows[0].user_id];
        } else return res.status(400).json({ success: false, message: 'Invalid request' });

        await db.execute(updateQuery, params);
        await db.execute('DELETE FROM password_resets WHERE otp = ?', [otp]);

        res.json({ success: true, message: 'Password reset successful!' });
    } catch (error) {
        console.error('❌ Error in resetPassword:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    studentRegister,
    studentLogin,
    companyRegister,
    companyLogin,
    adminLogin,
    googleLogin,
    forgotPassword,
    resetPassword
};