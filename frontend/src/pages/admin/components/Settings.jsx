import React, { useState, useEffect } from 'react'
import { 
  Settings, Bell, Lock, Shield, Monitor, Sun, Moon,
  Save, RefreshCw, Eye, EyeOff, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function SettingsComponent() {
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Settings States
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Placement Portal',
    siteEmail: '',
    sitePhone: '',
    siteAddress: '',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    language: 'en'
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newCompanyAlert: true,
    newJobAlert: true,
    studentRegistrationAlert: true,
    placementDriveAlert: true,
    weeklyDigest: false
  })
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    ipWhitelist: ''
  })
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: '#059669',
    fontSize: 'medium',
    compactView: false,
    animationsEnabled: true
  })
  
  // Temp states for editing
  const [tempGeneral, setTempGeneral] = useState(generalSettings)
  const [tempNotifications, setTempNotifications] = useState(notificationSettings)
  const [tempSecurity, setTempSecurity] = useState(securitySettings)
  const [tempAppearance, setTempAppearance] = useState(appearanceSettings)
  
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const token = localStorage.getItem('adminToken')

  // ✅ FETCH SETTINGS
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/settings`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        const data = response.data.settings || {}
        
        if (data.general) {
          setGeneralSettings(data.general)
          setTempGeneral(data.general)
        }
        if (data.notifications) {
          setNotificationSettings(data.notifications)
          setTempNotifications(data.notifications)
        }
        if (data.security) {
          setSecuritySettings(data.security)
          setTempSecurity(data.security)
        }
        if (data.appearance) {
          setAppearanceSettings(data.appearance)
          setTempAppearance(data.appearance)
          // Apply theme
          if (data.appearance.theme === 'dark') {
            document.documentElement.style.setProperty('--bg-color', '#1e293b')
            document.body.classList.add('dark-mode')
          } else {
            document.documentElement.style.setProperty('--bg-color', '#f8fafc')
            document.body.classList.remove('dark-mode')
          }
        }
      } else {
        toast.error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSettings()
    } else {
      setLoading(false)
    }
  }, [token])

  // ✅ SAVE GENERAL
  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      const response = await axios.put(`${API_URL}/admin/settings/general`, tempGeneral, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        setGeneralSettings(tempGeneral)
        toast.success('General settings saved successfully!')
      } else {
        toast.error(response.data.message || 'Failed to save general settings')
      }
    } catch (error) {
      console.error('Error saving general settings:', error)
      toast.error('Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  // ✅ SAVE NOTIFICATIONS
  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      const response = await axios.put(`${API_URL}/admin/settings/notifications`, tempNotifications, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        setNotificationSettings(tempNotifications)
        toast.success('Notification settings saved successfully!')
      } else {
        toast.error(response.data.message || 'Failed to save notification settings')
      }
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error('Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  // ✅ SAVE SECURITY
  const handleSaveSecurity = async () => {
    setSaving(true)
    try {
      const response = await axios.put(`${API_URL}/admin/settings/security`, tempSecurity, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        setSecuritySettings(tempSecurity)
        toast.success('Security settings saved successfully!')
      } else {
        toast.error(response.data.message || 'Failed to save security settings')
      }
    } catch (error) {
      console.error('Error saving security settings:', error)
      toast.error('Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  // ✅ SAVE APPEARANCE
  const handleSaveAppearance = async () => {
    setSaving(true)
    try {
      const response = await axios.put(`${API_URL}/admin/settings/appearance`, tempAppearance, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        setAppearanceSettings(tempAppearance)
        toast.success('Appearance settings saved successfully!')
        
        // Apply theme
        if (tempAppearance.theme === 'dark') {
          document.documentElement.style.setProperty('--bg-color', '#1e293b')
          document.body.classList.add('dark-mode')
        } else {
          document.documentElement.style.setProperty('--bg-color', '#f8fafc')
          document.body.classList.remove('dark-mode')
        }
      } else {
        toast.error(response.data.message || 'Failed to save appearance settings')
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error)
      toast.error('Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  // ✅ RESET SETTINGS
  const handleResetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default?')) return
    
    try {
      const response = await axios.post(`${API_URL}/admin/settings/reset`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('All settings reset to default!')
        fetchSettings()
      } else {
        toast.error(response.data.message || 'Failed to reset settings')
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error('Could not connect to server')
    }
  }

  // ✅ CHANGE PASSWORD
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setChangingPassword(true)
    try {
      const response = await axios.post(`${API_URL}/admin/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(response.data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Could not connect to server')
    } finally {
      setChangingPassword(false)
    }
  }

  const sections = [
    { id: 'general', label: 'General', icon: Settings, color: '#059669' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: '#3b82f6' },
    { id: 'security', label: 'Security', icon: Shield, color: '#8b5cf6' },
    { id: 'appearance', label: 'Appearance', icon: Monitor, color: '#f59e0b' }
  ]

  const styles = {
    container: {
      background: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      gap: '2rem',
      minHeight: '550px'
    },
    sidebar: {
      width: '220px',
      borderRight: '1px solid #e2e8f0',
      paddingRight: '1rem',
      flexShrink: 0
    },
    sectionTitle: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '1rem'
    },
    sectionBtn: (isActive, color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
      padding: '0.6rem 0.75rem',
      background: isActive ? `${color}10` : 'transparent',
      color: isActive ? color : '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: isActive ? '600' : '500',
      marginBottom: '0.25rem',
      transition: 'all 0.2s ease'
    }),
    content: {
      flex: 1,
      minWidth: 0
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    headerTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    headerActions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    saveBtn: {
      padding: '0.5rem 1.2rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    saveBtnDisabled: {
      padding: '0.5rem 1.2rem',
      background: '#94a3b8',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    resetBtn: {
      padding: '0.5rem 1rem',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    formGroup: {
      marginBottom: '1.25rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '0.25rem'
    },
    formInput: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none',
      transition: 'all 0.2s ease',
      background: 'white'
    },
    formSelect: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none',
      background: 'white',
      cursor: 'pointer'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.75rem',
      cursor: 'pointer',
      padding: '0.25rem 0'
    },
    checkboxLabel: {
      fontSize: '0.85rem',
      color: '#1e293b',
      cursor: 'pointer'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modal: {
      background: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      maxWidth: '450px',
      width: '90%'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    modalTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      color: '#64748b'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    btnPrimary: {
      flex: 1,
      padding: '0.6rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    btnSecondary: {
      flex: 1,
      padding: '0.6rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    colorOption: (isActive, color) => ({
      width: '36px',
      height: '36px',
      background: color,
      borderRadius: '10px',
      cursor: 'pointer',
      border: isActive ? '3px solid #1e293b' : '3px solid transparent',
      transition: 'all 0.2s ease',
      boxShadow: isActive ? '0 0 0 2px white, 0 0 0 4px #1e293b' : 'none'
    }),
    themeOption: (isActive) => ({
      padding: '0.5rem 1rem',
      borderRadius: '10px',
      cursor: 'pointer',
      border: isActive ? '2px solid #059669' : '1px solid #e2e8f0',
      background: isActive ? '#f0fdf4' : 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      fontSize: '0.85rem'
    }),
    passwordInputWrapper: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8'
    },
    loadingState: {
      textAlign: 'center',
      padding: '3rem'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#059669',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading settings...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  const renderGeneral = () => (
    <div>
      <div style={styles.header}>
        <div style={styles.headerTitle}><Settings size={20} color="#059669" /> General Settings</div>
        <div style={styles.headerActions}>
          <button onClick={handleResetSettings} style={styles.resetBtn}><RefreshCw size={14} /> Reset</button>
          <button onClick={handleSaveGeneral} disabled={saving} style={saving ? styles.saveBtnDisabled : styles.saveBtn}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <div style={styles.twoColumnGrid}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Site Name</label>
          <input 
            type="text" 
            value={tempGeneral.siteName} 
            onChange={(e) => setTempGeneral({...tempGeneral, siteName: e.target.value})} 
            style={styles.formInput} 
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Site Email</label>
          <input 
            type="email" 
            value={tempGeneral.siteEmail} 
            onChange={(e) => setTempGeneral({...tempGeneral, siteEmail: e.target.value})} 
            style={styles.formInput} 
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Site Phone</label>
          <input 
            type="text" 
            value={tempGeneral.sitePhone} 
            onChange={(e) => setTempGeneral({...tempGeneral, sitePhone: e.target.value})} 
            style={styles.formInput} 
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Site Address</label>
          <input 
            type="text" 
            value={tempGeneral.siteAddress} 
            onChange={(e) => setTempGeneral({...tempGeneral, siteAddress: e.target.value})} 
            style={styles.formInput} 
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Timezone</label>
          <select 
            value={tempGeneral.timezone} 
            onChange={(e) => setTempGeneral({...tempGeneral, timezone: e.target.value})} 
            style={styles.formSelect}
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="America/New_York">America/New York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Date Format</label>
          <select 
            value={tempGeneral.dateFormat} 
            onChange={(e) => setTempGeneral({...tempGeneral, dateFormat: e.target.value})} 
            style={styles.formSelect}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Default Language</label>
          <select 
            value={tempGeneral.language} 
            onChange={(e) => setTempGeneral({...tempGeneral, language: e.target.value})} 
            style={styles.formSelect}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="te">Telugu</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div>
      <div style={styles.header}>
        <div style={styles.headerTitle}><Bell size={20} color="#3b82f6" /> Notification Settings</div>
        <button onClick={handleSaveNotifications} disabled={saving} style={saving ? styles.saveBtnDisabled : styles.saveBtn}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div style={styles.twoColumnGrid}>
        <div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.emailNotifications} 
              onChange={(e) => setTempNotifications({...tempNotifications, emailNotifications: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>📧 Email Notifications</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.pushNotifications} 
              onChange={(e) => setTempNotifications({...tempNotifications, pushNotifications: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>🔔 Push Notifications</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.smsNotifications} 
              onChange={(e) => setTempNotifications({...tempNotifications, smsNotifications: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>📱 SMS Notifications</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.newCompanyAlert} 
              onChange={(e) => setTempNotifications({...tempNotifications, newCompanyAlert: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>🏢 New Company Registration</span>
          </div>
        </div>
        <div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.newJobAlert} 
              onChange={(e) => setTempNotifications({...tempNotifications, newJobAlert: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>💼 New Job Posting</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.studentRegistrationAlert} 
              onChange={(e) => setTempNotifications({...tempNotifications, studentRegistrationAlert: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>👨‍🎓 Student Registration</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.placementDriveAlert} 
              onChange={(e) => setTempNotifications({...tempNotifications, placementDriveAlert: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>📅 Placement Drive</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempNotifications.weeklyDigest} 
              onChange={(e) => setTempNotifications({...tempNotifications, weeklyDigest: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>📊 Weekly Digest</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div>
      <div style={styles.header}>
        <div style={styles.headerTitle}><Shield size={20} color="#8b5cf6" /> Security Settings</div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowPasswordModal(true)} style={{ ...styles.saveBtn, background: '#8b5cf6' }}>
            <Lock size={14} /> Change Password
          </button>
          <button onClick={handleSaveSecurity} disabled={saving} style={saving ? styles.saveBtnDisabled : styles.saveBtn}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <div style={styles.twoColumnGrid}>
        <div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempSecurity.twoFactorAuth} 
              onChange={(e) => setTempSecurity({...tempSecurity, twoFactorAuth: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>🔐 Two-Factor Authentication (2FA)</span>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>⏱️ Session Timeout (minutes)</label>
            <input 
              type="number" 
              value={tempSecurity.sessionTimeout} 
              onChange={(e) => setTempSecurity({...tempSecurity, sessionTimeout: parseInt(e.target.value) || 0})} 
              style={styles.formInput} 
              min="5"
              max="480"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>🔁 Max Login Attempts</label>
            <input 
              type="number" 
              value={tempSecurity.maxLoginAttempts} 
              onChange={(e) => setTempSecurity({...tempSecurity, maxLoginAttempts: parseInt(e.target.value) || 0})} 
              style={styles.formInput} 
              min="1"
              max="10"
            />
          </div>
        </div>
        <div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>📅 Password Expiry (days)</label>
            <input 
              type="number" 
              value={tempSecurity.passwordExpiryDays} 
              onChange={(e) => setTempSecurity({...tempSecurity, passwordExpiryDays: parseInt(e.target.value) || 0})} 
              style={styles.formInput} 
              min="7"
              max="365"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>🌐 IP Whitelist (comma separated)</label>
            <input 
              type="text" 
              value={tempSecurity.ipWhitelist} 
              onChange={(e) => setTempSecurity({...tempSecurity, ipWhitelist: e.target.value})} 
              placeholder="192.168.1.1, 10.0.0.1" 
              style={styles.formInput} 
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearance = () => (
    <div>
      <div style={styles.header}>
        <div style={styles.headerTitle}><Monitor size={20} color="#f59e0b" /> Appearance Settings</div>
        <button onClick={handleSaveAppearance} disabled={saving} style={saving ? styles.saveBtnDisabled : styles.saveBtn}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div style={styles.twoColumnGrid}>
        <div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Theme</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div 
                style={styles.themeOption(tempAppearance.theme === 'light')} 
                onClick={() => setTempAppearance({...tempAppearance, theme: 'light'})}
              >
                <Sun size={16} /> Light
              </div>
              <div 
                style={styles.themeOption(tempAppearance.theme === 'dark')} 
                onClick={() => setTempAppearance({...tempAppearance, theme: 'dark'})}
              >
                <Moon size={16} /> Dark
              </div>
              <div 
                style={styles.themeOption(tempAppearance.theme === 'system')} 
                onClick={() => setTempAppearance({...tempAppearance, theme: 'system'})}
              >
                <Monitor size={16} /> System
              </div>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Primary Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['#059669', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'].map(color => (
                <div 
                  key={color} 
                  style={styles.colorOption(tempAppearance.primaryColor === color, color)} 
                  onClick={() => setTempAppearance({...tempAppearance, primaryColor: color})}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Font Size</label>
            <select 
              value={tempAppearance.fontSize} 
              onChange={(e) => setTempAppearance({...tempAppearance, fontSize: e.target.value})} 
              style={styles.formSelect}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempAppearance.compactView} 
              onChange={(e) => setTempAppearance({...tempAppearance, compactView: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>📐 Compact View (Show more items)</span>
          </div>
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              checked={tempAppearance.animationsEnabled} 
              onChange={(e) => setTempAppearance({...tempAppearance, animationsEnabled: e.target.checked})} 
            />
            <span style={styles.checkboxLabel}>✨ Enable Animations</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sectionTitle}>Settings</div>
        {sections.map(section => {
          const Icon = section.icon
          return (
            <button 
              key={section.id} 
              onClick={() => setActiveSection(section.id)} 
              style={styles.sectionBtn(activeSection === section.id, section.color)}
            >
              <Icon size={16} /> {section.label}
            </button>
          )
        })}
      </div>
      
      <div style={styles.content}>
        {activeSection === 'general' && renderGeneral()}
        {activeSection === 'notifications' && renderNotifications()}
        {activeSection === 'security' && renderSecurity()}
        {activeSection === 'appearance' && renderAppearance()}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Change Password</div>
              <button onClick={() => setShowPasswordModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Current Password</label>
                <div style={styles.passwordInputWrapper}>
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'} 
                    value={passwordData.currentPassword} 
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                    style={styles.formInput} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                    style={styles.passwordToggle}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Password</label>
                <div style={styles.passwordInputWrapper}>
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    style={styles.formInput} 
                    required 
                    minLength="6"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)} 
                    style={styles.passwordToggle}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={styles.btnSecondary}>Cancel</button>
                <button type="submit" disabled={changingPassword} style={styles.btnPrimary}>
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsComponent