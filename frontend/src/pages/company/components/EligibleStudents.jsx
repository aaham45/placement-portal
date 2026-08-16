import { useState, useEffect, useRef } from 'react'
import { 
  Search, Star, Users, CheckCircle, UserPlus, 
  TrendingUp, Award, Briefcase, Mail, Phone, MapPin,
  ChevronDown, ChevronUp, X, Eye, Download, Filter,
  GraduationCap, Code, BookOpen, BadgeCheck, ToggleLeft, ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ✅ STYLES OBJECT
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  statCard: (color) => ({
    background: `linear-gradient(135deg, ${color}08, ${color}04)`,
    borderRadius: '16px',
    padding: '1rem',
    border: `1px solid ${color}20`,
    textAlign: 'center'
  }),
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '0.25rem'
  },
  requirementCard: {
    background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    border: '1px solid #fde68a'
  },
  requirementText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#92400e'
  },
  eligibleCount: {
    background: '#f59e0b',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  filtersBar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.8rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    flex: 1,
    maxWidth: '280px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.8rem',
    width: '100%'
  },
  filterSelect: {
    padding: '0.4rem 0.8rem',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.8rem',
    background: 'white',
    cursor: 'pointer'
  },
  matchSlider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.2rem 0.8rem',
    background: '#f8fafc',
    borderRadius: '10px'
  },
  matchInput: {
    width: '50px',
    padding: '0.2rem 0.3rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.7rem'
  },
  bulkActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  btnPrimary: {
    padding: '0.4rem 0.8rem',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  btnOutline: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  btnSuccess: {
    padding: '0.35rem 0.7rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  btnInfo: {
    padding: '0.35rem 0.7rem',
    background: '#dbeafe',
    color: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  btnDanger: {
    padding: '0.35rem 0.7rem',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  studentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '0.875rem',
    marginBottom: '0.875rem',
    transition: 'all 0.2s ease',
    background: 'white'
  },
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  studentInfo: {
    flex: 1
  },
  studentName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  studentMeta: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.2rem',
    fontSize: '0.65rem',
    color: '#64748b',
    flexWrap: 'wrap'
  },
  matchContainer: {
    textAlign: 'right'
  },
  matchBadge: (match) => ({
    background: `${getMatchColor(match)}15`,
    color: getMatchColor(match),
    padding: '0.2rem 0.6rem',
    borderRadius: '16px',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  }),
  matchLabel: {
    fontSize: '0.6rem',
    color: '#64748b',
    marginTop: '0.15rem'
  },
  skillsContainer: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
    margin: '0.5rem 0'
  },
  skillBadge: {
    background: '#f3e8ff',
    color: '#7c3aed',
    padding: '0.15rem 0.5rem',
    borderRadius: '16px',
    fontSize: '0.65rem',
    fontWeight: '500'
  },
  expandedContent: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e2e8f0'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.7rem',
    color: '#475569'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.4rem',
    justifyContent: 'flex-end',
    marginTop: '0.75rem',
    flexWrap: 'wrap'
  },
  emptyState: {
    textAlign: 'center',
    padding: '2.5rem',
    color: '#64748b'
  },
  shortlistedTag: {
    background: '#10b981',
    color: 'white',
    padding: '0.15rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.6rem',
    fontWeight: '500',
    marginLeft: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  quickFilterContainer: {
    display: 'flex',
    gap: '0.6rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  projectBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.15rem 0.4rem',
    borderRadius: '10px',
    fontSize: '0.6rem',
    fontWeight: '500'
  },
  certificationBadge: {
    background: '#fce7f3',
    color: '#be185d',
    padding: '0.15rem 0.4rem',
    borderRadius: '10px',
    fontSize: '0.6rem',
    fontWeight: '500'
  },
  locationText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#64748b',
    fontSize: '0.65rem'
  },
  skillInputContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    alignItems: 'center',
    padding: '0.2rem 0.4rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    minHeight: '1.8rem',
    minWidth: '160px'
  },
  skillTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    padding: '0.1rem 0.4rem',
    background: '#ede9fe',
    color: '#7c3aed',
    borderRadius: '12px',
    fontSize: '0.65rem',
    fontWeight: '500'
  },
  skillInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.7rem',
    background: 'transparent',
    flex: 1,
    minWidth: '60px',
    padding: '0.15rem 0'
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.65rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}

// Helper functions
const getMatchColor = (match) => {
  if (match >= 90) return '#10b981'
  if (match >= 80) return '#f59e0b'
  return '#ef4444'
}

const getMatchLabel = (match) => {
  if (match >= 90) return 'Excellent'
  if (match >= 80) return 'Good'
  return 'Average'
}

const safeConvertToArray = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'string') {
    return data.split(',').map(item => item.trim()).filter(item => item && item !== 'undefined' && item !== 'null')
  }
  return []
}

function EligibleStudents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [minMatch, setMinMatch] = useState(70)
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [expandedStudent, setExpandedStudent] = useState(null)
  const [eligibleStudents, setEligibleStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isShortlisting, setIsShortlisting] = useState(false)
  
  // Shortlisted IDs from backend
  const [shortlistedIds, setShortlistedIds] = useState([])
  
  // Filters
  const [minCgpa, setMinCgpa] = useState(7.5)
  const [skillFilterTags, setSkillFilterTags] = useState([])
  const [skillInputValue, setSkillInputValue] = useState('')
  const skillInputRef = useRef(null)

  // AUTO FILTER TOGGLE
  const [autoFilterEnabled, setAutoFilterEnabled] = useState(true)

  const token = localStorage.getItem('companyToken')
  const branches = ['all', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE']

  const requiredSkills = ['React', 'Java', 'Python', 'Node.js']
  const requiredCgpa = 7.5

  const addSkillTag = (skill) => {
    const trimmed = skill.trim()
    if (trimmed && !skillFilterTags.includes(trimmed)) {
      setSkillFilterTags([...skillFilterTags, trimmed])
      setSkillInputValue('')
    }
  }

  const removeSkillTag = (skill) => {
    setSkillFilterTags(skillFilterTags.filter(s => s !== skill))
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkillTag(skillInputValue)
    }
    if (e.key === 'Backspace' && skillInputValue === '' && skillFilterTags.length > 0) {
      removeSkillTag(skillFilterTags[skillFilterTags.length - 1])
    }
  }

  // Fetch eligible students
  const fetchEligibleStudents = async () => {
    setLoading(true)
    try {
      console.log('📋 Fetching eligible students from:', `${API_URL}/company/students`)
      
      const response = await axios.get(`${API_URL}/company/students`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📊 Response:', response.data)
      
      if (response.data.success) {
        const studentsData = response.data.students || []
        console.log('📊 Students count:', studentsData.length)
        
        const formattedStudents = studentsData.map(student => {
          let skills = []
          if (student.skills) {
            if (Array.isArray(student.skills)) {
              skills = student.skills
            } else if (typeof student.skills === 'string') {
              skills = student.skills.split(',').map(s => s.trim()).filter(Boolean)
            }
          }
          
          const matchedSkills = requiredSkills.filter(skill => 
            skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          )
          const skillMatch = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 0
          
          const cgpa = parseFloat(student.current_cgpa || student.cgpa || 0)
          const cgpaMatch = cgpa >= requiredCgpa ? 100 : (cgpa / requiredCgpa) * 100
          
          const match = Math.min(Math.round((skillMatch * 0.6) + (cgpaMatch * 0.4)), 100)
          
          let resumeUrl = student.resume_url || null
          if (resumeUrl && !resumeUrl.startsWith('http')) {
            if (resumeUrl.startsWith('/uploads/')) {
              resumeUrl = `${API_URL.replace('/api', '')}${resumeUrl}`
            } else if (resumeUrl.startsWith('uploads/')) {
              resumeUrl = `${API_URL.replace('/api', '')}/${resumeUrl}`
            } else {
              resumeUrl = `${API_URL.replace('/api', '')}/uploads/resumes/${resumeUrl}`
            }
          }
          
          return {
            id: student.id,
            name: student.name || 'Unknown',
            cgpa: cgpa,
            branch: student.branch || 'N/A',
            semester: student.semester || 8,
            skills: skills,
            match: match,
            email: student.email || '',
            phone: student.phone || 'N/A',
            location: student.location || student.address || 'Not specified',
            projects: safeConvertToArray(student.projects),
            experience: student.experience || 'Fresher',
            resumeUrl: resumeUrl,
            certifications: safeConvertToArray(student.certifications || student.achievements),
            regNo: student.reg_no || 'N/A',
            program: student.program || 'B.Tech'
          }
        })
        
        console.log('📊 Formatted students:', formattedStudents)
        setEligibleStudents(formattedStudents)
      } else {
        setEligibleStudents([])
      }
    } catch (error) {
      console.error('❌ Error fetching eligible students:', error)
      setEligibleStudents([])
      toast.error('Failed to load eligible students')
    } finally {
      setLoading(false)
    }
  }

  // Fetch shortlisted IDs from backend
  const fetchShortlistedIds = async () => {
    try {
      const response = await axios.get(`${API_URL}/company/shortlisted-ids`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setShortlistedIds(response.data.shortlistedIds || [])
        console.log('📊 Shortlisted IDs:', response.data.shortlistedIds)
      }
    } catch (error) {
      console.error('❌ Error fetching shortlisted IDs:', error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchEligibleStudents()
      fetchShortlistedIds()
    } else {
      console.log('❌ No token found')
      setEligibleStudents([])
      setLoading(false)
    }
  }, [token])

  // ✅ FIXED: Filter out already shortlisted students
  const filteredStudents = eligibleStudents.filter(student => {
    // ✅ Skip if already shortlisted
    if (shortlistedIds.includes(student.id)) {
      return false;
    }
    
    const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (student.branch || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch
    const matchesMatch = student.match >= minMatch
    
    let matchesAutoFilter = true
    if (autoFilterEnabled) {
      const matchesCgpa = student.cgpa >= requiredCgpa
      const matchesAutoSkills = requiredSkills.some(skill => 
        (student.skills || []).some(s => s.toLowerCase().includes(skill.toLowerCase()))
      )
      matchesAutoFilter = matchesCgpa && matchesAutoSkills
    }
    
    const matchesManualCgpa = minCgpa === 0 || student.cgpa >= minCgpa
    const matchesSkillTags = skillFilterTags.length === 0 || 
      skillFilterTags.some(tag => 
        (student.skills || []).some(s => s.toLowerCase().includes(tag.toLowerCase()))
      )
    
    return matchesSearch && matchesBranch && matchesMatch && 
           matchesAutoFilter && matchesManualCgpa && matchesSkillTags
  })

  // Check if student is shortlisted
  const isStudentShortlisted = (studentId) => {
    return shortlistedIds.includes(studentId)
  }

  // handleShortlist with API call
  const handleShortlist = async (student) => {
    if (isStudentShortlisted(student.id)) {
      toast.info(`${student.name} already shortlisted`)
      return
    }
    
    setIsShortlisting(true)
    try {
      console.log(`📝 Shortlisting student: ${student.id} - ${student.name}`)
      
      const response = await axios.post(
        `${API_URL}/company/students/${student.id}/shortlist`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      )
      
      console.log('📊 Shortlist response:', response.data)
      
      if (response.data.success) {
        setShortlistedIds([...shortlistedIds, student.id])
        toast.success(`${student.name} shortlisted successfully! 🎉`)
        await fetchEligibleStudents()
        await fetchShortlistedIds()
      } else {
        toast.error(response.data.message || 'Failed to shortlist')
      }
    } catch (error) {
      console.error('❌ Error shortlisting student:', error)
      let errorMsg = 'Failed to shortlist student'
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      }
      toast.error(errorMsg)
    } finally {
      setIsShortlisting(false)
    }
  }

  // handleRemoveShortlist with API call
  const handleRemoveShortlist = async (studentId) => {
    setIsShortlisting(true)
    try {
      console.log(`🗑️ Removing shortlist for student: ${studentId}`)
      
      const response = await axios.delete(
        `${API_URL}/company/students/${studentId}/shortlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        setShortlistedIds(shortlistedIds.filter(id => id !== studentId))
        toast.success('Removed from shortlist')
        await fetchEligibleStudents()
        await fetchShortlistedIds()
      } else {
        toast.error(response.data.message || 'Failed to remove')
      }
    } catch (error) {
      console.error('❌ Error removing shortlist:', error)
      toast.error(error.response?.data?.message || 'Failed to remove from shortlist')
    } finally {
      setIsShortlisting(false)
    }
  }

  // handleBulkShortlist with API calls
  const handleBulkShortlist = async () => {
    const newSelected = [...shortlistedIds]
    let count = 0
    
    setIsShortlisting(true)
    for (const student of filteredStudents) {
      if (!newSelected.includes(student.id)) {
        try {
          const response = await axios.post(
            `${API_URL}/company/students/${student.id}/shortlist`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          if (response.data.success) {
            newSelected.push(student.id)
            count++
          }
        } catch (error) {
          console.error(`❌ Error shortlisting ${student.name}:`, error)
        }
      }
    }
    
    setShortlistedIds(newSelected)
    toast.success(`${count} students shortlisted! 🎉`)
    await fetchEligibleStudents()
    await fetchShortlistedIds()
    setIsShortlisting(false)
  }

  const handleSendEmail = (student) => {
    const subject = encodeURIComponent('Interview Opportunity')
    const body = encodeURIComponent(
      `Dear ${student.name},\n\n` +
      `We are pleased to inform you that you have been shortlisted for an interview opportunity.\n\n` +
      `Regards,\nHR Team`
    )
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${student.email}&su=${subject}&body=${body}`, '_blank')
    toast.success(`Opening email for ${student.name}`)
  }

  const handleViewResume = (student) => {
    if (student.resumeUrl && student.resumeUrl !== '#' && student.resumeUrl !== null) {
      window.open(student.resumeUrl, '_blank')
      toast.success(`Opening resume for ${student.name}`)
    } else {
      toast.info('Resume not uploaded by student')
    }
  }

  const handleDownloadResume = (student) => {
    if (student.resumeUrl && student.resumeUrl !== '#' && student.resumeUrl !== null) {
      window.open(student.resumeUrl, '_blank')
      toast.success(`Downloading resume for ${student.name}`)
    } else {
      toast.info('Resume not uploaded by student')
    }
  }

  const stats = {
    total: eligibleStudents.length,
    filtered: filteredStudents.length,
    shortlisted: shortlistedIds.length,
    avgMatch: filteredStudents.length > 0 
      ? Math.round(filteredStudents.reduce((sum, s) => sum + s.match, 0) / filteredStudents.length) 
      : 0
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748b' }}>Loading eligible students...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <UserPlus size={18} color="white" />
          </div>
          <span>Eligible Students Finder</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.6rem', borderRadius: '20px' }}>
            {eligibleStudents.length} Total
          </span>
        </div>
        <div style={styles.bulkActions}>
          {shortlistedIds.length > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '500' }}>
              {shortlistedIds.length} shortlisted
            </span>
          )}
          <button 
            onClick={handleBulkShortlist} 
            style={styles.btnPrimary}
            disabled={isShortlisting || filteredStudents.length === 0}
          >
            <CheckCircle size={14} /> {isShortlisting ? 'Shortlisting...' : 'Bulk Shortlist'}
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Eligible</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.filtered}</div>
          <div style={styles.statLabel}>Filtered</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.shortlisted}</div>
          <div style={styles.statLabel}>Shortlisted</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.avgMatch}%</div>
          <div style={styles.statLabel}>Avg Match</div>
        </div>
      </div>

      <div style={styles.requirementCard}>
        <div style={styles.requirementText}>
          <Award size={16} color="#f59e0b" />
          🎯 Required: CGPA ≥ {requiredCgpa} | Skills: {requiredSkills.join(', ')}
        </div>
        <div style={styles.eligibleCount}>
          {filteredStudents.length} Eligible Students
        </div>
      </div>

      <div style={styles.quickFilterContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b' }}>Filters:</span>
        </div>

        <button
          onClick={() => setAutoFilterEnabled(!autoFilterEnabled)}
          style={{
            ...styles.toggleBtn,
            background: autoFilterEnabled ? '#dbeafe' : '#f1f5f9',
            color: autoFilterEnabled ? '#2563eb' : '#64748b'
          }}
        >
          {autoFilterEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          Auto Filter {autoFilterEnabled ? 'ON' : 'OFF'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <GraduationCap size={14} color="#64748b" />
          <span style={{ fontSize: '0.6rem', color: '#64748b' }}>CGPA ≥</span>
          <input
            type="number"
            value={minCgpa}
            onChange={(e) => setMinCgpa(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
            style={{
              width: '45px',
              padding: '0.15rem 0.3rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '0.65rem',
              outline: 'none'
            }}
            step="0.1"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Code size={14} color="#64748b" />
          <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Skills:</span>
          <div style={styles.skillInputContainer}>
            {skillFilterTags.map(tag => (
              <span key={tag} style={styles.skillTag}>
                {tag}
                <span 
                  onClick={() => removeSkillTag(tag)}
                  style={{ cursor: 'pointer', opacity: 0.6 }}
                >
                  <X size={10} />
                </span>
              </span>
            ))}
            <input
              ref={skillInputRef}
              type="text"
              value={skillInputValue}
              onChange={(e) => setSkillInputValue(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder={skillFilterTags.length === 0 ? "Type and Enter..." : ""}
              style={styles.skillInput}
            />
          </div>
          {skillFilterTags.length > 0 && (
            <button 
              onClick={() => setSkillFilterTags([])}
              style={{ ...styles.btnDanger, padding: '0.1rem 0.4rem', fontSize: '0.55rem' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={styles.filtersBar}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={styles.searchBox}>
            <Search size={14} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by name, skills..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} style={styles.filterSelect}>
            {branches.map(b => <option key={b} value={b}>{b === 'all' ? 'All Branches' : b}</option>)}
          </select>
          <div style={styles.matchSlider}>
            <Star size={12} color="#f59e0b" />
            <span style={{ fontSize: '0.6rem' }}>Match ≥</span>
            <input 
              type="number" 
              value={minMatch} 
              onChange={(e) => setMinMatch(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} 
              style={styles.matchInput} 
            />
            <span style={{ fontSize: '0.6rem' }}>%</span>
          </div>
        </div>
        <button onClick={() => {
          setSearchTerm('')
          setSelectedBranch('all')
          setMinMatch(70)
          setMinCgpa(7.5)
          setSkillFilterTags([])
          setSkillInputValue('')
          setAutoFilterEnabled(true)
        }} style={styles.btnOutline}>
          <X size={12} /> Reset All
        </button>
      </div>

      {filteredStudents.length === 0 ? (
        <div style={styles.emptyState}>
          <Users size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <p>No eligible students found</p>
          <p style={{ fontSize: '0.65rem' }}>Try adjusting your filters</p>
        </div>
      ) : (
        filteredStudents.map(student => {
          // ✅ Student is NOT shortlisted (filtered out already)
          return (
            <div key={student.id} style={styles.studentCard}>
              <div style={styles.studentHeader}>
                <div style={styles.studentInfo}>
                  <div style={styles.studentName}>
                    {student.name}
                  </div>
                  <div style={styles.studentMeta}>
                    <span>🎓 CGPA: {student.cgpa.toFixed(2)}</span>
                    <span>📚 {student.branch}</span>
                    <span>📅 Sem {student.semester}</span>
                    <span style={styles.locationText}>
                      <MapPin size={10} /> {student.location}
                    </span>
                    <span>{student.program}</span>
                  </div>
                  <div style={styles.skillsContainer}>
                    {(student.skills || []).map(skill => (
                      <span key={skill} style={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div style={styles.matchContainer}>
                  <div style={styles.matchBadge(student.match)}>
                    <TrendingUp size={10} /> {student.match}%
                  </div>
                  <div style={styles.matchLabel}>{getMatchLabel(student.match)}</div>
                </div>
              </div>

              <button 
                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                style={{ ...styles.btnOutline, width: '100%', marginTop: '0.4rem', justifyContent: 'center', padding: '0.25rem' }}
                disabled={isShortlisting}
              >
                {expandedStudent === student.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expandedStudent === student.id ? 'Show Less' : 'View Details'}
              </button>

              {expandedStudent === student.id && (
                <div style={styles.expandedContent}>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailItem}><Mail size={12} color="#64748b" /> {student.email}</div>
                    <div style={styles.detailItem}><Phone size={12} color="#64748b" /> {student.phone}</div>
                    <div style={styles.detailItem}><Briefcase size={12} color="#64748b" /> {student.experience || 'Fresher'}</div>
                    <div style={styles.detailItem}><GraduationCap size={12} color="#64748b" /> Reg: {student.regNo}</div>
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>
                      <BookOpen size={10} /> Projects:
                    </strong>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {student.projects && student.projects.length > 0 ? 
                        student.projects.map((p, idx) => (
                          <span key={idx} style={styles.projectBadge}>{p}</span>
                        )) : 
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>No projects listed</span>
                      }
                    </div>
                  </div>

                  <div>
                    <strong style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>
                      <BadgeCheck size={10} /> Certifications:
                    </strong>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {student.certifications && student.certifications.length > 0 ? 
                        student.certifications.map((c, idx) => (
                          <span key={idx} style={styles.certificationBadge}>{c}</span>
                        )) : 
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>No certifications listed</span>
                      }
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.actionButtons}>
                <button onClick={() => handleViewResume(student)} style={styles.btnOutline} disabled={isShortlisting}>
                  <Eye size={10} /> Resume
                </button>
                <button onClick={() => handleDownloadResume(student)} style={styles.btnInfo} disabled={isShortlisting}>
                  <Download size={10} /> Download
                </button>
                <button onClick={() => handleSendEmail(student)} style={styles.btnOutline} disabled={isShortlisting}>
                  <Mail size={10} /> Email
                </button>
                <button 
                  onClick={() => handleShortlist(student)} 
                  style={styles.btnSuccess}
                  disabled={isShortlisting}
                >
                  <CheckCircle size={10} /> {isShortlisting ? '...' : 'Shortlist'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default EligibleStudents