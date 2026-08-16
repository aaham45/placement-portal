import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calendar, Plus, Search, Eye, Edit2, Trash2, 
  Clock, CheckCircle, TrendingUp, Download,
  DollarSign, Target, Users, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function PlacementDrives() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDrive, setSelectedDrive] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editLoading, setEditLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)  // ✅ ADD THIS
  
  const [drives, setDrives] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    totalCompanies: 0,
    totalStudents: 0
  })

  // Add Drive Form State
  const [newDrive, setNewDrive] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    companies: '',
    eligibleBranches: '',
    minCgpa: '',
    packageRange: '',
    status: 'upcoming'
  })

  const token = localStorage.getItem('adminToken')

  // Date format function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Helper function to safely get array from string or array
  const safeSplit = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean)
    return []
  }

  // Format drive data from API
  const formatDrives = (data) => {
    return data.map(drive => ({
      id: drive.id,
      title: drive.title || 'Drive',
      description: drive.description || '',
      startDate: drive.start_date || drive.startDate || '',
      endDate: drive.end_date || drive.endDate || '',
      status: drive.status || 'upcoming',
      companies: safeSplit(drive.companies),
      eligibleBranches: safeSplit(drive.eligible_branches || drive.eligibleBranches),
      minCgpa: drive.min_cgpa || drive.minCgpa || 0,
      package: drive.package_range || drive.package || '0 LPA',
      locations: safeSplit(drive.locations),
      totalApplied: drive.total_applied || drive.totalApplied || 0,
      shortlisted: drive.shortlisted || 0,
      selected: drive.selected || 0,
      createdAt: drive.created_at || drive.createdAt
    }))
  }

  // --- STATS CALCULATION FUNCTION ---
  const calculateStats = (data) => {
    const total = data.length
    const upcoming = data.filter(d => d.status === 'upcoming').length
    const ongoing = data.filter(d => d.status === 'ongoing').length
    const completed = data.filter(d => d.status === 'completed').length
    const allCompanies = data.flatMap(d => d.companies || [])
    const totalCompanies = [...new Set(allCompanies)].length
    const totalStudents = data.reduce((sum, d) => sum + (d.totalApplied || 0), 0)
    setStats({ total, upcoming, ongoing, completed, totalCompanies, totalStudents })
  }

  // --- FETCH DRIVES ---
  const fetchDrives = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/placement-drives`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Drives response:', response.data)  // Debug ke liye
      
      if (response.data.success) {
        const data = response.data.drives || response.data.data || []
        const formattedDrives = formatDrives(data)
        setDrives(formattedDrives)
        
        if (response.data.stats) {
          setStats(response.data.stats)
        } else {
          calculateStats(formattedDrives)
        }
      } else {
        setDrives([])
        setStats({ total: 0, upcoming: 0, ongoing: 0, completed: 0, totalCompanies: 0, totalStudents: 0 })
      }
    } catch (error) {
      console.error('Error fetching drives:', error)
      setDrives([])
      setStats({ total: 0, upcoming: 0, ongoing: 0, completed: 0, totalCompanies: 0, totalStudents: 0 })
      toast.error('Failed to fetch placement drives')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchDrives()
    } else {
      setLoading(false)
    }
  }, [token, fetchDrives])

  // --- DELETE DRIVE ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return
    
    try {
      const response = await axios.delete(`${API_URL}/admin/placement-drives/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Placement drive deleted successfully!')
        fetchDrives()
      } else {
        toast.error(response.data.message || 'Failed to delete drive')
      }
    } catch (error) {
      console.error('Error deleting drive:', error)
      toast.error('Could not connect to server. Please try again.')
    }
  }

  // --- ADD DRIVE ---
  const handleAddDrive = async () => {
    if (!newDrive.title || !newDrive.startDate || !newDrive.endDate) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await axios.post(`${API_URL}/admin/placement-drives`, newDrive, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Placement drive created successfully!')
        setShowAddModal(false)
        setNewDrive({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          companies: '',
          eligibleBranches: '',
          minCgpa: '',
          packageRange: '',
          status: 'upcoming'
        })
        fetchDrives()
      } else {
        toast.error(response.data.message || 'Failed to create drive')
      }
    } catch (error) {
      console.error('Error adding drive:', error)
      toast.error('Could not connect to server. Please try again.')
    }
  }

  // --- EDIT DRIVE ---
  const handleEdit = (drive) => {
    setSelectedDrive({
      id: drive.id,
      title: drive.title,
      description: drive.description || '',
      startDate: drive.startDate,
      endDate: drive.endDate,
      status: drive.status,
      companies: drive.companies ? drive.companies.join(', ') : '',
      eligibleBranches: drive.eligibleBranches ? drive.eligibleBranches.join(', ') : '',
      minCgpa: drive.minCgpa,
      package: drive.package
    })
    setShowEditModal(true)
  }

  // --- UPDATE DRIVE ---
const handleUpdate = async () => {
  if (!selectedDrive) return

  setEditLoading(true)  // ✅ Edit loading ko true karo
  try {
    const updateData = {
      title: selectedDrive.title,
      description: selectedDrive.description,
      start_date: selectedDrive.startDate,
      end_date: selectedDrive.endDate,
      package_range: selectedDrive.package,
      min_cgpa: parseFloat(selectedDrive.minCgpa) || 0,
      status: selectedDrive.status
    }

    console.log('📤 Updating drive with data:', updateData)

    const response = await axios.put(`${API_URL}/admin/placement-drives/${selectedDrive.id}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.data.success) {
      toast.success('Placement drive updated successfully!')
      setShowEditModal(false)
      setSelectedDrive(null)
      fetchDrives()
    } else {
      toast.error(response.data.message || 'Failed to update drive')
    }
  } catch (error) {
    console.error('Error updating drive:', error)
    toast.error(error.response?.data?.message || 'Could not connect to server. Please try again.')
  } finally {
    setEditLoading(false)  // ✅ Edit loading ko false karo
  }
}

  // --- EXPORT ---
  const handleExport = () => {
    if (drives.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const exportData = drives.map(d => ({
        'Drive Title': d.title,
        'Companies': d.companies ? d.companies.join(', ') : '',
        'Package': d.package,
        'Start Date': formatDate(d.startDate),
        'End Date': formatDate(d.endDate),
        'Status': d.status === 'upcoming' ? 'Upcoming' : d.status === 'ongoing' ? 'Ongoing' : 'Completed',
        'Min CGPA': d.minCgpa,
        'Eligible Branches': d.eligibleBranches ? d.eligibleBranches.join(', ') : '',
        'Total Applied': d.totalApplied || 0,
        'Shortlisted': d.shortlisted || 0,
        'Selected': d.selected || 0
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Placement Drives')
      XLSX.writeFile(wb, `placement_drives_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Drives exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      upcoming: { bg: '#dbeafe', color: '#2563eb', icon: Clock, label: 'Upcoming' },
      ongoing: { bg: '#fef3c7', color: '#d97706', icon: TrendingUp, label: 'Ongoing' },
      completed: { bg: '#d1fae5', color: '#059669', icon: CheckCircle, label: 'Completed' }
    }
    const { bg, color, icon: Icon, label } = config[status] || config.upcoming
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '500', background: bg, color: color }}>
        <Icon size={10} /> {label}
      </span>
    )
  }

  const getDaysLeft = (endDate) => {
    if (!endDate) return 'Not specified'
    try {
      const today = new Date()
      const end = new Date(endDate)
      const diffTime = end - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return 'Ended'
      if (diffDays === 0) return 'Last day today!'
      return `${diffDays} days left`
    } catch {
      return 'Not specified'
    }
  }

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = (drive.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (drive.companies && drive.companies.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter
    return matchesSearch && matchesStatus
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
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
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
      background: '#8b5cf6',
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
    drivesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    driveCard: {
      background: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    cardHeader: {
      padding: '1rem',
      background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
      borderBottom: '1px solid #e2e8f0'
    },
    driveTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    driveDate: {
      fontSize: '0.65rem',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginTop: '0.25rem'
    },
    cardBody: {
      padding: '1rem'
    },
    driveInfo: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
      marginBottom: '0.75rem'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.7rem',
      color: '#64748b',
      background: '#f8fafc',
      padding: '0.2rem 0.5rem',
      borderRadius: '20px'
    },
    companyList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.25rem',
      marginBottom: '0.5rem'
    },
    companyBadge: {
      background: '#e0e7ff',
      color: '#4338ca',
      padding: '0.2rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.6rem'
    },
    statsRowCard: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem',
      paddingTop: '0.5rem',
      borderTop: '1px solid #e2e8f0'
    },
    statItemCard: {
      flex: 1,
      textAlign: 'center'
    },
    statValueCard: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    statLabelCard: {
      fontSize: '0.55rem',
      color: '#64748b'
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
    formSelect: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      background: 'white',
      cursor: 'pointer'
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
    branchList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.25rem',
      marginTop: '0.25rem'
    },
    branchBadge: {
      background: '#fef3c7',
      color: '#d97706',
      padding: '0.2rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.6rem'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading placement drives...</p>
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
            <Calendar size={18} color="white" />
          </div>
          <span>Placement Drives</span>
        </div>
        <div style={styles.actionBtns}>
          <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>
            <Plus size={14} /> Create Drive
          </button>
          <button onClick={handleExport} style={styles.btnOutline}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Drives</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.upcoming}</div>
          <div style={styles.statLabel}>Upcoming</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.ongoing}</div>
          <div style={styles.statLabel}>Ongoing</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard('#ec4899')}>
          <div style={styles.statValue}>{stats.totalCompanies}</div>
          <div style={styles.statLabel}>Companies</div>
        </div>
        <div style={styles.statCard('#06b6d4')}>
          <div style={styles.statValue}>{stats.totalStudents}</div>
          <div style={styles.statLabel}>Students Applied</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by title or company..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput} 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div style={styles.emptyState}>
          <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No placement drives found</p>
        </div>
      ) : (
        <div style={styles.drivesGrid}>
          {filteredDrives.map(drive => (
            <div key={drive.id} style={styles.driveCard}>
              <div style={styles.cardHeader}>
                <div style={styles.driveTitle}>
                  <span>{drive.title}</span>
                  {getStatusBadge(drive.status)}
                </div>
                <div style={styles.driveDate}>
                  <Calendar size={12} /> {formatDate(drive.startDate)} to {formatDate(drive.endDate)}
                </div>
              </div>
              <div style={styles.cardBody}>
                {/* Companies List */}
                <div style={styles.companyList}>
                  {drive.companies && drive.companies.length > 0 ? (
                    drive.companies.map(company => (
                      <span key={company} style={styles.companyBadge}>
                        <Building2 size={10} /> {company}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>No companies listed</span>
                  )}
                </div>
                
                {/* Drive Info */}
                <div style={styles.driveInfo}>
                  <span style={styles.infoItem}>
                    <DollarSign size={12} /> {drive.package}
                  </span>
                  <span style={styles.infoItem}>
                    <Target size={12} /> CGPA {drive.minCgpa}+
                  </span>
                  <span style={styles.infoItem}>
                    <Clock size={12} /> {getDaysLeft(drive.endDate)}
                  </span>
                </div>
                
                {/* Stats Row - Applied, Shortlisted, Selected */}
                <div style={styles.statsRowCard}>
                  <div style={styles.statItemCard}>
                    <div style={styles.statValueCard}>
                      <Users size={14} color="#3b82f6" /> {drive.totalApplied || 0}
                    </div>
                    <div style={styles.statLabelCard}>Applied</div>
                  </div>
                  <div style={styles.statItemCard}>
                    <div style={styles.statValueCard}>
                      <Users size={14} color="#f59e0b" /> {drive.shortlisted || 0}
                    </div>
                    <div style={styles.statLabelCard}>Shortlisted</div>
                  </div>
                  <div style={styles.statItemCard}>
                    <div style={styles.statValueCard}>
                      <Users size={14} color="#10b981" /> {drive.selected || 0}
                    </div>
                    <div style={styles.statLabelCard}>Selected</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <div 
                    onClick={() => { setSelectedDrive(drive); setShowDetailsModal(true) }} 
                    style={styles.actionIcon} 
                    title="View Details"
                  >
                    <Eye size={16} color="#3b82f6" />
                  </div>
                  <div 
                    onClick={() => handleEdit(drive)} 
                    style={styles.actionIcon} 
                    title="Edit"
                  >
                    <Edit2 size={16} color="#f59e0b" />
                  </div>
                  <div 
                    onClick={() => handleDelete(drive.id)} 
                    style={styles.actionIcon} 
                    title="Delete"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDrive && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Drive Details</div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Drive Title</div>
                <div style={styles.detailValue}>{selectedDrive.title}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Status</div>
                <div style={styles.detailValue}>{getStatusBadge(selectedDrive.status)}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Start Date</div>
                <div style={styles.detailValue}>{formatDate(selectedDrive.startDate)}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>End Date</div>
                <div style={styles.detailValue}>{formatDate(selectedDrive.endDate)}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Package</div>
                <div style={styles.detailValue}>{selectedDrive.package}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Min CGPA</div>
                <div style={styles.detailValue}>{selectedDrive.minCgpa}+</div>
              </div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Companies</div>
              <div style={styles.companyList}>
                {selectedDrive.companies && selectedDrive.companies.length > 0 ? (
                  selectedDrive.companies.map(c => (
                    <span key={c} style={styles.companyBadge}>
                      <Building2 size={10} /> {c}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No companies listed</span>
                )}
              </div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Eligible Branches</div>
              <div style={styles.branchList}>
                {selectedDrive.eligibleBranches && selectedDrive.eligibleBranches.length > 0 ? (
                  selectedDrive.eligibleBranches.map(b => (
                    <span key={b} style={styles.branchBadge}>{b}</span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No branches listed</span>
                )}
              </div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Description</div>
              <div style={styles.detailValue}>{selectedDrive.description || 'No description available'}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#3b82f6' }}>{selectedDrive.totalApplied || 0}</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Total Applied</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f59e0b' }}>{selectedDrive.shortlisted || 0}</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Shortlisted</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#10b981' }}>{selectedDrive.selected || 0}</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Selected</div>
              </div>
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDetailsModal(false)} style={styles.btnSecondary}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Drive Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Create Placement Drive</div>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Drive Title *</label>
              <input 
                type="text" 
                value={newDrive.title} 
                onChange={(e) => setNewDrive({...newDrive, title: e.target.value})} 
                placeholder="Enter drive title" 
                style={styles.formInput} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea 
                value={newDrive.description} 
                onChange={(e) => setNewDrive({...newDrive, description: e.target.value})} 
                placeholder="Enter description" 
                style={styles.formTextarea} 
                rows="3" 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Start Date *</label>
                <input 
                  type="date" 
                  value={newDrive.startDate} 
                  onChange={(e) => setNewDrive({...newDrive, startDate: e.target.value})} 
                  style={styles.formInput} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>End Date *</label>
                <input 
                  type="date" 
                  value={newDrive.endDate} 
                  onChange={(e) => setNewDrive({...newDrive, endDate: e.target.value})} 
                  style={styles.formInput} 
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Package (LPA)</label>
                <input 
                  type="text" 
                  value={newDrive.packageRange} 
                  onChange={(e) => setNewDrive({...newDrive, packageRange: e.target.value})} 
                  placeholder="e.g., 24 LPA" 
                  style={styles.formInput} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Min CGPA</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={newDrive.minCgpa} 
                  onChange={(e) => setNewDrive({...newDrive, minCgpa: e.target.value})} 
                  placeholder="7.5" 
                  style={styles.formInput} 
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Companies (comma separated)</label>
              <input 
                type="text" 
                value={newDrive.companies} 
                onChange={(e) => setNewDrive({...newDrive, companies: e.target.value})} 
                placeholder="Amazon India, Google India, Microsoft" 
                style={styles.formInput} 
              />
              <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Enter company names separated by commas</span>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Eligible Branches (comma separated)</label>
              <input 
                type="text" 
                value={newDrive.eligibleBranches} 
                onChange={(e) => setNewDrive({...newDrive, eligibleBranches: e.target.value})} 
                placeholder="CSE, IT, ECE" 
                style={styles.formInput} 
              />
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAddModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleAddDrive} disabled={addLoading} style={styles.btnPrimary}>
                {addLoading ? 'Creating...' : 'Create Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drive Modal */}
      {showEditModal && selectedDrive && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Edit Drive</div>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Drive Title</label>
              <input 
                type="text" 
                value={selectedDrive.title} 
                onChange={(e) => setSelectedDrive({...selectedDrive, title: e.target.value})} 
                style={styles.formInput} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea 
                value={selectedDrive.description} 
                onChange={(e) => setSelectedDrive({...selectedDrive, description: e.target.value})} 
                style={styles.formTextarea} 
                rows="3" 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Start Date</label>
                <input 
                  type="date" 
                  value={selectedDrive.startDate} 
                  onChange={(e) => setSelectedDrive({...selectedDrive, startDate: e.target.value})} 
                  style={styles.formInput} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>End Date</label>
                <input 
                  type="date" 
                  value={selectedDrive.endDate} 
                  onChange={(e) => setSelectedDrive({...selectedDrive, endDate: e.target.value})} 
                  style={styles.formInput} 
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Package (LPA)</label>
                <input 
                  type="text" 
                  value={selectedDrive.package} 
                  onChange={(e) => setSelectedDrive({...selectedDrive, package: e.target.value})} 
                  style={styles.formInput} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Min CGPA</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={selectedDrive.minCgpa} 
                  onChange={(e) => setSelectedDrive({...selectedDrive, minCgpa: e.target.value})} 
                  style={styles.formInput} 
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select 
                value={selectedDrive.status} 
                onChange={(e) => setSelectedDrive({...selectedDrive, status: e.target.value})} 
                style={styles.formSelect}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowEditModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleUpdate} disabled={editLoading} style={styles.btnPrimary}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlacementDrives