import { useState, useEffect } from 'react'
import { ShieldCheck, TrendingUp, Search, Edit2, Save, X, Briefcase, DollarSign, MapPin, Calendar, Building, Tag } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function EligibilityChecker() {
  const [profile, setProfile] = useState({
    cgpa: 0,
    branch: '',
    program: '',
    semester: '',
    skills: []
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [tempCgpa, setTempCgpa] = useState(0)
  const [filterBranch, setFilterBranch] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [eligibleJobs, setEligibleJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [stats, setStats] = useState({
    eligible: 0,
    highMatch: 0,
    averagePackage: 0
  })

  const token = localStorage.getItem('studentToken')

  // Helper function to normalize skills
  const normalizeSkills = (skills) => {
    if (!skills) return []
    if (Array.isArray(skills)) return skills
    if (typeof skills === 'string') return skills.split(',').map(s => s.trim()).filter(s => s)
    return []
  }

  // Helper function to check if job is still available
  const isJobAvailable = (job) => {
    if (!job.deadline) return true
    const deadline = new Date(job.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return deadline >= today && job.status === 'active'
  }

  // ✅ Company Logo Fallback
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

  // ✅ Get Full Logo URL
  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return null
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath
    }
    const baseUrl = 'http://localhost:5000'
    const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`
    return `${baseUrl}${cleanPath}`
  }

  // Fetch student profile
  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const studentData = response.data.profile || response.data.student
        const normalizedSkills = normalizeSkills(studentData.skills)
        
        setProfile({
          cgpa: studentData.current_cgpa || 0,
          branch: studentData.branch || '',
          program: studentData.program || '',
          semester: studentData.semester || '',
          skills: normalizedSkills
        })
        setTempCgpa(studentData.current_cgpa || 0)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    }
  }

  // Fetch applied jobs
  const fetchAppliedJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const ids = response.data.applications.map(app => app.job_id)
        setAppliedJobIds(ids)
        return ids
      }
      return []
    } catch (error) {
      console.log('Could not fetch applied jobs:', error.message)
      return []
    }
  }

  // ✅ Fetch eligible jobs
  const fetchEligibleJobs = async () => {
    setLoading(true)
    try {
      const appliedIds = await fetchAppliedJobs()
      
      const response = await axios.get(`${API_URL}/student/eligible-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success && response.data.jobs) {
        const availableJobs = response.data.jobs.filter(job => isJobAvailable(job))
        
        const jobsWithMatch = availableJobs.map(job => {
          // ✅ Get logo URL
          let logoUrl = null
          if (job.company_logo) {
            logoUrl = getFullLogoUrl(job.company_logo)
          }
          if (!logoUrl) {
            logoUrl = getCompanyLogo(job.companyName)
          }
          
          return {
            ...job,
            match: calculateMatch(job.eligibility),
            hasApplied: appliedIds.includes(job.id),
            companyLogo: logoUrl
          }
        })
        
        setEligibleJobs(jobsWithMatch)
        
        const eligibleCount = jobsWithMatch.length
        const highMatchCount = jobsWithMatch.filter(j => j.match >= 85).length
        const avgPackage = jobsWithMatch.length > 0 
          ? Math.round(jobsWithMatch.reduce((sum, j) => sum + parseFloat(j.package || 0), 0) / jobsWithMatch.length)
          : 0
        
        setStats({
          eligible: eligibleCount,
          highMatch: highMatchCount,
          averagePackage: avgPackage
        })
      } else {
        setEligibleJobs([])
      }
    } catch (error) {
      console.error('Error fetching eligible jobs:', error)
      setEligibleJobs([])
      toast.error('Failed to load eligible jobs')
    } finally {
      setLoading(false)
    }
  }

  const calculateMatch = (eligibilityCgpa) => {
    const studentCgpa = profile.cgpa || 0
    if (!eligibilityCgpa) return 85
    if (studentCgpa >= eligibilityCgpa + 0.5) return 95
    if (studentCgpa >= eligibilityCgpa) return 85
    if (studentCgpa >= eligibilityCgpa - 0.5) return 70
    if (studentCgpa >= eligibilityCgpa - 1) return 55
    return 40
  }

  const handleSaveCgpa = async () => {
    try {
      const response = await axios.put(`${API_URL}/student/profile`, 
        { currentCgpa: parseFloat(tempCgpa) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        setProfile({ ...profile, cgpa: parseFloat(tempCgpa) })
        setIsEditing(false)
        toast.success('CGPA updated successfully!')
        fetchEligibleJobs()
      }
    } catch (error) {
      console.error('Error updating CGPA:', error)
      toast.error('Failed to update CGPA')
    }
  }

  const handleQuickApply = async (job) => {
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
        toast.success(`Successfully applied to ${job.companyName}! 🎉`)
        setEligibleJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, hasApplied: true } : j
        ))
        setAppliedJobIds(prev => [...prev, job.id])
      } else {
        toast.error(response.data.message || 'Failed to apply')
      }
    } catch (error) {
      console.error('Apply error:', error)
      const errorMsg = error.response?.data?.message || 'Failed to apply'
      if (errorMsg.includes('Already applied')) {
        toast.error('You have already applied for this job!')
        setEligibleJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, hasApplied: true } : j
        ))
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setApplying(false)
    }
  }

  const getMatchColor = (match) => {
    if (match >= 90) return '#10b981'
    if (match >= 80) return '#3b82f6'
    if (match >= 70) return '#f59e0b'
    return '#ef4444'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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

  useEffect(() => {
    fetchStudentProfile()
    fetchEligibleJobs()
  }, [])

  const filteredJobs = eligibleJobs.filter(job => {
    const matchesSearch = job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBranch = filterBranch === 'all' || 
                          (job.branch && job.branch.toLowerCase() === filterBranch.toLowerCase())
    
    return matchesSearch && matchesBranch
  })

  const suggestions = []
  if (profile.cgpa < 8.0) {
    suggestions.push({ 
      message: 'Improve your CGPA to 8.0+ for better opportunities at top companies', 
      priority: 'high'
    })
  }
  if (normalizeSkills(profile.skills).length < 3) {
    suggestions.push({ 
      message: 'Add more technical skills to your profile to increase match percentage', 
      priority: 'high'
    })
  }

  const styles = {
    container: { background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    title: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    profileCard: { background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem', color: 'white' },
    profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' },
    profileDetails: { fontSize: '0.75rem', opacity: 0.9 },
    cgpaBox: { background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '120px' },
    cgpaValue: { fontSize: '2rem', fontWeight: '700' },
    cgpaLabel: { fontSize: '0.7rem', opacity: 0.9 },
    editBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginTop: '0.5rem', width: '100%', justifyContent: 'center' },
    statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    statCard: (color) => ({ flex: 1, background: '#f8fafc', borderRadius: '16px', padding: '1rem', textAlign: 'center', borderTop: `3px solid ${color}` }),
    statValue: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' },
    statLabel: { fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' },
    searchContainer: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1 },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%' },
    filterSelect: { padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', background: 'white', cursor: 'pointer' },
    loadingState: { textAlign: 'center', padding: '3rem', color: '#64748b' },
    jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    jobCard: { background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.3s ease' },
    cardHeader: { padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #e2e8f0' },
    companyLogo: { width: '50px', height: '50px', background: '#ffffff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    logoImage: { width: '100%', height: '100%', objectFit: 'contain', padding: '6px' },
    logoPlaceholder: { background: '#2563eb', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '600', borderRadius: '14px' },
    companyInfo: { flex: 1 },
    companyName: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' },
    jobTitle: { fontSize: '0.7rem', color: '#64748b' },
    matchBadge: (match) => ({ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: getMatchColor(match) + '15', color: getMatchColor(match) }),
    cardDetails: { padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' },
    detailItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#64748b', background: '#f8fafc', padding: '0.25rem 0.6rem', borderRadius: '20px' },
    deadlineInfo: { padding: '0.5rem 1rem', fontSize: '0.7rem', color: '#f59e0b', borderBottom: '1px solid #f1f5f9' },
    actionButtons: { padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem' },
    btnPrimary: (isApplying, hasApplied) => ({ 
      flex: 1, padding: '0.5rem', background: hasApplied ? '#10b981' : '#2563eb', 
      color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.75rem', 
      fontWeight: '500', cursor: (isApplying || hasApplied) ? 'not-allowed' : 'pointer', 
      opacity: (isApplying || hasApplied) ? 0.6 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' 
    }),
    suggestionsCard: { background: '#fef3c7', borderRadius: '16px', padding: '1rem', marginTop: '1rem' },
    suggestionTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    suggestionItem: { fontSize: '0.75rem', color: '#78350f', padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    emptyState: { textAlign: 'center', padding: '3rem', color: '#64748b' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', width: '90%' },
    editInput: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', textAlign: 'center' },
    modalButtons: { display: 'flex', gap: '1rem', marginTop: '1rem' },
    modalBtnSave: { flex: 1, padding: '0.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
    modalBtnCancel: { flex: 1, padding: '0.5rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer' }
  }

  const getSkillsDisplay = () => {
    const skillsArray = normalizeSkills(profile.skills)
    if (skillsArray.length === 0) return 'Not added'
    return skillsArray.slice(0, 3).join(', ') + (skillsArray.length > 3 ? '...' : '')
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading eligible jobs...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <ShieldCheck size={22} color="#10b981" />
          <span>Available Jobs For You</span>
        </div>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.profileRow}>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{profile.program} - {profile.branch}</div>
            <div style={styles.profileDetails}>
              Semester: {profile.semester || 'N/A'} | 
              Skills: {getSkillsDisplay()}
            </div>
          </div>
          <div style={styles.cgpaBox}>
            <div style={styles.cgpaValue}>{profile.cgpa}</div>
            <div style={styles.cgpaLabel}>Current CGPA</div>
            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
              <Edit2 size={12} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.eligible}</div>
          <div style={styles.statLabel}>Available Jobs</div>
        </div>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.highMatch}</div>
          <div style={styles.statLabel}>High Match (85%+)</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.averagePackage} LPA</div>
          <div style={styles.statLabel}>Avg Package</div>
        </div>
      </div>

      {/* Search & Filter */}
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
        <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="EE">EE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
      </div>

      {/* Available Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div style={styles.emptyState}>
          <ShieldCheck size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No jobs available at the moment</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
            Check back later for new opportunities!
          </p>
        </div>
      ) : (
        <div style={styles.jobsGrid}>
          {filteredJobs.map((job) => {
            const daysLeft = getDaysLeft(job.deadline)
            
            // ✅ Logo handling - using companyLogo from API or fallback
            let logoUrl = job.companyLogo || null
            
            return (
              <div key={job.id} style={styles.jobCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.companyLogo}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={job.companyName} 
                        style={styles.logoImage}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<div style="background: #2563eb; color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; border-radius: 14px;">${job.companyName?.charAt(0) || 'C'}</div>`
                        }}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>{job.companyName?.charAt(0) || 'C'}</div>
                    )}
                  </div>
                  <div style={styles.companyInfo}>
                    <div style={styles.companyName}>{job.companyName}</div>
                    <div style={styles.jobTitle}>{job.title}</div>
                  </div>
                  <div style={styles.matchBadge(job.match)}>
                    <TrendingUp size={10} /> {job.match}% Match
                  </div>
                </div>
                <div style={styles.cardDetails}>
                  <span style={styles.detailItem}>
                    <Tag size={12} /> 💰 {job.package} LPA
                  </span>
                  <span style={styles.detailItem}>
                    <MapPin size={12} /> {job.location || 'Remote'}
                  </span>
                  <span style={styles.detailItem}>
                    <Building size={12} /> {job.companyName}
                  </span>
                  <span style={styles.detailItem}>
                    🎯 {job.openings || 1} openings
                  </span>
                </div>
                <div style={styles.deadlineInfo}>
                  <Calendar size={12} style={{ marginRight: '0.25rem' }} />
                  ⏰ Apply by {formatDate(job.deadline)} {daysLeft && `(${daysLeft})`}
                </div>
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => handleQuickApply(job)} 
                    disabled={applying || job.hasApplied} 
                    style={styles.btnPrimary(applying, job.hasApplied)}
                  >
                    {job.hasApplied ? '✓ Applied' : (applying ? 'Applying...' : 'Apply Now →')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div style={styles.suggestionsCard}>
          <div style={styles.suggestionTitle}>
            <TrendingUp size={16} /> Suggestions to Improve Your Eligibility
          </div>
          {suggestions.map((s, idx) => (
            <div key={idx} style={styles.suggestionItem}>
              <span>{s.priority === 'high' ? '🔴' : '🟡'}</span>
              <span>{s.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Edit CGPA Modal */}
      {isEditing && (
        <div style={styles.modalOverlay} onClick={() => setIsEditing(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Update CGPA</h3>
            <input 
              type="number" 
              step="0.01" 
              value={tempCgpa} 
              onChange={(e) => setTempCgpa(e.target.value)} 
              style={styles.editInput}
            />
            <div style={styles.modalButtons}>
              <button onClick={handleSaveCgpa} style={styles.modalBtnSave}>Save</button>
              <button onClick={() => setIsEditing(false)} style={styles.modalBtnCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EligibilityChecker