import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Building2, Briefcase, Award, 
  Calendar, Clock, CheckCircle, AlertCircle, Bell,
  ArrowUp, ArrowDown, Eye, EyeOff, Download, RefreshCw,
  Target, Zap, DollarSign, MapPin, Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [quickStats, setQuickStats] = useState({
    todayApplications: 0,
    todayInterviews: 0,
    pendingApprovals: 0,
    activeDrives: 0
  })

  const token = localStorage.getItem('adminToken')

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/overview`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Dashboard Overview Response:', response.data)
      
      if (response.data.success) {
        setRecentActivities(response.data.recentActivities || [])
        setUpcomingEvents(response.data.upcomingEvents || [])
        setQuickStats(response.data.quickStats || {
          todayApplications: 0,
          todayInterviews: 0,
          pendingApprovals: 0,
          activeDrives: 0
        })
      } else {
        setRecentActivities([])
        setUpcomingEvents([])
        setQuickStats({
          todayApplications: 0,
          todayInterviews: 0,
          pendingApprovals: 0,
          activeDrives: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setRecentActivities([])
      setUpcomingEvents([])
      setQuickStats({
        todayApplications: 0,
        todayInterviews: 0,
        pendingApprovals: 0,
        activeDrives: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [token])

  const handleRefresh = () => {
    if (token) {
      fetchDashboardData()
      toast.success('Dashboard refreshed!')
    } else {
      toast.error('Please login to refresh')
    }
  }

  const getDaysLeftColor = (days) => {
    if (days <= 3) return '#ef4444'
    if (days <= 7) return '#f59e0b'
    return '#10b981'
  }

  const getActivityIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={12} color="#10b981" />
      case 'warning': return <AlertCircle size={12} color="#f59e0b" />
      default: return <Bell size={12} color="#3b82f6" />
    }
  }

  const getActivityBgColor = (type) => {
    switch(type) {
      case 'success': return '#d1fae5'
      case 'warning': return '#fef3c7'
      default: return '#dbeafe'
    }
  }

  const styles = {
    container: {
      marginTop: '1.5rem'
    },
    grid2Col: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.25rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    cardTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    refreshBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '0.25rem',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.7rem'
    },
    activitiesList: {
      maxHeight: '300px',
      overflowY: 'auto'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    activityIcon: (type) => ({
      width: '28px',
      height: '28px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: getActivityBgColor(type)
    }),
    activityContent: {
      flex: 1
    },
    activityText: {
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    activityTime: {
      fontSize: '0.6rem',
      color: '#94a3b8',
      marginTop: '0.2rem'
    },
    upcomingEvent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    eventDate: (days) => ({
      minWidth: '50px',
      textAlign: 'center',
      padding: '0.25rem 0.5rem',
      background: getDaysLeftColor(days) + '15',
      borderRadius: '8px',
      fontSize: '0.7rem',
      fontWeight: '600',
      color: getDaysLeftColor(days)
    }),
    eventTitle: {
      flex: 1,
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    eventDays: (days) => ({
      fontSize: '0.65rem',
      color: getDaysLeftColor(days)
    }),
    quickStatsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    quickStatCard: (color) => ({
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '0.75rem',
      textAlign: 'center',
      borderTop: `2px solid ${color}`,
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }),
    quickStatValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    quickStatLabel: {
      fontSize: '0.65rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#059669',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    },
    welcomeStats: {
      display: 'flex',
      gap: '2rem',
      flexWrap: 'wrap',
      marginTop: '0.5rem'
    },
    welcomeStatItem: {
      fontSize: '0.85rem',
      color: '#64748b'
    },
    welcomeStatValue: {
      fontWeight: '600',
      color: '#059669'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Quick Stats */}
      <div style={styles.quickStatsGrid}>
        <div style={styles.quickStatCard('#3b82f6')}>
          <div style={styles.quickStatValue}>{quickStats.todayApplications}</div>
          <div style={styles.quickStatLabel}>Today's Applications</div>
        </div>
        <div style={styles.quickStatCard('#8b5cf6')}>
          <div style={styles.quickStatValue}>{quickStats.todayInterviews}</div>
          <div style={styles.quickStatLabel}>Today's Interviews</div>
        </div>
        <div style={styles.quickStatCard('#f59e0b')}>
          <div style={styles.quickStatValue}>{quickStats.pendingApprovals}</div>
          <div style={styles.quickStatLabel}>Pending Approvals</div>
        </div>
        <div style={styles.quickStatCard('#10b981')}>
          <div style={styles.quickStatValue}>{quickStats.activeDrives}</div>
          <div style={styles.quickStatLabel}>Active Drives</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.grid2Col}>
        {/* Recent Activities */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <Clock size={16} color="#3b82f6" />
              <span>Recent Activities</span>
            </div>
            <button onClick={handleRefresh} style={styles.refreshBtn}>
              <RefreshCw size={14} />
              <span style={{ fontSize: '0.65rem' }}>Refresh</span>
            </button>
          </div>
          <div style={styles.activitiesList}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={activity.id || index} style={styles.activityItem}>
                  <div style={styles.activityIcon(activity.type || 'info')}>
                    {getActivityIcon(activity.type || 'info')}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityText}>{activity.action || activity.message || 'Activity'}</div>
                    <div style={styles.activityTime}>{activity.time || 'Just now'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                No recent activities
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <Calendar size={16} color="#8b5cf6" />
              <span>Upcoming Events</span>
            </div>
          </div>
          <div>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <div key={event.id || index} style={styles.upcomingEvent}>
                  <div style={styles.eventDate(event.daysLeft || 0)}>
                    {event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                  </div>
                  <div style={styles.eventTitle}>{event.title || 'Event'}</div>
                  <div style={styles.eventDays(event.daysLeft || 0)}>
                    {event.daysLeft === 0 ? 'Today' : event.daysLeft ? `${event.daysLeft} days left` : 'Soon'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                No upcoming events
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            <Zap size={16} color="#f59e0b" />
            <span>Admin Dashboard Overview</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Welcome to the Admin Dashboard! Here's what's happening today:
          </p>
          <div style={styles.welcomeStats}>
            <div style={styles.welcomeStatItem}>
              <span style={styles.welcomeStatValue}>{quickStats.todayApplications}</span> new applications
            </div>
            <div style={styles.welcomeStatItem}>
              <span style={styles.welcomeStatValue}>{quickStats.todayInterviews}</span> interviews scheduled
            </div>
            <div style={styles.welcomeStatItem}>
              <span style={styles.welcomeStatValue}>{quickStats.pendingApprovals}</span> pending approvals
            </div>
            <div style={styles.welcomeStatItem}>
              <span style={styles.welcomeStatValue}>{quickStats.activeDrives}</span> active placement drives
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview