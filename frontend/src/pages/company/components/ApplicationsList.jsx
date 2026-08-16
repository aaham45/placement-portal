import { useState, useEffect } from 'react'
import { 
  Briefcase, Calendar, CheckCircle, Clock, Eye, FileText, 
  XCircle, Download, Filter, Search, User, Building, Mail, Phone,
  ChevronDown, ChevronUp, Star, Award, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function ApplicationsList({ role = 'company' }) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0
  })

  const token = localStorage.getItem('companyToken')

  const getDisplayStatus = (status) => {
    const map = {
      'applied': 'pending',
      'pending': 'pending',
      'shortlisted': 'shortlisted',
      'selected': 'selected',
      'rejected': 'rejected',
      'interview': 'interview'
    }
    return map[status?.toLowerCase()] || status
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      console.log('📋 Fetching applications...')
      
      const response = await axios.get(`${API_URL}/company/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📊 Applications Response:', response.data)
      
      if (response.data.success) {
        const apps = response.data.applications || []
        console.log('📊 Applications count:', apps.length)
        setApplications(apps)
        
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === 'pending' || a.status === 'applied').length,
          shortlisted: apps.filter(a => a.status === 'shortlisted').length,
          selected: apps.filter(a => a.status === 'selected').length,
          rejected: apps.filter(a => a.status === 'rejected').length
        })
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchApplications()
    } else {
      setLoading(false)
    }
  }, [token])

  const statusConfig = {
    applied: { color: '#3b82f6', bg: '#dbeafe', icon: Clock, label: 'Applied' },
    pending: { color: '#f59e0b', bg: '#fef3c7', icon: Clock, label: 'Pending' },
    shortlisted: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle, label: 'Shortlisted' },
    rejected: { color: '#ef4444', bg: '#fee2e2', icon: XCircle, label: 'Rejected' },
    selected: { color: '#8b5cf6', bg: '#ede9fe', icon: Briefcase, label: 'Selected' },
    interview: { color: '#8b5cf6', bg: '#f3e8ff', icon: Calendar, label: 'Interview' }
  }

  const filteredApps = applications.filter(app => {
    const displayStatus = getDisplayStatus(app.status)
    const matchesFilter = filter === 'all' ? true : displayStatus === filter
    const matchesSearch = 
      (app.student_name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job_title || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.student_branch || '')?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleViewDetails = (app) => {
    setSelectedApp(app)
    setShowModal(true)
  }

  const handleStatusChange = async (appId, newStatus) => {
    if (updating) return
    setUpdating(true)
    
    try {
      console.log(`📝 Updating application ${appId} to ${newStatus}`)
      
      const response = await axios.put(`${API_URL}/company/applications/${appId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        toast.success(`Application ${newStatus} successfully!`)
        fetchApplications()
      } else {
        toast.error(response.data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const normalizeStatus = (status) => {
    const statusMap = {
      'applied': 'pending',
      'pending': 'pending',
      'shortlisted': 'shortlisted',
      'selected': 'selected',
      'rejected': 'rejected',
      'interview': 'interview'
    }
    return statusMap[status?.toLowerCase()] || 'pending'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // ✅ Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: '24px', textAlign: 'center', padding: '3rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <p style={{ color: '#64748b' }}>Loading applications...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const styles = {
    container: {
      background: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
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
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: (color) => ({
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      border: `1px solid ${color}20`,
      transition: 'all 0.2s ease'
    }),
    statCardInner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.7rem'
    },
    statValue: (color) => ({
      fontSize: '1.5rem',
      fontWeight: '700',
      color: color
    }),
    statIcon: (bgColor) => ({
      padding: '0.5rem',
      background: bgColor,
      borderRadius: '12px'
    }),
    filterBar: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem'
    },
    filterButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    filterBtn: (isActive, color) => ({
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      background: isActive ? color : '#f1f5f9',
      color: isActive ? 'white' : '#64748b',
      transition: 'all 0.2s ease'
    }),
    searchBox: {
      position: 'relative'
    },
    searchInput: {
      paddingLeft: '2rem',
      paddingRight: '1rem',
      paddingTop: '0.4rem',
      paddingBottom: '0.4rem',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#1e293b',
      width: '260px',
      outline: 'none',
      fontSize: '0.8rem'
    },
    searchIcon: {
      position: 'absolute',
      left: '0.6rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      color: '#64748b',
      fontWeight: '600',
      fontSize: '0.7rem',
      borderBottom: '2px solid #e2e8f0'
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '0.8rem'
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    avatar: (imageUrl, name) => ({
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '50%',
      background: imageUrl ? 'none' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      border: '2px solid #e2e8f0'
    }),
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    avatarText: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: 'white'
    },
    studentName: {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '0.8rem'
    },
    studentRegNo: {
      fontSize: '0.65rem',
      color: '#64748b'
    },
    jobTitle: {
      fontWeight: '500',
      color: '#1e293b',
      fontSize: '0.8rem'
    },
    companyName: {
      fontSize: '0.65rem',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginTop: '0.2rem'
    },
    packageText: {
      fontSize: '0.6rem',
      color: '#10b981',
      marginTop: '0.2rem'
    },
    dateText: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      color: '#64748b',
      fontSize: '0.7rem'
    },
    statusBadge: (color, bg) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.2rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.65rem',
      fontWeight: '600',
      background: bg,
      color: color
    }),
    actionButtons: {
      display: 'flex',
      gap: '0.3rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    iconBtn: {
      padding: '0.3rem',
      borderRadius: '6px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    statusSelect: {
      padding: '0.25rem 0.4rem',
      borderRadius: '6px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      color: '#1e293b',
      fontSize: '0.65rem',
      cursor: 'pointer'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.5rem',
      maxWidth: '650px',
      width: '90%',
      maxHeight: '85vh',
      overflow: 'auto',
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalClose: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8'
    },
    modalProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    modalAvatar: (imageUrl) => ({
      width: '4rem',
      height: '4rem',
      borderRadius: '50%',
      background: imageUrl ? 'none' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      border: '2px solid #e2e8f0'
    }),
    modalAvatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    modalAvatarText: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: 'white'
    },
    modalName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    modalRegNo: {
      color: '#64748b',
      fontSize: '0.7rem'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    infoCard: {
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '0.75rem'
    },
    infoLabel: {
      color: '#64748b',
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      marginTop: '0.2rem',
      fontSize: '0.8rem',
      fontWeight: '500'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    skillTag: {
      background: '#e0e7ff',
      color: '#4338ca',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.65rem'
    },
    coverLetterBox: {
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '0.75rem',
      marginBottom: '1rem'
    },
    coverLetterTitle: {
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    modalButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    modalBtnSecondary: {
      flex: 1,
      padding: '0.5rem',
      background: '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    sectionTitle: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem',
      paddingBottom: '0.25rem',
      borderBottom: '2px solid #e2e8f0'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <FileText size={18} color="white" />
          </div>
          <span>Applications</span>
          <span style={{ 
            fontSize: '0.7rem', 
            color: '#64748b', 
            background: '#f1f5f9',
            padding: '0.15rem 0.6rem',
            borderRadius: '20px'
          }}>
            {stats.total} Total
          </span>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard('#7c3aed')}>
          <div style={styles.statCardInner}>
            <div><div style={styles.statLabel}>Total</div><div style={styles.statValue('#1e293b')}>{stats.total}</div></div>
            <div style={styles.statIcon('rgba(124, 58, 237, 0.1)')}><Briefcase size={20} color="#7c3aed" /></div>
          </div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statCardInner}>
            <div><div style={styles.statLabel}>Pending</div><div style={styles.statValue('#f59e0b')}>{stats.pending}</div></div>
            <div style={styles.statIcon('rgba(245, 158, 11, 0.1)')}><Clock size={20} color="#f59e0b" /></div>
          </div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statCardInner}>
            <div><div style={styles.statLabel}>Shortlisted</div><div style={styles.statValue('#10b981')}>{stats.shortlisted}</div></div>
            <div style={styles.statIcon('rgba(16, 185, 129, 0.1)')}><CheckCircle size={20} color="#10b981" /></div>
          </div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statCardInner}>
            <div><div style={styles.statLabel}>Selected</div><div style={styles.statValue('#8b5cf6')}>{stats.selected}</div></div>
            <div style={styles.statIcon('rgba(139, 92, 246, 0.1)')}><Award size={20} color="#8b5cf6" /></div>
          </div>
        </div>
        <div style={styles.statCard('#ef4444')}>
          <div style={styles.statCardInner}>
            <div><div style={styles.statLabel}>Rejected</div><div style={styles.statValue('#ef4444')}>{stats.rejected}</div></div>
            <div style={styles.statIcon('rgba(239, 68, 68, 0.1)')}><XCircle size={20} color="#ef4444" /></div>
          </div>
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterButtons}>
          <button onClick={() => setFilter('all')} style={styles.filterBtn(filter === 'all', '#7c3aed')}><Filter size={12} /> All</button>
          <button onClick={() => setFilter('pending')} style={styles.filterBtn(filter === 'pending', '#f59e0b')}><Clock size={12} /> Pending</button>
          <button onClick={() => setFilter('shortlisted')} style={styles.filterBtn(filter === 'shortlisted', '#10b981')}><CheckCircle size={12} /> Shortlisted</button>
          <button onClick={() => setFilter('selected')} style={styles.filterBtn(filter === 'selected', '#8b5cf6')}><Award size={12} /> Selected</button>
          <button onClick={() => setFilter('rejected')} style={styles.filterBtn(filter === 'rejected', '#ef4444')}><XCircle size={12} /> Rejected</button>
        </div>
        <div style={styles.searchBox}>
          <Search size={12} style={styles.searchIcon} />
          <input type="text" placeholder="Search by name, job, or branch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Job & Company</th>
              <th style={styles.th}>CGPA</th>
              <th style={styles.th}>Branch</th>
              <th style={styles.th}>Applied Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  No applications found
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const statusKey = normalizeStatus(app.status)
                const StatusIcon = statusConfig[statusKey]?.icon || Clock
                const initials = getInitials(app.student_name)
                const profileImage = app.profile_pic || app.student_profile_pic || null
                
                return (
                  <tr key={app.id}>
                    <td style={styles.td}>
                      <div style={styles.studentInfo}>
                        <div style={styles.avatar(profileImage, app.student_name)}>
                          {profileImage ? (
                            <img 
                              src={profileImage} 
                              alt={app.student_name} 
                              style={styles.avatarImage}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.style.background = 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
                                e.target.parentElement.innerHTML = `<span style="font-size:0.8rem;font-weight:600;color:white">${initials}</span>`
                              }}
                            />
                          ) : (
                            <span style={styles.avatarText}>{initials}</span>
                          )}
                        </div>
                        <div>
                          <div style={styles.studentName}>{app.student_name || 'Unknown'}</div>
                          <div style={styles.studentRegNo}>{app.reg_no || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.jobTitle}>{app.job_title || 'Unknown'}</div>
                      <div style={styles.companyName}><Building size={10} /> {app.company_name || 'Company'}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#059669' }}>{app.student_cgpa || app.cgpa || 'N/A'}</span>
                    </td>
                    <td style={styles.td}>
                      <span>{app.student_branch || app.branch || 'N/A'}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateText}><Calendar size={10} /> {formatDate(app.applied_at || app.created_at)}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(statusConfig[statusKey]?.color, statusConfig[statusKey]?.bg)}>
                        <StatusIcon size={10} /> {statusConfig[statusKey]?.label || app.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button onClick={() => handleViewDetails(app)} style={styles.iconBtn} title="View Details">
                          <Eye size={14} color="#64748b" />
                        </button>
                        {role === 'company' && (
                          <select 
                            value={normalizeStatus(app.status)} 
                            onChange={(e) => handleStatusChange(app.id, e.target.value)} 
                            style={styles.statusSelect}
                            disabled={updating}
                          >
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="selected">Selected</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showModal && selectedApp && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={styles.modalClose}><XCircle size={18} /></button>
            
            <div style={styles.modalProfile}>
              <div style={styles.modalAvatar(selectedApp.profile_pic || null)}>
                {selectedApp.profile_pic ? (
                  <img 
                    src={selectedApp.profile_pic} 
                    alt={selectedApp.student_name} 
                    style={styles.modalAvatarImage}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
                      e.target.parentElement.innerHTML = `<span style="font-size:1.2rem;font-weight:600;color:white">${getInitials(selectedApp.student_name)}</span>`
                    }}
                  />
                ) : (
                  <span style={styles.modalAvatarText}>{getInitials(selectedApp.student_name)}</span>
                )}
              </div>
              <div>
                <div style={styles.modalName}>{selectedApp.student_name || 'Unknown'}</div>
                <div style={styles.modalRegNo}>{selectedApp.reg_no || ''}</div>
              </div>
            </div>

            <div style={styles.sectionTitle}>📋 Contact & Academic Details</div>
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}><Mail size={10} /> {selectedApp.student_email || selectedApp.email || 'Not provided'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Phone</div>
                <div style={styles.infoValue}><Phone size={10} /> {selectedApp.student_phone || selectedApp.phone || 'Not provided'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>CGPA</div>
                <div style={styles.infoValue}>📊 {selectedApp.student_cgpa || selectedApp.cgpa || 'N/A'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Branch</div>
                <div style={styles.infoValue}>🎓 {selectedApp.student_branch || selectedApp.branch || 'N/A'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Applied Job</div>
                <div style={styles.infoValue}>💼 {selectedApp.job_title || 'N/A'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Status</div>
                <div style={styles.infoValue}>
                  <span style={styles.statusBadge(
                    statusConfig[normalizeStatus(selectedApp.status)]?.color,
                    statusConfig[normalizeStatus(selectedApp.status)]?.bg
                  )}>
                    {statusConfig[normalizeStatus(selectedApp.status)]?.label || selectedApp.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedApp.skills && (
              <>
                <div style={styles.sectionTitle}>🛠️ Technical Skills</div>
                <div style={styles.skillsContainer}>
                  {selectedApp.skills.split(',').map((skill, i) => (
                    <span key={i} style={styles.skillTag}>{skill.trim()}</span>
                  ))}
                </div>
              </>
            )}

            <div style={styles.coverLetterBox}>
              <div style={styles.coverLetterTitle}>
                <FileText size={12} /> Cover Letter
              </div>
              <p style={{ color: '#475569', fontSize: '0.75rem', lineHeight: '1.5', margin: 0 }}>
                {selectedApp.cover_letter || 'No cover letter provided.'}
              </p>
            </div>

            <div style={styles.modalButtons}>
              <button style={styles.modalBtnSecondary} onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ApplicationsList