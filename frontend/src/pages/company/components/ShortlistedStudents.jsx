import { useState, useEffect } from 'react'
import { 
  Users, CheckCircle, XCircle, Calendar, Mail, Phone, MapPin,
  Search, Filter, ChevronDown, ChevronUp, Star, Award, 
  Briefcase, Send, Eye, Download, Clock, MessageCircle,
  TrendingUp, UserCheck, Video, FileText, User, GraduationCap,
  Building, AtSign, Smartphone, Globe, Link as LinkIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
    background: 'linear-gradient(135deg, #10b981, #059669)',
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
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem'
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
    padding: '0.5rem 1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    flex: 1,
    maxWidth: '300px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.85rem',
    width: '100%'
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.85rem',
    background: 'white',
    cursor: 'pointer'
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
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  studentCard: {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '1rem',
    transition: 'all 0.2s ease'
  },
  studentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  studentAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: '600',
    flexShrink: 0,
    overflow: 'hidden'
  },
  studentCardTitle: {
    flex: 1
  },
  studentCardName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  studentCardMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.7rem',
    color: '#64748b',
    flexWrap: 'wrap',
    marginTop: '0.15rem'
  },
  studentCardBody: {
    padding: '1rem 1.25rem'
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.6rem',
    background: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#475569'
  },
  infoItemIcon: {
    color: '#94a3b8',
    flexShrink: 0
  },
  infoItemLabel: {
    color: '#94a3b8',
    fontSize: '0.6rem',
    marginRight: '0.15rem'
  },
  infoItemValue: {
    fontWeight: '500',
    color: '#1e293b'
  },
  skillsContainer: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
    marginBottom: '0.5rem'
  },
  skillBadge: {
    background: '#f3e8ff',
    color: '#7c3aed',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.65rem',
    fontWeight: '500'
  },
  statusBadge: (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.15rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.65rem',
    fontWeight: '600',
    background: bg,
    color: color
  }),
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    padding: '0.75rem 1.25rem',
    background: '#fafafa',
    borderTop: '1px solid #e2e8f0'
  },
  btnInfo: {
    padding: '0.3rem 0.7rem',
    background: '#dbeafe',
    color: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  btnPrimary: {
    padding: '0.3rem 0.7rem',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  btnSuccess: {
    padding: '0.3rem 0.7rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  btnDanger: {
    padding: '0.3rem 0.7rem',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  expandBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    padding: '0.3rem',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '0.7rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '0.5rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '0.5rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
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
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '1.2rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  formLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '0.25rem'
  },
  formInput: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.85rem',
    outline: 'none'
  },
  formSelect: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.85rem',
    outline: 'none',
    background: 'white',
    cursor: 'pointer'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem'
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    justifyContent: 'flex-end'
  },
  btnCancel: {
    padding: '0.5rem 1.5rem',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  btnSchedule: {
    padding: '0.5rem 1.5rem',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  jobTypeBadge: {
    display: 'inline-block',
    padding: '0.15rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.6rem',
    fontWeight: '500',
    marginLeft: '0.5rem',
    background: '#ede9fe',
    color: '#7c3aed'
  }
}

// Helper functions
const getStatusBadgeFn = (status) => {
  const badges = {
    'pending': { icon: '⏳', text: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
    'shortlisted': { icon: '✅', text: 'Shortlisted', color: '#10b981', bg: '#d1fae5' },
    'interview': { icon: '📅', text: 'Interview', color: '#3b82f6', bg: '#dbeafe' },
    'selected': { icon: '🏆', text: 'Selected', color: '#10b981', bg: '#d1fae5' },
    'rejected': { icon: '❌', text: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
  }
  return badges[status] || badges['pending']
}

function ShortlistedStudents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [expandedStudent, setExpandedStudent] = useState(null)
  const [shortlistedStudents, setShortlistedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    mode: 'Online',
    type: 'Technical',
    link: '',
    venue: ''
  })

  const token = localStorage.getItem('companyToken')
  const branches = ['all', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE']

  const fetchShortlistedStudents = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/company/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const apps = response.data.applications || []
        console.log('📊 Applications from backend:', apps);
        
        const shortlisted = apps.filter(app => app.status === 'shortlisted').map(app => ({
          id: app.id,
          student_id: app.student_id,
          name: app.student_name || app.name || 'Unknown',
          cgpa: parseFloat(app.student_cgpa || app.cgpa || 0),
          branch: app.student_branch || app.branch || 'N/A',
          skills: app.skills ? (typeof app.skills === 'string' ? app.skills.split(',') : app.skills) : [],
          email: app.student_email || app.email || '',
          phone: app.student_phone || app.phone || 'N/A',
          appliedFor: app.job_title || app.title || 'Job',
          shortlistedDate: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A',
          status: app.status || 'shortlisted',
          resumeUrl: app.resume_url || '#',
          job_type: app.job_type || 'Full-time',
          profilePic: app.profile_pic || app.student_profile_pic || null
        }))
        
        console.log('📊 Shortlisted students with profilePic:', shortlisted);
        setShortlistedStudents(shortlisted)
      } else {
        setShortlistedStudents([])
      }
    } catch (error) {
      console.error('Error fetching shortlisted students:', error)
      setShortlistedStudents([])
      toast.error('Failed to load shortlisted students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchShortlistedStudents()
    } else {
      setShortlistedStudents([])
      setLoading(false)
    }
  }, [token])

  const getInterviewTypeByJobType = (jobType) => {
    const typeMap = {
      'Full-time': 'Technical',
      'Part-time': 'HR',
      'Internship': 'HR',
      'Contract': 'Technical',
      'Remote': 'Technical',
      'Fresher': 'HR',
      'Walk-in': 'HR',
      'On-site': 'Technical',
      'Hybrid': 'Technical'
    }
    return typeMap[jobType] || 'Technical'
  }

  const handleOpenInterviewModal = (student) => {
    setSelectedStudent(student)
    const defaultType = getInterviewTypeByJobType(student.job_type || 'Full-time')
    setInterviewData({
      date: '',
      time: '',
      mode: 'Online',
      type: defaultType,
      link: '',
      venue: ''
    })
    setShowInterviewModal(true)
  }

  const handleScheduleInterview = async () => {
    if (!selectedStudent) return
    
    if (!interviewData.date || !interviewData.time) {
      toast.error('Please select date and time for interview')
      return
    }

    if (updating) return
    setUpdating(true)

    try {
      let studentUserId = selectedStudent.student_id;
      
      if (studentUserId === undefined || studentUserId === null) {
        console.error('❌ student_id is undefined for student:', selectedStudent);
        toast.error('Student ID not found. Please refresh and try again.');
        setUpdating(false);
        return;
      }
      
      console.log('📤 Scheduling interview for student_user_id:', studentUserId);
      console.log('📤 Application ID:', selectedStudent.id);

      await axios.put(
        `${API_URL}/company/applications/${selectedStudent.id}/status`,
        { status: 'interview' },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const interviewPayload = {
        applicationId: selectedStudent.id,
        studentId: studentUserId,
        date: interviewData.date,
        time: interviewData.time,
        mode: interviewData.mode,
        notes: `Interview Type: ${interviewData.type}\nLink: ${interviewData.link || 'N/A'}`
      }

      console.log('📤 Interview Payload:', interviewPayload);

      const response = await axios.post(
        `${API_URL}/company/interviews/schedule`,
        interviewPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success(`Interview scheduled for ${selectedStudent.name}!`)
        fetchShortlistedStudents()
        setShowInterviewModal(false)
        setSelectedStudent(null)
        setInterviewData({ date: '', time: '', mode: 'Online', type: 'Technical', link: '', venue: '' })
      } else {
        toast.error(response.data.message || 'Failed to schedule interview')
      }
    } catch (error) {
      console.error('Error scheduling interview:', error)
      toast.error(error.response?.data?.message || 'Failed to schedule interview')
    } finally {
      setUpdating(false)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedBranch('all')
    setSortBy('date')
    toast.success('Filters cleared!')
  }

  const handleViewResume = (student) => {
    if (!student.resumeUrl || student.resumeUrl === '#' || student.resumeUrl === '' || student.resumeUrl === null) {
      toast.error('Resume not uploaded by student');
      return;
    }
    
    try {
      let resumeUrl = student.resumeUrl;
      const baseUrl = 'http://localhost:5000';
      
      if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
        // Already full URL
      } 
      else if (resumeUrl.startsWith('/uploads/')) {
        resumeUrl = `${baseUrl}${resumeUrl}`;
      } 
      else if (resumeUrl.startsWith('uploads/')) {
        resumeUrl = `${baseUrl}/${resumeUrl}`;
      } 
      else if (!resumeUrl.startsWith('/')) {
        resumeUrl = `${baseUrl}/uploads/resumes/${resumeUrl}`;
      } 
      else {
        resumeUrl = `${baseUrl}${resumeUrl}`;
      }
      
      console.log('📄 Opening resume:', resumeUrl);
      window.open(resumeUrl, '_blank');
      toast.success(`Opening resume for ${student.name}`);
    } catch (error) {
      console.error('Error opening resume:', error);
      toast.error('Failed to open resume');
    }
  }

  const handleSendEmail = (student) => {
    const subject = encodeURIComponent(`Interview Opportunity - ${student.appliedFor}`)
    const body = encodeURIComponent(
      `Dear ${student.name},\n\n` +
      `We are pleased to inform you that you have been shortlisted for the position of ${student.appliedFor}.\n\n` +
      `We would like to schedule an interview with you. Please confirm your availability.\n\n` +
      `Regards,\nHR Team`
    )
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${student.email}&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
    toast.success(`Opening Gmail for ${student.name}`)
  }

  const handleReject = async (student) => {
    if (!window.confirm(`Are you sure you want to reject ${student.name}?`)) return
    if (updating) return
    setUpdating(true)
    try {
      await axios.put(
        `${API_URL}/company/applications/${student.id}/status`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`${student.name} has been rejected`)
      fetchShortlistedStudents()
    } catch (error) {
      console.error('Error rejecting student:', error)
      toast.error('Failed to reject student')
    } finally {
      setUpdating(false)
    }
  }

  const filteredStudents = shortlistedStudents.filter(student => {
    const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (student.appliedFor || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch
    return matchesSearch && matchesBranch
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.shortlistedDate) - new Date(a.shortlistedDate)
    } else if (sortBy === 'cgpa') {
      return (b.cgpa || 0) - (a.cgpa || 0)
    }
    return 0
  })

  const stats = {
    total: shortlistedStudents.length,
    pending: shortlistedStudents.filter(s => s.status === 'pending' || s.status === 'shortlisted').length,
    interview: shortlistedStudents.filter(s => s.status === 'interview' || s.status === 'interview_scheduled').length,
    selected: shortlistedStudents.filter(s => s.status === 'selected').length,
    avgCgpa: shortlistedStudents.length > 0 
      ? (shortlistedStudents.reduce((sum, s) => sum + (parseFloat(s.cgpa) || 0), 0) / shortlistedStudents.length).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748b' }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}><UserCheck size={18} color="white" /></div>
          <span>Shortlisted Students</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.6rem', borderRadius: '20px' }}>
            {shortlistedStudents.length} Total
          </span>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}><Users size={12} /> Total Shortlisted</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}><Clock size={12} /> Pending</div>
        </div>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.interview}</div>
          <div style={styles.statLabel}><Calendar size={12} /> Interview</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.selected}</div>
          <div style={styles.statLabel}><Award size={12} /> Selected</div>
        </div>
        <div style={styles.statCard('#ec4899')}>
          <div style={styles.statValue}>{stats.avgCgpa}</div>
          <div style={styles.statLabel}><TrendingUp size={12} /> Avg CGPA</div>
        </div>
      </div>

      <div style={styles.filtersBar}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Search by name, skill or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          </div>
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} style={styles.filterSelect}>
            {branches.map(b => <option key={b} value={b}>{b === 'all' ? 'All Branches' : b}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
            <option value="date">Sort by Date</option>
            <option value="cgpa">Sort by CGPA</option>
          </select>
        </div>
        <button onClick={handleClearFilters} style={styles.btnOutline}>
          <XCircle size={14} /> Clear
        </button>
      </div>

      {sortedStudents.length === 0 ? (
        <div style={styles.emptyState}>
          <Users size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No shortlisted students found</p>
        </div>
      ) : (
        sortedStudents.map(student => {
          const status = getStatusBadgeFn(student.status)
          const isExpanded = expandedStudent === student.id
          
          return (
            <div key={student.id} style={styles.studentCard}>
              {/* ✅ Student Card Header with Profile Picture */}
              <div style={styles.studentCardHeader}>
                <div style={styles.studentAvatar}>
                  {student.profilePic ? (
                    <img 
                      src={student.profilePic} 
                      alt={student.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        console.error('❌ Avatar image error:', e.target.src);
                        const parent = e.target.parentElement;
                        if (parent) {
                          e.target.style.display = 'none';
                          parent.style.background = 'linear-gradient(135deg, #7c3aed, #8b5cf6)';
                          parent.style.display = 'flex';
                          parent.style.alignItems = 'center';
                          parent.style.justifyContent = 'center';
                          parent.style.borderRadius = '50%';
                          parent.style.width = '48px';
                          parent.style.height = '48px';
                          parent.style.color = 'white';
                          parent.style.fontSize = '1.2rem';
                          parent.style.fontWeight = '600';
                          parent.innerHTML = student.name.charAt(0).toUpperCase();
                        }
                      }}
                    />
                  ) : (
                    student.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={styles.studentCardTitle}>
                  <div style={styles.studentCardName}>
                    {student.name}
                    <span style={styles.statusBadge(status.bg, status.color)}>
                      {status.icon} {status.text}
                    </span>
                  </div>
                  <div style={styles.studentCardMeta}>
                    <span>🎓 CGPA: {student.cgpa}</span>
                    <span>📚 {student.branch}</span>
                    <span>💼 {student.appliedFor}</span>
                    <span>📅 {student.shortlistedDate}</span>
                  </div>
                </div>
              </div>

              <div style={styles.studentCardBody}>
                <div style={styles.infoRow}>
                  <div style={styles.infoItem}>
                    <Mail size={14} style={styles.infoItemIcon} />
                    <span style={styles.infoItemLabel}>Email:</span>
                    <span style={styles.infoItemValue}>{student.email || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <Phone size={14} style={styles.infoItemIcon} />
                    <span style={styles.infoItemLabel}>Phone:</span>
                    <span style={styles.infoItemValue}>{student.phone || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <Briefcase size={14} style={styles.infoItemIcon} />
                    <span style={styles.infoItemLabel}>Applied For:</span>
                    <span style={styles.infoItemValue}>{student.appliedFor}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <Calendar size={14} style={styles.infoItemIcon} />
                    <span style={styles.infoItemLabel}>Shortlisted:</span>
                    <span style={styles.infoItemValue}>{student.shortlistedDate}</span>
                  </div>
                </div>

                {student.skills && student.skills.length > 0 && (
                  <div style={styles.skillsContainer}>
                    {student.skills.slice(0, 6).map(skill => (
                      <span key={skill} style={styles.skillBadge}>{skill}</span>
                    ))}
                    {student.skills.length > 6 && (
                      <span style={styles.skillBadge}>+{student.skills.length - 6}</span>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                  style={styles.expandBtn}
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? 'Show Less' : 'View Full Details'}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={styles.infoRow}>
                      <div style={styles.infoItem}>
                        <User size={14} style={styles.infoItemIcon} />
                        <span style={styles.infoItemLabel}>Name:</span>
                        <span style={styles.infoItemValue}>{student.name}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <GraduationCap size={14} style={styles.infoItemIcon} />
                        <span style={styles.infoItemLabel}>CGPA:</span>
                        <span style={styles.infoItemValue}>{student.cgpa}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Building size={14} style={styles.infoItemIcon} />
                        <span style={styles.infoItemLabel}>Branch:</span>
                        <span style={styles.infoItemValue}>{student.branch}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <AtSign size={14} style={styles.infoItemIcon} />
                        <span style={styles.infoItemLabel}>Email:</span>
                        <span style={styles.infoItemValue}>{student.email}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Smartphone size={14} style={styles.infoItemIcon} />
                        <span style={styles.infoItemLabel}>Phone:</span>
                        <span style={styles.infoItemValue}>{student.phone}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Briefcase size={14} style={styles.infoItemIcon} />
                        <span style={styles.infoItemLabel}>Applied For:</span>
                        <span style={styles.infoItemValue}>{student.appliedFor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.actionButtons}>
                <button onClick={() => handleViewResume(student)} style={styles.btnInfo}>
                  <Eye size={12} /> Resume
                </button>
                <button onClick={() => handleSendEmail(student)} style={styles.btnPrimary}>
                  <Mail size={12} /> Email
                </button>
                {student.status === 'shortlisted' && (
                  <button onClick={() => handleOpenInterviewModal(student)} style={styles.btnSuccess}>
                    <Calendar size={12} /> Schedule Interview
                  </button>
                )}
                {student.status !== 'rejected' && student.status !== 'selected' && (
                  <button onClick={() => handleReject(student)} style={styles.btnDanger}>
                    <XCircle size={12} /> Reject
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}

      {showInterviewModal && selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => setShowInterviewModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <Calendar size={18} color="#7c3aed" />
                Schedule Interview - {selectedStudent.name}
                <span style={styles.jobTypeBadge}>{selectedStudent.job_type || 'Full-time'}</span>
              </div>
              <button onClick={() => setShowInterviewModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleScheduleInterview() }}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Date *</label>
                  <input 
                    type="date" 
                    value={interviewData.date} 
                    onChange={(e) => setInterviewData({...interviewData, date: e.target.value})} 
                    style={styles.formInput} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Time *</label>
                  <input 
                    type="time" 
                    value={interviewData.time} 
                    onChange={(e) => setInterviewData({...interviewData, time: e.target.value})} 
                    style={styles.formInput} 
                    required 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Mode</label>
                  <select 
                    value={interviewData.mode} 
                    onChange={(e) => setInterviewData({...interviewData, mode: e.target.value})} 
                    style={styles.formSelect}
                  >
                    <option value="Online">Online (Video Call)</option>
                    <option value="Offline">Offline (In-Person)</option>
                    <option value="Phone">Phone Call</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Interview Type</label>
                  <select 
                    value={interviewData.type} 
                    onChange={(e) => setInterviewData({...interviewData, type: e.target.value})} 
                    style={styles.formSelect}
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                  </select>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    💡 Auto-selected based on job type: {interviewData.type}
                  </div>
                </div>
              </div>

              {interviewData.mode === 'Online' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Google Meet Link</label>
                  <input 
                    type="url" 
                    placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                    value={interviewData.link} 
                    onChange={(e) => setInterviewData({...interviewData, link: e.target.value})} 
                    style={styles.formInput} 
                  />
                </div>
              )}

              {interviewData.mode === 'Offline' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Venue</label>
                  <input 
                    type="text" 
                    placeholder="Office address" 
                    value={interviewData.venue} 
                    onChange={(e) => setInterviewData({...interviewData, venue: e.target.value})} 
                    style={styles.formInput} 
                  />
                </div>
              )}

              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowInterviewModal(false)} style={styles.btnCancel}>
                  Cancel
                </button>
                <button type="submit" disabled={updating} style={styles.btnSchedule}>
                  {updating ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShortlistedStudents