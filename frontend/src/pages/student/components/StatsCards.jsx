import { useState, useEffect } from 'react'
import { Eye, TrendingUp, Zap, Briefcase, Award, Calendar, CheckCircle, Target, Sparkles, Rocket, Clock, Users, ThumbsUp, Quote, Star, Activity } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ✅ API URL FIXED: Localhost 5000 pe chalega
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StatsCards({ stats: propStats, onNavigate }) {
  const [stats, setStats] = useState({
    appliedJobs: 0,
    shortlisted: 0,
    interviews: 0,
    offersReceived: 0,
    profileComplete: 0
  })
  const [currentQuote, setCurrentQuote] = useState(0)
  const [animated, setAnimated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])

  // ✅ TOKEN FIX: 'token' ki jagah 'studentToken' use kiya
  const token = localStorage.getItem('studentToken')

  const quotes = [
    { text: "Your next opportunity is just one application away. Keep pushing!", author: "Placement Cell" },
    { text: "Success is where preparation and opportunity meet.", author: "Bobby Unser" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  ]

  // ✅ Fetch dashboard stats from backend
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const data = response.data.stats
        setStats({
          appliedJobs: data.appliedJobs || 0,
          shortlisted: data.shortlisted || 0,
          interviews: data.interviews || 0,
          offersReceived: data.offersReceived || 0,
          profileComplete: data.profileComplete || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('studentToken')
        window.location.href = '/login'
      } else {
        toast.error('Failed to load dashboard stats')
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/recent-activities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success && response.data.activities) {
        setRecentActivities(response.data.activities)
      } else {
        setRecentActivities([])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('studentToken')
        window.location.href = '/login'
      } else {
        toast.error('Failed to load activities')
      }
      setRecentActivities([])
    }
  }

  // ✅ Fetch upcoming deadlines
  const fetchUpcomingDeadlines = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/upcoming-deadlines`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success && response.data.deadlines) {
        setUpcomingDeadlines(response.data.deadlines)
      } else {
        setUpcomingDeadlines([])
      }
    } catch (error) {
      console.error('Error fetching deadlines:', error)
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('studentToken')
        window.location.href = '/login'
      } else {
        toast.error('Failed to load deadlines')
      }
      setUpcomingDeadlines([])
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardStats()
      fetchRecentActivities()
      fetchUpcomingDeadlines()
    } else {
      setLoading(false)
    }
  }, [token])

  // Quote rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
      setAnimated(true)
      setTimeout(() => setAnimated(false), 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    { label: 'Applied Jobs', value: stats.appliedJobs, color: '#3b82f6', icon: Briefcase, link: 'jobs', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', delay: 0 },
    { label: 'Shortlisted', value: stats.shortlisted, color: '#10b981', icon: CheckCircle, link: 'applications', bg: 'linear-gradient(135deg, #10b981, #059669)', delay: 0.1 },
    { label: 'Interviews', value: stats.interviews, color: '#f59e0b', icon: Calendar, link: 'interviews', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', delay: 0.2 },
    { label: 'Offers Received', value: stats.offersReceived, color: '#8b5cf6', icon: Award, link: 'offers', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', delay: 0.3 },
  ]

  const getDaysLeft = (deadline) => {
    if (!deadline) return 0
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // ✅ STYLES OBJECT
  const styles = {
    container: {
      padding: '0.5rem 0'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: (bg, delay) => ({
      background: bg,
      borderRadius: '20px',
      padding: '1.25rem',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeInUp 0.5s ease ${delay}s both`
    }),
    statValue: {
      fontSize: '2rem',
      fontWeight: '800',
      letterSpacing: '-0.02em'
    },
    statLabel: {
      fontSize: '0.7rem',
      opacity: 0.85,
      marginTop: '0.25rem',
      fontWeight: '500'
    },
    statIcon: {
      position: 'absolute',
      bottom: '0.75rem',
      right: '0.75rem',
      opacity: 0.15
    },
    profileCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      animation: 'fadeInUp 0.5s ease 0.4s both',
      cursor: 'pointer'
    },
    profileValue: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#1e293b',
      letterSpacing: '-0.02em'
    },
    profileLabel: {
      fontSize: '0.7rem',
      color: '#64748b',
      marginTop: '0.25rem',
      fontWeight: '500'
    },
    progressBarContainer: {
      width: '100%',
      height: '8px',
      background: '#e2e8f0',
      borderRadius: '100px',
      marginTop: '0.75rem',
      overflow: 'hidden'
    },
    progressFill: (percent) => ({
      width: `${percent}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
      borderRadius: '100px',
      transition: 'width 0.5s ease'
    }),
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    cardTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 0',
      borderBottom: '1px solid #f1f5f9',
      transition: 'all 0.2s ease'
    },
    deadlineItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    deadlineBadge: (days) => ({
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.65rem',
      fontWeight: '600',
      background: days <= 5 ? '#fee2e2' : '#d1fae5',
      color: days <= 5 ? '#dc2626' : '#065f46'
    }),
    quoteCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '1.25rem',
      marginTop: '1rem',
      color: 'white',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    quoteText: {
      fontSize: '0.9rem',
      fontWeight: '500',
      lineHeight: '1.4',
      marginBottom: '0.5rem',
      transition: 'opacity 0.3s ease'
    },
    quoteAuthor: {
      fontSize: '0.7rem',
      opacity: 0.8
    },
    progressSection: {
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: '20px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      animation: 'fadeInUp 0.5s ease 0.5s both'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .stat-card:hover svg {
          animation: pulse 0.5s ease;
        }
        .activity-item:hover {
          background: #f8fafc;
          transform: translateX(4px);
          border-radius: 12px;
          padding-left: 0.5rem;
        }
        .deadline-item:hover {
          background: #f8fafc;
          transform: translateX(4px);
          border-radius: 12px;
          padding-left: 0.5rem;
        }
      `}</style>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map(card => (
          <div
            key={card.label}
            onClick={() => onNavigate && onNavigate(card.link)}
            style={styles.statCard(card.bg, card.delay)}
            className="stat-card"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div>
              <div style={styles.statValue}>{card.value}</div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
            <card.icon size={48} style={styles.statIcon} />
          </div>
        ))}
        
        {/* Profile Complete Card */}
        <div
          style={styles.profileCard}
          className="stat-card"
          onClick={() => onNavigate && onNavigate('profile')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={styles.profileValue}>{stats.profileComplete}%</div>
              <div style={styles.profileLabel}>Profile Complete</div>
            </div>
            <Eye size={20} color="#94a3b8" />
          </div>
          <div style={styles.progressBarContainer}>
            <div style={styles.progressFill(stats.profileComplete)}></div>
          </div>
        </div>
      </div>

      {/* Placement Journey Section */}
      <div style={styles.progressSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} /> Placement Journey
            </div>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Great progress! Keep going 🚀</p>
          </div>
          <Rocket size={20} style={{ opacity: 0.8 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px' }}>
              <div style={{ width: `${stats.profileComplete}%`, height: '100%', background: 'white', borderRadius: '100px', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{stats.profileComplete}%</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumnGrid}>
        {/* Recent Activity */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Activity size={16} color="#3b82f6" /> Recent Activity
          </div>
          {recentActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.7rem' }}>
              No recent activities
            </div>
          ) : (
            recentActivities.map((activity, idx) => (
              <div key={idx} style={styles.activityItem} className="activity-item">
                <div style={{ fontSize: '1.2rem' }}>{activity.icon || '📌'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#1e293b' }}>{activity.text}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem' }}>{activity.time}</div>
                </div>
              </div>
            ))
          )}
          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <span 
              onClick={() => onNavigate && onNavigate('notifications')} 
              style={{ fontSize: '0.7rem', color: '#2563eb', cursor: 'pointer' }}
            >
              View all activity →
            </span>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Clock size={16} color="#f59e0b" /> Upcoming Deadlines
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.7rem' }}>
              No upcoming deadlines
            </div>
          ) : (
            upcomingDeadlines.map((deadline, idx) => {
              const daysLeft = deadline.daysLeft || getDaysLeft(deadline.deadline)
              return (
                <div key={idx} style={styles.deadlineItem} className="deadline-item">
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>{deadline.company}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{deadline.role}</div>
                  </div>
                  <div>
                    <div style={styles.deadlineBadge(daysLeft)}>
                      {daysLeft} days left
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <span 
              onClick={() => onNavigate && onNavigate('jobs')} 
              style={{ fontSize: '0.7rem', color: '#2563eb', cursor: 'pointer' }}
            >
              View all deadlines →
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Quote with Animation */}
      <div style={styles.quoteCard}>
        <Quote size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
        <div style={{ ...styles.quoteText, opacity: animated ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
          "{quotes[currentQuote].text}"
        </div>
        <div style={styles.quoteAuthor}>— {quotes[currentQuote].author}</div>
      </div>

      {/* Celebration Banner (when profile is high) */}
      {stats.profileComplete >= 80 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderRadius: '16px',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          marginTop: '1rem',
          animation: 'fadeInUp 0.5s ease'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Star size={14} /> Great job! You're in the top 20% of students! <Star size={14} />
          </p>
        </div>
      )}
    </div>
  )
}

export default StatsCards