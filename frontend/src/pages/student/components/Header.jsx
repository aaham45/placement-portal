// frontend/src/pages/student/components/Header.jsx

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, LogOut, ChevronDown, 
  Moon, Sun, HelpCircle, Mail, Phone,
  FileText, MessageCircle, Briefcase, Calendar, Award, X, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Header({ student, onLogout, onNotificationClick, onProfileClick }) {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // ✅ For notification popup
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const helpRef = useRef(null);
  const popupRef = useRef(null);

  // ✅ Direct state - No Context
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // ✅ Fetch notifications directly
  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
        setUnreadCount(formatted.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
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
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
      return true;
    } catch (error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
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
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return false;
    }
  };

  // ✅ Clear all
  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await axios.delete(`${API_URL}/student/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
      return true;
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      return false;
    }
  };

  // ✅ Handle notification click - Show popup (not full page)
  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setSelectedNotification(notif);
    setShowNotificationPopup(true);
    setShowNotifications(false);
  };

  // ✅ Handle view all - Navigate to notifications page
  const handleViewAll = () => {
    setShowNotifications(false);
    if (onNotificationClick) onNotificationClick();
    navigate('/student/notifications');
  };

  // ✅ Close popup
  const closePopup = () => {
    setShowNotificationPopup(false);
    setSelectedNotification(null);
  };

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.style.background = '#1e293b';
      document.body.style.color = '#f1f5f9';
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.background = '#1e293b';
      document.body.style.color = '#f1f5f9';
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.background = '#f1f5f9';
      document.body.style.color = '#1e293b';
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Fetch notifications on mount
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false);
      }
      // Close popup on outside click
      if (showNotificationPopup && popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationPopup]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    if (onLogout) {
      onLogout();
    } else {
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    toast.success(`${!darkMode ? 'Dark' : 'Light'} mode activated`);
  };

  const handleRefresh = () => {
    fetchNotifications();
    toast.success('Notifications refreshed 🔄');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'application': return <Briefcase size={16} color="#3b82f6" />;
      case 'interview': return <Calendar size={16} color="#8b5cf6" />;
      case 'job': return <Briefcase size={16} color="#10b981" />;
      case 'success': return <Award size={16} color="#10b981" />;
      case 'warning': return <Bell size={16} color="#f59e0b" />;
      default: return <Bell size={16} color="#f59e0b" />;
    }
  };

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
      background: '#dbeafe',
      color: '#2563eb',
      padding: '0.15rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      fontWeight: '500'
    },
    statsContainer: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.8rem',
      background: '#f8fafc',
      borderRadius: '10px'
    },
    statValue: {
      fontSize: '0.85rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.65rem',
      color: '#64748b'
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
      fontWeight: '600',
      minWidth: '18px',
      textAlign: 'center'
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
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
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
      width: '220px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'slideDown 0.2s ease'
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
      maxHeight: '450px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'slideDown 0.2s ease'
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
      background: read ? 'white' : '#eff6ff',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      '&:hover': {
        background: read ? '#f8fafc' : '#dbeafe'
      }
    }),
    notificationMessage: {
      flex: 1,
      minWidth: 0
    },
    notificationTitleText: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#1e293b',
      marginBottom: '0.2rem'
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
      color: '#2563eb',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      '&:hover': {
        background: '#eff6ff'
      }
    },
    helpDropdown: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '210px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'slideDown 0.2s ease'
    },
    helpItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 1rem',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      fontSize: '0.7rem',
      color: '#1e293b'
    },
    // ✅ Popup Styles - Modal Overlay
    popupOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease'
    },
    popup: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.5rem',
      maxWidth: '420px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
      animation: 'slideUp 0.3s ease',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      position: 'relative'
    },
    popupHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.75rem'
    },
    popupTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    popupCloseBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      padding: '0.25rem',
      borderRadius: '50%',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    popupBody: {
      marginTop: '0.5rem'
    },
    popupMessage: {
      fontSize: '0.85rem',
      color: '#475569',
      lineHeight: '1.6',
      marginBottom: '0.75rem'
    },
    popupTime: {
      fontSize: '0.65rem',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    popupType: {
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      fontWeight: '600',
      marginTop: '0.5rem'
    },
    popupTypeApplication: {
      background: '#dbeafe',
      color: '#2563eb'
    },
    popupTypeInterview: {
      background: '#ede9fe',
      color: '#8b5cf6'
    },
    popupTypeJob: {
      background: '#d1fae5',
      color: '#10b981'
    },
    popupTypeInfo: {
      background: '#fef3c7',
      color: '#d97706'
    }
  };

  // Add animation styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <>
      {/* ✅ Notification Popup - Modal (Not Full Page) */}
      {showNotificationPopup && selectedNotification && (
        <div style={styles.popupOverlay} onClick={closePopup}>
          <div style={styles.popup} ref={popupRef} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <div style={styles.popupTitle}>
                {getNotificationIcon(selectedNotification.type)}
                <span>{selectedNotification.title}</span>
              </div>
              <button onClick={closePopup} style={styles.popupCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.popupBody}>
              <p style={styles.popupMessage}>{selectedNotification.message}</p>
              <div style={styles.popupTime}>
                <Clock size={14} /> {selectedNotification.time}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{
                  ...styles.popupType,
                  ...(selectedNotification.type === 'application' ? styles.popupTypeApplication :
                      selectedNotification.type === 'interview' ? styles.popupTypeInterview :
                      selectedNotification.type === 'job' ? styles.popupTypeJob :
                      styles.popupTypeInfo)
                }}>
                  {selectedNotification.type === 'application' ? '📄 Application' :
                   selectedNotification.type === 'interview' ? '📅 Interview' :
                   selectedNotification.type === 'job' ? '💼 Job' : '🔔 Notification'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.leftSection}>
          <div style={styles.greeting}>
            <span style={styles.welcomeText}>Welcome back,</span>
            <div style={styles.userName}>
              {student?.name || 'Student'} <span style={styles.badge}>Student</span>
            </div>
          </div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <Briefcase size={14} color="#3b82f6" />
            <div>
              <div style={styles.statValue}>{student?.appliedJobs || 0}</div>
              <div style={styles.statLabel}>Applied Jobs</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <Award size={14} color="#10b981" />
            <div>
              <div style={styles.statValue}>{student?.shortlisted || 0}</div>
              <div style={styles.statLabel}>Shortlisted</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <Calendar size={14} color="#8b5cf6" />
            <div>
              <div style={styles.statValue}>{student?.interviews || 0}</div>
              <div style={styles.statLabel}>Interviews</div>
            </div>
          </div>
        </div>

        <div style={styles.rightSection}>
          {/* Dark Mode Toggle */}
          <div style={styles.iconBtn} onClick={handleThemeToggle} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            {darkMode ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#64748b" />}
          </div>

          {/* Help Button */}
          <div style={{ position: 'relative' }} ref={helpRef}>
            <div style={styles.iconBtn} onClick={() => setShowHelp(!showHelp)} title="Help">
              <HelpCircle size={16} />
            </div>
            {showHelp && (
              <div style={styles.helpDropdown}>
                <div style={styles.helpItem} onClick={() => window.open('/docs', '_blank')}>
                  <FileText size={14} /> Documentation
                </div>
                <div style={styles.helpItem} onClick={() => toast.success('Email: support@cutm.ac.in')}>
                  <Mail size={14} /> Contact Support
                </div>
                <div style={styles.helpItem} onClick={() => toast.success('WhatsApp: +91 94370 12345')}>
                  <MessageCircle size={14} /> WhatsApp Support
                </div>
                <div style={styles.helpItem} onClick={() => toast.success('Call: +91 94370 12345')}>
                  <Phone size={14} /> Call Support
                </div>
              </div>
            )}
          </div>

          {/* ✅ Notifications - Click to open popup */}
          <div style={{ position: 'relative' }} ref={notificationRef}>
            <div 
              style={styles.iconBtn} 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
            </div>
            
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationHeader}>
                  <span style={styles.notificationTitle}>Notifications</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {notifications.some(n => !n.read) && (
                      <span style={{ fontSize: '0.6rem', color: '#2563eb', cursor: 'pointer' }} onClick={markAllAsRead}>
                        Mark all read
                      </span>
                    )}
                    {notifications.length > 0 && (
                      <span style={{ fontSize: '0.6rem', color: '#ef4444', cursor: 'pointer' }} onClick={clearAll}>
                        Clear all
                      </span>
                    )}
                    <span style={{ fontSize: '0.6rem', color: '#2563eb', cursor: 'pointer' }} onClick={handleRefresh}>
                      🔄 Refresh
                    </span>
                  </div>
                </div>
                <div style={styles.notificationList}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.7rem' }}>Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.7rem' }}>No notifications</div>
                  ) : (
                    notifications.slice(0, 8).map(notif => (
                      <div 
                        key={notif.id} 
                        style={styles.notificationItem(notif.read)} 
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div style={{ marginTop: '0.1rem' }}>{getNotificationIcon(notif.type)}</div>
                        <div style={styles.notificationMessage}>
                          <div style={styles.notificationTitleText}>{notif.title}</div>
                          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{notif.message}</div>
                          <div style={styles.notificationTime}>{notif.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                  {notifications.length > 8 && (
                    <div style={{ textAlign: 'center', padding: '0.3rem', fontSize: '0.6rem', color: '#94a3b8' }}>
                      +{notifications.length - 8} more notifications
                    </div>
                  )}
                </div>
                <div style={styles.viewAllBtn} onClick={handleViewAll}>
                  View all notifications →
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div style={styles.profileContainer} ref={profileRef}>
            <div style={styles.profileBtn} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
              <div style={styles.avatar}>{student?.name?.charAt(0) || 'S'}</div>
              <div style={styles.profileInfo}>
                <span style={styles.profileName}>{student?.name?.split(' ')[0] || 'Student'}</span>
                <span style={styles.profileRole}>Student</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {showProfileDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={{ fontWeight: '600', fontSize: '0.75rem', color: '#1e293b' }}>{student?.name || 'Student'}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{student?.email || 'student@cutm.ac.in'}</div>
                </div>
                <div style={styles.divider} />
                <div style={styles.dropdownItem} onClick={() => { 
                  if (onProfileClick) onProfileClick(); 
                  setShowProfileDropdown(false);
                }}>
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
    </>
  );
}

export default Header;