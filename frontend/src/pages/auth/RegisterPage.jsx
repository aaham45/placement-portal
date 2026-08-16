import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, Phone, MapPin, Calendar, BookOpen, AlertCircle, Layers } from 'lucide-react'
import { studentRegister } from '../services/api'
import toast from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'

function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    regNo: '',
    email: '',
    phone: '',
    program: '',
    branch: '',
    session: '',
    semester: '',
    currentCgpa: '',
    password: '',
    confirmPassword: ''
  })

  // ✅ Google se login hai toh email auto-fill
  useEffect(() => {
    const token = localStorage.getItem('studentToken')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.email) {
          setFormData(prev => ({ ...prev, email: decoded.email }))
        }
        if (decoded.name) {
          setFormData(prev => ({ ...prev, fullName: decoded.name }))
        }
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.regNo || !formData.email || !formData.password) {
      toast.error('Please fill all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    const allowedDomains = ['@centurionuniv.edu.in', '@cutm.ac.in']
    const isValidEmail = allowedDomains.some(domain => formData.email.toLowerCase().endsWith(domain))
    
    if (!isValidEmail) {
      toast.error('Please use college email (@centurionuniv.edu.in or @cutm.ac.in)')
      return
    }

    if (formData.currentCgpa && (formData.currentCgpa < 0 || formData.currentCgpa > 10)) {
      toast.error('CGPA must be between 0 and 10')
      return
    }

    setLoading(true)
    
    try {
      const response = await studentRegister({
        fullName: formData.fullName,
        regNo: formData.regNo,
        email: formData.email,
        phone: formData.phone,
        program: formData.program,
        branch: formData.branch,
        session: formData.session,
        semester: formData.semester,
        currentCgpa: formData.currentCgpa,
        password: formData.password
      })
      
      toast.success(response.data.message || 'Registration Successful! 🎉')
      navigate('/login?role=student')
    } catch (error) {
      console.error(error)
      // ✅ Agar email already registered hai toh login pe redirect
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Email already registered')) {
        toast.error('This email is already registered. Please login instead.')
        setTimeout(() => {
          navigate('/login?role=student')
        }, 2000)
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const programs = [
    'BTech (Bachelor of Technology)',
    'Diploma (Polytechnic)',
    'MTech (Master of Technology)',
    'MBA (Master of Business Administration)',
    'BCA (Bachelor of Computer Applications)',
    'MCA (Master of Computer Applications)',
    'BSc (Bachelor of Science)',
    'MSc (Master of Science)'
  ]

  const branches = [
    'Computer Science Engineering (CSE)',
    'Information Technology (IT)',
    'Electronics & Communication (ECE)',
    'Electrical Engineering (EE)',
    'Mechanical Engineering (ME)',
    'Civil Engineering (CE)',
    'Computer Application (MCA/BCA)',
    'Business Administration (MBA)'
  ]

  const sessions = [
    '2021-2025',
    '2022-2026',
    '2023-2027',
    '2024-2028',
    '2025-2029'
  ]

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

  const styles = {
    container: {
      minHeight: '100vh',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      maxWidth: '680px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden',
      maxHeight: '92vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      padding: '22px 20px',
      textAlign: 'center',
      flexShrink: 0
    },
    logo: {
      width: '52px',
      height: '52px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 8px',
      fontSize: '26px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '2px'
    },
    subtitle: {
      fontSize: '12px',
      color: '#bfdbfe'
    },
    formContainer: {
      padding: '12px 20px 8px 20px',
      flex: 1,
      overflow: 'hidden'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '6px'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    inputGroup: {
      marginBottom: '10px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px'
    },
    required: {
      color: '#ef4444',
      marginLeft: '2px'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '8px 14px',
      paddingLeft: '36px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '13px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      backgroundColor: '#fafafa'
    },
    select: {
      width: '100%',
      padding: '8px 14px',
      paddingLeft: '36px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '13px',
      outline: 'none',
      backgroundColor: '#fafafa',
      cursor: 'pointer',
      appearance: 'none'
    },
    passwordWrapper: {
      position: 'relative'
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: 0
    },
    registerBtn: {
      width: '100%',
      padding: '11px',
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    loginLink: {
      textAlign: 'center',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid #e2e8f0',
      fontSize: '13px',
      color: '#64748b',
      flexShrink: 0
    },
    footer: {
      textAlign: 'center',
      marginTop: '2px',
      fontSize: '10px',
      color: '#94a3b8',
      flexShrink: 0
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '14px',
      height: '14px',
      border: '2px solid white',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite'
    },
    hint: {
      fontSize: '10px',
      color: '#94a3b8',
      marginTop: '2px'
    },
    infoBox: {
      backgroundColor: '#eff6ff',
      padding: '10px 14px',
      borderRadius: '8px',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    infoText: {
      fontSize: '11px',
      color: '#1e40af',
      margin: 0
    },
    iconStyle: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8'
    }
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
          background-color: white;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
      `}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🎓</div>
          <h1 style={styles.title}>Student Registration</h1>
          <p style={styles.subtitle}>Create your account to start placement journey</p>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.infoBox}>
            <AlertCircle size={15} color="#2563eb" />
            <p style={styles.infoText}>
              Use your college email ID (@centurionuniv.edu.in or @cutm.ac.in) for registration
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={{...styles.inputGroup, ...styles.fullWidth}}>
                <label style={styles.label}>
                  Full Name <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <User size={15} style={styles.iconStyle} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Registration Number <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <GraduationCap size={15} style={styles.iconStyle} />
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleChange}
                    placeholder="CUTM/2024/XXX"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  College Email <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <Mail size={15} style={styles.iconStyle} />
                  <input
                    type="email"
                    autoComplete="off"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.name@cutm.ac.in"
                    style={styles.input}
                    required
                  />
                </div>
                <p style={styles.hint}>Only @centurionuniv.edu.in or @cutm.ac.in allowed</p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <div style={styles.inputWrapper}>
                  <Phone size={15} style={styles.iconStyle} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXXXXXXX"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Program <span style={styles.required}>*</span></label>
                <div style={styles.inputWrapper}>
                  <Layers size={15} style={styles.iconStyle} />
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Branch</label>
                <div style={styles.inputWrapper}>
                  <BookOpen size={15} style={styles.iconStyle} />
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Session</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={15} style={styles.iconStyle} />
                  <select
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Session</option>
                    {sessions.map(session => (
                      <option key={session} value={session}>{session}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Semester</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={15} style={styles.iconStyle} />
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem} Semester</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Current CGPA</label>
                <div style={styles.inputWrapper}>
                  <GraduationCap size={15} style={styles.iconStyle} />
                  <input
                    type="number"
                    name="currentCgpa"
                    value={formData.currentCgpa}
                    onChange={handleChange}
                    placeholder="8.5"
                    step="0.01"
                    min="0"
                    max="10"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Password <span style={styles.required}>*</span>
                </label>
                <div style={styles.passwordWrapper}>
                  <Lock size={15} style={styles.iconStyle} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    style={{...styles.input, paddingRight: '36px'}}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Confirm Password <span style={styles.required}>*</span>
                </label>
                <div style={styles.passwordWrapper}>
                  <Lock size={15} style={styles.iconStyle} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    style={{...styles.input, paddingRight: '36px'}}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.registerBtn}
            >
              {loading ? (
                <>
                  <span style={styles.loadingSpinner}></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <GraduationCap size={15} />
                  Register Student
                </>
              )}
            </button>
          </form>

          <div style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login?role=student" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              Login here
            </Link>
          </div>

          <div style={styles.footer}>
            <p>© 2024 CUTM Placement Management Portal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage