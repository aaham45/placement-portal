// frontend/src/pages/student/StudentDashboard.jsx

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Home, User, Briefcase, FileText, Calendar, ShieldCheck, 
  BarChart3, BookOpen, Bell, Award, Heart, LogOut,
  Settings as SettingsIcon, Search, ChevronDown, TrendingUp, Target, Zap,
  Clock, Calendar as CalendarIcon, ArrowRight, CheckCircle, 
  AlertCircle, Briefcase as BriefcaseIcon, Users, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

// Components
import StatsCards from './components/StatsCards'
import Profile from './components/Profile'
import AvailableJobs from './components/AvailableJobs'
import MyApplications from './components/MyApplications'
import InterviewSchedule from './components/InterviewSchedule'
import EligibilityChecker from './components/EligibilityChecker'
import ResumeAnalyzer from './components/ResumeAnalyzer'
import PlacementResources from './components/PlacementResources'
import Notifications from './components/Notifications'
import OfferLetters from './components/OfferLetters'
import SavedJobs from './components/SavedJobs'
import SettingsComponent from './components/Settings'
import Sidebar from './components/Sidebar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StudentDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applying, setApplying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('student')

  const notificationRef = useRef(null)
  const profileRef = useRef(null)

  const token = localStorage.getItem('studentToken')

  const [profile, setProfile] = useState({
    name: '',
    regNo: '',
    email: '',
    phone: '',
    address: '',
    program: '',
    branch: '',
    session: '',
    semester: '',
    cgpa: '0',
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    linkedin: '',
    github: '',
    portfolio: '',
    bio: '',
    profilePic: null
  })

  const [stats, setStats] = useState({
    availableJobs: 0,
    myApplications: 0,
    savedJobs: 0,
    interviews: 0,
    appliedJobs: 0,
    shortlisted: 0,
    offersReceived: 0,
    profileComplete: 0
  })

  const [activities, setActivities] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const getTimeAgo = (date) => {
    if (!date) return 'Just now'
    const now = new Date()
    const then = new Date(date)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  // ✅ Get profile picture URL - FIXED
  const getProfilePicUrl = () => {
    if (!profile?.profilePic) return null;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    
    if (profile.profilePic.startsWith('http://') || profile.profilePic.startsWith('https://')) {
      return profile.profilePic;
    }
    
    const path = profile.profilePic.startsWith('/') ? profile.profilePic : `/${profile.profilePic}`;
    const fullUrl = `${baseUrl}${path}`;
    
    console.log('🖼️ Profile Pic URL:', fullUrl);
    return fullUrl;
  };

  // ✅ Get initials
  const getInitials = (name) => {
    if (!name) return 'S'
    const names = name.trim().split(' ')
    if (names.length === 1) return names[0][0].toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  const fetchUnreadCount = async () => {
    if (!token) return
    try {
      const response = await axios.get(`${API_URL}/student/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setUnreadCount(response.data.count || 0)
      }
    } catch (error) {
      try {
        const response = await axios.get(`${API_URL}/student/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          const unread = response.data.notifications?.filter(n => !n.is_read).length || 0
          setUnreadCount(unread)
        }
      } catch (e) {
        setUnreadCount(0)
      }
    }
  }

  const fetchStudentData = async () => {
    setLoading(true)
    try {
      const profileRes = await axios.get(`${API_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (profileRes.data.success) {
        const data = profileRes.data.profile || {}
        setProfile({
          name: data.name || '',
          regNo: data.reg_no || data.regNo || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          program: data.program || '',
          branch: data.branch || '',
          session: data.session || '',
          semester: data.semester || '',
          cgpa: data.current_cgpa || data.currentCgpa || data.cgpa || '0',
          skills: data.skills ? (typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()) : data.skills) : [],
          certifications: data.certifications ? (typeof data.certifications === 'string' ? data.certifications.split(',').map(c => c.trim()) : data.certifications) : [],
          projects: data.projects ? (typeof data.projects === 'string' ? data.projects.split(',').map(p => p.trim()) : data.projects) : [],
          languages: data.languages ? (typeof data.languages === 'string' ? data.languages.split(',').map(l => l.trim()) : data.languages) : ['English'],
          linkedin: data.linkedin || '',
          github: data.github || '',
          portfolio: data.portfolio || '',
          bio: data.bio || '',
          profilePic: data.profile_pic || data.profilePic || null
        })
      }

      const statsRes = await axios.get(`${API_URL}/student/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (statsRes.data.success) {
        const s = statsRes.data.stats || {}
        setStats({
          availableJobs: s.availableJobs || 0,
          myApplications: s.myApplications || s.appliedJobs || 0,
          savedJobs: s.savedJobs || 0,
          interviews: s.interviews || 0,
          appliedJobs: s.appliedJobs || 0,
          shortlisted: s.shortlisted || 0,
          offersReceived: s.offersReceived || 0,
          profileComplete: s.profileComplete || 0
        })
      }

      const activitiesRes = await axios.get(`${API_URL}/student/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.activities || [])
      }

      const deadlinesRes = await axios.get(`${API_URL}/student/deadlines`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (deadlinesRes.data.success) {
        setDeadlines(deadlinesRes.data.deadlines || [])
      }

      await fetchUnreadCount()

    } catch (error) {
      console.error('❌ Error fetching student data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('studentToken')
    if (!storedToken) {
      navigate('/login?role=student')
      return
    }
    fetchStudentData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('studentToken')
    localStorage.removeItem('user')
    localStorage.removeItem('currentUserRole')
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleApply = (job) => {
    setSelectedJob(job)
    setShowApplyModal(true)
  }

  const confirmApply = async () => {
    if (!selectedJob) return
    setApplying(true)
    try {
      const response = await axios.post(`${API_URL}/student/jobs/${selectedJob.id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        toast.success(`Applied successfully! 🎉`)
        setShowApplyModal(false)
        fetchStudentData()
      } else {
        toast.error(response.data.message || 'Failed to apply')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  // ============ ENHANCED STYLES ============
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      display: 'flex'
    },
    mainContent: {
      marginLeft: sidebarOpen ? '280px' : '80px',
      padding: '1.5rem',
      width: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    topBar: {
      background: 'white',
      borderRadius: '20px',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    },
    greeting: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1e293b',
      letterSpacing: '-0.3px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    greetingSub: {
      color: '#64748b',
      fontSize: '0.75rem',
      marginTop: '0.2rem'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      position: 'relative'
    },
    notificationIcon: {
      position: 'relative',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '12px',
      transition: 'all 0.2s ease'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      background: '#ef4444',
      color: 'white',
      fontSize: '0.6rem',
      padding: '0.15rem 0.35rem',
      borderRadius: '10px',
      fontWeight: '600',
      minWidth: '18px',
      textAlign: 'center'
    },
    profileAvatar: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      background: '#f8fafc',
      borderRadius: '40px',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    avatarImg: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      overflow: 'hidden',
      flexShrink: 0
    },
    dropdown: {
      position: 'absolute',
      top: '45px',
      right: '0',
      background: 'white',
      borderRadius: '14px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      width: '240px',
      zIndex: 1000,
      overflow: 'hidden',
      border: '1px solid #e2e8f0'
    },
    dropdownHeader: {
      padding: '0.75rem 1rem',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    dropdownHeaderAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '600',
      overflow: 'hidden',
      flexShrink: 0
    },
    dropdownHeaderInfo: {
      flex: 1,
      minWidth: 0
    },
    dropdownHeaderName: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    dropdownHeaderEmail: {
      fontSize: '0.6rem',
      color: '#64748b',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 1rem',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      fontSize: '0.75rem',
      color: '#1e293b'
    },
    notificationPanel: {
      position: 'absolute',
      top: '45px',
      right: '0',
      background: 'white',
      borderRadius: '14px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      width: '360px',
      maxHeight: '420px',
      overflowY: 'auto',
      zIndex: 1000,
      border: '1px solid #e2e8f0'
    },
    notificationHeader: {
      padding: '1rem',
      borderBottom: '1px solid #e2e8f0',
      fontWeight: '600',
      fontSize: '0.9rem',
      background: '#fafcff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    notificationItem: (read) => ({
      display: 'flex',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e2e8f0',
      background: read ? 'white' : '#eff6ff',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }),
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
      width: '90%',
      textAlign: 'center'
    },
    cancelBtn: {
      padding: '0.6rem 1.5rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '500',
      margin: '0.5rem'
    },
    confirmBtn: {
      padding: '0.6rem 1.5rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '500',
      margin: '0.5rem'
    },
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statsCard: (color) => ({
      background: 'white',
      padding: '1.25rem',
      borderRadius: '16px',
      border: `1px solid ${color}20`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }),
    statsIcon: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }),
    statsInfo: {
      flex: 1
    },
    statsValue: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#1e293b',
      lineHeight: '1.2'
    },
    statsLabel: {
      fontSize: '0.7rem',
      color: '#64748b',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statsChange: (positive) => ({
      fontSize: '0.6rem',
      color: positive ? '#10b981' : '#ef4444',
      background: positive ? '#d1fae5' : '#fee2e2',
      padding: '0.15rem 0.4rem',
      borderRadius: '10px',
      fontWeight: '600',
      marginTop: '0.25rem',
      display: 'inline-block'
    }),
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    activityCard: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cardBadge: {
      background: '#dbeafe',
      color: '#2563eb',
      padding: '0.15rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      fontWeight: '600'
    },
    activityList: {
      maxHeight: '280px',
      overflowY: 'auto'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    activityIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      background: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    activityContent: {
      flex: 1,
      minWidth: 0
    },
    activityText: {
      fontSize: '0.85rem',
      color: '#1e293b',
      fontWeight: '500'
    },
    activityTime: {
      fontSize: '0.65rem',
      color: '#94a3b8'
    },
    viewAllBtn: {
      marginTop: '1rem',
      color: '#2563eb',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.5rem',
      borderRadius: '8px'
    },
    deadlineItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    deadlinePriority: (days) => ({
      width: '4px',
      height: '32px',
      borderRadius: '4px',
      background: days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981',
      flexShrink: 0
    }),
    deadlineContent: {
      flex: 1,
      minWidth: 0
    },
    deadlineRole: {
      fontSize: '0.85rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    deadlineCompany: {
      fontSize: '0.7rem',
      color: '#64748b'
    },
    deadlineDays: (days) => ({
      fontSize: '0.65rem',
      fontWeight: '600',
      color: days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981',
      background: days <= 3 ? '#fee2e2' : days <= 7 ? '#fef3c7' : '#d1fae5',
      padding: '0.15rem 0.4rem',
      borderRadius: '10px',
      whiteSpace: 'nowrap'
    }),
    quoteCard: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      borderRadius: '16px',
      textAlign: 'center',
      border: '1px solid #a7f3d0'
    },
    quoteText: {
      color: '#065f46',
      fontStyle: 'italic',
      fontSize: '1.1rem',
      fontWeight: '500'
    },
    quoteAuthor: {
      fontSize: '0.75rem',
      color: '#047857',
      marginTop: '0.5rem',
      fontWeight: '500'
    },
    quoteIcon: {
      fontSize: '2rem',
      color: '#059669',
      marginBottom: '0.5rem'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading dashboard...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statsCard('#3b82f6')}>
                <div style={styles.statsIcon('#3b82f6')}>
                  <BriefcaseIcon size={22} color="#3b82f6" />
                </div>
                <div style={styles.statsInfo}>
                  <div style={styles.statsValue}>{stats.availableJobs || 0}</div>
                  <div style={styles.statsLabel}>Available Jobs</div>
                  <span style={styles.statsChange(true)}>+12 this week</span>
                </div>
              </div>

              <div style={styles.statsCard('#10b981')}>
                <div style={styles.statsIcon('#10b981')}>
                  <FileText size={22} color="#10b981" />
                </div>
                <div style={styles.statsInfo}>
                  <div style={styles.statsValue}>{stats.myApplications || 0}</div>
                  <div style={styles.statsLabel}>My Applications</div>
                  <span style={styles.statsChange(true)}>Applied recently</span>
                </div>
              </div>

              <div style={styles.statsCard('#ec4899')}>
                <div style={styles.statsIcon('#ec4899')}>
                  <Heart size={22} color="#ec4899" />
                </div>
                <div style={styles.statsInfo}>
                  <div style={styles.statsValue}>{stats.savedJobs || 0}</div>
                  <div style={styles.statsLabel}>Saved Jobs</div>
                  <span style={styles.statsChange(false)}>Review pending</span>
                </div>
              </div>

              <div style={styles.statsCard('#8b5cf6')}>
                <div style={styles.statsIcon('#8b5cf6')}>
                  <CalendarIcon size={22} color="#8b5cf6" />
                </div>
                <div style={styles.statsInfo}>
                  <div style={styles.statsValue}>{stats.interviews || 0}</div>
                  <div style={styles.statsLabel}>Interviews</div>
                  <span style={styles.statsChange(true)}>Upcoming</span>
                </div>
              </div>
            </div>

            <div style={styles.twoColumnGrid}>
              <div style={styles.activityCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Clock size={18} color="#8b5cf6" />
                    Recent Activity
                    <span style={styles.cardBadge}>
                      {activities.length} updates
                    </span>
                  </div>
                </div>
                {activities.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                    No recent activities
                  </p>
                ) : (
                  <div style={styles.activityList}>
                    {activities.slice(0, 5).map((activity, index) => (
                      <div key={index} style={styles.activityItem}>
                        <div style={styles.activityIcon}>
                          <CheckCircle size={14} color="#3b82f6" />
                        </div>
                        <div style={styles.activityContent}>
                          <div style={styles.activityText}>{activity.text}</div>
                          <div style={styles.activityTime}>{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button style={styles.viewAllBtn}>
                  View all activity <ArrowRight size={14} />
                </button>
              </div>

              <div style={styles.activityCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <AlertCircle size={18} color="#f59e0b" />
                    Upcoming Deadlines
                    <span style={{ ...styles.cardBadge, background: '#fef3c7', color: '#d97706' }}>
                      {deadlines.length} pending
                    </span>
                  </div>
                </div>
                {deadlines.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                    No upcoming deadlines 🎉
                  </p>
                ) : (
                  deadlines.slice(0, 5).map((deadline, index) => (
                    <div key={index} style={styles.deadlineItem}>
                      <div style={styles.deadlinePriority(deadline.daysLeft || 0)} />
                      <div style={styles.deadlineContent}>
                        <div style={styles.deadlineRole}>{deadline.role}</div>
                        <div style={styles.deadlineCompany}>{deadline.company}</div>
                      </div>
                      <div style={styles.deadlineDays(deadline.daysLeft || 0)}>
                        {deadline.daysLeft <= 0 ? 'Today!' : `${deadline.daysLeft} days`}
                      </div>
                    </div>
                  ))
                )}
                <button style={styles.viewAllBtn}>
                  View all deadlines <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div style={styles.quoteCard}>
              <div style={styles.quoteIcon}>💪</div>
              <p style={styles.quoteText}>
                "Your next opportunity is just one application away. Keep pushing!"
              </p>
              <p style={styles.quoteAuthor}>— Placement Cell</p>
            </div>
          </>
        )
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} />
      case 'jobs':
        return <AvailableJobs onApply={handleApply} />
      case 'applications':
        return <MyApplications />
      case 'interviews':
        return <InterviewSchedule />
      case 'eligibility':
        return <EligibilityChecker profile={profile} />
      case 'resume':
        return <ResumeAnalyzer />
      case 'resources':
        return <PlacementResources />
      case 'notifications':
        return <Notifications />
      case 'offers':
        return <OfferLetters />
      case 'saved':
        return <SavedJobs onApply={handleApply} />
      case 'settings':
        return <SettingsComponent />
      default:
        return <StatsCards stats={stats} onNavigate={setActiveTab} />
    }
  }

  return (
    <div style={styles.container}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.greeting}>
              Welcome back, {profile.name?.split(' ')[0] || 'User'}! 🎉
            </div>
            <div style={styles.greetingSub}>
              Your placement journey looks great! Keep going.
            </div>
          </div>
          <div style={styles.rightSection}>
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <div 
                style={styles.notificationIcon} 
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) {
                    setActiveTab('notifications')
                  }
                }}
              >
                <Bell size={20} color="#64748b" />
                {unreadCount > 0 && (
                  <span style={styles.notificationBadge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              {showNotifications && (
                <div style={styles.notificationPanel}>
                  <div style={styles.notificationHeader}>
                    <span>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ 
                        background: '#ef4444', 
                        color: 'white', 
                        padding: '0.1rem 0.5rem', 
                        borderRadius: '20px', 
                        fontSize: '0.6rem'
                      }}>
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      <Bell size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>No notifications</p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>You're all caught up! 🎉</p>
                    </div>
                  ) : (
                    <div 
                      style={styles.notificationItem(false)}
                      onClick={() => {
                        setShowNotifications(false)
                        setActiveTab('notifications')
                      }}
                    >
                      <div>📄</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>
                          You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Click to view all</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }} ref={profileRef}>
              <div 
                style={styles.profileAvatar} 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div style={styles.avatarImg}>
                  {profile?.profilePic ? (
                    <img 
                      src={getProfilePicUrl()} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        console.error('❌ Dashboard image error:', e.target.src);
                        const parent = e.target.parentElement;
                        if (parent) {
                          e.target.style.display = 'none';
                          parent.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
                          parent.style.width = '36px';
                          parent.style.height = '36px';
                          parent.style.borderRadius = '50%';
                          parent.style.display = 'flex';
                          parent.style.alignItems = 'center';
                          parent.style.justifyContent = 'center';
                          parent.style.color = 'white';
                          parent.style.fontSize = '0.875rem';
                          parent.style.fontWeight = '600';
                          parent.textContent = getInitials(profile.name);
                        }
                      }}
                    />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                  {profile.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={14} color="#64748b" />
              </div>
              {showProfileDropdown && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownHeaderAvatar}>
                      {profile?.profilePic ? (
                        <img 
                          src={getProfilePicUrl()} 
                          alt="Profile" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%', 
                            objectFit: 'cover' 
                          }}
                          onError={(e) => {
                            console.error('❌ Dropdown image error:', e.target.src);
                            const parent = e.target.parentElement;
                            if (parent) {
                              e.target.style.display = 'none';
                              parent.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
                              parent.style.width = '40px';
                              parent.style.height = '40px';
                              parent.style.borderRadius = '50%';
                              parent.style.display = 'flex';
                              parent.style.alignItems = 'center';
                              parent.style.justifyContent = 'center';
                              parent.style.color = 'white';
                              parent.style.fontSize = '0.9rem';
                              parent.style.fontWeight = '600';
                              parent.textContent = getInitials(profile.name);
                            }
                          }}
                        />
                      ) : (
                        getInitials(profile.name)
                      )}
                    </div>
                    <div style={styles.dropdownHeaderInfo}>
                      <div style={styles.dropdownHeaderName}>{profile.name || 'Student'}</div>
                      <div style={styles.dropdownHeaderEmail}>{profile.email || 'student@college.edu'}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }}></div>
                  <div 
                    style={styles.dropdownItem} 
                    onClick={() => { setActiveTab('profile'); setShowProfileDropdown(false) }}
                  >
                    <User size={16} /> My Profile
                  </div>
                  <div 
                    style={styles.dropdownItem} 
                    onClick={() => { setActiveTab('settings'); setShowProfileDropdown(false) }}
                  >
                    <SettingsIcon size={16} /> Settings
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }}></div>
                  <div style={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} color="#ef4444" /> <span style={{ color: '#ef4444' }}>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      {showApplyModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Confirm Application</h3>
            <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
              Are you sure you want to apply for
            </p>
            <p style={{ fontWeight: '600', color: '#1e293b' }}>
              {selectedJob.company || selectedJob.companyName} - {selectedJob.title || selectedJob.role}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem' }}>
              Package: {selectedJob.package}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setShowApplyModal(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmApply} disabled={applying} style={styles.confirmBtn}>
                {applying ? 'Applying...' : 'Confirm Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard