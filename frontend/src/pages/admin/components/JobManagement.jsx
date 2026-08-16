import React, { useState, useEffect } from 'react'
import { 
  Briefcase, Search, Eye, CheckCircle, XCircle, 
  Edit2, Trash2, Plus, Download, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function JobManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [jobs, setJobs] = useState([])
  const [companies, setCompanies] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    totalApplications: 0,
    avgPackage: 0
  })

  // Add Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    companyId: '',
    salary_range: '',
    location: '',
    eligibility: '',
    skills: '',
    openings: '',
    deadline: '',
    description: '',
    jobType: 'Full-time'
  })

  const token = localStorage.getItem('adminToken')

  // --- STATS CALCULATION FUNCTION ---
  const calculateStats = (data) => {
    const total = data.length
    const active = data.filter(j => j.status === 'active' || j.status === 'Active').length
    const closed = data.filter(j => j.status === 'closed' || j.status === 'Closed').length
    const totalApplications = data.reduce((sum, j) => sum + (j.applications || 0), 0)
    
    let avgPackage = 0
    if (data.length > 0) {
      const packages = data.map(j => {
        const salaryStr = j.salary_range || '0 LPA'
        const numbers = salaryStr.match(/\d+/g)
        if (numbers) {
          const nums = numbers.map(Number)
          if (nums.length > 1) {
            return nums.reduce((a, b) => a + b, 0) / nums.length
          }
          return nums[0] || 0
        }
        return 0
      })
      const validPackages = packages.filter(p => p > 0)
      avgPackage = validPackages.length > 0 
        ? Math.round(validPackages.reduce((a, b) => a + b, 0) / validPackages.length) 
        : 0
    }
    setStats({ total, active, closed, totalApplications, avgPackage })
  }

  // --- FETCH JOBS ---
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/jobs`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        const data = response.data.jobs || response.data.data || []
        console.log('📊 Raw jobs data:', data)
        
        const formattedJobs = data.map(job => ({
          id: job.id,
          title: job.title || '',
          company: job.company_name || job.companyName || job.company || '',
          company_id: job.company_id || job.companyId,
          salary_range: job.salary_range || job.package || '0 LPA',
          location: job.location || '',
          jobType: job.job_type || job.jobType || 'Full-time',
          status: job.status || 'active',
          postedDate: job.posted_date || job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          deadline: job.application_deadline || job.deadline || '',
          applications: job.applications_count || job.applications || 0,
          openings: job.openings || 1,
          eligibility: job.eligibility || job.min_cgpa || 0,
          skills: job.skills ? (Array.isArray(job.skills) ? job.skills : job.skills.split(',').map(s => s.trim()).filter(Boolean)) : [],
          description: job.description || '',
          created_at: job.created_at
        }))
        
        console.log('📊 Formatted jobs:', formattedJobs)
        setJobs(formattedJobs)
        calculateStats(formattedJobs)
      } else {
        setJobs([])
        setStats({ total: 0, active: 0, closed: 0, totalApplications: 0, avgPackage: 0 })
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
      setStats({ total: 0, active: 0, closed: 0, totalApplications: 0, avgPackage: 0 })
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  // --- FETCH COMPANIES ---
  const fetchCompanies = async () => {
    try {
      console.log('📤 Fetching companies...')
      const response = await axios.get(`${API_URL}/admin/companies`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('📊 Companies response:', response.data)
      
      if (response.data.success) {
        const data = response.data.companies || response.data.data || []
        console.log('📊 Companies data:', data)
        setCompanies(data)
      } else {
        setCompanies([])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  useEffect(() => {
    if (token) {
      fetchJobs()
      fetchCompanies()
    } else {
      setLoading(false)
    }
  }, [token])

  // --- ADD JOB ---
  const handleAddJob = async () => {
    if (!newJob.title || !newJob.companyId || !newJob.salary_range || !newJob.location) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await axios.post(`${API_URL}/admin/jobs`, newJob, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Job added successfully!')
        setShowAddModal(false)
        setNewJob({
          title: '',
          companyId: '',
          salary_range: '',
          location: '',
          eligibility: '',
          skills: '',
          openings: '',
          deadline: '',
          description: '',
          jobType: 'Full-time'
        })
        fetchJobs()
      } else {
        toast.error(response.data.message || 'Failed to add job')
      }
    } catch (error) {
      console.error('Error adding job:', error)
      toast.error('Could not connect to server. Please try again.')
    }
  }

  // --- DELETE JOB ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return
    
    try {
      const response = await axios.delete(`${API_URL}/admin/jobs/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Job deleted successfully!')
        fetchJobs()
      } else {
        toast.error('Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Could not connect to server')
    }
  }

  // --- TOGGLE STATUS ---
  const handleStatusToggle = async (id) => {
    try {
      const job = jobs.find(j => j.id === id)
      const newStatus = job?.status === 'active' ? 'closed' : 'active'
      
      const response = await axios.put(`${API_URL}/admin/jobs/${id}/status`,
        { status: newStatus },
        { headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      )
      if (response.data.success) {
        toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'} successfully!`)
        fetchJobs()
      } else {
        toast.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Could not connect to server')
    }
  }

  // --- EDIT JOB ---
  const handleEdit = (job) => {
    setSelectedJob({ ...job })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!selectedJob) return
    
    try {
      const response = await axios.put(`${API_URL}/admin/jobs/${selectedJob.id}`,
        {
          title: selectedJob.title,
          salary_range: selectedJob.salary_range,
          location: selectedJob.location,
          status: selectedJob.status,
          jobType: selectedJob.jobType,
          openings: selectedJob.openings,
          eligibility: selectedJob.eligibility,
          deadline: selectedJob.deadline,
          skills: Array.isArray(selectedJob.skills) ? selectedJob.skills.join(',') : selectedJob.skills,
          description: selectedJob.description
        },
        { headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      )
      if (response.data.success) {
        toast.success('Job updated successfully!')
        setShowEditModal(false)
        setSelectedJob(null)
        fetchJobs()
      } else {
        toast.error('Failed to update job')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error('Could not connect to server')
    }
  }

  // --- EXPORT ---
  const handleExport = () => {
    if (jobs.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const exportData = jobs.map(job => ({
        'Job Title': job.title,
        'Company': job.company,
        'Package': job.salary_range,
        'Location': job.location,
        'Job Type': job.jobType,
        'Status': job.status,
        'Posted Date': job.postedDate,
        'Deadline': job.deadline,
        'Applications': job.applications || 0,
        'Openings': job.openings,
        'Eligibility CGPA': job.eligibility,
        'Skills': Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || ''
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Jobs')
      XLSX.writeFile(wb, `jobs_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Jobs exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    }
  }

  const getStatusBadge = (status) => {
    const isActive = status === 'active' || status === 'Active'
    if (isActive) {
      return { bg: '#d1fae5', color: '#059669', icon: CheckCircle, label: 'Active' }
    }
    return { bg: '#fee2e2', color: '#dc2626', icon: XCircle, label: 'Closed' }
  }

  const getCompanyNames = () => {
    const uniqueCompanies = [...new Set(jobs.map(j => j.company).filter(Boolean))]
    return ['all', ...uniqueCompanies]
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.company || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesCompany = companyFilter === 'all' || job.company === companyFilter
    return matchesSearch && matchesStatus && matchesCompany
  })

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
      background: 'linear-gradient(135deg, #059669, #10b981)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
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
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.6rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    actionBtns: {
      display: 'flex',
      gap: '0.5rem'
    },
    btnPrimary: {
      padding: '0.5rem 1rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnOutline: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    filterBar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
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
      borderBottom: '2px solid #e2e8f0',
      fontSize: '0.7rem',
      fontWeight: '600',
      color: '#64748b'
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '0.8rem'
    },
    jobTitle: {
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.2rem'
    },
    companyName: {
      fontSize: '0.65rem',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    actionIcons: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionIcon: {
      padding: '0.25rem',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#94a3b8'
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
    modalTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginBottom: '0.25rem',
      color: '#64748b'
    },
    formInput: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none'
    },
    formSelect: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      background: 'white',
      cursor: 'pointer'
    },
    formTextarea: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    btnSecondary: {
      flex: 1,
      padding: '0.6rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer'
    },
    detailGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    detailItem: {
      padding: '0.5rem',
      background: '#f8fafc',
      borderRadius: '10px'
    },
    detailLabel: {
      fontSize: '0.6rem',
      color: '#64748b'
    },
    detailValue: {
      fontSize: '0.85rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.25rem',
      marginTop: '0.25rem'
    },
    skillBadge: {
      background: '#e0e7ff',
      color: '#4338ca',
      padding: '0.2rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.6rem'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading jobs...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <Briefcase size={18} color="white" />
          </div>
          <span>Job Management</span>
        </div>
        <div style={styles.actionBtns}>
          <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>
            <Plus size={14} /> Add Job
          </button>
          <button onClick={handleExport} style={styles.btnOutline}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue}>{stats.total}</div><div style={styles.statLabel}>Total Jobs</div></div>
        <div style={styles.statCard('#10b981')}><div style={styles.statValue}>{stats.active}</div><div style={styles.statLabel}>Active Jobs</div></div>
        <div style={styles.statCard('#ef4444')}><div style={styles.statValue}>{stats.closed}</div><div style={styles.statLabel}>Closed Jobs</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue}>{stats.totalApplications}</div><div style={styles.statLabel}>Applications</div></div>
        <div style={styles.statCard('#f59e0b')}><div style={styles.statValue}>{stats.avgPackage} LPA</div><div style={styles.statLabel}>Avg Package</div></div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search by title or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Companies</option>
            {getCompanyNames().filter(c => c !== 'all').map((c, index) => (
              <option key={`${c || 'company'}-${index}`} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Job Title</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Package</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Applications</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <Briefcase size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <p>No jobs found</p>
                </td>
              </tr>
            ) : (
              filteredJobs.map(job => {
                const status = getStatusBadge(job.status)
                const StatusIcon = status.icon
                return (
                  <tr key={job.id}>
                    <td style={styles.td}>
                      <div style={styles.jobTitle}>{job.title}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Posted: {job.postedDate}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.companyName}><Building2 size={10} /> {job.company}</div>
                    </td>
                    <td style={styles.td}>
                      <div>{job.salary_range}</div>
                    </td>
                    <td style={styles.td}>{job.location}</td>
                    <td style={styles.td}>{job.applications || 0}</td>
                    <td style={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '500', background: status.bg, color: status.color }}>
                        <StatusIcon size={10} /> {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionIcons}>
                        <div onClick={() => { setSelectedJob(job); setShowDetailsModal(true) }} style={styles.actionIcon} title="View Details">
                          <Eye size={16} color="#3b82f6" />
                        </div>
                        <div onClick={() => handleEdit(job)} style={styles.actionIcon} title="Edit">
                          <Edit2 size={16} color="#f59e0b" />
                        </div>
                        <div onClick={() => handleStatusToggle(job.id)} style={styles.actionIcon} title={job.status === 'active' ? 'Close Job' : 'Activate Job'}>
                          {job.status === 'active' ? <XCircle size={16} color="#ef4444" /> : <CheckCircle size={16} color="#10b981" />}
                        </div>
                        <div onClick={() => handleDelete(job.id)} style={styles.actionIcon} title="Delete">
                          <Trash2 size={16} color="#ef4444" />
                        </div>
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
      {showDetailsModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Job Details</div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Job Title</div><div style={styles.detailValue}>{selectedJob.title}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Company</div><div style={styles.detailValue}>{selectedJob.company}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Package</div><div style={styles.detailValue}>{selectedJob.salary_range}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Location</div><div style={styles.detailValue}>{selectedJob.location}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Job Type</div><div style={styles.detailValue}>{selectedJob.jobType}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Openings</div><div style={styles.detailValue}>{selectedJob.openings}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Eligibility</div><div style={styles.detailValue}>CGPA {selectedJob.eligibility}+</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}>Deadline</div><div style={styles.detailValue}>{selectedJob.deadline}</div></div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Required Skills</div>
              <div style={styles.skillsList}>
                {Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 ? (
                  selectedJob.skills.map((skill, idx) => (
                    <span key={idx} style={styles.skillBadge}>{skill}</span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No skills listed</span>
                )}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Description</div>
              <div style={styles.detailValue}>{selectedJob.description || 'No description available'}</div>
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDetailsModal(false)} style={styles.btnSecondary}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Edit Job</div>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Job Title</label>
              <input type="text" value={selectedJob.title} onChange={(e) => setSelectedJob({...selectedJob, title: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Package (LPA)</label>
              <input type="text" value={selectedJob.salary_range} onChange={(e) => setSelectedJob({...selectedJob, salary_range: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Location</label>
              <input type="text" value={selectedJob.location} onChange={(e) => setSelectedJob({...selectedJob, location: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select value={selectedJob.status} onChange={(e) => setSelectedJob({...selectedJob, status: e.target.value})} style={styles.formSelect}>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowEditModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleUpdate} style={styles.btnPrimary}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Add New Job</div>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Job Title *</label>
              <input type="text" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g., Software Engineer" style={styles.formInput} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Company *</label>
              <select 
                value={newJob.companyId} 
                onChange={(e) => setNewJob({...newJob, companyId: e.target.value})} 
                style={styles.formSelect}
              >
                <option value="">Select Company</option>
                {companies && companies.length > 0 ? (
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name || company.name || company.companyName || 'Unnamed Company'}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No companies available</option>
                )}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Package (LPA) *</label>
                <input type="text" value={newJob.salary_range} onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})} placeholder="e.g., 24 LPA" style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Location *</label>
                <input type="text" value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="e.g., Bangalore" style={styles.formInput} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Job Type</label>
                <select value={newJob.jobType} onChange={(e) => setNewJob({...newJob, jobType: e.target.value})} style={styles.formSelect}>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Openings</label>
                <input type="number" value={newJob.openings} onChange={(e) => setNewJob({...newJob, openings: e.target.value})} placeholder="Number of openings" style={styles.formInput} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Min CGPA</label>
                <input type="number" step="0.1" value={newJob.eligibility} onChange={(e) => setNewJob({...newJob, eligibility: e.target.value})} placeholder="e.g., 7.5" style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Deadline</label>
                <input type="date" value={newJob.deadline} onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} style={styles.formInput} />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Skills (comma separated)</label>
              <input type="text" value={newJob.skills} onChange={(e) => setNewJob({...newJob, skills: e.target.value})} placeholder="e.g., React, Node.js, Python" style={styles.formInput} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="Job description..." style={styles.formTextarea} rows="3" />
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAddModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleAddJob} style={styles.btnPrimary}>Add Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobManagement