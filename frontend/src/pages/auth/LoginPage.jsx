import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, Building, Users, ShieldCheck, Home, Info } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { studentLogin, companyLogin, adminLogin } from '../services/api'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  // ✅ State for Info Tooltip
  const [showInfo, setShowInfo] = useState(false)
  
  const [userType, setUserType] = useState(() => {
    const params = new URLSearchParams(location.search)
    const roleParam = params.get('role')
    if (roleParam === 'company') return 'company'
    if (roleParam === 'admin') return 'admin'
    return 'student'
  })

  // ✅ Ref to always hold latest userType WITHOUT changing GoogleLogin prop identity
  const userTypeRef = useRef(userType)
  useEffect(() => {
    userTypeRef.current = userType
  }, [userType])
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    const savedRole = localStorage.getItem('rememberedRole')
    
    if (savedEmail && savedPassword && savedRole === userType) {
      setFormData({ email: savedEmail, password: savedPassword })
      setRememberMe(true)
    }
  }, [userType])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const roleParam = params.get('role')
    if (roleParam === 'company') {
      setUserType('company')
      setFormData({ email: '', password: '' })
    } else if (roleParam === 'admin') {
      setUserType('admin')
      setFormData({ email: '', password: '' })
    } else if (roleParam === 'student') {
      setUserType('student')
      setFormData({ email: '', password: '' })
    }
  }, [location.search])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    
    try {
      let response
      
      if (userType === 'student') {
        response = await studentLogin({ email: formData.email, password: formData.password })
      } else if (userType === 'company') {
        response = await companyLogin({ email: formData.email, password: formData.password })
      } else {
        response = await adminLogin({ email: formData.email, password: formData.password })
      }
      
      const { token, user } = response.data
      
      if (user.role === 'student') localStorage.setItem('studentToken', token)
      else if (user.role === 'company') localStorage.setItem('companyToken', token)
      else if (user.role === 'admin') localStorage.setItem('adminToken', token)
      
      localStorage.setItem('currentUserRole', user.role)
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success(response.data.message)
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
        localStorage.setItem('rememberedPassword', formData.password)
        localStorage.setItem('rememberedRole', user.role)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
        localStorage.removeItem('rememberedRole')
      }
      
      if (user.role === 'student') navigate('/student/dashboard', { replace: true })
      else if (user.role === 'company') navigate('/company/dashboard', { replace: true })
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Google Login Handler — STABLE reference via useCallback (empty deps).
  // Reads current tab from userTypeRef instead of a `role` argument, so this
  // function identity never changes across renders and GoogleLogin does NOT
  // call google.accounts.id.initialize() again on every keystroke/re-render.
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    const role = userTypeRef.current
    setGoogleLoading(true)
    try {
      const idToken = credentialResponse.credential
      const decodedToken = JSON.parse(atob(idToken.split('.')[1]))
      const email = decodedToken.email
      const name = decodedToken.name
      
      if (!email) {
        toast.error('Could not get email from Google')
        setGoogleLoading(false)
        return
      }

      // 🛑 STUDENT DOMAIN CHECK
      if (role === 'student') {
        const allowedDomains = ['@centurionuniv.edu.in', '@cutm.ac.in']
        const isValid = allowedDomains.some(domain => email.toLowerCase().endsWith(domain))
        if (!isValid) {
          toast.error('Please use your college email')
          setGoogleLoading(false)
          return
        }
      }
      
      const res = await axios.post(`${API_URL}/auth/google`, {
        email: email,
        name: name,
        role: role
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const { token, user } = res.data
      
      if (user.role === 'student') localStorage.setItem('studentToken', token)
      else if (user.role === 'company') localStorage.setItem('companyToken', token)
      else if (user.role === 'admin') localStorage.setItem('adminToken', token)
      
      localStorage.setItem('currentUserRole', user.role)
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success(`Welcome ${user.name || name}! 🎓`)
      
      if (user.role === 'student') navigate('/student/dashboard', { replace: true })
      else if (user.role === 'company') navigate('/company/dashboard', { replace: true })
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      
    } catch (error) {
      console.error('Google login error:', error.response?.data || error.message)
      if (error.response?.data?.message?.includes('Email not registered')) {
        toast.error('This email is not registered. Please use your registered email.')
      } else {
        toast.error(error.response?.data?.message || 'Google login failed')
      }
    } finally {
      setGoogleLoading(false)
    }
  }, [navigate])

  // ✅ Also stable — avoids creating a new inline arrow function every render
  const handleGoogleError = useCallback(() => {
    toast.error('Google login failed. Please try again.')
  }, [])

  const userTypes = [
    { id: 'student', label: 'Student', icon: Users, color: '#2563eb' },
    { id: 'company', label: 'Company', icon: Building, color: '#7c3aed' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: '#059669' }
  ]

  const styles = {
    container: {
      minHeight: '100vh', height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: "'Inter', sans-serif"
    },
    card: { maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' },
    header: {
      background: userType === 'student' ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' :
                   userType === 'company' ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' :
                   'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      padding: '24px 20px', textAlign: 'center'
    },
    logo: { width: '56px', height: '56px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '4px' },
    subtitle: { fontSize: '12px', color: userType === 'student' ? '#bfdbfe' : userType === 'company' ? '#ddd6fe' : '#a7f3d0' },
    formContainer: { padding: '24px' },
    tabsContainer: { display: 'flex', gap: '10px', marginBottom: '24px' },
    tab: (isActive, color) => ({
      flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid',
      borderColor: isActive ? color : '#e2e8f0', backgroundColor: isActive ? color : 'white',
      color: isActive ? 'white' : '#64748b', fontWeight: '600', fontSize: '13px',
      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '6px'
    }),
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', paddingLeft: '38px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' },
    passwordWrapper: { position: 'relative' },
    eyeButton: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    optionsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    checkbox: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer' },
    forgotLink: { fontSize: '12px', color: userType === 'student' ? '#2563eb' : userType === 'company' ? '#7c3aed' : '#059669', textDecoration: 'none' },
    signinBtn: {
      width: '100%', padding: '11px',
      background: userType === 'student' ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' :
                   userType === 'company' ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' :
                   'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px', display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: '8px'
    },
    divider: { display: 'flex', alignItems: 'center', textAlign: 'center', margin: '16px 0', color: '#94a3b8', fontSize: '11px' },
    registerLink: { textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' },
    backHomeWrapper: { textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' },
    backHomeBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontSize: '12px', padding: '6px 16px', borderRadius: '20px', transition: 'all 0.2s', background: '#f8fafc', border: '1px solid #e2e8f0' },
    loadingSpinner: { display: 'inline-block', width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }
  }

  // ✅ ROLE-SPECIFIC TOOLTIP MESSAGES (Hover ke liye)
  const getInfoMessage = () => {
    if (userType === 'student') {
      return 'Use your college email';
    }
    return 'Use your registered email';
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input:focus { border-color: ${userType === 'student' ? '#2563eb' : userType === 'company' ? '#7c3aed' : '#059669'}; box-shadow: 0 0 0 2px rgba(${userType === 'student' ? '37,99,235' : userType === 'company' ? '139,92,246' : '5,150,105'}, 0.1); }
        button:hover { transform: translateY(-1px); }
        .tooltip-icon { cursor: pointer; transition: transform 0.2s; }
        .tooltip-icon:hover { transform: scale(1.1); }
        .tooltip-box {
          position: absolute; bottom: -45px; left: 50%; transform: translateX(-50%);
          background: #1e293b; color: white; padding: 6px 14px; border-radius: 6px;
          font-size: 11px; white-space: nowrap; z-index: 10; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .tooltip-box::after {
          content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
          border-width: 0 6px 6px 6px; border-style: solid; border-color: transparent transparent #1e293b transparent;
        }
      `}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>{userType === 'student' ? '🎓' : userType === 'company' ? '🏢' : '👨‍💼'}</div>
          <h1 style={styles.title}>{userType === 'student' ? 'Student Login' : userType === 'company' ? 'Company Login' : 'Admin Login'}</h1>
          <p style={styles.subtitle}>Access your placement dashboard</p>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.tabsContainer}>
            {userTypes.map((type) => {
              const Icon = type.icon
              const isActive = userType === type.id
              return (
                <button key={type.id} onClick={() => { setUserType(type.id); setFormData({ email: '', password: '' }); const url = new URL(window.location); url.searchParams.set('role', type.id); window.history.pushState({}, '', url) }} style={styles.tab(isActive, type.color)}>
                  <Icon size={14} /> {type.label}
                </button>
              )
            })}
          </div>

          {/* ✅ Google Sign + Info Icon with Tooltip */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              itp_support={true}
              cancel_on_tap_outside={true}
              type="standard"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
            <div 
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <Info 
                size={14}
                color="#64748b" 
                className="tooltip-icon"
              />
              {showInfo && (
                <div className="tooltip-box">
                  {getInfoMessage()}
                </div>
              )}
            </div>
          </div>

          <div style={styles.divider}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <span style={{ padding: '0 10px' }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="email" 
                  autoComplete="off" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter your email id"
                  style={styles.input} 
                  required 
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Enter your password"
                  style={{ ...styles.input, paddingRight: '38px' }} 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  {showPassword ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div style={styles.optionsRow}>
              <label style={styles.checkbox}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ marginRight: '4px' }} /> Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={styles.signinBtn}>
              {loading ? <><span style={styles.loadingSpinner}></span> Signing in...</> : <><LogIn size={15} /> Sign In</>}
            </button>
          </form>

          {userType === 'student' && <div style={styles.registerLink}>Don't have an account? <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Register here</Link></div>}
          {userType === 'company' && <div style={styles.registerLink}>New company? <a href="/company-register" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>Register your company</a></div>}

          <div style={styles.backHomeWrapper}>
            <Link to="/" className="back-home-btn" style={styles.backHomeBtn}> <Home size={13} /> Back to Home </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
