// frontend/src/pages/student/components/Notifications.jsx

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Calendar, Briefcase, UserCheck, Mail, Trash2, CheckCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Notifications({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const token = localStorage.getItem('studentToken');

  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    try {
      const now = new Date();
      const then = new Date(date);
      const diffMs = now - then;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return 'Recently';
    }
  };

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('📤 Fetching notifications...');
      const response = await axios.get(`${API_URL}/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📥 Notifications response:', response.data);
      
      if (response.data.success) {
        const data = response.data.notifications || [];
        const formatted = data.map(n => ({
          id: n.id,
          title: n.title || 'Notification',
          message: n.message || '',
          read: n.is_read === 1 || n.is_read === true,
          type: n.type || 'info',
          time: n.time || getTimeAgo(n.created_at),
          created_at: n.created_at
        }));
        setNotifications(formatted);
        console.log('✅ Notifications set:', formatted.length);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/student/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      toast.success('Marked as read ✅');
      return true;
    } catch (error) {
      console.error('❌ Mark read error:', error);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return false;
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/student/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read ✅');
      return true;
    } catch (error) {
      console.error('❌ Mark all read error:', error);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return false;
    }
  };

  // ✅ Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/student/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted 🗑️');
      return true;
    } catch (error) {
      console.error('❌ Delete error:', error);
      setNotifications(prev => prev.filter(n => n.id !== id));
      return false;
    }
  };

  // ✅ Clear all notifications
  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await axios.delete(`${API_URL}/student/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      toast.success('All notifications cleared 🗑️');
      return true;
    } catch (error) {
      console.error('❌ Clear all error:', error);
      setNotifications([]);
      return false;
    }
  };

  // ✅ Refresh
  const handleRefresh = () => {
    fetchNotifications();
    toast.success('Notifications refreshed 🔄');
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'application': return <UserCheck size={16} color="#3b82f6" />;
      case 'interview': return <Calendar size={16} color="#8b5cf6" />;
      case 'job': return <Briefcase size={16} color="#10b981" />;
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <XCircle size={16} color="#f59e0b" />;
      default: return <Bell size={16} color="#f59e0b" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => {
    if (showUnreadOnly) return !n.read;
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const styles = {
    container: {
      background: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      width: '100%',
      maxWidth: '100%'
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
      fontWeight: '600',
      marginLeft: '0.5rem'
    },
    filtersBar: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '1.5rem',
      justifyContent: 'space-between'
    },
    filterGroup: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    filterBtn: (active) => ({
      padding: '0.4rem 0.8rem',
      background: active ? '#f59e0b' : '#f1f5f9',
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
    refreshBtn: {
      padding: '0.4rem 0.8rem',
      background: 'transparent',
      color: '#2563eb',
      border: '1px solid #2563eb',
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
      maxHeight: '550px',
      overflowY: 'auto',
      paddingRight: '0.25rem'
    },
    notificationItem: (read) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1rem',
      background: read ? 'white' : '#fef3c7',
      borderRadius: '16px',
      border: `1px solid ${read ? '#e2e8f0' : '#fde68a'}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }),
    notificationContent: {
      flex: 1,
      minWidth: 0
    },
    notificationTitle: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    notificationMessage: {
      fontSize: '0.7rem',
      color: '#64748b',
      marginBottom: '0.25rem',
      wordWrap: 'break-word'
    },
    notificationTime: {
      fontSize: '0.6rem',
      color: '#94a3b8'
    },
    actionIcons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      flexShrink: 0
    },
    iconBtn: {
      padding: '0.25rem',
      borderRadius: '6px',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    },
    loadingState: {
      textAlign: 'center',
      padding: '3rem'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#f59e0b',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    },
    notificationCount: {
      fontSize: '0.65rem',
      color: '#94a3b8'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading notifications...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
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
          <button onClick={() => setShowUnreadOnly(!showUnreadOnly)} style={styles.filterBtn(showUnreadOnly)}>
            {showUnreadOnly ? <Eye size={12} /> : <EyeOff size={12} />} Unread Only
          </button>
          <button onClick={handleRefresh} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={styles.actionBtn}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} style={{ ...styles.actionBtn, color: '#dc2626' }}>
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div style={styles.filtersBar}>
        <div style={styles.filterGroup}>
          <button onClick={() => setFilter('all')} style={styles.filterBtn(filter === 'all')}>All</button>
          <button onClick={() => setFilter('unread')} style={styles.filterBtn(filter === 'unread')}>Unread</button>
          <button onClick={() => setFilter('read')} style={styles.filterBtn(filter === 'read')}>Read</button>
        </div>
        <span style={styles.notificationCount}>
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={styles.emptyState}>
          <Bell size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>No notifications</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>You're all caught up! 🎉</p>
        </div>
      ) : (
        <div style={styles.notificationList}>
          {filteredNotifications.map(notif => (
            <div 
              key={notif.id} 
              style={styles.notificationItem(notif.read)}
              onClick={() => {
                if (!notif.read) {
                  markAsRead(notif.id);
                }
                // ✅ Navigate to notification details or stay on page
                if (onNotificationClick) {
                  onNotificationClick(notif);
                }
              }}
            >
              <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
                {getTypeIcon(notif.type)}
              </div>
              <div style={styles.notificationContent}>
                <div style={styles.notificationTitle}>{notif.title}</div>
                <div style={styles.notificationMessage}>{notif.message}</div>
                <div style={styles.notificationTime}>{notif.time}</div>
              </div>
              <div style={styles.actionIcons}>
                {!notif.read && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      markAsRead(notif.id); 
                    }} 
                    style={styles.iconBtn} 
                    title="Mark as read"
                  >
                    <CheckCircle size={14} color="#10b981" />
                  </button>
                )}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    deleteNotification(notif.id); 
                  }} 
                  style={styles.iconBtn} 
                  title="Delete"
                >
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .notification-list::-webkit-scrollbar {
          width: 4px;
        }
        .notification-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .notification-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default Notifications;