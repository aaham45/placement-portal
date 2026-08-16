import { useState, useEffect } from 'react'
import { Calendar, Clock, Video, MapPin, Users, CheckCircle, XCircle, Eye, Edit, Trash2, Plus, Mail, Phone, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ✅ STYLES OBJECT
const styles = {
  container: {
    background: 'white',
    borderRadius: '20px',
    padding: '1.25rem',
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
    fontSize: '1.1rem',
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
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  statCard: (color) => ({
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '1rem',
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
    marginTop: '0.25rem'
  },
  candidateSelect: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.85rem',
    background: 'white',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  interviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  interviewCard: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  applicantName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  jobRole: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '0.2rem'
  },
  interviewDetails: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
    padding: '0.5rem 0',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.7rem',
    color: '#64748b'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    padding: '0.4rem 0.8rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
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
    gap: '0.25rem'
  },
  btnSuccess: {
    padding: '0.4rem 0.8rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  btnDanger: {
    padding: '0.4rem 0.8rem',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
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
    maxWidth: '500px',
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
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b'
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
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem'
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
  // ✅ ADD THESE MISSING STYLES
  loadingSpinner: {
    width: '2rem',
    height: '2rem',
    border: '3px solid #e2e8f0',
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },
  loadingText: {
    color: '#64748b'
  }
}

function InterviewManagement() {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    mode: 'Online',
    type: 'Technical',
    link: '',
    venue: ''
  })
  const [applications, setApplications] = useState([])
  const [scheduledInterviewsList, setScheduledInterviewsList] = useState([])
  const [allInterviews, setAllInterviews] = useState([]) // ✅ NEW: Store all interviews
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const token = localStorage.getItem('companyToken')

  // ✅ FETCH APPLICATIONS & INTERVIEWS
  const fetchApplications = async () => {
    setLoading(true)
    try {
      // ✅ Fetch applications
      const appResponse = await axios.get(`${API_URL}/company/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (appResponse.data.success) {
        const apps = appResponse.data.applications || []
        const formattedApps = apps.map(app => ({
          id: app.id,
          student_id: app.student_id,
          job_id: app.job_id,
          name: app.student_name || app.name || 'Unknown',
          cgpa: app.student_cgpa || app.cgpa || 0,
          branch: app.student_branch || app.branch || 'N/A',
          role: app.job_title || app.title || 'Unknown',
          job: app.job_title || app.title || 'Unknown',
          status: app.status || 'applied',
          job_type: app.job_type || 'Full-time'
        }))
        setApplications(formattedApps)
        
        // ✅ Fetch interviews to get interview IDs
        const interviewResponse = await axios.get(`${API_URL}/company/interviews`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (interviewResponse.data.success) {
          const interviews = interviewResponse.data.interviews || []
          setAllInterviews(interviews)
          console.log('📊 All interviews:', interviews)
          
          // ✅ Get scheduled interviews (status = interview or scheduled)
          const scheduledAppIds = interviews
            .filter(i => i.status === 'scheduled' || i.status === 'upcoming' || i.status === 'interview')
            .map(i => i.application_id)
          
          const scheduledApps = formattedApps.filter(a => scheduledAppIds.includes(a.id))
          setScheduledInterviewsList(scheduledApps)
          console.log('📊 Scheduled applications:', scheduledApps.length)
        }
      } else {
        setApplications([])
        setScheduledInterviewsList([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setApplications([])
      setScheduledInterviewsList([])
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchApplications()
    } else {
      setApplications([])
      setScheduledInterviewsList([])
      setLoading(false)
    }
  }, [token])

  const scheduledInterviews = scheduledInterviewsList
  const readyCandidates = applications.filter(a => a.status === 'shortlisted')

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

  const handleScheduleClick = (applicant) => {
    setSelectedApplicant(applicant)
    const jobType = applicant.job_type || 'Full-time'
    const defaultType = getInterviewTypeByJobType(jobType)
    
    setInterviewData({
      date: '',
      time: '',
      mode: 'Online',
      type: defaultType,
      link: '',
      venue: ''
    })
    setShowScheduleModal(true)
  }

  const handleScheduleSubmit = async () => {
    if (!interviewData.date || !interviewData.time) {
      toast.error('Please fill date and time')
      return
    }

    if (updating) return
    setUpdating(true)

    try {
      await axios.put(`${API_URL}/company/applications/${selectedApplicant.id}/status`,
        { status: 'interview' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const interviewPayload = {
        applicationId: selectedApplicant.id,
        studentId: selectedApplicant.student_id,
        date: interviewData.date,
        time: interviewData.time,
        mode: interviewData.mode,
        type: interviewData.type,
        notes: `Interview Type: ${interviewData.type}`
      };

      const response = await axios.post(`${API_URL}/company/interviews/schedule`, interviewPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(`Interview scheduled for ${selectedApplicant.name}`)
        fetchApplications()
        setShowScheduleModal(false)
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

  const handleAddFeedback = (applicant) => {
    const feedback = prompt('Enter interview feedback (Communication/Technical/Overall):')
    if (feedback) {
      toast.success(`Feedback added for ${applicant.name}`)
    }
  }

  // ✅ FIXED: Complete Interview - Updates BOTH application AND interview status
  const handleComplete = async (applicant) => {
    if (updating) return
    setUpdating(true)
    
    try {
      console.log('📝 Completing interview for applicant:', applicant.id, applicant.name)
      
      // ✅ Find the interview ID for this application
      const interview = allInterviews.find(i => i.application_id === applicant.id)
      
      if (!interview) {
        toast.error('Interview not found for this applicant')
        setUpdating(false)
        return
      }
      
      console.log('📊 Found interview:', interview.id, 'Status:', interview.status)
      
      // ✅ STEP 1: Update interview status to 'completed'
      await axios.put(
        `${API_URL}/company/interviews/${interview.id}/status`,
        { 
          status: 'completed',
          feedback: 'Interview completed successfully'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('✅ Interview status updated to completed')
      
      // ✅ STEP 2: Update application status to 'selected'
      await axios.put(
        `${API_URL}/company/applications/${applicant.id}/status`,
        { status: 'selected' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('✅ Application status updated to selected')
      
      toast.success(`Interview completed for ${applicant.name}! 🎉`)
      
      // ✅ Refresh data
      fetchApplications()
      
    } catch (error) {
      console.error('❌ Error completing interview:', error)
      toast.error(error.response?.data?.message || 'Failed to complete interview')
    } finally {
      setUpdating(false)
    }
  }

  const getModeIcon = (mode) => {
    return mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />
  }

  const stats = {
    readyCandidates: readyCandidates.length,
    scheduled: scheduledInterviews.length,
    completed: applications.filter(a => a.status === 'selected').length
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading interviews...</p>
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
            <Calendar size={18} color="white" />
          </div>
          <span>Interview Management</span>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.readyCandidates}</div>
          <div style={styles.statLabel}>Ready for Interview</div>
        </div>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.scheduled}</div>
          <div style={styles.statLabel}>Scheduled</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>📅 Schedule New Interview</h3>
        <select
          onChange={(e) => {
            const applicant = readyCandidates.find(a => a.id === parseInt(e.target.value))
            if (applicant) handleScheduleClick(applicant)
          }}
          style={styles.candidateSelect}
          defaultValue=""
        >
          <option value="" disabled>Select a candidate to schedule interview</option>
          {readyCandidates.map(app => (
            <option key={app.id} value={app.id}>
              {app.name} - {app.role} (CGPA: {app.cgpa}) - {app.job_type || 'Full-time'}
            </option>
          ))}
          {readyCandidates.length === 0 && (
            <option disabled>No candidates ready for interview</option>
          )}
        </select>
      </div>

      <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>📋 Scheduled Interviews</h3>
      {scheduledInterviews.length === 0 ? (
        <div style={styles.emptyState}>
          <Calendar size={40} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
          <p>No interviews scheduled yet</p>
          <p style={{ fontSize: '0.7rem' }}>Schedule an interview from the dropdown above</p>
        </div>
      ) : (
        <div style={styles.interviewsList}>
          {scheduledInterviews.map(app => {
            // ✅ Find interview details for this application
            const interview = allInterviews.find(i => i.application_id === app.id)
            
            return (
              <div key={app.id} style={styles.interviewCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.applicantName}>{app.name}</div>
                    <div style={styles.jobRole}>
                      {app.role} • CGPA: {app.cgpa} • {app.branch}
                    </div>
                  </div>
                  <span style={{ padding: '0.2rem 0.6rem', background: '#dbeafe', borderRadius: '20px', fontSize: '0.65rem', color: '#2563eb' }}>
                    Interview
                  </span>
                </div>
                
                {/* ✅ Show interview details if available */}
                {interview && (
                  <div style={styles.interviewDetails}>
                    <span style={styles.detailItem}>
                      <Calendar size={12} /> {interview.formatted_date || 'TBD'}
                    </span>
                    <span style={styles.detailItem}>
                      <Clock size={12} /> {interview.formatted_time || 'TBD'}
                    </span>
                    <span style={styles.detailItem}>
                      {interview.mode === 'Online' ? <Video size={12} /> : <MapPin size={12} />} {interview.mode || 'Online'}
                    </span>
                    {interview.meeting_link && (
                      <span style={styles.detailItem}>
                        <LinkIcon size={12} /> <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Join</a>
                      </span>
                    )}
                  </div>
                )}
                
                <div style={styles.actionButtons}>
                  <button onClick={() => handleAddFeedback(app)} style={styles.btnOutline}>
                    <Edit size={12} /> Feedback
                  </button>
                  <button onClick={() => handleComplete(app)} style={styles.btnSuccess} disabled={updating}>
                    <CheckCircle size={12} /> {updating ? 'Processing...' : 'Complete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showScheduleModal && selectedApplicant && (
        <div style={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                Schedule Interview - {selectedApplicant.name}
              </div>
              <button onClick={() => setShowScheduleModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleScheduleSubmit() }}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Date *</label>
                  <input type="date" value={interviewData.date} onChange={(e) => setInterviewData({...interviewData, date: e.target.value})} style={styles.formInput} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Time *</label>
                  <input type="time" value={interviewData.time} onChange={(e) => setInterviewData({...interviewData, time: e.target.value})} style={styles.formInput} required />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Mode</label>
                  <select value={interviewData.mode} onChange={(e) => setInterviewData({...interviewData, mode: e.target.value})} style={styles.formSelect}>
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Phone</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Interview Type</label>
                  <select value={interviewData.type} onChange={(e) => setInterviewData({...interviewData, type: e.target.value})} style={styles.formSelect}>
                    <option>Technical</option>
                    <option>HR</option>
                    <option>Managerial</option>
                  </select>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    💡 Auto-selected based on job type: {interviewData.type}
                  </div>
                </div>
              </div>
              {interviewData.mode === 'Online' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Meeting Link</label>
                  <input type="url" placeholder="https://meet.google.com/..." value={interviewData.link} onChange={(e) => setInterviewData({...interviewData, link: e.target.value})} style={styles.formInput} />
                </div>
              )}
              {interviewData.mode === 'Offline' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Venue</label>
                  <input type="text" placeholder="Office address" value={interviewData.venue} onChange={(e) => setInterviewData({...interviewData, venue: e.target.value})} style={styles.formInput} />
                </div>
              )}
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowScheduleModal(false)} style={styles.btnCancel}>
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

export default InterviewManagement