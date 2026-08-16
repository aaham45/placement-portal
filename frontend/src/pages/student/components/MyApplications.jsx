// frontend/src/pages/student/components/MyApplications.jsx

import { useState, useEffect } from 'react'
import { FileText, Calendar, Eye, Search, Briefcase, Building, Clock, Tag, MapPin } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ✅ COMMON FUNCTION - SAME AS AVAILABLE JOBS
const getFullLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  
  // If already full URL, return as is
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  // ✅ Use backend base URL (remove /api from end)
  const baseUrl = API_URL.replace('/api', '');
  
  // Clean path
  const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
  
  const fullUrl = `${baseUrl}${cleanPath}`;
  console.log('🖼️ MyApplications Logo URL:', fullUrl);
  return fullUrl;
};

// ✅ FALLBACK LOGOS (same as AvailableJobs)
const getFallbackLogo = (companyName) => {
  if (!companyName) return null;
  
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
    'Infosys': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/2560px-Infosys_logo.svg.png',
    'Wipro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wipro_logo.svg/2560px-Wipro_logo.svg.png'
  };
  return logos[companyName] || null;
};

function MyApplications() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('studentToken')

  const fetchApplications = async () => {
    setLoading(true)
    try {
      console.log('📝 Fetching applications...')
      
      const response = await axios.get(`${API_URL}/student/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📝 API Response:', response.data)
      
      if (response.data.success && response.data.applications) {
        const formattedApps = response.data.applications.map(app => ({
          id: app.id,
          company: app.company_name || app.companyName || 'Unknown Company',
          company_logo: app.company_logo || null,
          role: app.job_title || app.title || 'Unknown Role',
          package: formatPackage(app.package || app.salary_range),
          location: app.location || 'N/A',
          status: getStatusText(app.status),
          statusRaw: app.status || 'pending',
          appliedDate: formatDate(app.applied_at),
          coverLetter: app.cover_letter || 'No cover letter provided',
          job_id: app.job_id,
          student_name: app.student_name,
          registration_number: app.registration_number,
          program: app.program,
          branch: app.branch,
          cgpa: app.cgpa
        }))
        
        console.log('✅ Formatted Applications:', formattedApps)
        console.log('📊 First app logo:', formattedApps[0]?.company_logo)
        setApplications(formattedApps)
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', error)
      setApplications([])
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const formatPackage = (pkg) => {
    if (!pkg) return 'N/A'
    if (pkg === 'N/A' || pkg === '0 LPA') return 'N/A'
    if (pkg === '0' || pkg === 0) return 'N/A'
    if (String(pkg).includes('LPA')) return pkg
    if (!isNaN(pkg) && pkg > 0) return `${pkg} LPA`
    if (String(pkg).includes('-')) return `${pkg} LPA`
    return pkg
  }

  useEffect(() => {
    if (token) {
      fetchApplications()
    } else {
      setLoading(false)
    }
  }, [token])

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Applied',
      'applied': 'Applied',
      'shortlisted': 'Shortlisted',
      'selected': 'Selected',
      'rejected': 'Rejected',
      'interview': 'Interview Scheduled',
      'interview_scheduled': 'Interview Scheduled',
      'in_review': 'Under Review',
      'offered': 'Offered'
    }
    return statusMap[status?.toLowerCase()] || 'Applied'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Applied': { icon: '⏳', color: '#f59e0b', bg: '#fef3c7', border: '#f59e0b' },
      'Shortlisted': { icon: '✅', color: '#10b981', bg: '#d1fae5', border: '#10b981' },
      'Selected': { icon: '🏆', color: '#8b5cf6', bg: '#ede9fe', border: '#8b5cf6' },
      'Rejected': { icon: '❌', color: '#ef4444', bg: '#fee2e2', border: '#ef4444' },
      'Interview Scheduled': { icon: '📅', color: '#3b82f6', bg: '#dbeafe', border: '#3b82f6' },
      'Under Review': { icon: '🔍', color: '#f59e0b', bg: '#fef3c7', border: '#f59e0b' },
      'Offered': { icon: '🎯', color: '#10b981', bg: '#d1fae5', border: '#10b981' }
    }
    return badges[status] || badges['Applied']
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (app.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    interview: applications.filter(a => a.status === 'Interview Scheduled').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length
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
    titleCount: {
      fontSize: '0.8rem', 
      color: '#94a3b8', 
      fontWeight: '400'
    },
    searchContainer: { 
      display: 'flex', 
      gap: '0.75rem', 
      flexWrap: 'wrap' 
    },
    searchBox: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem', 
      padding: '0.5rem 1rem', 
      background: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px' 
    },
    searchInput: { 
      border: 'none', 
      background: 'transparent', 
      outline: 'none', 
      fontSize: '0.85rem', 
      width: '180px' 
    },
    filterSelect: { 
      padding: '0.5rem 1rem', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      fontSize: '0.85rem', 
      background: 'white', 
      cursor: 'pointer' 
    },
    statsRow: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', 
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
      borderTopColor: '#2563eb', 
      borderRadius: '50%', 
      animation: 'spin 0.6s linear infinite', 
      margin: '0 auto 1rem' 
    },
    applicationsList: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem' 
    },
    applicationCard: { 
      background: '#ffffff', 
      borderRadius: '16px', 
      border: '1px solid #e2e8f0', 
      overflow: 'hidden', 
      transition: 'all 0.3s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    },
    cardHeader: { 
      padding: '1rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      background: '#fafcff',
      borderBottom: '1px solid #f1f5f9'
    },
    companyLogo: { 
      width: '52px', 
      height: '52px', 
      background: '#ffffff', 
      borderRadius: '14px', 
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
      padding: '8px' 
    },
    logoPlaceholder: { 
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)', 
      color: 'white', 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '1.2rem', 
      fontWeight: '600',
      borderRadius: '14px'
    },
    companyInfo: { 
      flex: 1, 
      minWidth: 0 
    },
    companyName: { 
      fontSize: '1rem', 
      fontWeight: '700', 
      color: '#1e293b' 
    },
    jobRole: { 
      fontSize: '0.8rem', 
      color: '#64748b', 
      marginTop: '0.1rem' 
    },
    jobDetails: { 
      padding: '0.6rem 1rem', 
      display: 'flex', 
      gap: '0.5rem', 
      flexWrap: 'wrap', 
      borderBottom: '1px solid #f1f5f9',
      background: '#ffffff'
    },
    detailItem: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.3rem', 
      fontSize: '0.7rem', 
      color: '#475569', 
      background: '#f1f5f9', 
      padding: '0.25rem 0.6rem', 
      borderRadius: '20px' 
    },
    statusSection: { 
      padding: '0.6rem 1rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      flexWrap: 'wrap', 
      gap: '0.5rem',
      background: '#ffffff'
    },
    statusBadge: (color, bg, border) => ({ 
      background: bg, 
      color: color, 
      padding: '0.25rem 0.75rem', 
      borderRadius: '20px', 
      fontSize: '0.7rem', 
      fontWeight: '600', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.25rem',
      border: `1px solid ${border || color}` 
    }),
    appliedDate: { 
      fontSize: '0.7rem', 
      color: '#64748b', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.25rem' 
    },
    actionButtons: { 
      padding: '0.6rem 1rem', 
      display: 'flex', 
      gap: '0.75rem', 
      background: '#fafcff',
      borderTop: '1px solid #f1f5f9'
    },
    btnOutline: { 
      flex: 1, 
      padding: '0.5rem', 
      background: 'transparent', 
      color: '#2563eb', 
      border: '1px solid #2563eb', 
      borderRadius: '10px', 
      fontSize: '0.75rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.4rem',
      transition: 'all 0.2s'
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
    modalCoverLetter: {
      background: '#f8fafc',
      padding: '0.75rem',
      borderRadius: '12px',
      fontSize: '0.8rem',
      color: '#475569',
      border: '1px solid #e2e8f0',
      maxHeight: '150px',
      overflow: 'auto'
    },
    modalStudentInfo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      background: '#f8fafc',
      padding: '0.75rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    modalStudentItem: {
      fontSize: '0.75rem',
      color: '#475569'
    },
    modalStudentLabel: {
      fontSize: '0.6rem',
      color: '#94a3b8',
      fontWeight: '500',
      textTransform: 'uppercase'
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
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading applications...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <FileText size={22} color="#8b5cf6" />
          <span>My Applications</span>
          <span style={styles.titleCount}>({applications.length} applications)</span>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search company or role..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="Applied">⏳ Applied</option>
            <option value="Shortlisted">✅ Shortlisted</option>
            <option value="Interview Scheduled">📅 Interview</option>
            <option value="Selected">🏆 Selected</option>
            <option value="Rejected">❌ Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.applied}</div>
          <div style={styles.statLabel}>Applied</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.shortlisted}</div>
          <div style={styles.statLabel}>Shortlisted</div>
        </div>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.interview}</div>
          <div style={styles.statLabel}>Interview</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.selected}</div>
          <div style={styles.statLabel}>Selected</div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div style={styles.emptyState}>
          <FileText size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No applications found</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {applications.length === 0 
              ? "You haven't applied to any jobs yet. Start exploring!" 
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div style={styles.applicationsList}>
          {filteredApplications.map((app) => {
            const badge = getStatusBadge(app.status)
            
            // ✅ LOGO: Use company_logo from API with fallback
            let logoUrl = null
            if (app.company_logo) {
              logoUrl = getFullLogoUrl(app.company_logo)
            }
            if (!logoUrl) {
              logoUrl = getFallbackLogo(app.company)
            }
            
            console.log(`🖼️ ${app.company} Logo URL:`, logoUrl);
            
            return (
              <div key={app.id} style={styles.applicationCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.companyLogo}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={app.company} 
                        style={styles.logoImage}
                        onError={(e) => {
                          console.log(`❌ Logo failed for ${app.company}, using initials`);
                          e.target.style.display = 'none'
                          const parent = e.target.parentElement
                          parent.innerHTML = `<div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; border-radius: 14px;">${app.company?.charAt(0) || 'C'}</div>`
                        }}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>{app.company?.charAt(0) || 'C'}</div>
                    )}
                  </div>
                  <div style={styles.companyInfo}>
                    <div style={styles.companyName}>{app.company}</div>
                    <div style={styles.jobRole}>{app.role}</div>
                  </div>
                </div>
                
                <div style={styles.jobDetails}>
                  <span style={styles.detailItem}>
                    <Briefcase size={12} /> {app.role}
                  </span>
                  <span style={styles.detailItem}>
                    <Tag size={12} /> 💰 {app.package}
                  </span>
                  <span style={styles.detailItem}>
                    <Building size={12} /> {app.company}
                  </span>
                </div>
                
                <div style={styles.statusSection}>
                  <div style={styles.statusBadge(badge.color, badge.bg, badge.border)}>
                    <span>{badge.icon}</span> {app.status}
                  </div>
                  <div style={styles.appliedDate}>
                    <Calendar size={12} /> Applied on {app.appliedDate}
                  </div>
                </div>
                
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => { setSelectedApp(app); setShowDetailsModal(true) }} 
                    style={styles.btnOutline}
                  >
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApp && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {selectedApp.company} - {selectedApp.role}
              </div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📋 Application Details</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span style={styles.detailItem}>💰 {selectedApp.package}</span>
                <span style={styles.detailItem}>📍 {selectedApp.location}</span>
                <span style={styles.detailItem}>📅 Applied on {selectedApp.appliedDate}</span>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📝 Status</div>
              <div style={{ 
                ...styles.statusBadge(
                  getStatusBadge(selectedApp.status).color, 
                  getStatusBadge(selectedApp.status).bg,
                  getStatusBadge(selectedApp.status).border
                ), 
                display: 'inline-flex', 
                marginTop: '0.15rem' 
              }}>
                <span>{getStatusBadge(selectedApp.status).icon}</span> {selectedApp.status}
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>👤 Student Details</div>
              <div style={styles.modalStudentInfo}>
                <div style={styles.modalStudentItem}>
                  <div style={styles.modalStudentLabel}>Name</div>
                  {selectedApp.student_name || 'N/A'}
                </div>
                <div style={styles.modalStudentItem}>
                  <div style={styles.modalStudentLabel}>Registration No.</div>
                  {selectedApp.registration_number || 'N/A'}
                </div>
                <div style={styles.modalStudentItem}>
                  <div style={styles.modalStudentLabel}>Program</div>
                  {selectedApp.program || 'N/A'}
                </div>
                <div style={styles.modalStudentItem}>
                  <div style={styles.modalStudentLabel}>Branch</div>
                  {selectedApp.branch || 'N/A'}
                </div>
                <div style={styles.modalStudentItem}>
                  <div style={styles.modalStudentLabel}>CGPA</div>
                  {selectedApp.cgpa || 'N/A'}
                </div>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>✉️ Cover Letter</div>
              <div style={styles.modalCoverLetter}>
                {selectedApp.coverLetter || 'No cover letter provided'}
              </div>
            </div>
            
            <button onClick={() => setShowDetailsModal(false)} style={styles.modalCloseBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyApplications