import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Globe, Briefcase, Users, FileText } from 'lucide-react'
import { companyRegister } from '../services/api'
import toast from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'

function CompanyRegister() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    location: '',
    employeeCount: '',
    password: '',
    confirmPassword: ''
  })

  // ✅ Google se company login hai toh email auto-fill
  useEffect(() => {
    const token = localStorage.getItem('companyToken')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.email) {
          setFormData(prev => ({ ...prev, email: decoded.email }))
        }
        if (decoded.name) {
          setFormData(prev => ({ ...prev, companyName: decoded.name }))
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
    
    if (!formData.companyName || !formData.hrName || !formData.email || !formData.password) {
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

    setLoading(true)
    
    try {
      const response = await companyRegister({
        companyName: formData.companyName,
        hrName: formData.hrName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        location: formData.location,
        employeeCount: formData.employeeCount,
        password: formData.password
      })
      
      toast.success(response.data.message)
      navigate('/login?role=company')
    } catch (error) {
      console.error(error)
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already registered')) {
        toast.error('❌ This email is already registered. Please login instead.')
        setTimeout(() => {
          navigate('/login?role=company')
        }, 2000)
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const industries = [
    'Information Technology',
    'Software Development',
    'Banking & Finance',
    'Consulting',
    'E-commerce',
    'Healthcare',
    'Manufacturing',
    'Education',
    'Telecommunications',
    'Media & Entertainment',
    'Other'
  ]

  const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

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
      maxWidth: '720px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden',
      maxHeight: '95vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
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
      color: '#ddd6fe'
    },
    formContainer: {
      padding: '16px 24px 12px 24px',
      flex: 1,
      overflow: 'hidden'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    inputGroup: {
      marginBottom: '8px'
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
      padding: '10px',
      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
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
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '1px solid #e2e8f0',
      fontSize: '13px',
      color: '#64748b',
      flexShrink: 0
    },
    footer: {
      textAlign: 'center',
      marginTop: '6px',
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
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
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
          <div style={styles.logo}>🏢</div>
          <h1 style={styles.title}>Company Registration</h1>
          <p style={styles.subtitle}>Register your company for campus placements</p>
        </div>

        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={{...styles.inputGroup, ...styles.fullWidth}}>
                <label style={styles.label}>Company Name <span style={styles.required}>*</span></label>
                <div style={styles.inputWrapper}>
                  <Building size={15} style={styles.iconStyle} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>HR/Contact Person <span style={styles.required}>*</span></label>
                <div style={styles.inputWrapper}>
                  <User size={15} style={styles.iconStyle} />
                  <input
                    type="text"
                    name="hrName"
                    value={formData.hrName}
                    onChange={handleChange}
                    placeholder="Full name"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Official Email <span style={styles.required}>*</span></label>
                <div style={styles.inputWrapper}>
                  <Mail size={15} style={styles.iconStyle} />
                  <input
                    type="email"
                    autoComplete="off"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hr@company.com"
                    style={styles.input}
                    required
                  />
                </div>
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
                <label style={styles.label}>Industry Type</label>
                <div style={styles.inputWrapper}>
                  <Briefcase size={15} style={styles.iconStyle} />
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Industry</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Employee Count</label>
                <div style={styles.inputWrapper}>
                  <Users size={15} style={styles.iconStyle} />
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Range</option>
                    {employeeRanges.map(range => (
                      <option key={range} value={range}>{range} employees</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Website</label>
                <div style={styles.inputWrapper}>
                  <Globe size={15} style={styles.iconStyle} />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="www.company.com"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Location</label>
                <div style={styles.inputWrapper}>
                  <MapPin size={15} style={styles.iconStyle} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password <span style={styles.required}>*</span></label>
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
                <label style={styles.label}>Confirm Password <span style={styles.required}>*</span></label>
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
                  Registering...
                </>
              ) : (
                <>
                  <FileText size={15} />
                  Register Company
                </>
              )}
            </button>
          </form>

          <div style={styles.loginLink}>
            Already have a company account?{' '}
            <Link 
              to="/login?role=company"
              style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}
            >
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

export default CompanyRegister