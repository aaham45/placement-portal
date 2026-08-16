// frontend/src/pages/student/components/InterviewSchedule.jsx
// ✅ COMPLETE FIXED - Status sahi dikhega, Completed interviews "Upcoming" mein nahi dikhenge

import { useState, useEffect } from 'react'
import { Calendar, Clock, Video, MapPin, Phone, Users, CheckCircle, XCircle, AlertCircle, ExternalLink, CalendarDays, ChevronLeft, ChevronRight, Eye, Building, Briefcase, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function InterviewSchedule() {
  const [viewMode, setViewMode] = useState('upcoming')
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    selected: 0
  })

  const token = localStorage.getItem('studentToken')

  // ✅ Fetch interviews with logo and clean link
  const fetchInterviews = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📝 Interviews Response:', response.data)
      
      if (response.data.success && response.data.interviews) {
        const formattedInterviews = response.data.interviews.map(interview => {
          let dateObj = null
          let dateStr = 'TBD'
          let timeStr = 'TBD'
          
          if (interview.scheduled_date) {
            dateObj = new Date(interview.scheduled_date)
            if (!isNaN(dateObj.getTime())) {
              dateStr = dateObj.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
              timeStr = dateObj.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })
            }
          }
          
          // ✅ Clean link extraction
          let cleanLink = interview.meeting_link || interview.link || null;
          if (cleanLink) {
            const urlMatch = cleanLink.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
              cleanLink = urlMatch[0];
            } else {
              const meetMatch = cleanLink.match(/meet\.google\.com\/[a-z-]+/i);
              if (meetMatch) {
                cleanLink = `https://${meetMatch[0]}`;
              }
            }
            if (cleanLink && !cleanLink.startsWith('http')) {
              cleanLink = null;
            }
          }
          
          // ✅ IMPORTANT: Normalize status
          let normalizedStatus = (interview.status || '').toLowerCase().trim();
          
          // ✅ Map status to standard values
          if (normalizedStatus === 'completed' || normalizedStatus === 'done' || normalizedStatus === 'finished') {
            normalizedStatus = 'completed';
          } else if (normalizedStatus === 'scheduled' || normalizedStatus === 'upcoming' || normalizedStatus === 'interview') {
            normalizedStatus = 'scheduled';
          } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
            normalizedStatus = 'cancelled';
          } else if (normalizedStatus === 'rescheduled') {
            normalizedStatus = 'rescheduled';
          }
          
          console.log(`📊 Interview ${interview.id} status: ${interview.status} → ${normalizedStatus}`);
          
          return {
            id: interview.id,
            company: interview.companyName || interview.company || 'Company',
            role: interview.job_title || interview.role || 'Role',
            round: interview.interview_type || interview.round || 'Technical',
            date: dateStr,
            time: timeStr,
            dateObj: dateObj,
            mode: interview.mode || 'Online',
            duration: interview.duration || '60 min',
            venue: interview.venue || 'Online Meeting',
            link: cleanLink,
            interviewer: interview.interviewer_name || 'HR Team',
            interviewerRole: interview.interviewer_role || 'Recruiter',
            status: normalizedStatus,  // ✅ Use normalized status
            type: interview.interview_type || 'Technical',
            tips: interview.tips || 'Prepare well for the interview',
            requirements: interview.requirements ? 
              (Array.isArray(interview.requirements) ? interview.requirements : interview.requirements.split(',')) : 
              ['Keep resume ready', 'Be on time'],
            feedback: interview.feedback || null,
            result: interview.result || null,
            companyLogo: interview.company_logo || null
          }
        })
        setInterviews(formattedInterviews)
        console.log('✅ Formatted Interviews with statuses:', formattedInterviews.map(i => ({ id: i.id, status: i.status })))
      } else {
        setInterviews([])
      }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      setInterviews([])
      toast.error('Failed to load interview schedule')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Status badge function - complete mapping
  const getStatusBadge = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    const statusMap = {
      'scheduled': { icon: '📅', text: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' },
      'upcoming': { icon: '📅', text: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' },
      'completed': { icon: '✅', text: 'Completed', color: '#10b981', bg: '#d1fae5' },
      'done': { icon: '✅', text: 'Completed', color: '#10b981', bg: '#d1fae5' },
      'finished': { icon: '✅', text: 'Completed', color: '#10b981', bg: '#d1fae5' },
      'cancelled': { icon: '❌', text: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
      'canceled': { icon: '❌', text: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
      'rescheduled': { icon: '🔄', text: 'Rescheduled', color: '#f59e0b', bg: '#fef3c7' },
      'pending': { icon: '⏳', text: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
      'interview': { icon: '📅', text: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' },
    };
    
    return statusMap[normalizedStatus] || { 
      icon: '📌', 
      text: status || 'Scheduled', 
      color: '#64748b', 
      bg: '#f1f5f9' 
    };
  };

  // ✅ FIXED: Result badge function
  const getResultBadge = (result) => {
    const normalizedResult = (result || '').toLowerCase().trim();
    
    if (normalizedResult === 'selected') {
      return { icon: '✅', text: 'Selected', color: '#10b981', bg: '#d1fae5' }
    } else if (normalizedResult === 'rejected') {
      return { icon: '❌', text: 'Rejected', color: '#ef4444', bg: '#fee2e2' }
    }
    return { icon: '⏳', text: 'Pending', color: '#f59e0b', bg: '#fef3c7' }
  }

  // ✅ FIXED: Calculate stats with proper status filtering
  const calculateStats = (interviewList) => {
    // ✅ Only count 'scheduled' or 'upcoming' as upcoming
    const upcomingList = interviewList.filter(i => 
      i.status === 'scheduled' || i.status === 'upcoming' || i.status === 'interview'
    )
    // ✅ Count 'completed' as completed
    const completedList = interviewList.filter(i => 
      i.status === 'completed' || i.status === 'done' || i.status === 'finished'
    )
    const selectedList = completedList.filter(i => 
      i.result === 'selected'
    )
    
    setStats({
      total: interviewList.length,
      upcoming: upcomingList.length,
      completed: completedList.length,
      selected: selectedList.length
    })
  }

  useEffect(() => {
    if (token) {
      fetchInterviews()
    } else {
      setInterviews([])
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    calculateStats(interviews)
  }, [interviews])

  // ✅ FIXED: Filter interviews based on status - EXACT matching
  // ✅ ONLY scheduled/upcoming interviews show in Upcoming tab
  const upcomingInterviews = interviews.filter(i => 
    i.status === 'scheduled' || i.status === 'upcoming' || i.status === 'interview'
  )
  
  // ✅ ONLY completed/done/finished interviews show in Past tab
  const pastInterviews = interviews.filter(i => 
    i.status === 'completed' || i.status === 'done' || i.status === 'finished'
  )

  const handleJoinInterview = (interview) => {
    if (interview.link && interview.link.startsWith('http')) {
      window.open(interview.link, '_blank');
      toast.success(`Joining ${interview.company} interview...`);
    } else {
      toast.info(`No meeting link available. Interview venue: ${interview.venue}`);
    }
  }

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview)
    setShowDetailsModal(true)
  }

  const getCompanyInitial = (company) => {
    return company?.charAt(0) || 'C'
  }

  const getCompanyLogo = (companyName) => {
    const logos = {
      'Amazon India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
      'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
      'Asus India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png',
      'Asus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png',
      'HP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/HP_logo_2012.svg/2560px-HP_logo_2012.svg.png',
      'Google': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
      'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png',
      'Flipkart': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flipkart_logo.svg/2560px-Flipkart_logo.svg.png',
      'TCS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/2560px-Tata_Consultancy_Services_Logo.svg.png',
      'Infosys': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/2560px-Infosys_logo.svg.png'
    }
    return logos[companyName] || null
  }

  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return null
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath
    }
    const baseUrl = 'http://localhost:5000'
    const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`
    return `${baseUrl}${cleanPath}`
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
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    tabsContainer: { 
      display: 'flex', 
      gap: '0.5rem', 
      background: '#f1f5f9', 
      padding: '0.25rem', 
      borderRadius: '12px' 
    },
    tab: (active) => ({ 
      padding: '0.5rem 1rem', 
      background: active ? 'white' : 'transparent', 
      color: active ? '#2563eb' : '#64748b', 
      border: 'none', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontSize: '0.8rem', 
      fontWeight: '500', 
      transition: 'all 0.2s ease', 
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' 
    }),
    statsRow: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
      gap: '0.75rem', 
      marginBottom: '1.5rem' 
    },
    statCard: (color) => ({ 
      background: '#f8fafc', 
      borderRadius: '16px', 
      padding: '0.75rem', 
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
      color: '#64748b', 
      marginTop: '0.15rem' 
    },
    loadingState: { 
      textAlign: 'center', 
      padding: '3rem', 
      color: '#64748b' 
    },
    spinner: { 
      width: '40px', 
      height: '40px', 
      border: '3px solid #e2e8f0', 
      borderTopColor: '#06b6d4', 
      borderRadius: '50%', 
      animation: 'spin 0.6s linear infinite', 
      margin: '0 auto 1rem' 
    },
    interviewsList: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem' 
    },
    interviewCard: { 
      background: '#ffffff', 
      borderRadius: '16px', 
      border: '1px solid #e2e8f0', 
      overflow: 'hidden', 
      transition: 'all 0.3s ease' 
    },
    cardHeader: { 
      padding: '0.75rem 1rem', 
      background: '#fafcff', 
      borderBottom: '1px solid #e2e8f0', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem' 
    },
    companyLogo: { 
      width: '48px', 
      height: '48px', 
      background: '#ffffff', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      flexShrink: 0,
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)' 
    },
    logoImage: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain', 
      padding: '6px' 
    },
    logoPlaceholder: { 
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)', 
      color: 'white', 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '1.2rem', 
      fontWeight: '600',
      borderRadius: '12px' 
    },
    companyInfo: { 
      flex: 1, 
      minWidth: 0 
    },
    companyName: { 
      fontSize: '0.95rem', 
      fontWeight: '700', 
      color: '#1e293b' 
    },
    interviewRole: { 
      fontSize: '0.75rem', 
      color: '#64748b' 
    },
    interviewDetails: { 
      padding: '0.5rem 1rem', 
      display: 'flex', 
      gap: '0.5rem', 
      flexWrap: 'wrap', 
      borderBottom: '1px solid #f1f5f9' 
    },
    detailItem: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.25rem', 
      fontSize: '0.65rem', 
      color: '#475569', 
      background: '#f1f5f9', 
      padding: '0.2rem 0.5rem', 
      borderRadius: '20px' 
    },
    statusSection: {
      padding: '0.4rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    statusBadge: (color, bg) => ({ 
      padding: '0.2rem 0.75rem', 
      borderRadius: '20px', 
      fontSize: '0.65rem', 
      fontWeight: '600', 
      background: bg, 
      color: color, 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '0.25rem' 
    }),
    actionButtons: { 
      padding: '0.5rem 1rem', 
      display: 'flex', 
      gap: '0.5rem', 
      background: '#fafcff',
      borderTop: '1px solid #f1f5f9' 
    },
    btnJoin: { 
      flex: 1, 
      padding: '0.4rem', 
      background: '#10b981', 
      color: 'white', 
      border: 'none', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      fontWeight: '500', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem' 
    },
    btnDetails: { 
      flex: 1, 
      padding: '0.4rem', 
      background: 'transparent', 
      color: '#2563eb', 
      border: '1px solid #2563eb', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem' 
    },
    modalOverlay: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      backdropFilter: 'blur(4px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000 
    },
    modal: { 
      background: 'white', 
      borderRadius: '24px', 
      padding: '1.5rem', 
      maxWidth: '550px', 
      width: '90%', 
      maxHeight: '85vh', 
      overflow: 'auto' 
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
      fontSize: '1.1rem', 
      fontWeight: '600', 
      color: '#1e293b' 
    },
    closeBtn: { 
      background: 'none', 
      border: 'none', 
      cursor: 'pointer', 
      color: '#64748b', 
      fontSize: '1.2rem' 
    },
    modalSection: { 
      marginBottom: '1rem' 
    },
    modalLabel: { 
      fontSize: '0.7rem', 
      fontWeight: '600', 
      color: '#64748b', 
      textTransform: 'uppercase', 
      letterSpacing: '0.5px', 
      marginBottom: '0.25rem' 
    },
    modalValue: { 
      fontSize: '0.85rem', 
      color: '#1e293b' 
    },
    modalCloseBtn: {
      width: '100%',
      padding: '0.6rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      marginTop: '0.5rem',
      fontWeight: '500'
    },
    emptyState: { 
      textAlign: 'center', 
      padding: '3rem', 
      color: '#64748b' 
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading interview schedule...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}><Calendar size={18} color="white" /></div>
          <span>Interview Schedule</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '400' }}>
            ({interviews.length} interviews)
          </span>
        </div>
        <div style={styles.tabsContainer}>
          <button onClick={() => setViewMode('upcoming')} style={styles.tab(viewMode === 'upcoming')}>
            📅 Upcoming
          </button>
          <button onClick={() => setViewMode('past')} style={styles.tab(viewMode === 'past')}>
            📋 Past
          </button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.upcoming}</div>
          <div style={styles.statLabel}>Upcoming</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.selected}</div>
          <div style={styles.statLabel}>Selected</div>
        </div>
      </div>

      {viewMode === 'upcoming' ? (
        upcomingInterviews.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p>No upcoming interviews scheduled</p>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              When your applications get shortlisted, interviews will appear here
            </p>
          </div>
        ) : (
          <div style={styles.interviewsList}>
            {upcomingInterviews.map((interview) => {
              const status = getStatusBadge(interview.status)
              
              let logoUrl = null
              if (interview.companyLogo) {
                logoUrl = getFullLogoUrl(interview.companyLogo)
              }
              if (!logoUrl) {
                logoUrl = getCompanyLogo(interview.company)
              }
              
              return (
                <div key={interview.id} style={styles.interviewCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.companyLogo}>
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={interview.company} 
                          style={styles.logoImage}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<div style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; border-radius: 12px;">${getCompanyInitial(interview.company)}</div>`
                          }}
                        />
                      ) : (
                        <div style={styles.logoPlaceholder}>{getCompanyInitial(interview.company)}</div>
                      )}
                    </div>
                    <div style={styles.companyInfo}>
                      <div style={styles.companyName}>{interview.company}</div>
                      <div style={styles.interviewRole}>{interview.role} - {interview.round}</div>
                    </div>
                  </div>
                  
                  <div style={styles.interviewDetails}>
                    <span style={styles.detailItem}>
                      <Calendar size={12} /> {interview.date}
                    </span>
                    <span style={styles.detailItem}>
                      <Clock size={12} /> {interview.time}
                    </span>
                    <span style={styles.detailItem}>
                      {interview.mode === 'online' || interview.mode === 'Online' ? <Video size={12} /> : <MapPin size={12} />} {interview.mode}
                    </span>
                    <span style={styles.detailItem}>
                      {interview.type === 'Technical' ? '💻 Technical' : '👔 HR'}
                    </span>
                  </div>
                  
                  <div style={styles.statusSection}>
                    <span style={styles.statusBadge(status.color, status.bg)}>
                      {status.icon} {status.text}
                    </span>
                  </div>
                  
                  <div style={styles.actionButtons}>
                    {interview.link && interview.link.startsWith('http') && (
                      <button onClick={() => handleJoinInterview(interview)} style={styles.btnJoin}>
                        <Video size={14} /> Join Now
                      </button>
                    )}
                    <button onClick={() => handleViewDetails(interview)} style={styles.btnDetails}>
                      <Eye size={14} /> Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        pastInterviews.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p>No past interviews</p>
          </div>
        ) : (
          <div style={styles.interviewsList}>
            {pastInterviews.map((interview) => {
              const result = getResultBadge(interview.result)
              const status = getStatusBadge(interview.status)
              
              let logoUrl = null
              if (interview.companyLogo) {
                logoUrl = getFullLogoUrl(interview.companyLogo)
              }
              if (!logoUrl) {
                logoUrl = getCompanyLogo(interview.company)
              }
              
              return (
                <div key={interview.id} style={styles.interviewCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.companyLogo}>
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={interview.company} 
                          style={styles.logoImage}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<div style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; border-radius: 12px;">${getCompanyInitial(interview.company)}</div>`
                          }}
                        />
                      ) : (
                        <div style={styles.logoPlaceholder}>{getCompanyInitial(interview.company)}</div>
                      )}
                    </div>
                    <div style={styles.companyInfo}>
                      <div style={styles.companyName}>{interview.company}</div>
                      <div style={styles.interviewRole}>{interview.role} - {interview.round}</div>
                    </div>
                    <span style={styles.statusBadge(status.color, status.bg)}>
                      {status.icon} {status.text}
                    </span>
                  </div>
                  
                  <div style={styles.interviewDetails}>
                    <span style={styles.detailItem}>
                      <Calendar size={12} /> {interview.date}
                    </span>
                    <span style={styles.detailItem}>
                      <Clock size={12} /> {interview.time}
                    </span>
                    <span style={styles.detailItem}>
                      {interview.mode === 'online' || interview.mode === 'Online' ? <Video size={12} /> : <MapPin size={12} />} {interview.mode}
                    </span>
                    {interview.result && (
                      <span style={styles.detailItem}>
                        {result.icon} {result.text}
                      </span>
                    )}
                  </div>
                  
                  <div style={styles.actionButtons}>
                    <button onClick={() => handleViewDetails(interview)} style={styles.btnDetails}>
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInterview && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{selectedInterview.company} - {selectedInterview.round}</div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📋 Interview Details</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span style={styles.detailItem}>📅 {selectedInterview.date}</span>
                <span style={styles.detailItem}>⏰ {selectedInterview.time}</span>
                <span style={styles.detailItem}>⏱️ {selectedInterview.duration}</span>
                <span style={styles.detailItem}>{selectedInterview.mode === 'online' || selectedInterview.mode === 'Online' ? '💻 Online' : '📍 Offline'}</span>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📍 Venue / Link</div>
              <div style={styles.modalValue}>{selectedInterview.venue}</div>
              {selectedInterview.link && (
                <a 
                  href={selectedInterview.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#2563eb', fontSize: '0.8rem', marginTop: '0.25rem', display: 'inline-block' }}
                >
                  Open Link →
                </a>
              )}
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>👨‍💼 Interviewer</div>
              <div style={styles.modalValue}>{selectedInterview.interviewer} - {selectedInterview.interviewerRole}</div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>💡 Tips</div>
              <div style={styles.modalValue}>{selectedInterview.tips}</div>
            </div>
            
            {selectedInterview.requirements && selectedInterview.requirements.length > 0 && (
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>✅ Requirements</div>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                  {selectedInterview.requirements.map((req, idx) => (
                    <li key={idx} style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem' }}>• {req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedInterview.feedback && (
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>📝 Feedback</div>
                <div style={styles.modalValue}>{selectedInterview.feedback}</div>
              </div>
            )}
            
            {selectedInterview.status === 'scheduled' && selectedInterview.link && selectedInterview.link.startsWith('http') && (
              <button 
                onClick={() => handleJoinInterview(selectedInterview)} 
                style={{ width: '100%', padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '1rem' }}
              >
                Join Interview Now →
              </button>
            )}
            
            <button onClick={() => setShowDetailsModal(false)} style={styles.modalCloseBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewSchedule