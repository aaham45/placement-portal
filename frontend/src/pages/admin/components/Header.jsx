import React, { useState, useEffect, useRef } from 'react'
import { 
  Bell, User, LogOut, ChevronDown, 
  Settings, CheckCircle, XCircle, AlertCircle,
  Building2, Users, Briefcase, Calendar, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Header({ onLogout, onNotificationClick, onProfileClick }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const profileRef = useRef(null)
  const notificationRef = useRef(null)

  const token = localStorage.getItem('adminToken')

  // Fetch admin profile
  const fetchAdminProfile = async () => {
    if (!token) return
    
    try {
      const response = await axios.get(`${API_URL}/admin/profile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success && response.data.profile) {
        setAdmin(response.data.profile)
      } else {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        setAdmin({
          name: userData.name || 'Admin',
          email: userData.email || 'admin@cutm.ac.in',
          avatar: 'A'
        })
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setAdmin({
        name: userData.name || 'Admin',
        email: userData.email || 'admin@cutm.ac.in',
        avatar: 'A'
      })
    }
  }

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([])
      setLoading(false)
      return
    }
    
    try {
      const response = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        const data = response.data.notifications || response.data.data || []
        const formattedNotifs = data.map(notif => ({
          id: notif.id,
          title: notif.title || 'Notification',
          message: notif.message || notif.content || '',
          time: getTimeAgo(notif.created_at || notif.createdAt),
          read: notif.is_read === 1 || notif.read === true,
          type: notif.type || 'info',
          created_at: notif.created_at || notif.createdAt
        }))
        setNotifications(formattedNotifs)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    if (!token) return
    
    try {
      await axios.put(`${API_URL}/admin/notifications/${id}/read`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      toast.success('Marked as read')
    } catch (error) {
      console.error('Error marking as read:', error)
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    }
  }

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (!token) return
    
    try {
      for (const notif of notifications.filter(n => !n.read)) {
        await axios.put(`${API_URL}/admin/notifications/${notif.id}/read`, {}, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  // ✅ FIX: Clear all notifications - Backend se bhi delete karo
  const handleClearAll = async () => {
    if (notifications.length === 0) {
      toast.info('No notifications to clear')
      return
    }
    
    if (!window.confirm('Are you sure you want to delete all notifications?')) return
    
    try {
      // ✅ Backend se delete karo
      for (const notif of notifications) {
        await axios.delete(`${API_URL}/admin/notifications/${notif.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
      setNotifications([])
      toast.success('All notifications cleared from server!')
    } catch (error) {
      console.error('Error clearing notifications:', error)
      // Agar backend delete fail ho toh frontend se hatao
      setNotifications([])
      toast.success('Notifications cleared locally')
    }
  }

  // Refresh notifications
  const handleRefreshNotifications = async () => {
    setRefreshing(true)
    await fetchNotifications()
    setRefreshing(false)
    toast.success('Notifications refreshed')
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('user')
    localStorage.removeItem('currentUserRole')
    toast.success('Logged out successfully')
    if (onLogout) {
      onLogout()
    } else {
      window.location.href = '/'
    }
  }

  // Handle profile click
  const handleProfileClick = () => {
    setShowProfileDropdown(false)
    if (onProfileClick) {
      onProfileClick()
    }
  }

  // Handle notification click
  const handleNotificationClick = () => {
    setShowNotifications(false)
    if (onNotificationClick) {
      onNotificationClick()
    }
  }

  // Get time ago helper
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

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchAdminProfile()
      fetchNotifications()
    } else {
      setLoading(false)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setAdmin({
        name: userData.name || 'Admin',
        email: userData.email || 'admin@cutm.ac.in',
        avatar: 'A'
      })
    }
  }, [token])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'company': return <Building2 size={14} color="#3b82f6" />
      case 'student': return <Users size={14} color="#10b981" />
      case 'job': return <Briefcase size={14} color="#8b5cf6" />
      case 'drive': return <Calendar size={14} color="#f59e0b" />
      case 'success': return <CheckCircle size={14} color="#10b981" />
      case 'warning': return <AlertCircle size={14} color="#f59e0b" />
      case 'error': return <XCircle size={14} color="#ef4444" />
      default: return <Bell size={14} color="#94a3b8" />
    }
  }

  const getNotificationBg = (read, type) => {
    if (read) return '#ffffff'
    switch(type) {
      case 'company': return '#eff6ff'
      case 'student': return '#ecfdf5'
      case 'job': return '#f3e8ff'
      case 'drive': return '#fef3c7'
      case 'success': return '#ecfdf5'
      case 'warning': return '#fef3c7'
      case 'error': return '#fef2f2'
      default: return '#f8fafc'
    }
  }

  const currentUnreadCount = notifications.filter(n => !n.read).length

  const styles = {
    header: {
      background: 'white',
      borderRadius: '20px',
      padding: '0.75rem 1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
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
      gap: '0.5rem'
    },
    badge: {
      background: '#d1fae5',
      color: '#059669',
      padding: '0.15rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      fontWeight: '500'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      position: 'relative'
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
      transition: 'all 0.2s ease',
      color: '#64748b'
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
      background: 'linear-gradient(135deg, #059669, #10b981)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: '600'
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
      width: '240px',
      background: 'white',
      borderRadius: '14px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 100,
      overflow: 'hidden'
    },
    dropdownHeader: {
      padding: '0.75rem 1rem',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
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
      width: '380px',
      maxHeight: '480px',
      background: 'white',
      borderRadius: '14px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
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
      maxHeight: '340px',
      overflowY: 'auto'
    },
    notificationItem: (read, bg) => ({
      display: 'flex',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e2e8f0',
      background: bg,
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
      color: '#94a3b8',
      marginTop: '0.25rem'
    },
    viewAllBtn: {
      padding: '0.6rem',
      textAlign: 'center',
      borderTop: '1px solid #e2e8f0',
      fontSize: '0.65rem',
      color: '#059669',
      cursor: 'pointer'
    },
    refreshIcon: {
      marginLeft: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    spinning: {
      animation: 'spin 0.6s linear infinite'
    }
  }

  return (
    <div style={styles.header}>
      <div>
        <div style={styles.welcomeText}>Welcome back,</div>
        <div style={styles.userName}>
          {admin?.name || 'Admin'} <span style={styles.badge}>Admin</span>
        </div>
      </div>

      <div style={styles.rightSection}>
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <div style={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
            <Bell size={16} />
            {currentUnreadCount > 0 && <span style={styles.notificationBadge}>{currentUnreadCount}</span>}
          </div>
          
          {showNotifications && (
            <div style={styles.notificationDropdown}>
              <div style={styles.notificationHeader}>
                <span style={styles.notificationTitle}>Notifications</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span 
                    style={{ fontSize: '0.6rem', color: '#059669', cursor: 'pointer' }} 
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </span>
                  <span 
                    style={{ fontSize: '0.6rem', color: '#ef4444', cursor: 'pointer' }} 
                    onClick={handleClearAll}
                  >
                    Clear all
                  </span>
                  <div style={styles.refreshIcon} onClick={handleRefreshNotifications}>
                    <RefreshCw size={12} style={refreshing ? styles.spinning : {}} />
                  </div>
                </div>
              </div>
              <div style={styles.notificationList}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.7rem' }}>
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.7rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      style={styles.notificationItem(notif.read, getNotificationBg(notif.read, notif.type))}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <div>{getNotificationIcon(notif.type)}</div>
                      <div style={styles.notificationMessage}>
                        <div style={styles.notificationTitleText}>{notif.title}</div>
                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{notif.message}</div>
                        <div style={styles.notificationTime}>{notif.time}</div>
                      </div>
                      {!notif.read && <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }} />}
                    </div>
                  ))
                )}
              </div>
              <div style={styles.viewAllBtn} onClick={handleNotificationClick}>
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={styles.profileContainer} ref={profileRef}>
          <div style={styles.profileBtn} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div style={styles.avatar}>{admin?.avatar || admin?.name?.charAt(0) || 'A'}</div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{admin?.name?.split(' ')[0] || 'Admin'}</span>
              <span style={styles.profileRole}>Administrator</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showProfileDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <div style={{ fontWeight: '600', fontSize: '0.75rem', color: '#1e293b' }}>
                  {admin?.name || 'Admin'}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                  {admin?.email || 'admin@cutm.ac.in'}
                </div>
              </div>
              <div style={styles.divider} />
              <div style={styles.dropdownItem} onClick={handleProfileClick}>
                <User size={14} /> My Profile
              </div>
              <div style={styles.dropdownItem} onClick={handleProfileClick}>
                <Settings size={14} /> Settings
              </div>
              <div style={styles.divider} />
              <div style={styles.dropdownItem} onClick={handleLogout}>
                <LogOut size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Header