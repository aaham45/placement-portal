import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Lock, Eye, Mail, Phone, MapPin, Globe, Moon, Sun, CreditCard, LogOut, Save, X, CheckCircle, AlertCircle, Smartphone, Key, Database, Download, Trash2, ChevronRight, Briefcase, Calendar, Award, Code, FileText, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('studentToken')

  // Profile Settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    regNo: '',
    program: '',
    branch: '',
    semester: '',
    session: '',
    currentCgpa: 0,
    skills: [],
    linkedin: '',
    github: '',
    portfolio: '',
    bio: ''
  })
  const [editProfile, setEditProfile] = useState(profile)

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [jobAlerts, setJobAlerts] = useState(false)
  const [interviewReminders, setInterviewReminders] = useState(false)

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [showContact, setShowContact] = useState(false)

  // Appearance Settings
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('medium')

  // ✅ FETCH STUDENT PROFILE
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const data = response.data.profile || response.data.student
        
        const formattedProfile = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          regNo: data.reg_no || data.regNo || '',
          program: data.program || '',
          branch: data.branch || '',
          semester: data.semester || '',
          session: data.session || '',
          currentCgpa: data.current_cgpa || data.cgpa || 0,
          skills: data.skills ? (typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()).filter(s => s) : data.skills) : [],
          linkedin: data.linkedin || '',
          github: data.github || '',
          portfolio: data.portfolio || '',
          bio: data.bio || ''
        }
        
        setProfile(formattedProfile)
        setEditProfile(formattedProfile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FETCH SETTINGS
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📝 Settings Response:', response.data)
      
      if (response.data.success) {
        const settings = response.data.settings
        
        if (settings.notifications) {
          setEmailNotifications(settings.notifications.emailNotifications ?? false)
          setPushNotifications(settings.notifications.pushNotifications ?? false)
          setJobAlerts(settings.notifications.jobAlerts ?? false)
          setInterviewReminders(settings.notifications.interviewReminders ?? false)
        }
        
        if (settings.privacy) {
          setProfileVisibility(settings.privacy.profileVisibility ?? 'public')
          setShowContact(settings.privacy.showContact ?? false)
        }
        
        if (settings.appearance) {
          setTheme(settings.appearance.theme ?? 'light')
          setFontSize(settings.appearance.fontSize ?? 'medium')
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProfile()
      fetchSettings()
    } else {
      setLoading(false)
    }
  }, [token])

  // ✅ SAVE PROFILE
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const updateData = {
        name: editProfile.name,
        regNo: editProfile.regNo,
        phone: editProfile.phone,
        address: editProfile.address,
        program: editProfile.program,
        branch: editProfile.branch,
        session: editProfile.session,
        semester: editProfile.semester,
        currentCgpa: editProfile.currentCgpa,
        skills: Array.isArray(editProfile.skills) ? editProfile.skills.join(',') : editProfile.skills,
        linkedin: editProfile.linkedin,
        github: editProfile.github,
        portfolio: editProfile.portfolio,
        bio: editProfile.bio
      }
      
      const response = await axios.put(`${API_URL}/student/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setProfile(editProfile)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // ✅ SAVE NOTIFICATION SETTINGS
  const saveNotificationSettings = async () => {
    setSaving(true)
    try {
      const payload = {
        emailNotifications: Boolean(emailNotifications),
        pushNotifications: Boolean(pushNotifications),
        smsNotifications: false,
        jobAlerts: Boolean(jobAlerts),
        interviewReminders: Boolean(interviewReminders),
        offerUpdates: true,
        newsletter: false
      }
      
      console.log('📤 Saving notification settings:', payload)
      
      const response = await axios.put(`${API_URL}/student/settings/notifications`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📥 Save response:', response.data)
      
      if (response.data.success) {
        toast.success('Notification settings saved! ✅')
      } else {
        toast.error(response.data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // ✅ SAVE PRIVACY SETTINGS - FIXED with value mapping
  const savePrivacySettings = async () => {
    setSaving(true)
    try {
      // ✅ Map frontend values to database enum values
      const visibilityMap = {
        'public': 'public',
        'private': 'private',
        'only-me': 'company_only'
      }
      
      const dbVisibility = visibilityMap[profileVisibility] || 'public'
      
      const payload = {
        profileVisibility: dbVisibility,
        showResume: true,
        showContact: Boolean(showContact),
        showSkills: true,
        dataSharing: false
      }
      
      console.log('📤 Saving privacy settings:', payload)
      
      const response = await axios.put(`${API_URL}/student/settings/privacy`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📥 Privacy save response:', response.data)
      
      if (response.data.success) {
        toast.success('Privacy settings saved! ✅')
      } else {
        toast.error(response.data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // ✅ SAVE APPEARANCE SETTINGS
  const saveAppearanceSettings = async () => {
    setSaving(true)
    try {
      const payload = {
        theme: theme || 'light',
        fontSize: fontSize || 'medium',
        compactView: false
      }
      
      console.log('📤 Saving appearance settings:', payload)
      
      const response = await axios.put(`${API_URL}/student/settings/appearance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📥 Appearance save response:', response.data)
      
      if (response.data.success) {
        toast.success('Appearance settings saved! ✅')
        // Apply theme
        if (theme === 'dark') {
          document.body.classList.add('dark-mode')
          document.body.style.background = '#1e293b'
          document.body.style.color = '#f1f5f9'
        } else {
          document.body.classList.remove('dark-mode')
          document.body.style.background = '#f1f5f9'
          document.body.style.color = '#1e293b'
        }
      } else {
        toast.error(response.data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditProfile(profile)
    setIsEditing(false)
  }

  // ✅ Toggle functions with auto-save
  const toggleEmailNotifications = () => {
    const newValue = !emailNotifications
    setEmailNotifications(newValue)
    setTimeout(() => saveNotificationSettings(), 300)
  }

  const togglePushNotifications = () => {
    const newValue = !pushNotifications
    setPushNotifications(newValue)
    setTimeout(() => saveNotificationSettings(), 300)
  }

  const toggleJobAlerts = () => {
    const newValue = !jobAlerts
    setJobAlerts(newValue)
    setTimeout(() => saveNotificationSettings(), 300)
  }

  const toggleInterviewReminders = () => {
    const newValue = !interviewReminders
    setInterviewReminders(newValue)
    setTimeout(() => saveNotificationSettings(), 300)
  }

  const handleProfileVisibilityChange = (value) => {
    setProfileVisibility(value)
    setTimeout(() => savePrivacySettings(), 300)
  }

  const toggleShowContact = () => {
    const newValue = !showContact
    setShowContact(newValue)
    setTimeout(() => savePrivacySettings(), 300)
  }

  const handleThemeChange = (value) => {
    setTheme(value)
    setTimeout(() => saveAppearanceSettings(), 300)
  }

  const handleFontSizeChange = (value) => {
    setFontSize(value)
    setTimeout(() => saveAppearanceSettings(), 300)
  }

  const handleChangePassword = async () => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: profile.email
      })
      toast.success('Password reset link sent to your email!')
    } catch (error) {
      toast.error('Failed to send reset link')
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`${API_URL}/student/account`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          toast.success('Account deleted successfully')
          localStorage.removeItem('studentToken')
          localStorage.removeItem('user')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        }
      } catch (error) {
        console.error('Error deleting account:', error)
        toast.error('Failed to delete account')
      }
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'account', label: 'Account', icon: Lock },
  ]

  const styles = {
    container: {
      background: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    },
    header: {
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    titleIcon: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #64748b, #475569)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tabsContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '0.5rem'
    },
    tab: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: active ? '#2563eb' : 'transparent',
      color: active ? 'white' : '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    }),
    loadingState: {
      textAlign: 'center',
      padding: '3rem'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#64748b',
      marginBottom: '0.25rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      outline: 'none',
      transition: 'border 0.2s'
    },
    select: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      outline: 'none',
      background: 'white'
    },
    textarea: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem',
      color: '#1e293b'
    },
    toggle: {
      width: '44px',
      height: '24px',
      background: '#cbd5e1',
      borderRadius: '24px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      flexShrink: 0
    },
    toggleActive: {
      width: '44px',
      height: '24px',
      background: '#2563eb',
      borderRadius: '24px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      flexShrink: 0
    },
    toggleCircle: {
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },
    toggleCircleActive: {
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      right: '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },
    btnPrimary: {
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginRight: '0.5rem',
      transition: 'all 0.2s'
    },
    btnOutline: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s'
    },
    btnDanger: {
      padding: '0.5rem 1rem',
      background: '#fee2e2',
      color: '#ef4444',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s'
    },
    infoBox: {
      background: '#eff6ff',
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    dangerBox: {
      background: '#fee2e2',
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem'
    },
    valueDisplay: {
      padding: '0.6rem',
      background: '#f8fafc',
      borderRadius: '8px',
      fontSize: '0.85rem',
      color: '#1e293b',
      border: '1px solid #e2e8f0'
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

  const renderContent = () => {
    if (activeTab === 'profile') {
      return (
        <div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              {isEditing ? (
                <input type="text" value={editProfile.name} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.name || 'Not set'}</div>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Registration No</label>
              <div style={styles.valueDisplay}>{profile.regNo || 'Not set'}</div>
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.valueDisplay}>{profile.email || 'Not set'}</div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              {isEditing ? (
                <input type="text" value={editProfile.phone} onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.phone || 'Not set'}</div>
              )}
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Program</label>
              {isEditing ? (
                <input type="text" value={editProfile.program} onChange={(e) => setEditProfile({...editProfile, program: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.program || 'Not set'}</div>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Branch</label>
              {isEditing ? (
                <input type="text" value={editProfile.branch} onChange={(e) => setEditProfile({...editProfile, branch: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.branch || 'Not set'}</div>
              )}
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Session</label>
              {isEditing ? (
                <input type="text" value={editProfile.session} onChange={(e) => setEditProfile({...editProfile, session: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.session || 'Not set'}</div>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Semester</label>
              {isEditing ? (
                <input type="text" value={editProfile.semester} onChange={(e) => setEditProfile({...editProfile, semester: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.semester || 'Not set'}</div>
              )}
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>CGPA</label>
              {isEditing ? (
                <input type="number" step="0.01" min="0" max="10" value={editProfile.currentCgpa} onChange={(e) => setEditProfile({...editProfile, currentCgpa: parseFloat(e.target.value) || 0})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.currentCgpa || 0} / 10</div>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              {isEditing ? (
                <input type="text" value={editProfile.address} onChange={(e) => setEditProfile({...editProfile, address: e.target.value})} style={styles.input} />
              ) : (
                <div style={styles.valueDisplay}>{profile.address || 'Not set'}</div>
              )}
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Bio</label>
            {isEditing ? (
              <textarea value={editProfile.bio} onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})} style={styles.textarea} rows="3" placeholder="Tell us about yourself..." />
            ) : (
              <div style={styles.valueDisplay}>{profile.bio || 'Not set'}</div>
            )}
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>LinkedIn</label>
              {isEditing ? (
                <input type="text" value={editProfile.linkedin} onChange={(e) => setEditProfile({...editProfile, linkedin: e.target.value})} style={styles.input} placeholder="LinkedIn URL" />
              ) : (
                <div style={styles.valueDisplay}>{profile.linkedin || 'Not set'}</div>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>GitHub</label>
              {isEditing ? (
                <input type="text" value={editProfile.github} onChange={(e) => setEditProfile({...editProfile, github: e.target.value})} style={styles.input} placeholder="GitHub URL" />
              ) : (
                <div style={styles.valueDisplay}>{profile.github || 'Not set'}</div>
              )}
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Portfolio</label>
            {isEditing ? (
              <input type="text" value={editProfile.portfolio} onChange={(e) => setEditProfile({...editProfile, portfolio: e.target.value})} style={styles.input} placeholder="Portfolio URL" />
            ) : (
              <div style={styles.valueDisplay}>{profile.portfolio || 'Not set'}</div>
            )}
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={styles.btnPrimary}><User size={14} /> Edit Profile</button>
          ) : (
            <div>
              <button onClick={handleSaveProfile} disabled={saving} style={styles.btnPrimary}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleCancelEdit} style={styles.btnOutline}>Cancel</button>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'notifications') {
      return (
        <div>
          <div style={styles.checkboxGroup}>
            <div style={styles.checkboxLabel}><Mail size={16} /> Email Notifications</div>
            <div onClick={toggleEmailNotifications} style={emailNotifications ? styles.toggleActive : styles.toggle}>
              <div style={emailNotifications ? styles.toggleCircleActive : styles.toggleCircle}></div>
            </div>
          </div>
          <div style={styles.checkboxGroup}>
            <div style={styles.checkboxLabel}><Bell size={16} /> Push Notifications</div>
            <div onClick={togglePushNotifications} style={pushNotifications ? styles.toggleActive : styles.toggle}>
              <div style={pushNotifications ? styles.toggleCircleActive : styles.toggleCircle}></div>
            </div>
          </div>
          <div style={styles.checkboxGroup}>
            <div style={styles.checkboxLabel}><Briefcase size={16} /> Job Alerts</div>
            <div onClick={toggleJobAlerts} style={jobAlerts ? styles.toggleActive : styles.toggle}>
              <div style={jobAlerts ? styles.toggleCircleActive : styles.toggleCircle}></div>
            </div>
          </div>
          <div style={styles.checkboxGroup}>
            <div style={styles.checkboxLabel}><Calendar size={16} /> Interview Reminders</div>
            <div onClick={toggleInterviewReminders} style={interviewReminders ? styles.toggleActive : styles.toggle}>
              <div style={interviewReminders ? styles.toggleCircleActive : styles.toggleCircle}></div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={saveNotificationSettings} disabled={saving} style={styles.btnPrimary}>
              <Save size={14} /> {saving ? 'Saving...' : '💾 Save Notification Settings'}
            </button>
          </div>
        </div>
      )
    }

    if (activeTab === 'privacy') {
      return (
        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Visibility</label>
            <select 
              value={profileVisibility} 
              onChange={(e) => handleProfileVisibilityChange(e.target.value)} 
              style={styles.select}
            >
              <option value="public">🌍 Public - Anyone can view</option>
              <option value="private">🔒 Private - Only recruiters</option>
              <option value="only-me">👤 Only Me</option>
            </select>
          </div>
          
          <div style={styles.checkboxGroup}>
            <div style={styles.checkboxLabel}>
              <Phone size={16} /> Show Contact Information
            </div>
            <div 
              onClick={toggleShowContact} 
              style={showContact ? styles.toggleActive : styles.toggle}
            >
              <div style={showContact ? styles.toggleCircleActive : styles.toggleCircle}></div>
            </div>
          </div>
          
          <div style={styles.infoBox}>
            <AlertCircle size={20} color="#2563eb" />
            <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
              Your data is secure. We never share your information without consent.
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={savePrivacySettings} 
              disabled={saving} 
              style={styles.btnPrimary}
            >
              <Save size={14} /> {saving ? 'Saving...' : '💾 Save Privacy Settings'}
            </button>
          </div>
        </div>
      )
    }

    if (activeTab === 'appearance') {
      return (
        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Theme</label>
            <select 
              value={theme} 
              onChange={(e) => handleThemeChange(e.target.value)} 
              style={styles.select}
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Font Size</label>
            <select 
              value={fontSize} 
              onChange={(e) => handleFontSizeChange(e.target.value)} 
              style={styles.select}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={saveAppearanceSettings} 
              disabled={saving} 
              style={styles.btnPrimary}
            >
              <Save size={14} /> {saving ? 'Saving...' : '💾 Save Appearance Settings'}
            </button>
          </div>
        </div>
      )
    }

    if (activeTab === 'account') {
      return (
        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Change Password</label>
            <button onClick={handleChangePassword} style={styles.btnOutline}><Key size={14} /> Reset Password</button>
          </div>
          <div style={styles.dangerBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Trash2 size={18} color="#ef4444" />
              <strong style={{ color: '#991b1b' }}>Delete Account</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginBottom: '0.75rem' }}>Once you delete your account, there is no going back. All your data will be permanently removed.</p>
            <button onClick={handleDeleteAccount} style={styles.btnDanger}><Trash2 size={14} /> Delete Account</button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <Settings size={18} color="white" />
          </div>
          <span>Settings</span>
        </div>
      </div>

      <div style={styles.tabsContainer}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={styles.tab(activeTab === tab.id)}>
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {renderContent()}
    </div>
  )
}

export default SettingsComponent