import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, Calendar, Briefcase, UserCheck, Mail, Trash2, CheckCheck, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ✅ STYLES OBJECT
const styles = {
  container: {
    background: 'white',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
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
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    background: '#ef4444',
    color: 'white',
    padding: '0.15rem 0.5rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  filtersBar: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1rem'
  },
  filterBtn: (active) => ({
    padding: '0.4rem 0.8rem',
    background: active ? '#7c3aed' : '#f1f5f9',
    color: active ? 'white' : '#64748b',
    border: 'none',
    borderRadius: '20px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }),
  actionBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  actionBtnPrimary: {
    padding: '0.4rem 0.8rem',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  actionBtnDanger: {
    padding: '0.4rem 0.8rem',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  notificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  notificationItem: (read) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    background: read ? 'white' : '#f3e8ff',
    borderRadius: '16px',
    border: `1px solid ${read ? '#e2e8f0' : '#d8b4fe'}`,
    transition: 'all 0.2s ease',
    cursor: 'default'
  }),
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  notificationMessage: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginBottom: '0.25rem',
    lineHeight: '1.4'
  },
  notificationTime: {
    fontSize: '0.6rem',
    color: '#94a3b8'
  },
  newBadge: {
    fontSize: '0.55rem',
    background: '#7c3aed',
    color: 'white',
    padding: '0.1rem 0.4rem',
    borderRadius: '10px',
    fontWeight: '500'
  },
  notificationActions: {
    display: 'flex',
    gap: '0.3rem',
    flexShrink: 0
  },
  iconBtn: {
    padding: '0.3rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBtnRead: {
    padding: '0.3rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: '#d1fae5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBtnDelete: {
    padding: '0.3rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    margin: '0 auto 1rem'
  }
}

// Helper function to get time ago
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

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const token = localStorage.getItem('companyToken')

  // ✅ FETCH NOTIFICATIONS - FIXED
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      console.log('📋 Fetching notifications...')
      
      const response = await axios.get(`${API_URL}/company/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📊 Notifications Response:', response.data)
      
      if (response.data.success) {
        const formattedNotifs = (response.data.notifications || []).map(notif => {
          // ✅ FIX: Properly handle read status
          const isRead = notif.read === true || notif.is_read === 1 || notif.is_read === true;
          return {
            id: notif.id,
            title: notif.title || 'Notification',
            message: notif.message || '',
            time: getTimeAgo(notif.created_at),
            read: isRead,
            type: notif.type || 'info',
            created_at: notif.created_at
          }
        })
        console.log('📊 Formatted notifications:', formattedNotifs.map(n => ({ id: n.id, read: n.read })))
        setNotifications(formattedNotifs)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
      setNotifications([])
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchNotifications()
    } else {
      console.log('❌ No token found')
      setNotifications([])
      setLoading(false)
    }
  }, [token])

  // ✅ MARK SINGLE AS READ - FIXED
  const handleMarkAsRead = async (id) => {
    if (updating) return
    setUpdating(true)
    
    try {
      console.log(`📝 Marking notification ${id} as read...`)
      
      const response = await axios.put(`${API_URL}/company/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📥 Response:', response.data)
      
      if (response.data.success) {
        // ✅ Update local state using functional update
        setNotifications(prev => 
          prev.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        )
        toast.success('Marked as read')
      } else {
        toast.error(response.data.message || 'Failed to mark as read')
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error)
      toast.error('Failed to mark as read')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ MARK ALL AS READ - FIXED
  const handleMarkAllAsRead = async () => {
    if (updating) return
    setUpdating(true)
    
    try {
      console.log('📝 Marking all notifications as read...')
      
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      
      if (unreadIds.length === 0) {
        toast.info('No unread notifications')
        setUpdating(false)
        return
      }
      
      // ✅ Mark each unread notification as read
      await Promise.all(
        unreadIds.map(id =>
          axios.put(`${API_URL}/company/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )
      
      // ✅ Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ DELETE SINGLE
  const handleDelete = async (id) => {
    if (updating) return
    setUpdating(true)
    
    try {
      console.log(`🗑️ Deleting notification ${id}...`)
      
      await axios.delete(`${API_URL}/company/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('❌ Error deleting notification:', error)
      toast.error('Failed to delete notification')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ CLEAR ALL
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return
    if (updating) return
    setUpdating(true)
    
    try {
      console.log('🗑️ Clearing all notifications...')
      
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
    } finally {
      setUpdating(false)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeIcon = (type) => {
    switch(type) {
      case 'application': return <UserCheck size={16} color="#3b82f6" />
      case 'interview': return <Calendar size={16} color="#8b5cf6" />
      case 'job': return <Briefcase size={16} color="#10b981" />
      case 'success': return <CheckCircle size={16} color="#10b981" />
      case 'warning': return <XCircle size={16} color="#f59e0b" />
      default: return <Bell size={16} color="#f59e0b" />
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ color: '#64748b' }}>Loading notifications...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <Bell size={18} color="white" />
          </div>
          <span>Notifications</span>
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount} new</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={styles.actionBtnPrimary}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClearAll} style={styles.actionBtnDanger}>
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div style={styles.filtersBar}>
        <button onClick={() => setFilter('all')} style={styles.filterBtn(filter === 'all')}>
          All ({notifications.length})
        </button>
        <button onClick={() => setFilter('unread')} style={styles.filterBtn(filter === 'unread')}>
          Unread ({unreadCount})
        </button>
        <button onClick={() => setFilter('read')} style={styles.filterBtn(filter === 'read')}>
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={styles.emptyState}>
          {notifications.length === 0 ? (
            <>
              <Bell size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <p>No notifications</p>
              <p style={{ fontSize: '0.7rem' }}>You're all caught up!</p>
            </>
          ) : (
            <>
              <Bell size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <p>No notifications match your filter</p>
              <button 
                onClick={() => setFilter('all')} 
                style={{ ...styles.actionBtn, marginTop: '0.5rem' }}
              >
                Show all
              </button>
            </>
          )}
        </div>
      ) : (
        <div style={styles.notificationList}>
          {filteredNotifications.map(notif => (
            <div key={notif.id} style={styles.notificationItem(notif.read)}>
              <div style={{ marginTop: '0.15rem' }}>{getTypeIcon(notif.type)}</div>
              <div style={styles.notificationContent}>
                <div style={styles.notificationTitle}>
                  {notif.title}
                  {!notif.read && (
                    <span style={styles.newBadge}>New</span>
                  )}
                </div>
                <div style={styles.notificationMessage}>{notif.message}</div>
                <div style={styles.notificationTime}>{notif.time}</div>
              </div>
              <div style={styles.notificationActions}>
                {!notif.read ? (
                  <button 
                    onClick={() => handleMarkAsRead(notif.id)} 
                    style={styles.iconBtnRead}
                    title="Mark as read"
                  >
                    <Eye size={14} color="#059669" />
                  </button>
                ) : (
                  <button 
                    style={styles.iconBtn}
                    title="Already read"
                    disabled
                  >
                    <EyeOff size={14} color="#94a3b8" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notif.id)} 
                  style={styles.iconBtnDelete}
                  title="Delete"
                >
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications