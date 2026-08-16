import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Send, KeyRound, Phone, Smartphone } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [contactMethod, setContactMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (contactMethod === 'email' && !email) {
      toast.error('Please enter your email address')
      return
    }
    if (contactMethod === 'phone' && !phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    
    try {
      const payload = contactMethod === 'email' ? { email } : { phone };
      const response = await axios.post(`${API_URL}/auth/forgot-password`, payload)
      toast.success(response.data.message || 'OTP sent successfully!')
      setStep(2)
    } catch (error) {
      console.error('Send OTP error:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all password fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    try {
      const payload = {
        otp,
        newPassword,
        ...(contactMethod === 'email' ? { email } : { phone })
      };
      
      const response = await axios.post(`${API_URL}/auth/reset-password`, payload)
      
      toast.success(response.data.message || 'Password reset successful!')
      navigate('/login')
    } catch (error) {
      console.error('Reset error:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh', height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: "'Inter', sans-serif"
    },
    card: { maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' },
    header: {
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      padding: '28px 20px', textAlign: 'center'
    },
    logo: { width: '56px', height: '56px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '4px' },
    subtitle: { fontSize: '12px', color: '#bfdbfe' },
    formContainer: { padding: '28px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' },
    toggleContainer: {
      display: 'flex', gap: '10px', marginBottom: '16px',
      background: '#f1f5f9', padding: '4px', borderRadius: '10px'
    },
    toggleBtn: (isActive) => ({
      flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
      background: isActive ? 'white' : 'transparent',
      color: isActive ? '#2563eb' : '#64748b',
      fontWeight: '600', fontSize: '13px', cursor: 'pointer',
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
    }),
    inputWrapper: { position: 'relative' },
    input: {
      width: '100%', padding: '12px 14px', paddingLeft: '42px',
      border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px',
      outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
      backgroundColor: '#fafafa'
    },
    btn: {
      width: '100%', padding: '12px',
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px',
      fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      marginTop: '8px'
    },
    backLink: { textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' },
    backLinkText: { color: '#64748b', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    loadingSpinner: { display: 'inline-block', width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
    hint: { fontSize: '10px', color: '#94a3b8', marginTop: '6px' }
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); background-color: white; }
        button:hover { transform: translateY(-1px); }
      `}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🔐</div>
          <h1 style={styles.title}>Forgot Password?</h1>
          <p style={styles.subtitle}>
            {step === 1 && "Enter your Email or Phone to reset password"}
            {step === 2 && "Enter OTP and create new password"}
          </p>
        </div>

        <div style={styles.formContainer}>
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div style={styles.toggleContainer}>
                <button 
                  type="button"
                  style={styles.toggleBtn(contactMethod === 'email')}
                  onClick={() => setContactMethod('email')}
                >
                  <Mail size={16} /> Email
                </button>
                <button 
                  type="button"
                  style={styles.toggleBtn(contactMethod === 'phone')}
                  onClick={() => setContactMethod('phone')}
                >
                  <Smartphone size={16} /> Phone
                </button>
              </div>

              {contactMethod === 'email' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@cutm.ac.in"
                      style={styles.input}
                      required={contactMethod === 'email'}
                    />
                  </div>
                  <p style={styles.hint}>Use your registered college email</p>
                </div>
              )}

              {contactMethod === 'phone' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <div style={styles.inputWrapper}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="tel"
                      autoComplete="off"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXXXXXXX"
                      style={styles.input}
                      required={contactMethod === 'phone'}
                    />
                  </div>
                  <p style={styles.hint}>Enter your registered mobile number</p>
                </div>
              )}

              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? (
                  <><span style={styles.loadingSpinner}></span> Sending OTP...</>
                ) : (
                  <><Send size={16} /> Send OTP</>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Enter OTP</label>
                <div style={styles.inputWrapper}>
                  <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    autoComplete="off"           // ✅ Browser OTP autofill band kiya
                    autoComplete="one-time-code" // ✅ Browser ko bata diya ki ye OTP hai, save mat karo
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    style={styles.input}
                    required
                  />
                </div>
                <p style={styles.hint}>Enter the OTP sent to your {contactMethod}</p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    style={{...styles.input, paddingRight: '38px'}}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    style={{...styles.input, paddingRight: '38px'}}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? (
                  <><span style={styles.loadingSpinner}></span> Resetting Password...</>
                ) : (
                  <><CheckCircle size={16} /> Reset Password</>
                )}
              </button>
            </form>
          )}

          <div style={styles.backLink}>
            <Link to="/login" style={styles.backLinkText}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword