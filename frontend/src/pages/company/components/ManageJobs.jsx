import { useState, useEffect } from 'react'
import { 
  Briefcase, MapPin, DollarSign, Calendar, Users, 
  Eye, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, Search, Save, X,
  Tag, Award, Building
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function ManageJobs({ jobs: propJobs, onUpdate, onDelete, onPostJob }) {
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    salary_range: '',
    location: '',
    job_type: '',
    eligibility: '',
    openings: '',
    application_deadline: '',
    description: '',
    skills: ''
  })

  const token = localStorage.getItem('companyToken')

  // ✅ Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      setLoading(true)
      console.log('📋 Fetching jobs...')
      
      const response = await axios.get(`${API_URL}/company/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📊 Jobs Response:', response.data)
      
      if (response.data.success && response.data.jobs) {
        const formattedJobs = response.data.jobs.map(job => ({
          id: job.id,
          title: job.title || 'Untitled',
          salary_range: job.salary_range || job.package || 'N/A',
          location: job.location || 'Not specified',
          applications: job.applications_count || job.applications || 0,
          status: job.status === 'active' ? 'active' : 'closed',
          application_deadline: job.application_deadline || job.deadline,
          eligibility: job.eligibility || 0,
          skills: job.skills ? (typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : job.skills) : [],
          company_id: job.company_id,
          description: job.description || '',
          job_type: job.job_type || 'Full-time',
          openings: job.openings || 1,
          created_at: job.created_at
        }))
        
        console.log('✅ Formatted jobs:', formattedJobs.length)
        setJobs(formattedJobs)
        if (onUpdate) onUpdate(formattedJobs)
      } else {
        setJobs([])
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchJobs()
    } else {
      setLoading(false)
    }
  }, [token])

  // ✅ Update when propJobs changes
  useEffect(() => {
    if (propJobs && propJobs.length > 0) {
      setJobs(propJobs)
      setLoading(false)
    }
  }, [propJobs])

  // ✅ Toggle Job Status
  const handleStatusToggle = async (job) => {
    if (updating) return
    setUpdating(true)
    
    const newStatus = job.status === 'active' ? 'closed' : 'active'
    
    try {
      const response = await axios.put(
        `${API_URL}/company/jobs/${job.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'}!`)
        const updatedJobs = jobs.map(j => 
          j.id === job.id ? { ...j, status: newStatus } : j
        )
        setJobs(updatedJobs)
        if (onUpdate) onUpdate(updatedJobs)
      } else {
        toast.error(response.data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('❌ Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ Delete Job
  const handleDeleteClick = (job) => {
    setSelectedJob(job)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedJob || updating) return
    setUpdating(true)
    
    try {
      const response = await axios.delete(
        `${API_URL}/company/jobs/${selectedJob.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        toast.success('Job deleted successfully!')
        const updatedJobs = jobs.filter(j => j.id !== selectedJob.id)
        setJobs(updatedJobs)
        if (onUpdate) onUpdate(updatedJobs)
        if (onDelete) onDelete(selectedJob.id)
        setShowDeleteConfirm(false)
        setSelectedJob(null)
      } else {
        toast.error(response.data.message || 'Failed to delete job')
      }
    } catch (error) {
      console.error('❌ Error deleting job:', error)
      toast.error('Failed to delete job')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setSelectedJob(null)
  }

  // ✅ Edit Job
  const handleEditClick = (job) => {
    setSelectedJob(job)
    setEditForm({
      title: job.title || '',
      salary_range: job.salary_range || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      eligibility: job.eligibility || '',
      openings: job.openings || '',
      application_deadline: job.application_deadline || '',
      description: job.description || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || ''
    })
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (updating) return
    setUpdating(true)

    try {
      const response = await axios.put(
        `${API_URL}/company/jobs/${selectedJob.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success('Job updated successfully!')
        fetchJobs()
        setShowEditModal(false)
        setSelectedJob(null)
      } else {
        toast.error(response.data.message || 'Failed to update job')
      }
    } catch (error) {
      console.error('❌ Error updating job:', error)
      toast.error('Failed to update job')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ Post New Job
  const handlePostNewJob = () => {
    if (onPostJob) onPostJob()
  }

  // ✅ Refresh Jobs
  const handleRefresh = () => {
    fetchJobs()
    toast.success('Jobs refreshed!')
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    totalApplications: jobs.reduce((sum, j) => sum + (j.applications || 0), 0)
  }

  const styles = {
    container: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
    title: { fontSize: '18px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' },
    headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
    statsRow: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    statCard: { background: '#f8f9fa', borderRadius: '12px', padding: '12px 20px', minWidth: '100px', textAlign: 'center' },
    statValue: { fontSize: '24px', fontWeight: '700', color: '#333' },
    statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
    searchContainer: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', flex: 1, minWidth: '200px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' },
    filterSelect: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: 'white', cursor: 'pointer' },
    refreshBtn: { padding: '8px 12px', background: '#f1f5f9', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', borderBottom: '2px solid #eee' },
    td: { padding: '12px', fontSize: '14px', borderBottom: '1px solid #eee' },
    statusBadge: (status) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: status === 'active' ? '#d4edda' : '#f8d7da', color: status === 'active' ? '#155724' : '#721c24' }),
    actionBtn: { padding: '6px', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', margin: '0 2px', transition: 'all 0.2s ease' },
    btnPrimary: { padding: '8px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' },
    modalButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
    btnCancel: { padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    btnDanger: { padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    btnSuccess: { padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#999' },
    formGroup: { marginBottom: '15px' },
    formLabel: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '5px' },
    formInput: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    modalTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
    skillBadge: {
      display: 'inline-block',
      padding: '2px 10px',
      background: '#ede9fe',
      color: '#7c3aed',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: '500',
      marginRight: '4px',
      marginBottom: '4px'
    },
    jobMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '4px',
      fontSize: '11px',
      color: '#666'
    },
    jobMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#f8f9fa',
      padding: '2px 8px',
      borderRadius: '4px'
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748b' }}>Loading jobs...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Briefcase size={20} color="#7c3aed" />
          <span>Manage Jobs</span>
          <span style={{ fontSize: '12px', color: '#999', background: '#f1f5f9', padding: '2px 10px', borderRadius: '20px' }}>
            {jobs.length} Jobs
          </span>
        </div>
        <div style={styles.headerActions}>
          <button onClick={handleRefresh} style={styles.refreshBtn}>🔄 Refresh</button>
          <button onClick={handlePostNewJob} style={styles.btnPrimary}>
            <Plus size={16} /> Post New Job
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.total}</div><div style={styles.statLabel}>Total Jobs</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.active}</div><div style={styles.statLabel}>Active</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.closed}</div><div style={styles.statLabel}>Closed</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.totalApplications}</div><div style={styles.statLabel}>Applications</div></div>
      </div>

      {/* SEARCH */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={16} color="#999" />
          <input type="text" placeholder="Search jobs by title or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* TABLE */}
      {filteredJobs.length === 0 ? (
        <div style={styles.emptyState}>
          <Briefcase size={40} color="#ddd" style={{ marginBottom: '10px' }} />
          <p>{jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}</p>
          {jobs.length === 0 && <button onClick={handlePostNewJob} style={styles.btnPrimary}><Plus size={16} /> Post Your First Job</button>}
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Job Title & Details</th>
              <th style={styles.th}>Package</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Applications</th>
              <th style={styles.th}>Deadline</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{job.title}</div>
                  
                  {/* ✅ Job Type Badge */}
                  <div style={styles.jobMeta}>
                    <span style={styles.jobMetaItem}>
                      <Briefcase size={10} /> {job.job_type || 'Full-time'}
                    </span>
                    <span style={styles.jobMetaItem}>
                      <Award size={10} /> CGPA: {job.eligibility || 'N/A'}
                    </span>
                    <span style={styles.jobMetaItem}>
                      <Users size={10} /> {job.openings || 1} openings
                    </span>
                    {job.created_at && (
                      <span style={styles.jobMetaItem}>
                        <Clock size={10} /> Posted: {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  
                  {/* ✅ Skills Display - FIXED with Array.isArray check */}
                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div style={{ marginTop: '6px' }}>
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} style={styles.skillBadge}>{skill}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span style={{ fontSize: '10px', color: '#999' }}>+{job.skills.length - 4} more</span>
                      )}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '600', color: '#059669' }}>{job.salary_range || 'N/A'}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#999" /> {job.location || 'N/A'}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} color="#999" /> {job.applications || 0}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                    <Calendar size={12} /> 
                    {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(job.status)}>
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => handleEditClick(job)} style={styles.actionBtn} title="Edit Job">
                      <Edit size={18} color="#3b82f6" />
                    </button>
                    <button onClick={() => handleStatusToggle(job)} style={styles.actionBtn} title={job.status === 'active' ? 'Close Job' : 'Activate Job'}>
                      {job.status === 'active' ? <XCircle size={18} color="#dc2626" /> : <CheckCircle size={18} color="#10b981" />}
                    </button>
                    <button onClick={() => handleDeleteClick(job)} style={{ ...styles.actionBtn, color: '#dc2626' }} title="Delete Job">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DELETE MODAL */}
      {showDeleteConfirm && selectedJob && (
        <div style={styles.modalOverlay} onClick={handleDeleteCancel}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#dc2626' }}>🗑️ Delete Job</h3>
            <p>Are you sure you want to delete <strong>{selectedJob.title}</strong>?</p>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>This action cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button onClick={handleDeleteCancel} style={styles.btnCancel}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={styles.btnDanger}>Delete Job</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <Edit size={20} color="#3b82f6" />
              Edit Job - {selectedJob.title}
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Job Title *</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleEditChange} style={styles.formInput} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Salary Range *</label>
                  <input type="text" name="salary_range" value={editForm.salary_range} onChange={handleEditChange} placeholder="e.g., 18-24 LPA" style={styles.formInput} required />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Location *</label>
                  <input type="text" name="location" value={editForm.location} onChange={handleEditChange} style={styles.formInput} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Job Type</label>
                  <select name="job_type" value={editForm.job_type} onChange={handleEditChange} style={styles.formInput}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Eligibility (CGPA)</label>
                  <input type="number" step="0.1" name="eligibility" value={editForm.eligibility} onChange={handleEditChange} style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Openings</label>
                  <input type="number" name="openings" value={editForm.openings} onChange={handleEditChange} style={styles.formInput} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Application Deadline</label>
                  <input type="date" name="application_deadline" value={editForm.application_deadline} onChange={handleEditChange} style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Skills</label>
                  <input type="text" name="skills" value={editForm.skills} onChange={handleEditChange} placeholder="React, Node.js, Python" style={styles.formInput} />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowEditModal(false)} style={styles.btnCancel}>Cancel</button>
                <button type="submit" disabled={updating} style={styles.btnSuccess}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageJobs