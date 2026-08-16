import { useState, useEffect } from 'react'
import { Heart, Briefcase, MapPin, DollarSign, Calendar, Clock, Trash2, Eye, TrendingUp, Building, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function SavedJobs({ onApply }) {
  const [savedJobs, setSavedJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  const token = localStorage.getItem('studentToken')

  // ✅ FIXED: Get full logo URL - using backend URL
  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    // If already full URL, return as is
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    // ✅ Use backend URL (5000) not frontend URL (5173)
    const baseUrl = 'http://localhost:5000';
    
    // Remove leading slash if exists
    const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  // ✅ Company logos mapping (fallback)
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
      'Infosys': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/2560px-Infosys_logo.svg.png',
      'Wipro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wipro_logo.svg/2560px-Wipro_logo.svg.png'
    }
    return logos[companyName] || null
  }

  // ✅ Fetch saved jobs
  const fetchSavedJobs = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/saved-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📝 Saved Jobs Response:', response.data)
      
      if (response.data.success && response.data.savedJobs) {
        const formattedJobs = response.data.savedJobs.map(job => ({
          id: job.id,
          company: job.company || job.companyName || 'Unknown Company',
          companyLogo: job.companyLogo || job.company_logo || null,
          role: job.title || job.role || 'Unknown Role',
          package: job.package || '0 LPA',
          location: job.location || 'Remote',
          type: job.jobType || job.type || 'Full-time',
          savedDate: job.savedAt || job.savedDate || job.created_at || new Date().toISOString(),
          deadline: job.deadline,
          description: job.description || 'No description available',
          requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements : job.requirements.split(',')) : [],
          hasApplied: job.hasApplied || false
        }))
        setSavedJobs(formattedJobs)
        console.log('✅ Formatted Saved Jobs:', formattedJobs)
      } else {
        setSavedJobs([])
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      setSavedJobs([])
      toast.error('Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  // ✅ Remove saved job
  const handleRemoveJob = async (jobId, jobName) => {
    try {
      await axios.delete(`${API_URL}/student/saved-jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSavedJobs(savedJobs.filter(job => job.id !== jobId))
      toast.success(`Removed ${jobName} from saved jobs`)
    } catch (error) {
      console.error('Error removing saved job:', error)
      toast.error('Failed to remove job')
    }
  }

  // ✅ Apply for job
  const handleApply = async (job) => {
    if (job.hasApplied) {
      toast.error('You have already applied for this job!')
      return
    }
    
    setApplying(true)
    try {
      const response = await axios.post(`${API_URL}/student/jobs/${job.id}/apply`, 
        { coverLetter: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        toast.success(`Applied to ${job.company} successfully! 🎉`)
        setSavedJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, hasApplied: true } : j
        ))
        if (onApply) {
          onApply(job)
        }
      } else {
        toast.error(response.data.message || 'Failed to apply')
      }
    } catch (error) {
      console.error('Error applying:', error)
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Already applied')) {
        toast.error('You have already applied for this job!')
        setSavedJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, hasApplied: true } : j
        ))
      } else {
        toast.error(error.response?.data?.message || 'Failed to apply')
      }
    } finally {
      setApplying(false)
      setShowDetailsModal(false)
    }
  }

  const handleViewDetails = (job) => {
    setSelectedJob(job)
    setShowDetailsModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    try {
      const options = { day: 'numeric', month: 'short', year: 'numeric' }
      return new Date(dateString).toLocaleDateString('en-IN', options)
    } catch {
      return 'Recently'
    }
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Last day today!'
    return `${diffDays} days left`
  }

  const stats = {
    total: savedJobs.length,
    totalPackage: savedJobs.reduce((sum, job) => {
      const pkg = parseInt(job.package) || 0
      return sum + pkg
    }, 0),
    companies: [...new Set(savedJobs.map(j => j.company))].length
  }

  const getCompanyInitial = (company) => {
    return company?.charAt(0) || 'C'
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
      background: 'linear-gradient(135deg, #ec4899, #db2777)', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    statsRow: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
      gap: '0.75rem', 
      marginBottom: '1.5rem' 
    },
    statCard: (color) => ({ 
      background: '#f8fafc', 
      borderRadius: '16px', 
      padding: '0.75rem 1rem', 
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
      borderTopColor: '#ec4899', 
      borderRadius: '50%', 
      animation: 'spin 0.6s linear infinite', 
      margin: '0 auto 1rem' 
    },
    jobsGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
      gap: '1rem' 
    },
    jobCard: { 
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
      background: 'linear-gradient(135deg, #ec4899, #db2777)', 
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
    companyRole: { 
      fontSize: '0.75rem', 
      color: '#64748b' 
    },
    savedDate: { 
      fontSize: '0.6rem', 
      color: '#94a3b8', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.25rem', 
      marginTop: '0.1rem' 
    },
    cardDetails: { 
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
    deadlineBadge: { 
      padding: '0.4rem 1rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    deadlineText: { 
      fontSize: '0.65rem', 
      color: '#f59e0b' 
    },
    actionButtons: { 
      padding: '0.5rem 1rem', 
      display: 'flex', 
      gap: '0.5rem', 
      background: '#fafcff',
      borderTop: '1px solid #f1f5f9' 
    },
    btnPrimary: (disabled) => ({ 
      flex: 1, 
      padding: '0.4rem', 
      background: disabled ? '#10b981' : '#2563eb', 
      color: 'white', 
      border: 'none', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: disabled ? 'not-allowed' : 'pointer', 
      opacity: disabled ? 0.7 : 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem' 
    }),
    btnOutline: { 
      padding: '0.4rem 0.8rem', 
      background: 'transparent', 
      color: '#64748b', 
      border: '1px solid #e2e8f0', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem' 
    },
    btnDanger: { 
      padding: '0.4rem 0.8rem', 
      background: 'transparent', 
      color: '#ef4444', 
      border: '1px solid #fee2e2', 
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
    requirementsList: { 
      paddingLeft: '1.25rem', 
      marginTop: '0.25rem' 
    },
    requirementItem: { 
      fontSize: '0.8rem', 
      color: '#475569', 
      marginBottom: '0.2rem' 
    },
    emptyState: { 
      textAlign: 'center', 
      padding: '3rem', 
      color: '#64748b' 
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
          <p>Loading saved jobs...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}><Heart size={18} color="white" /></div>
          <span>Saved Jobs</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '400' }}>
            ({savedJobs.length} jobs)
          </span>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard('#ec4899')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Saved Jobs</div>
        </div>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.companies}</div>
          <div style={styles.statLabel}>Companies</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.totalPackage} LPA</div>
          <div style={styles.statLabel}>Total Worth</div>
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <div style={styles.emptyState}>
          <Heart size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No saved jobs yet</p>
          <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: '#94a3b8' }}>
            Click ❤️ on jobs to save them for later
          </p>
        </div>
      ) : (
        <div style={styles.jobsGrid}>
          {savedJobs.map((job) => {
            const daysLeft = getDaysLeft(job.deadline)
            const isExpired = daysLeft === 'Expired'
            
            // ✅ Get logo - try multiple sources
            let logoUrl = null
            
            // First: Try companyLogo from API (using fixed getFullLogoUrl)
            if (job.companyLogo) {
              logoUrl = getFullLogoUrl(job.companyLogo)
              console.log('🖼️ Logo URL from API:', logoUrl)
            }
            
            // Second: Try fallback logos
            if (!logoUrl) {
              logoUrl = getCompanyLogo(job.company)
              console.log('🖼️ Logo URL from fallback:', logoUrl)
            }
            
            return (
              <div key={job.id} style={styles.jobCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.companyLogo}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={job.company} 
                        style={styles.logoImage}
                        onError={(e) => {
                          console.log('❌ Logo load failed, using initials');
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<div style="background: linear-gradient(135deg, #ec4899, #db2777); color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; border-radius: 12px;">${getCompanyInitial(job.company)}</div>`
                        }}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>{getCompanyInitial(job.company)}</div>
                    )}
                  </div>
                  <div style={styles.companyInfo}>
                    <div style={styles.companyName}>{job.company}</div>
                    <div style={styles.companyRole}>{job.role}</div>
                    <div style={styles.savedDate}>
                      <Clock size={10} /> Saved on {formatDate(job.savedDate)}
                    </div>
                  </div>
                </div>
                
                <div style={styles.cardDetails}>
                  <span style={styles.detailItem}>
                    <Tag size={10} /> 💰 {job.package}
                  </span>
                  <span style={styles.detailItem}>
                    <MapPin size={10} /> {job.location}
                  </span>
                  <span style={styles.detailItem}>
                    {job.type === 'internship' ? '🎓 Internship' : 
                     job.type === 'part_time' ? '⏳ Part-time' : 
                     job.type === 'contract' ? '📄 Contract' : '💼 Full-time'}
                  </span>
                </div>
                
                <div style={styles.deadlineBadge}>
                  <span style={styles.deadlineText}>
                    <Calendar size={12} /> {isExpired ? 'Application Closed' : `Apply by ${formatDate(job.deadline)} (${daysLeft})`}
                  </span>
                </div>
                
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => handleApply(job)} 
                    disabled={applying || job.hasApplied || isExpired} 
                    style={styles.btnPrimary(job.hasApplied || isExpired)}
                  >
                    {job.hasApplied ? '✓ Applied' : (applying ? '⏳ Applying...' : 'Apply Now →')}
                  </button>
                  <button onClick={() => handleViewDetails(job)} style={styles.btnOutline}>
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handleRemoveJob(job.id, job.company)} style={styles.btnDanger}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{selectedJob.company} - {selectedJob.role}</div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📋 Job Details</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span style={styles.detailItem}>💰 {selectedJob.package}</span>
                <span style={styles.detailItem}>📍 {selectedJob.location}</span>
                <span style={styles.detailItem}>{selectedJob.type}</span>
                <span style={styles.detailItem}>📅 Apply by {formatDate(selectedJob.deadline)}</span>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📝 Description</div>
              <div style={styles.modalValue}>{selectedJob.description}</div>
            </div>
            
            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>✅ Requirements</div>
                <ul style={styles.requirementsList}>
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx} style={styles.requirementItem}>• {req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => handleApply(selectedJob)} 
                disabled={applying || selectedJob.hasApplied} 
                style={styles.btnPrimary(selectedJob.hasApplied)}
              >
                {selectedJob.hasApplied ? '✓ Already Applied' : (applying ? 'Applying...' : 'Apply Now →')}
              </button>
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

export default SavedJobs