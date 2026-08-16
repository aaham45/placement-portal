import React, { useState, useEffect, useCallback } from 'react'
import { 
  Bell, CheckCircle, XCircle, AlertCircle, Info, 
  Users, Clock, Eye, Trash2, Send, Search,
  Check, Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Notifications() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  })

  const token = localStorage.getItem('adminToken')

  // Get time ago - FIXED
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
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    } catch {
      return 'Recently'
    }
  }

  // Format notification from backend
  const formatNotification = (notif) => ({
    id: notif.id,
    title: notif.title || 'Notification',
    message: notif.message || notif.content || '',
    type: notif.type || 'info',
    target: notif.target || 'all',
    read: notif.is_read === 1 || notif.is_read === true || notif.read === true,
    createdAt: notif.created_at || notif.createdAt,
    time: getTimeAgo(notif.created_at || notif.createdAt)
  })

  // --- FETCH NOTIFICATIONS ---
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        const data = response.data.notifications || response.data.data || []
        const formatted = data.map(formatNotification)
        setNotifications(formatted)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchNotifications()
    } else {
      setNotifications([])
      setLoading(false)
    }
  }, [token, fetchNotifications])

  // --- MARK AS READ ---
  const handleMarkAsRead = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/notifications/${id}/read`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ))
        toast.success('Marked as read')
      } else {
        toast.error('Failed to mark as read')
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  // --- MARK ALL READ ---
  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) {
      toast.info('All notifications are already read')
      return
    }

    try {
      let successCount = 0
      for (const id of unreadIds) {
        try {
          await axios.put(`${API_URL}/admin/notifications/${id}/read`, {}, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          successCount++
        } catch (e) {
          console.error(`Failed to mark ${id}:`, e)
        }
      }
      
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success(`${successCount} notifications marked as read`)
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // --- DELETE SINGLE ---
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return
    
    try {
      const response = await axios.delete(`${API_URL}/admin/notifications/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        setNotifications(notifications.filter(n => n.id !== id))
        toast.success('Notification deleted')
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  // --- DELETE ALL --- ✅ UPDATED
  const handleDeleteAll = async () => {
    if (notifications.length === 0) {
      toast.info('No notifications to delete')
      return
    }
    if (!window.confirm('Are you sure you want to delete all notifications?')) return
    
    try {
      // ✅ SINGLE API CALL - clear-all endpoint
      const response = await axios.delete(`${API_URL}/admin/notifications/clear-all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        setNotifications([])
        toast.success(response.data.message || 'All notifications cleared!')
      } else {
        toast.error(response.data.message || 'Failed to clear notifications')
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
      // Agar backend fail ho toh frontend se hatao
      setNotifications([])
      toast.success('Notifications cleared locally')
    }
  }

  // --- SEND NOTIFICATION ---
  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill title and message')
      return
    }
    
    setSending(true)
    try {
      const response = await axios.post(`${API_URL}/admin/notifications/send`, newNotification, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success(`Notification sent successfully!`)
        fetchNotifications()
        setShowSendModal(false)
        setNewNotification({ title: '', message: '', type: 'info', target: 'all' })
      } else {
        toast.error(response.data.message || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      const newNotif = {
        id: Date.now(),
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        target: newNotification.target,
        read: false,
        createdAt: new Date().toISOString(),
        time: 'Just now'
      }
      setNotifications([newNotif, ...notifications])
      toast.success('Notification added locally!')
      setShowSendModal(false)
      setNewNotification({ title: '', message: '', type: 'info', target: 'all' })
    } finally {
      setSending(false)
    }
  }

  // --- EXPORT TO EXCEL ---
  const handleExport = () => {
    if (notifications.length === 0) {
      toast.error('No notifications to export')
      return
    }

    try {
      const exportData = notifications.map(n => ({
        'Title': n.title,
        'Message': n.message,
        'Type': n.type,
        'Target': getTargetLabel(n.target),
        'Status': n.read ? 'Read' : 'Unread',
        'Time': n.time,
        'Date': n.createdAt ? new Date(n.createdAt).toLocaleString() : ''
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Notifications')
      XLSX.writeFile(wb, `notifications_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Notifications exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    }
  }

  const getTypeStyles = (type) => {
    const styles = {
      success: { bg: '#d1fae5', color: '#059669', icon: CheckCircle },
      error: { bg: '#fee2e2', color: '#dc2626', icon: XCircle },
      warning: { bg: '#fef3c7', color: '#f59e0b', icon: AlertCircle },
      info: { bg: '#dbeafe', color: '#3b82f6', icon: Info }
    }
    return styles[type] || styles.info
  }

  const getTargetLabel = (target) => {
    const labels = {
      all: 'All Users',
      students: 'Students Only',
      companies: 'Companies Only',
      admin: 'Admins Only'
    }
    return labels[target] || target || 'All Users'
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = (notif.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (notif.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || notif.type === filterType
    const matchesTab = activeTab === 'all' ? true : 
                       activeTab === 'unread' ? !notif.read :
                       activeTab === notif.target
    return matchesSearch && matchesType && matchesTab
  })

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    today: notifications.filter(n => {
      const time = n.time || ''
      return time === 'Just now' || time === '1 hour ago' || time === '2 hours ago'
    }).length
  }

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
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    actionBtns: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    btnPrimary: {
      padding: '0.5rem 1rem',
      background: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnOutline: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnDanger: {
      padding: '0.5rem 1rem',
      background: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: (color) => ({
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      textAlign: 'center',
      borderTop: `3px solid ${color}`
    }),
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.65rem',
      color: '#64748b'
    },
    tabsContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '0.5rem',
      flexWrap: 'wrap'
    },
    tab: (isActive, color) => ({
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      background: isActive ? color : '#f1f5f9',
      color: isActive ? 'white' : '#64748b'
    }),
    filterBar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      flex: 1,
      maxWidth: '300px'
    },
    searchInput: {
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '0.85rem',
      width: '100%'
    },
    filterSelect: {
      padding: '0.5rem 1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '0.85rem',
      background: 'white',
      cursor: 'pointer'
    },
    notificationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    notificationItem: (read, typeColor) => ({
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: read ? 'white' : `${typeColor}08`,
      borderRadius: '16px',
      border: `1px solid ${read ? '#e2e8f0' : typeColor + '30'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    }),
    notificationIcon: (bg, color) => ({
      width: '40px',
      height: '40px',
      background: bg,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color
    }),
    notificationContent: {
      flex: 1
    },
    notificationTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    notificationMessage: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginBottom: '0.5rem'
    },
    notificationMeta: {
      display: 'flex',
      gap: '1rem',
      fontSize: '0.65rem',
      color: '#94a3b8'
    },
    notificationActions: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    },
    actionIcon: {
      padding: '0.25rem',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#94a3b8'
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
      maxWidth: '500px',
      width: '90%'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
    },
    modalTitle: {
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      color: '#64748b'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginBottom: '0.25rem',
      color: '#64748b'
    },
    formInput: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none'
    },
    formSelect: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      background: 'white',
      cursor: 'pointer'
    },
    formTextarea: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    btnSecondary: {
      flex: 1,
      padding: '0.6rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer'
    },
    loadingState: {
      textAlign: 'center',
      padding: '3rem'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#8b5cf6',
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
          <p>Loading notifications...</p>
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
        </div>
        <div style={styles.actionBtns}>
          <button onClick={() => setShowSendModal(true)} style={styles.btnPrimary}>
            <Send size={14} /> Send
          </button>
          <button onClick={handleMarkAllRead} style={styles.btnOutline}>
            <Check size={14} /> Mark All Read
          </button>
          <button onClick={handleDeleteAll} style={styles.btnDanger}>
            <Trash2 size={14} /> Clear All
          </button>
          <button onClick={handleExport} style={styles.btnOutline}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.unread}</div>
          <div style={styles.statLabel}>Unread</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.today}</div>
          <div style={styles.statLabel}>Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button onClick={() => setActiveTab('all')} style={styles.tab(activeTab === 'all', '#8b5cf6')}>All</button>
        <button onClick={() => setActiveTab('unread')} style={styles.tab(activeTab === 'unread', '#f59e0b')}>Unread</button>
        <button onClick={() => setActiveTab('students')} style={styles.tab(activeTab === 'students', '#3b82f6')}>Students</button>
        <button onClick={() => setActiveTab('companies')} style={styles.tab(activeTab === 'companies', '#10b981')}>Companies</button>
        <button onClick={() => setActiveTab('admin')} style={styles.tab(activeTab === 'admin', '#8b5cf6')}>Admin</button>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput} 
          />
        </div>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)} 
          style={styles.filterSelect}
        >
          <option value="all">All Types</option>
          <option value="info">Information</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Notifications List */}
      <div style={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map(notif => {
            const typeStyle = getTypeStyles(notif.type)
            const Icon = typeStyle.icon
            return (
              <div 
                key={notif.id} 
                style={styles.notificationItem(notif.read, typeStyle.color)}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              >
                <div style={styles.notificationIcon(typeStyle.bg, typeStyle.color)}>
                  <Icon size={18} />
                </div>
                <div style={styles.notificationContent}>
                  <div style={styles.notificationTitle}>
                    {notif.title}
                    {!notif.read && (
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        background: '#8b5cf6', 
                        color: 'white', 
                        padding: '0.1rem 0.5rem', 
                        borderRadius: '12px', 
                        fontSize: '0.55rem' 
                      }}>
                        New
                      </span>
                    )}
                  </div>
                  <div style={styles.notificationMessage}>{notif.message}</div>
                  <div style={styles.notificationMeta}>
                    <span><Clock size={10} /> {notif.time}</span>
                    <span><Users size={10} /> To: {getTargetLabel(notif.target)}</span>
                  </div>
                </div>
                <div style={styles.notificationActions}>
                  {!notif.read && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id) }} 
                      style={styles.actionIcon} 
                      title="Mark as read"
                    >
                      <Eye size={16} color="#3b82f6" />
                    </div>
                  )}
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id) }} 
                    style={styles.actionIcon} 
                    title="Delete"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div style={styles.modalOverlay} onClick={() => setShowSendModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Send Notification</div>
              <button onClick={() => setShowSendModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Target Audience</label>
              <select 
                value={newNotification.target} 
                onChange={(e) => setNewNotification({...newNotification, target: e.target.value})} 
                style={styles.formSelect}
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="companies">Companies Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Type</label>
              <select 
                value={newNotification.type} 
                onChange={(e) => setNewNotification({...newNotification, type: e.target.value})} 
                style={styles.formSelect}
              >
                <option value="info">Information</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Title *</label>
              <input 
                type="text" 
                value={newNotification.title} 
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})} 
                placeholder="Notification title" 
                style={styles.formInput} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Message *</label>
              <textarea 
                value={newNotification.message} 
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})} 
                placeholder="Notification message" 
                style={styles.formTextarea} 
                rows="3" 
              />
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowSendModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleSendNotification} disabled={sending} style={styles.btnPrimary}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications