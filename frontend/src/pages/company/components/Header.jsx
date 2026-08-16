import { useState, useEffect, useRef } from 'react'
import { 
  Bell, User, LogOut, ChevronDown, 
  HelpCircle, Users, Briefcase, 
  Calendar, Award, Mail, Phone,
  FileText, MessageCircle, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'  // ✅ FIXED

function Header({ company, onLogout, onNotificationClick, onProfileClick, onDocumentationClick }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  
  const profileRef = useRef(null)
  const notificationRef = useRef(null)
  const helpRef = useRef(null)

  const token = localStorage.getItem('companyToken')

  // ✅ Fetch notifications from backend - FIXED
  const fetchNotifications = async () => {
    if (!token) {
      console.log('❌ No token found');
      setNotifications([]);
      return;
    }
    
    setLoading(true)
    try {
      console.log('📋 Fetching notifications for header...');
      console.log('🔑 Token:', token);
      
      const response = await axios.get(`${API_URL}/company/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Notifications Response:', response.data);
      
      if (response.data.success && response.data.notifications) {
        const formattedNotifs = response.data.notifications.map(n => ({
          id: n.id,
          title: n.title || 'Notification',
          message: n.message || '',
          read: n.read === true || n.is_read === 1,
          type: n.type || 'info',
          created_at: n.created_at,
          time: getTimeAgo(n.created_at)
        }))
        console.log('📊 Formatted notifications:', formattedNotifs);
        setNotifications(formattedNotifs)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
      console.error('❌ Error response:', error.response?.data)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ Mark notification as read - FIXED
  const handleMarkAsRead = async (id) => {
    try {
      console.log('📝 Marking notification as read:', id);
      
      const response = await axios.put(`${API_URL}/company/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📥 Response:', response.data);
      
      if (response.data.success) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ))
        toast.success('Marked as read')
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  // ✅ Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) {
        toast.info('No unread notifications');
        return;
      }
      
      await Promise.all(
        unreadIds.map(id =>
          axios.put(`${API_URL}/company/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )
      
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // ✅ Clear all notifications
  const handleClearAll = async () => {
    if (!window.confirm('Delete all notifications?')) return;
    
    try {
      await Promise.all(
        notifications.map(n =>
          axios.delete(`${API_URL}/company/notifications/${n.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )
      
      setNotifications([])
      toast.success('All notifications cleared')
    } catch (error) {
      console.error('❌ Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }

  // ✅ Fetch notifications on mount
  useEffect(() => {
    if (token) {
      fetchNotifications()
    }
  }, [token])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('companyToken')
    localStorage.removeItem('user')
    localStorage.removeItem('companyId')
    if (onLogout) {
      onLogout()
    } else {
      toast.success('Logged out successfully!')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }
  }

  // ==================== HELP FUNCTIONS ====================
  const handleDocumentation = () => {
    setShowHelp(false)
    if (onDocumentationClick) {
      onDocumentationClick()
    } else {
      window.location.href = '/company/documentation'
    }
    toast.success('📄 Loading documentation...')
  }

  const handleContactSupport = () => {
    setShowHelp(false)
    const subject = encodeURIComponent('Support Needed - Placement Portal')
    const body = encodeURIComponent(
      `Hello Support Team,\n\n` +
      `I need help with the Placement Portal.\n\n` +
      `Company: ${company?.name || 'N/A'}\n` +
      `HR: ${company?.hrName || company?.name || 'N/A'}\n` +
      `Email: ${company?.email || 'N/A'}\n\n` +
      `Issue Description:\n` +
      `[Please describe your issue here]\n\n` +
      `Regards,\n` +
      `${company?.hrName || company?.name || 'User'}`
    )
    window.location.href = `mailto:support@placementportal.com?subject=${subject}&body=${body}`
    toast.success('📧 Opening email...')
  }

  const handleWhatsAppSupport = () => {
    setShowHelp(false)
    const phone = '919876543210'
    const message = encodeURIComponent(
      `Hello! I need help with Placement Portal.\n\n` +
      `Company: ${company?.name || 'N/A'}\n` +
      `HR: ${company?.hrName || company?.name || 'N/A'}`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    toast.success('💬 Opening WhatsApp...')
  }

  const handleCallSupport = () => {
    setShowHelp(false)
    const phone = '+919876543210'
    window.location.href = `tel:${phone}`
    toast.success('📞 Opening phone...')
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'application': return <Users size={14} color="#3b82f6" />
      case 'interview': return <Calendar size={14} color="#8b5cf6" />
      case 'job': return <Briefcase size={14} color="#10b981" />
      default: return <Bell size={14} color="#f59e0b" />
    }
  }

  const getTimeAgo = (date) => {
    if (!date) return 'Just now'
    try {
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
    } catch {
      return 'Recently'
    }
  }

  const currentUnreadCount = notifications.filter(n => !n.read).length

  const getAvatarContent = () => {
    if (company?.logo) {
      return <img src={company.logo} alt="Company Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    }
    return company?.name?.charAt(0) || company?.hrName?.charAt(0) || 'C'
  }

  const getCompanyRole = () => {
    if (company?.status === 'approved' || company?.status === 'verified') {
      return 'Verified Recruiter'
    }
    if (company?.status === 'pending') {
      return 'Pending Verification'
    }
    return 'HR Manager'
  }

  const getShortName = () => {
    const name = company?.name || company?.companyName || 'Company'
    if (name.includes(' ')) {
      return name.split(' ')[0]
    }
    return name
  }

  const styles = {
    header: {
      background: 'white',
      borderRadius: '20px',
      padding: '0.75rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    greeting: {
      display: 'flex',
      flexDirection: 'column'
    },
    welcomeText: {
      fontSize: '0.7rem',
      color: '#64748b'
    },
    userName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    badge: {
      background: '#10b981',
      color: 'white',
      padding: '0.15rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      fontWeight: '500'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    iconBtn: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      background: '#ef4444',
      color: 'white',
      fontSize: '0.55rem',
      padding: '0.15rem 0.35rem',
      borderRadius: '20px',
      fontWeight: '600'
    },
    profileContainer: {
      position: 'relative'
    },
    profileBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.5rem 0.25rem 0.25rem',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '40px',
      cursor: 'pointer'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: '600',
      overflow: 'hidden',
      flexShrink: 0
    },
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    profileName: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    profileRole: {
      fontSize: '0.55rem',
      color: '#64748b'
    },
    dropdown: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '220px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 100,
      overflow: 'hidden'
    },
    dropdownHeader: {
      padding: '0.75rem 1rem',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    dropdownHeaderAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
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
      flex: 1
    },
    dropdownHeaderName: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    dropdownHeaderEmail: {
      fontSize: '0.6rem',
      color: '#64748b'
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
    divider: {
      height: '1px',
      background: '#e2e8f0',
      margin: '0.25rem 0'
    },
    notificationDropdown: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '360px',
      maxHeight: '450px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 100,
      overflow: 'hidden'
    },
    notificationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e2e8f0'
    },
    notificationTitle: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    notificationList: {
      maxHeight: '320px',
      overflowY: 'auto'
    },
    notificationItem: (read) => ({
      display: 'flex',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e2e8f0',
      background: read ? 'white' : '#f3e8ff',
      cursor: 'pointer',
      transition: 'background 0.2s ease'
    }),
    notificationMessage: {
      flex: 1
    },
    notificationTitleText: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    notificationTime: {
      fontSize: '0.55rem',
      color: '#94a3b8'
    },
    viewAllBtn: {
      padding: '0.6rem',
      textAlign: 'center',
      borderTop: '1px solid #e2e8f0',
      fontSize: '0.65rem',
      color: '#7c3aed',
      cursor: 'pointer'
    },
    helpDropdown: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '220px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 100,
      overflow: 'hidden'
    },
    helpItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.7rem',
      color: '#1e293b',
      borderBottom: '1px solid #f1f5f9'
    },
    helpItemLast: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.7rem',
      color: '#1e293b'
    }
  }

  return (
    <div style={styles.header}>
      <div style={styles.leftSection}>
        <div style={styles.greeting}>
          <span style={styles.welcomeText}>Welcome back,</span>
          <div style={styles.userName}>
            {company?.hrName || company?.name || 'HR'} <span style={styles.badge}>HR</span>
          </div>
        </div>
      </div>

      <div style={styles.rightSection}>
        {/* HELP BUTTON */}
        <div style={{ position: 'relative' }} ref={helpRef}>
          <div style={styles.iconBtn} onClick={() => setShowHelp(!showHelp)} title="Help & Support">
            <HelpCircle size={16} color="#64748b" />
          </div>
          {showHelp && (
            <div style={styles.helpDropdown}>
              <div style={styles.helpItem} onClick={handleDocumentation}>
                <FileText size={14} color="#3b82f6" />
                <span>Documentation</span>
                <ExternalLink size={12} color="#94a3b8" style={{ marginLeft: 'auto' }} />
              </div>
              <div style={styles.helpItem} onClick={handleContactSupport}>
                <Mail size={14} color="#8b5cf6" />
                <span>Contact Support</span>
              </div>
              <div style={styles.helpItem} onClick={handleWhatsAppSupport}>
                <MessageCircle size={14} color="#10b981" />
                <span>WhatsApp Support</span>
                <span style={{ fontSize: '0.55rem', color: '#94a3b8', marginLeft: 'auto' }}>+91 9876543210</span>
              </div>
              <div style={styles.helpItemLast} onClick={handleCallSupport}>
                <Phone size={14} color="#ef4444" />
                <span>Call Support</span>
                <span style={{ fontSize: '0.55rem', color: '#94a3b8', marginLeft: 'auto' }}>+91 9876543210</span>
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <div style={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
            <Bell size={16} />
            {currentUnreadCount > 0 && <span style={styles.notificationBadge}>{currentUnreadCount}</span>}
          </div>
          
          {showNotifications && (
            <div style={styles.notificationDropdown}>
              <div style={styles.notificationHeader}>
                <span style={styles.notificationTitle}>Notifications</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6rem', color: '#7c3aed', cursor: 'pointer' }} onClick={handleMarkAllRead}>Mark all read</span>
                  <span style={{ fontSize: '0.6rem', color: '#ef4444', cursor: 'pointer' }} onClick={handleClearAll}>Clear all</span>
                </div>
              </div>
              <div style={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.7rem' }}>No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={styles.notificationItem(notif.read)} onClick={() => handleMarkAsRead(notif.id)}>
                      <div>{getNotificationIcon(notif.type)}</div>
                      <div style={styles.notificationMessage}>
                        <div style={styles.notificationTitleText}>{notif.title}</div>
                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{notif.message}</div>
                        <div style={styles.notificationTime}>{notif.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={styles.viewAllBtn} onClick={() => { if (onNotificationClick) onNotificationClick(); setShowNotifications(false) }}>View all notifications</div>
            </div>
          )}
        </div>

        {/* PROFILE DROPDOWN */}
        <div style={styles.profileContainer} ref={profileRef}>
          <div style={styles.profileBtn} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div style={styles.avatar}>{getAvatarContent()}</div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{getShortName()}</span>
              <span style={styles.profileRole}>{getCompanyRole()}</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showProfileDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownHeaderAvatar}>{getAvatarContent()}</div>
                <div style={styles.dropdownHeaderInfo}>
                  <div style={styles.dropdownHeaderName}>{company?.name || company?.companyName || 'Company'}</div>
                  <div style={styles.dropdownHeaderEmail}>{company?.email || 'hr@company.com'}</div>
                </div>
              </div>
              <div style={styles.divider} />
              <div style={styles.dropdownItem} onClick={() => { if (onProfileClick) onProfileClick(); setShowProfileDropdown(false) }}>
                <User size={14} /> My Profile
              </div>
              <div style={styles.divider} />
              <div style={styles.dropdownItem} onClick={handleLogout}>
                <LogOut size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header