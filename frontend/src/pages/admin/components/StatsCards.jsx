import React, { useState, useEffect } from 'react'
import { 
  Users, Building2, Briefcase, Award, TrendingUp, DollarSign,
  UserCheck, UserX, Clock, Calendar, CheckCircle, AlertCircle,
  BarChart3, PieChart, Activity, Zap, Target, Eye, FileText,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StatsCards() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [usingMock, setUsingMock] = useState(false)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    activeJobs: 0,
    placedStudents: 0,
    placementRate: 0,
    highestPackage: 0,
    totalApplications: 0,
    pendingApprovals: 0,
    ongoingDrives: 0,
    avgPackage: 0
  })

  const token = localStorage.getItem('adminToken')

  // Fetch stats from backend
  const fetchStats = async (showToast = false) => {
    console.log('🔑 Admin Token:', token ? '✅ Present' : '❌ Missing')
    
    if (!token) {
      console.log('❌ No admin token found')
      setStats({
        totalStudents: 0,
        totalCompanies: 0,
        activeJobs: 0,
        placedStudents: 0,
        placementRate: 0,
        highestPackage: 0,
        totalApplications: 0,
        pendingApprovals: 0,
        ongoingDrives: 0,
        avgPackage: 0
      })
      setUsingMock(false)
      setLoading(false)
      return
    }

    try {
      console.log('📊 Fetching admin stats...')
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Stats Response:', response.data)
      
      if (response.data.success && response.data.stats) {
        console.log('✅ Stats data received:', response.data.stats)
        setStats(response.data.stats)
        setUsingMock(false)
        if (showToast) {
          toast.success('Stats refreshed!')
        }
      } else {
        console.log('❌ Stats API returned success: false')
        setStats({
          totalStudents: 0,
          totalCompanies: 0,
          activeJobs: 0,
          placedStudents: 0,
          placementRate: 0,
          highestPackage: 0,
          totalApplications: 0,
          pendingApprovals: 0,
          ongoingDrives: 0,
          avgPackage: 0
        })
        setUsingMock(false)
        if (showToast) {
          toast.error('Unable to load live data')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      setStats({
        totalStudents: 0,
        totalCompanies: 0,
        activeJobs: 0,
        placedStudents: 0,
        placementRate: 0,
        highestPackage: 0,
        totalApplications: 0,
        pendingApprovals: 0,
        ongoingDrives: 0,
        avgPackage: 0
      })
      setUsingMock(false)
      if (showToast) {
        toast.error('Failed to fetch stats')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats(true)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      id: 1,
      title: 'Total Students',
      value: stats.totalStudents?.toLocaleString() || 0,
      icon: Users,
      color: '#3b82f6',
      bg: '#dbeafe',
      change: '+0%',
      changeType: 'neutral',
      description: 'Registered students',
      key: 'totalStudents'
    },
    {
      id: 2,
      title: 'Companies',
      value: stats.totalCompanies?.toLocaleString() || 0,
      icon: Building2,
      color: '#10b981',
      bg: '#d1fae5',
      change: '+0%',
      changeType: 'neutral',
      description: 'Registered companies',
      key: 'totalCompanies'
    },
    {
      id: 3,
      title: 'Active Jobs',
      value: stats.activeJobs?.toLocaleString() || 0,
      icon: Briefcase,
      color: '#8b5cf6',
      bg: '#ede9fe',
      change: '+0%',
      changeType: 'neutral',
      description: 'Open positions',
      key: 'activeJobs'
    },
    {
      id: 4,
      title: 'Placed Students',
      value: stats.placedStudents?.toLocaleString() || 0,
      icon: Award,
      color: '#f59e0b',
      bg: '#fef3c7',
      change: '+0%',
      changeType: 'neutral',
      description: 'Successfully placed',
      key: 'placedStudents'
    },
    {
      id: 5,
      title: 'Placement Rate',
      value: `${stats.placementRate || 0}%`,
      icon: TrendingUp,
      color: '#ec4899',
      bg: '#fce7f3',
      change: '+0%',
      changeType: 'neutral',
      description: 'Overall placement',
      key: 'placementRate',
      showProgress: true
    },
    {
      id: 6,
      title: 'Highest Package',
      value: `${stats.highestPackage || 0} LPA`,
      icon: DollarSign,
      color: '#06b6d4',
      bg: '#cffafe',
      change: '+0 LPA',
      changeType: 'neutral',
      description: 'Highest CTC offered',
      key: 'highestPackage'
    },
    {
      id: 7,
      title: 'Total Applications',
      value: stats.totalApplications?.toLocaleString() || 0,
      icon: FileText,
      color: '#a855f7',
      bg: '#f3e8ff',
      change: '+0%',
      changeType: 'neutral',
      description: 'Job applications',
      key: 'totalApplications'
    },
    {
      id: 8,
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: Clock,
      color: '#f97316',
      bg: '#ffedd5',
      change: '0',
      changeType: 'neutral',
      description: 'Awaiting verification',
      key: 'pendingApprovals'
    },
    {
      id: 9,
      title: 'Ongoing Drives',
      value: stats.ongoingDrives || 0,
      icon: Calendar,
      color: '#14b8a6',
      bg: '#ccfbf1',
      change: '0',
      changeType: 'neutral',
      description: 'Active placement drives',
      key: 'ongoingDrives'
    },
    {
      id: 10,
      title: 'Avg Package',
      value: `${stats.avgPackage || 0} LPA`,
      icon: TrendingUp,
      color: '#f43f5e',
      bg: '#ffe4e6',
      change: '+0 LPA',
      changeType: 'neutral',
      description: 'Average CTC',
      key: 'avgPackage'
    }
  ]

  const getChangeColor = (changeType) => {
    if (changeType === 'increase') return '#10b981'
    if (changeType === 'decrease') return '#ef4444'
    return '#64748b'
  }

  const getChangeIcon = (changeType) => {
    if (changeType === 'increase') return '↑'
    if (changeType === 'decrease') return '↓'
    return '→'
  }

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.75rem'
    },
    iconWrapper: (color, bg) => ({
      width: '48px',
      height: '48px',
      background: bg,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color
    }),
    moreBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      padding: '0.25rem',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    cardContent: {
      marginBottom: '0.75rem'
    },
    value: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    title: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    changeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      flexWrap: 'wrap'
    },
    changeBadge: (changeType, changeColor) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.2rem 0.5rem',
      background: changeType === 'increase' ? '#d1fae5' : changeType === 'decrease' ? '#fee2e2' : '#f1f5f9',
      borderRadius: '20px',
      fontSize: '0.65rem',
      fontWeight: '600',
      color: changeColor
    }),
    description: {
      fontSize: '0.65rem',
      color: '#94a3b8'
    },
    progressBar: {
      marginTop: '0.75rem',
      height: '4px',
      background: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: (percent) => ({
      width: `${Math.min(100, Math.max(0, percent))}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #059669, #10b981)',
      borderRadius: '4px',
      transition: 'width 1s ease'
    }),
    footer: {
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    trendIcon: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.6rem',
      color: '#64748b'
    },
    loadingState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    },
    mockBadge: {
      background: '#fef3c7',
      color: '#d97706',
      padding: '0.2rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1
    },
    refreshBtn: {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 100,
      transition: 'transform 0.2s'
    },
    spinning: {
      animation: 'spin 0.6s linear infinite'
    },
    loader: {
      width: '2rem',
      height: '2rem',
      border: '3px solid #e2e8f0',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={styles.card}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={styles.loader}></div>
            </div>
          </div>
        ))}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <div style={styles.container}>
        {statCards.map((stat) => {
          const Icon = stat.icon
          const changeColor = getChangeColor(stat.changeType)
          const changeIcon = getChangeIcon(stat.changeType)
          const showProgress = stat.showProgress || stat.id === 5
          
          return (
            <div 
              key={stat.id} 
              style={styles.card}
              onClick={() => {
                console.log(`Clicked on ${stat.title}`)
              }}
            >
              {usingMock && <div style={styles.mockBadge}>Demo</div>}
              
              <div style={styles.cardHeader}>
                <div style={styles.iconWrapper(stat.color, stat.bg)}>
                  <Icon size={24} />
                </div>
                <button 
                  style={styles.moreBtn} 
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.info(`${stat.title}: ${stat.value}`)
                  }}
                >
                  <Eye size={14} />
                  <span style={{ fontSize: '0.6rem' }}>Details</span>
                </button>
              </div>

              <div style={styles.cardContent}>
                <div style={styles.value}>{stat.value}</div>
                <div style={styles.title}>{stat.title}</div>
              </div>

              <div style={styles.changeContainer}>
                <span style={styles.changeBadge(stat.changeType, changeColor)}>
                  {changeIcon} {stat.change}
                </span>
                <span style={styles.description}>{stat.description}</span>
              </div>

              {showProgress && (
                <div style={styles.progressBar}>
                  <div style={styles.progressFill(stats.placementRate)}></div>
                </div>
              )}

              <div style={styles.footer}>
                <div style={styles.trendIcon}>
                  <Activity size={12} />
                  <span>vs last month</span>
                </div>
                <div style={styles.trendIcon}>
                  <Target size={12} />
                  <span>View details</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Refresh Button */}
      <button 
        style={styles.refreshBtn}
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw size={20} style={refreshing ? styles.spinning : {}} />
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        button:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  )
}

export default StatsCards