import { useState, useEffect } from 'react'
import { Search, Briefcase, MapPin, DollarSign, Calendar, Heart, Eye, Clock, TrendingUp, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AvailableJobs({ onApply }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPackage, setFilterPackage] = useState('')
  const [filterType, setFilterType] = useState('')
  const [savedJobs, setSavedJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)

  // ✅ Apply Modal States
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [selectedJobForApply, setSelectedJobForApply] = useState(null)

  // ✅ Success Card States
  const [showSuccessCard, setShowSuccessCard] = useState(false)
  const [successData, setSuccessData] = useState({})
  const [isSuccess, setIsSuccess] = useState(true)

  const token = localStorage.getItem('studentToken')

  // ✅ Fetch student profile
  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const data = response.data.profile || response.data.student
        setStudentProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setStudentProfile({ current_cgpa: 0 })
    }
  }

  // ✅ Fetch applied jobs IDs
  const fetchAppliedJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const applications = response.data.applications || []
        return applications.map(app => app.job_id)
      }
      return []
    } catch (error) {
      return []
    }
  }

  const isJobActive = (job) => {
    if (!job.deadline) return true
    const deadline = new Date(job.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return deadline >= today && job.status === 'active'
  }

  // ✅ Fetch saved jobs
  const fetchSavedJobsIds = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/saved-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success && response.data.savedJobs) {
        setSavedJobs(response.data.savedJobs.map(job => job.id))
      } else {
        setSavedJobs([])
      }
    } catch (error) {
      setSavedJobs([])
    }
  }

  // ✅ Fetch active jobs
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/jobs/active`)
      
      if (response.data.success && response.data.jobs) {
        const appliedJobIds = await fetchAppliedJobs()
        const activeJobs = response.data.jobs.filter(job => isJobActive(job))
        
        const formattedJobs = activeJobs.map(job => ({
          id: job.id,
          company: job.companyName || 'Unknown Company',
          companyLogo: job.company_logo || job.logo,
          role: job.title || 'Unknown Role',
          package: job.package ? (job.package.includes('LPA') ? job.package : job.package + ' LPA') : '0 LPA',
          location: job.location || 'Remote',
          type: job.job_type?.replace('_', ' ') || 'Unknown',
          postedDate: getDaysAgo(job.created_at),
          deadline: formatDate(job.deadline),
          match: calculateMatch(job.eligibility),
          eligibility: job.eligibility || 0,
          openings: job.openings || 1,
          description: job.description || 'No description available',
          skills: job.skills || [],
          hasApplied: appliedJobIds.includes(job.id)
        }))
        
        setJobs(formattedJobs)
      } else {
        setJobs([])
      }
    } catch (error) {
      toast.error('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysAgo = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1d ago'
    if (diffDays < 7) return `${diffDays}d ago`
    return `${Math.ceil(diffDays / 7)}w ago`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const calculateMatch = (eligibilityCgpa) => {
    const studentCgpa = studentProfile?.current_cgpa || 0
    if (!eligibilityCgpa || eligibilityCgpa === 0) return 0
    if (studentCgpa >= eligibilityCgpa + 0.5) return 95
    if (studentCgpa >= eligibilityCgpa) return 85
    if (studentCgpa >= eligibilityCgpa - 0.5) return 70
    if (studentCgpa >= eligibilityCgpa - 1) return 55
    return 40
  }

  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    const baseUrl = API_URL.replace('/api', '');
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${baseUrl}${path}`;
  };

  const getFallbackLogo = (companyName) => {
    const logos = {
      'Amazon India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
      'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
      'Asus India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png',
      'HP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/HP_logo_2012.svg/2560px-HP_logo_2012.svg.png'
    };
    return logos[companyName] || null;
  };

  useEffect(() => {
    fetchStudentProfile()
    fetchSavedJobsIds()
  }, [])

  useEffect(() => {
    if (studentProfile !== null) {
      fetchJobs()
    }
  }, [studentProfile])

  const handleSaveJob = async (jobId) => {
    const isSaved = savedJobs.includes(jobId)
    
    try {
      if (isSaved) {
        await axios.delete(`${API_URL}/student/saved-jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSavedJobs(savedJobs.filter(id => id !== jobId))
        toast.success('Removed from saved jobs')
      } else {
        await axios.post(`${API_URL}/student/saved-jobs/${jobId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSavedJobs([...savedJobs, jobId])
        toast.success('Job saved! ❤️')
      }
    } catch (error) {
      toast.error('Failed to save job')
    }
  }

  const handleViewDetails = (job) => {
    setSelectedJob(job)
    setShowDetailsModal(true)
  }

  // ✅ Open Apply Modal with Cover Letter
  const openApplyModal = (job) => {
    if (job.hasApplied) {
      toast.info('📌 You have already applied for this job!')
      return
    }
    setSelectedJobForApply(job)
    setCoverLetter('')
    setShowApplyModal(true)
  }

  // ✅ Apply with Cover Letter
  const handleApplyWithCoverLetter = async () => {
    if (!selectedJobForApply) return
    
    setApplying(true)
    
    try {
      const response = await axios.post(
        `${API_URL}/student/jobs/${selectedJobForApply.id}/apply`,
        { coverLetter: coverLetter || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        // ✅ Update job status
        setJobs(prev => prev.map(j => 
          j.id === selectedJobForApply.id ? { ...j, hasApplied: true } : j
        ))
        
        if (onApply) onApply(selectedJobForApply)
        
        // ✅ Show Success Card
        setSuccessData({
          company: selectedJobForApply.company,
          title: selectedJobForApply.role,
          package: selectedJobForApply.package
        })
        setIsSuccess(true)
        setShowSuccessCard(true)
        setShowApplyModal(false)
        setCoverLetter('')
        setSelectedJobForApply(null)
        setApplying(false)
        
        setTimeout(() => {
          setShowSuccessCard(false)
        }, 3000)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply'
      
      if (errorMessage.toLowerCase().includes('already applied')) {
        setJobs(prev => prev.map(j => 
          j.id === selectedJobForApply.id ? { ...j, hasApplied: true } : j
        ))
      }
      
      setIsSuccess(false)
      setSuccessData({
        company: selectedJobForApply.company,
        title: selectedJobForApply.role
      })
      setShowSuccessCard(true)
      setShowApplyModal(false)
      setApplying(false)
      setTimeout(() => {
        setShowSuccessCard(false)
      }, 3000)
    }
  }

  const getMatchColor = (match) => {
    if (match >= 90) return '#10b981'
    if (match >= 80) return '#3b82f6'
    if (match >= 70) return '#f59e0b'
    return '#ef4444'
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.role || '').toLowerCase().includes(searchTerm.toLowerCase())

    const pkgValue = parseFloat(job.package) || 0
    const filterPkgValue = parseFloat(filterPackage) || 0
    const matchesPackage = !filterPackage || pkgValue >= filterPkgValue

    const jobTypeNormalized = (job.type || '').toLowerCase().replace('-', '_')
    const filterTypeNormalized = filterType.toLowerCase().replace('-', '_')
    const matchesType = !filterType || jobTypeNormalized.includes(filterTypeNormalized)

    return matchesSearch && matchesPackage && matchesType
  })

  const styles = {
    container: { background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    title: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    searchContainer: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '200px' },
    filterSelect: { padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', background: 'white', cursor: 'pointer' },
    loadingState: { textAlign: 'center', padding: '3rem', color: '#64748b' },
    jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem', marginTop: '1rem' },
    jobCard: { background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.3s ease' },
    jobHeader: { padding: '1rem', background: '#fafcff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' },
    companyLogo: { width: '55px', height: '55px', background: '#ffffff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    logoImage: { width: '100%', height: '100%', objectFit: 'contain', padding: '8px' },
    logoPlaceholder: { background: '#2563eb', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '600', borderRadius: '16px' },
    companyInfo: { flex: 1 },
    companyName: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' },
    jobRole: { fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
    jobDetails: { padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' },
    detailItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#64748b', background: '#f8fafc', padding: '0.25rem 0.6rem', borderRadius: '20px' },
    matchSection: { padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' },
    matchBadge: (match) => ({ background: getMatchColor(match) + '15', color: getMatchColor(match), padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }),
    deadlineText: { fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    actionButtons: { padding: '1rem', display: 'flex', gap: '0.75rem', background: '#fafcff' },
    btnPrimary: (isApplying, hasApplied) => ({ 
      flex: 1, 
      padding: '0.5rem', 
      background: hasApplied ? '#10b981' : '#2563eb', 
      color: 'white', 
      border: 'none', 
      borderRadius: '12px', 
      fontSize: '0.75rem', 
      fontWeight: '500', 
      cursor: (isApplying || hasApplied) ? 'not-allowed' : 'pointer', 
      opacity: (isApplying || hasApplied) ? 0.8 : 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.5rem' 
    }),
    btnOutline: { padding: '0.5rem', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minWidth: '40px' },
    saveBtn: { padding: '0.5rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { background: 'white', borderRadius: '24px', padding: '1.5rem', maxWidth: '550px', width: '90%', maxHeight: '85vh', overflow: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' },
    modalTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' },
    modalSection: { marginBottom: '1rem' },
    modalLabel: { fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' },
    modalValue: { fontSize: '0.9rem', color: '#1e293b' },
    emptyState: { textAlign: 'center', padding: '3rem', color: '#64748b' },
    recommendedTag: { background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.6rem', fontWeight: '600' },

    // ✅ Apply Modal Styles
    applyModalOverlay: {
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
      zIndex: 2000
    },
    applyModal: {
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    applyModalTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    applyModalSubtitle: {
      fontSize: '0.85rem',
      color: '#64748b',
      marginBottom: '0.25rem'
    },
    applyModalCompany: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      marginBottom: '1.5rem'
    },
    applyLabel: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#475569',
      display: 'block',
      marginBottom: '0.3rem'
    },
    applyTextarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '0.85rem',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      outline: 'none'
    },
    applyCharCount: {
      fontSize: '0.7rem',
      color: '#94a3b8',
      textAlign: 'right',
      marginTop: '0.3rem',
      marginBottom: '1rem'
    },
    applyButtons: {
      display: 'flex',
      gap: '1rem'
    },
    applyCancelBtn: {
      flex: 1,
      padding: '0.6rem',
      background: '#f1f5f9',
      border: 'none',
      borderRadius: '12px',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500'
    },
    applySubmitBtn: {
      flex: 1,
      padding: '0.6rem',
      background: '#2563eb',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500'
    },

    // ✅ Success Card Styles
    successCardOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      backdropFilter: 'blur(4px)'
    },
    successCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      borderTop: '5px solid #10b981'
    },
    successCardError: {
      borderTop: '5px solid #ef4444'
    },
    successIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: '#d1fae5',
      color: '#10b981',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 0.75rem',
      fontSize: '2rem'
    },
    successIconError: {
      background: '#fecaca',
      color: '#ef4444'
    },
    successTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    successSubtitle: {
      fontSize: '0.85rem',
      color: '#64748b',
      marginBottom: '0.25rem'
    },
    successMessage: {
      fontSize: '0.85rem',
      color: '#475569',
      marginTop: '0.5rem',
      fontWeight: '500'
    },
    successPackage: {
      display: 'inline-block',
      background: '#f1f5f9',
      padding: '0.15rem 0.6rem',
      borderRadius: '12px',
      fontSize: '0.65rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    successAutoDismiss: {
      fontSize: '0.6rem',
      color: '#94a3b8',
      marginTop: '1rem'
    },
    successProgressBar: {
      width: '100%',
      height: '3px',
      background: '#e2e8f0',
      borderRadius: '2px',
      marginTop: '0.75rem',
      overflow: 'hidden'
    },
    successProgressFill: {
      height: '100%',
      background: '#10b981',
      borderRadius: '2px',
      animation: 'progressShrink 3s linear forwards'
    },
    successProgressFillError: {
      height: '100%',
      background: '#ef4444',
      borderRadius: '2px',
      animation: 'progressShrink 3s linear forwards'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading jobs...</p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes progressShrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* ✅ Success Card */}
      {showSuccessCard && (
        <div style={styles.successCardOverlay}>
          <div style={{ ...styles.successCard, ...(isSuccess ? {} : styles.successCardError) }}>
            <div style={{ ...styles.successIcon, ...(isSuccess ? {} : styles.successIconError) }}>
              {isSuccess ? '✅' : '❌'}
            </div>
            <h3 style={styles.successTitle}>
              {isSuccess ? 'Application Submitted! 🎉' : 'Application Failed'}
            </h3>
            <p style={styles.successSubtitle}>
              {successData.company} - {successData.title}
            </p>
            {isSuccess && successData.package && (
              <span style={styles.successPackage}>💰 {successData.package}</span>
            )}
            <p style={styles.successMessage}>
              {isSuccess 
                ? 'Your application has been submitted successfully!' 
                : 'Something went wrong. Please try again.'}
            </p>
            <div style={styles.successProgressBar}>
              <div style={isSuccess ? styles.successProgressFill : styles.successProgressFillError} />
            </div>
            <p style={styles.successAutoDismiss}>Closing in 3 seconds...</p>
          </div>
        </div>
      )}

      {/* ✅ Apply Modal with Cover Letter */}
      {showApplyModal && selectedJobForApply && (
        <div style={styles.applyModalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.applyModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.applyModalTitle}>
              Apply for {selectedJobForApply.role}
            </div>
            <div style={styles.applyModalSubtitle}>
              {selectedJobForApply.company}
            </div>
            <div style={styles.applyModalCompany}>
              💰 {selectedJobForApply.package} • 📍 {selectedJobForApply.location}
            </div>
            
            <label style={styles.applyLabel}>
              ✉️ Cover Letter <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value.slice(0, 1000))}
              placeholder="Why do you want to join this company? What makes you a good fit for this role?"
              style={styles.applyTextarea}
            />
            <div style={styles.applyCharCount}>
              {coverLetter.length}/1000 characters
            </div>
            
            <div style={styles.applyButtons}>
              <button 
                onClick={() => setShowApplyModal(false)} 
                style={styles.applyCancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyWithCoverLetter} 
                disabled={applying}
                style={{
                  ...styles.applySubmitBtn,
                  opacity: applying ? 0.6 : 1
                }}
              >
                {applying ? '⏳ Applying...' : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Briefcase size={22} color="#f59e0b" />
          <span>Available Jobs</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
            ({jobs.length} jobs)
          </span>
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
          <select value={filterPackage} onChange={(e) => setFilterPackage(e.target.value)} style={styles.filterSelect}>
            <option value="">All Packages</option>
            <option value="3">3+ LPA</option>
            <option value="5">5+ LPA</option>
            <option value="7">7+ LPA</option>
            <option value="10">10+ LPA</option>
            <option value="15">15+ LPA</option>
            <option value="20">20+ LPA</option>
            <option value="25">25+ LPA</option>
            <option value="30">30+ LPA</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={styles.filterSelect}>
            <option value="">All Types</option>
            <option value="full_time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div style={styles.emptyState}>
          <Briefcase size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No jobs available at the moment</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
            Check back later for new opportunities!
          </p>
        </div>
      ) : (
        <div style={styles.jobsGrid}>
          {filteredJobs.map((job) => {
            const isSaved = savedJobs.includes(job.id)
            
            let logoUrl = getFullLogoUrl(job.companyLogo);
            if (!logoUrl) {
              logoUrl = getFallbackLogo(job.company);
            }
            
            return (
              <div key={job.id} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <div style={styles.companyLogo}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={job.company} 
                        style={styles.logoImage} 
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          e.target.parentElement.innerHTML = `<div style="background: #2563eb; color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; border-radius: 16px;">${job.company?.charAt(0)}</div>` 
                        }} 
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>{job.company?.charAt(0)}</div>
                    )}
                  </div>
                  <div style={styles.companyInfo}>
                    <div style={styles.companyName}>{job.company}</div>
                    <div style={styles.jobRole}>
                      {job.role}
                      {job.match >= 90 && <span style={styles.recommendedTag}>⭐ Top Match</span>}
                    </div>
                  </div>
                  <button onClick={() => handleSaveJob(job.id)} style={styles.saveBtn}>
                    {isSaved ? '❤️' : '🤍'}
                  </button>
                </div>
                <div style={styles.jobDetails}>
                  <span style={styles.detailItem}><DollarSign size={12} /> {job.package}</span>
                  <span style={styles.detailItem}><MapPin size={12} /> {job.location}</span>
                  <span style={styles.detailItem}><Clock size={12} /> Posted {job.postedDate}</span>
                  <span style={styles.detailItem}>
                    {job.type === 'internship' ? '🎓 Internship' : 
                     job.type === 'part_time' ? '⏳ Part-time' : 
                     job.type === 'contract' ? '📄 Contract' : '💼 Full-time'}
                  </span>
                </div>
                <div style={styles.matchSection}>
                  <div style={styles.matchBadge(job.match)}>
                    <TrendingUp size={12} /> {job.match}% Match
                  </div>
                  <div style={styles.deadlineText}>
                    <Calendar size={12} /> Apply by {job.deadline}
                  </div>
                </div>
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => openApplyModal(job)} 
                    disabled={applying || job.hasApplied} 
                    style={styles.btnPrimary(applying, job.hasApplied)}
                  >
                    {job.hasApplied ? '✓ Applied' : 'Apply Now →'}
                  </button>
                  <button onClick={() => handleViewDetails(job)} style={styles.btnOutline}>
                    <Eye size={14} /> Details
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
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <span style={styles.detailItem}>💰 {selectedJob.package}</span>
                <span style={styles.detailItem}>📍 {selectedJob.location}</span>
                <span style={styles.detailItem}>{selectedJob.type}</span>
                <span style={styles.detailItem}>🎯 {selectedJob.openings} openings</span>
              </div>
            </div>
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📝 Description</div>
              <div style={styles.modalValue}>{selectedJob.description}</div>
            </div>
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📊 Eligibility</div>
              <div style={styles.modalValue}>Minimum CGPA: {selectedJob.eligibility}+</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => { setShowDetailsModal(false); openApplyModal(selectedJob) }} 
                disabled={applying || selectedJob.hasApplied} 
                style={styles.btnPrimary(applying, selectedJob.hasApplied)}
              >
                {selectedJob.hasApplied ? '✓ Applied' : 'Apply Now →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvailableJobs