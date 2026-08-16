import { useState, useEffect } from 'react'
import { Users, CheckCircle, Clock, XCircle, UserCheck, Briefcase, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const styles = {
  container: {
    background: 'white',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    marginTop: '1.5rem'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem'
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
  pipeline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    overflowX: 'auto'
  },
  stageColumn: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '0.75rem',
    minWidth: '200px'
  },
  stageHeader: (color, bg) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    background: bg,
    borderRadius: '12px',
    marginBottom: '0.75rem',
    color: color
  }),
  stageName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    flex: 1
  },
  stageCount: {
    background: 'white',
    padding: '0.15rem 0.5rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  candidateCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  candidateName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  candidateRole: {
    fontSize: '0.65rem',
    color: '#64748b',
    marginTop: '0.25rem'
  },
  candidateCgpa: {
    fontSize: '0.6rem',
    color: '#10b981',
    marginTop: '0.25rem'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.25rem',
    marginTop: '0.5rem'
  },
  actionBtn: (color) => ({
    padding: '0.2rem 0.6rem',
    background: color || '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.55rem',
    cursor: 'pointer',
    color: 'white',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }),
  emptyState: {
    textAlign: 'center',
    padding: '1.5rem 0.5rem',
    color: '#94a3b8',
    fontSize: '0.7rem'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    margin: '0 auto 1rem'
  },
  interviewModal: {
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
  interviewModalContent: {
    background: 'white',
    borderRadius: '24px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%'
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
    borderRadius: '10px',
    fontSize: '0.85rem',
    outline: 'none'
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  btnPrimary: {
    flex: 1,
    padding: '0.6rem',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  btnSecondary: {
    flex: 1,
    padding: '0.6rem',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  }
}

function RecruitmentPipeline() {
  const stages = [
    { id: 'pending', name: 'Applied', icon: Users, color: '#3b82f6', bg: '#dbeafe' },
    { id: 'shortlisted', name: 'Shortlisted', icon: UserCheck, color: '#8b5cf6', bg: '#ede9fe' },
    { id: 'interview', name: 'Interview', icon: Calendar, color: '#f59e0b', bg: '#fef3c7' },
    { id: 'selected', name: 'Selected', icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
    { id: 'rejected', name: 'Rejected', icon: XCircle, color: '#ef4444', bg: '#fee2e2' }
  ]

  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    mode: 'online',
    notes: ''
  })

  const token = localStorage.getItem('companyToken')

  // ✅ FIXED: Status to Stage mapping
  const getStageFromStatus = (status) => {
    const statusMap = {
      'pending': 'pending',
      'shortlisted': 'shortlisted',
      'interview': 'interview',
      'selected': 'selected',
      'rejected': 'rejected'
    }
    return statusMap[status?.toLowerCase()] || 'pending'
  }

  const getStatusFromStage = (stage) => {
    const stageMap = {
      'pending': 'pending',
      'shortlisted': 'shortlisted',
      'interview': 'interview',
      'selected': 'selected',
      'rejected': 'rejected'
    }
    return stageMap[stage] || 'pending'
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      console.log('📋 Fetching applications...')
      
      const response = await axios.get(`${API_URL}/company/applications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Applications Response:', response.data)
      
      if (response.data.success) {
        const apps = response.data.applications || []
        console.log('📊 Applications count:', apps.length)
        console.log('📊 Applications statuses:', apps.map(a => a.status))
        
        const pipelineCandidates = apps.map(app => ({
          id: app.id,
          name: app.student_name || app.name || 'Candidate',
          role: app.job_title || app.title || 'Job',
          stage: getStageFromStatus(app.status),
          cgpa: parseFloat(app.student_cgpa || app.cgpa || 0),
          email: app.student_email || app.email || '',
          phone: app.student_phone || app.phone || '',
          appliedAt: app.applied_at || app.created_at,
          studentId: app.student_id
        }))
        
        console.log('📊 Pipeline candidates with stages:', pipelineCandidates.map(c => ({
          name: c.name,
          role: c.role,
          stage: c.stage
        })))
        
        setCandidates(pipelineCandidates)
      } else {
        console.log('❌ No applications found')
        setCandidates([])
      }
    } catch (error) {
      console.error('❌ Error fetching pipeline data:', error)
      console.error('❌ Error details:', error.response?.data)
      setCandidates([])
      toast.error('Failed to load pipeline data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchApplications()
    } else {
      console.log('❌ No token found')
      setCandidates([])
      setLoading(false)
    }
  }, [token])

  // ✅ Handle moving candidate to next stage
  const handleMoveStage = async (candidate, direction) => {
    const currentIndex = stages.findIndex(s => s.id === candidate.stage)
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex >= 0 && newIndex < stages.length) {
      const newStage = stages[newIndex].id
      
      // ✅ If moving to interview, show modal
      if (newStage === 'interview') {
        setSelectedCandidate(candidate)
        setShowInterviewModal(true)
        return
      }
      
      const newStatus = getStatusFromStage(newStage)
      
      // Update local state
      setCandidates(candidates.map(c => 
        c.id === candidate.id ? { ...c, stage: newStage } : c
      ))
      
      try {
        await axios.put(`${API_URL}/company/applications/${candidate.id}/status`,
          { 
            status: newStatus,
            student_id: candidate.studentId 
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        )
        toast.success(`${candidate.name} moved to ${stages[newIndex].name}`)
        fetchApplications()
      } catch (error) {
        console.error('❌ Error updating status:', error)
        toast.error('Failed to update status')
        fetchApplications()
      }
    }
  }

  // ✅ Handle interview scheduling
  const handleScheduleInterview = async () => {
    if (!selectedCandidate) return
    
    if (!interviewData.date || !interviewData.time) {
      toast.error('Please select date and time for interview')
      return
    }

    const formattedDate = new Date(interviewData.date).toISOString().split('T')[0];
    const formattedTime = interviewData.time;

    const interviewPayload = {
      applicationId: selectedCandidate.id,
      studentId: selectedCandidate.studentId,
      date: formattedDate,
      time: formattedTime,
      mode: interviewData.mode || 'online',
      notes: interviewData.notes || ''
    };

    console.log('📤 Sending interview payload:', interviewPayload);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/company/interviews/schedule`,
        interviewPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Interview response:', response.data);

      if (response.data.success) {
        toast.success(`Interview scheduled for ${selectedCandidate.name}`);
        setShowInterviewModal(false);
        setSelectedCandidate(null);
        setInterviewData({ date: '', time: '', mode: 'online', notes: '' });
        fetchApplications();
      } else {
        toast.error(response.data.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('❌ Error scheduling interview:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to schedule interview. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleMoveBack = async (candidate) => {
    const currentIndex = stages.findIndex(s => s.id === candidate.stage)
    if (currentIndex > 0) {
      const prevStage = stages[currentIndex - 1].id
      const prevStatus = getStatusFromStage(prevStage)
      
      setCandidates(candidates.map(c => 
        c.id === candidate.id ? { ...c, stage: prevStage } : c
      ))
      
      try {
        await axios.put(`${API_URL}/company/applications/${candidate.id}/status`,
          { 
            status: prevStatus,
            student_id: candidate.studentId 
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        )
        toast.success(`${candidate.name} moved back to ${stages[currentIndex - 1].name}`)
        fetchApplications()
      } catch (error) {
        console.error('❌ Error moving back:', error)
        toast.error('Failed to move back')
        fetchApplications()
      }
    }
  }

  const getCandidatesByStage = (stageId) => {
    const filtered = candidates.filter(c => c.stage === stageId)
    console.log(`🔍 Stage ${stageId}: ${filtered.length} candidates`)
    return filtered
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ color: '#64748b' }}>Loading pipeline...</p>
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
      <div style={styles.title}>
        <div style={styles.titleIcon}>
          <Briefcase size={18} color="white" />
        </div>
        <span>Recruitment Pipeline</span>
        <span style={{ 
          marginLeft: 'auto', 
          fontSize: '0.8rem', 
          color: '#64748b',
          background: '#f1f5f9',
          padding: '0.2rem 0.8rem',
          borderRadius: '20px'
        }}>
          {candidates.length} Total Candidates
        </span>
      </div>

      <div style={styles.pipeline}>
        {stages.map((stage, idx) => {
          const stageCandidates = getCandidatesByStage(stage.id)
          const StageIcon = stage.icon
          
          return (
            <div key={stage.id} style={styles.stageColumn}>
              <div style={styles.stageHeader(stage.color, stage.bg)}>
                <StageIcon size={14} />
                <span style={styles.stageName}>{stage.name}</span>
                <span style={styles.stageCount}>{stageCandidates.length}</span>
              </div>
              
              {stageCandidates.length === 0 ? (
                <div style={styles.emptyState}>
                  <User size={24} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                  <div>No candidates</div>
                </div>
              ) : (
                stageCandidates.map(candidate => (
                  <div key={candidate.id} style={styles.candidateCard}>
                    <div style={styles.candidateName}>{candidate.name}</div>
                    <div style={styles.candidateRole}>
                      {candidate.role}
                    </div>
                    {candidate.cgpa > 0 && (
                      <div style={styles.candidateCgpa}>🎓 CGPA: {candidate.cgpa.toFixed(2)}</div>
                    )}
                    <div style={styles.actionButtons}>
                      {idx > 0 && (
                        <button 
                          onClick={() => handleMoveBack(candidate)} 
                          style={styles.actionBtn('#94a3b8')}
                          title="Move back"
                        >
                          ←
                        </button>
                      )}
                      {idx < stages.length - 1 && (
                        <button 
                          onClick={() => handleMoveStage(candidate, 'next')} 
                          style={styles.actionBtn(stage.color)}
                          title={stage.id === 'shortlisted' ? 'Schedule Interview' : 'Move to next stage'}
                        >
                          {stage.id === 'shortlisted' ? '📅 Schedule' : '→'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>

      {/* ✅ Interview Schedule Modal */}
      {showInterviewModal && selectedCandidate && (
        <div style={styles.interviewModal} onClick={() => setShowInterviewModal(false)}>
          <div style={styles.interviewModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
              Schedule Interview - {selectedCandidate.name}
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Interview Date *</label>
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
              <label style={styles.formLabel}>Interview Time *</label>
              <input
                type="time"
                value={interviewData.time}
                onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                style={styles.formInput}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Interview Mode</label>
              <select
                value={interviewData.mode}
                onChange={(e) => setInterviewData({...interviewData, mode: e.target.value})}
                style={styles.formInput}
              >
                <option value="online">Online (Video Call)</option>
                <option value="offline">Offline (In-Person)</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Notes (Optional)</label>
              <textarea
                value={interviewData.notes}
                onChange={(e) => setInterviewData({...interviewData, notes: e.target.value})}
                style={{...styles.formInput, minHeight: '80px', resize: 'vertical'}}
                placeholder="Add any notes about the interview..."
              />
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowInterviewModal(false)} style={styles.btnSecondary}>
                Cancel
              </button>
              <button onClick={handleScheduleInterview} style={styles.btnPrimary}>
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecruitmentPipeline