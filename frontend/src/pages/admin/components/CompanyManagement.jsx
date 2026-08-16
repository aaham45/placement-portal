import React, { useState, useEffect, useCallback } from 'react'
import { 
  Building2, Search, Eye, CheckCircle, XCircle, 
  Edit2, Trash2, Plus, Download, Clock, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function CompanyManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const [companies, setCompanies] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    totalJobs: 0,
    totalPlaced: 0
  })

  const [newCompany, setNewCompany] = useState({
    companyName: '',
    hrName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    location: '',
    employeeCount: '',
    description: '',
    password: ''
  })

  const token = localStorage.getItem('adminToken')

  const industries = ['Technology', 'E-commerce', 'IT Services', 'Banking', 'Consulting', 'Healthcare', 'Manufacturing', 'Education', 'Finance', 'Retail']

  // ============ FORMAT COMPANY ============
  const formatCompany = (c) => ({
    id: c.id,
    name: c.companyName || c.name || c.company_name || 'Company',
    company_name: c.companyName || c.name || c.company_name || 'Company',
    hrName: c.hrName || c.hr_name || 'N/A',
    email: c.email || c.contact_email || '',
    phone: c.phone || c.contact_phone || '',
    location: c.location || c.address || '',
    industry: c.industry || '',
    website: c.website || '',
    employeeCount: c.employeeCount || c.employee_count || '',
    description: c.description || '',
    status: c.isVerified === 1 || c.isVerified === true || c.status === 'approved' || c.status === 'verified' ? 'verified' : 
            c.status === 'rejected' ? 'rejected' : 'pending',
    isVerified: c.isVerified === 1 || c.isVerified === true,
    jobs: c.jobs || 0,
    placed: c.placed || 0,
    since: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    user_id: c.user_id || null
  })

  // ============ CALCULATE STATS ============
  const calculateStats = (data) => {
    setStats({
      total: data.length,
      verified: data.filter(c => c.status === 'verified').length,
      pending: data.filter(c => c.status === 'pending').length,
      rejected: data.filter(c => c.status === 'rejected').length,
      totalJobs: data.reduce((sum, c) => sum + (c.jobs || 0), 0),
      totalPlaced: data.reduce((sum, c) => sum + (c.placed || 0), 0)
    })
  }

  // ============ FETCH COMPANIES ============
  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/companies`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Companies response:', response.data)  // ✅ Debug ke liye
      
      if (response.data.success) {
        const data = response.data.companies || response.data.data || []
        console.log('📊 Companies data:', data)  // ✅ Debug ke liye
        const formattedCompanies = data.map(formatCompany)
        setCompanies(formattedCompanies)
        calculateStats(formattedCompanies)
      } else {
        setCompanies([])
        calculateStats([])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
      calculateStats([])
      toast.error('Failed to fetch companies from server')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchCompanies()
    } else {
      setLoading(false)
    }
  }, [token, fetchCompanies])

  // ============ FETCH COMPANY DETAILS ============
  const fetchCompanyDetails = async (companyId) => {
    console.log('📋 Fetching details for company:', companyId)  // ✅ Debug ke liye
    setDetailsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/companies/${companyId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Company details response:', response.data)  // ✅ Debug ke liye
      
      if (response.data.success) {
        const data = response.data.company || response.data.data || {}
        setSelectedCompany({
          id: data.id,
          name: data.companyName || data.name || data.company_name || '',
          company_name: data.companyName || data.name || data.company_name || '',
          hrName: data.hrName || data.hr_name || 'N/A',
          email: data.email || data.contact_email || '',
          phone: data.phone || data.contact_phone || '',
          website: data.website || '',
          industry: data.industry || '',
          location: data.location || data.address || '',
          employeeCount: data.employeeCount || data.employee_count || '',
          description: data.description || '',
          since: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: data.isVerified === 1 || data.isVerified === true || data.status === 'approved' || data.status === 'verified' ? 'verified' : 
                  data.status === 'rejected' ? 'rejected' : 'pending'
        })
        setShowDetailsModal(true)
      } else {
        toast.error('Failed to fetch company details')
      }
    } catch (error) {
      console.error('Error fetching company details:', error)
      toast.error('Failed to fetch company details')
    } finally {
      setDetailsLoading(false)
    }
  }

  // ============ UPDATE STATUS ============
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/admin/companies/${id}/verify`, 
        { status: newStatus === 'verified' ? 'approved' : 'rejected' },
        { headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      )
      if (response.data.success) {
        toast.success(`Company ${newStatus === 'verified' ? 'verified' : 'rejected'} successfully!`)
        fetchCompanies()
      } else {
        throw new Error('API failed')
      }
    } catch (error) {
      const updatedCompanies = companies.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      )
      setCompanies(updatedCompanies)
      calculateStats(updatedCompanies)
      toast.success(`Company ${newStatus === 'verified' ? 'verified' : 'rejected'} successfully!`)
    }
  }

  // ============ DELETE COMPANY ============
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return
    
    try {
      const response = await axios.delete(`${API_URL}/admin/companies/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Company deleted successfully!')
        fetchCompanies()
      } else {
        toast.error(response.data.message || 'Failed to delete company')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Failed to delete company')
    }
  }

  // ============ ADD COMPANY ============
  const handleAddCompany = async () => {
    if (!newCompany.companyName || !newCompany.hrName || !newCompany.email) {
      toast.error('Please fill all required fields: Company Name, HR Name, and Email')
      return
    }

    setAddLoading(true)
    try {
      const response = await axios.post(`${API_URL}/admin/companies`, newCompany, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Company added successfully!')
        setShowAddModal(false)
        setNewCompany({
          companyName: '',
          hrName: '',
          email: '',
          phone: '',
          website: '',
          industry: '',
          location: '',
          employeeCount: '',
          description: '',
          password: ''
        })
        fetchCompanies()
      } else {
        toast.error(response.data.message || 'Failed to add company')
      }
    } catch (error) {
      console.error('Error adding company:', error)
      toast.error(error.response?.data?.message || 'Failed to add company')
    } finally {
      setAddLoading(false)
    }
  }

  // ============ EDIT COMPANY ============
  const handleEdit = (company) => {
    console.log('📝 Opening edit modal for:', company)
    setSelectedCompany({
      id: company.id,
      name: company.name || company.company_name || '',
      company_name: company.name || company.company_name || '',
      hrName: company.hrName || 'N/A',
      email: company.email || '',
      phone: company.phone || '',
      website: company.website || '',
      industry: company.industry || '',
      location: company.location || '',
      employeeCount: company.employeeCount || '',
      description: company.description || '',
      since: company.since || ''
    })
    setShowEditModal(true)
  }

  // ============ UPDATE COMPANY ============
  const handleUpdateCompany = async () => {
    if (!selectedCompany) return

    setEditLoading(true)
    try {
      const updateData = {
        name: selectedCompany.name || selectedCompany.company_name || '',
        company_name: selectedCompany.name || selectedCompany.company_name || '',
        description: selectedCompany.description || '',
        industry: selectedCompany.industry || '',
        address: selectedCompany.location || '',
        phone: selectedCompany.phone || '',
        website: selectedCompany.website || '',
        email: selectedCompany.email || '',
        hrName: selectedCompany.hrName || '',
        employeeCount: selectedCompany.employeeCount || '',
        location: selectedCompany.location || ''
      }

      console.log('📤 Updating company with data:', updateData)

      const response = await axios.put(`${API_URL}/admin/companies/${selectedCompany.id}`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        toast.success('Company updated successfully!')
        setShowEditModal(false)
        setSelectedCompany(null)
        fetchCompanies()
      } else {
        toast.error(response.data.message || 'Failed to update company')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error('Could not connect to server')
    } finally {
      setEditLoading(false)
    }
  }

  // ============ BULK VERIFY ============
  const handleBulkVerify = async () => {
    const pendingCompanies = companies.filter(c => c.status === 'pending')
    if (pendingCompanies.length === 0) {
      toast.info('No pending companies to verify. All companies are already verified or rejected!')
      return
    }

    if (!window.confirm(`Are you sure you want to verify ${pendingCompanies.length} pending companies?`)) return

    let successCount = 0
    for (const company of pendingCompanies) {
      try {
        await axios.put(`${API_URL}/admin/companies/${company.id}/verify`,
          { status: 'approved' },
          { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }}
        )
        successCount++
      } catch (error) {
        console.log(`Failed to verify ${company.name}`)
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} companies verified successfully!`)
      fetchCompanies()
    } else {
      toast.error('Bulk verification failed. Please try again.')
    }
  }

  // ============ EXPORT ============
  const handleExport = () => {
    if (companies.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const exportData = companies.map(c => ({
        'Company Name': c.name,
        'HR Name': c.hrName,
        'Email': c.email,
        'Phone': c.phone || '',
        'Website': c.website || '',
        'Industry': c.industry || '',
        'Location': c.location || '',
        'Employee Count': c.employeeCount || '',
        'Status': c.status === 'verified' ? 'Verified' : c.status === 'pending' ? 'Pending' : 'Rejected',
        'Jobs Posted': c.jobs || 0,
        'Students Placed': c.placed || 0,
        'Since': c.since || ''
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Companies')
      
      const fileName = `companies_export_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success(`Companies data exported successfully as ${fileName}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed: ' + error.message)
    }
  }

  // ============ REFRESH ============
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchCompanies()
      toast.success('Companies refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh companies')
    } finally {
      setRefreshing(false)
    }
  }

  // ============ GET STATUS BADGE ============
  const getStatusBadge = (status) => {
    const config = {
      verified: { bg: '#d1fae5', color: '#059669', icon: CheckCircle, label: 'Verified' },
      pending: { bg: '#fef3c7', color: '#d97706', icon: Clock, label: 'Pending' },
      rejected: { bg: '#fee2e2', color: '#dc2626', icon: XCircle, label: 'Rejected' }
    }
    const { bg, color, icon: Icon, label } = config[status] || config.pending
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '500', background: bg, color: color }}>
        <Icon size={10} /> {label}
      </span>
    )
  }

  // ============ FILTERED COMPANIES ============
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = (company.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.hrName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    const matchesIndustry = industryFilter === 'all' || (company.industry || '').toLowerCase() === industryFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesIndustry
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
      gap: '0.5rem',
      flexWrap: 'wrap'
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
      overflowX: 'auto',
      maxHeight: '500px',
      overflowY: 'auto'
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
      color: '#64748b',
      position: 'sticky',
      top: 0,
      background: 'white'
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '0.8rem'
    },
    companyName: {
      fontWeight: '600',
      color: '#1e293b'
    },
    companyEmail: {
      fontSize: '0.65rem',
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
      maxWidth: '600px',
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
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#059669',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading companies...</p>
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
          <div style={styles.titleIcon}><Building2 size={18} color="white" /></div>
          <span>Company Management</span>
        </div>
        <div style={styles.actionBtns}>
          <button onClick={handleBulkVerify} style={styles.btnPrimary}>
            <CheckCircle size={14} /> Bulk Verify
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.btnOutline}>
            <Plus size={14} /> Add Company
          </button>
          <button onClick={handleExport} style={styles.btnOutline}>
            <Download size={14} /> Export
          </button>
          <button onClick={handleRefresh} style={styles.btnOutline} disabled={refreshing}>
            <RefreshCw size={14} style={refreshing ? { animation: 'spin 0.6s linear infinite' } : {}} /> Refresh
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}><div style={styles.statValue}>{stats.total}</div><div style={styles.statLabel}>Total Companies</div></div>
        <div style={styles.statCard('#10b981')}><div style={styles.statValue}>{stats.verified}</div><div style={styles.statLabel}>Verified</div></div>
        <div style={styles.statCard('#f59e0b')}><div style={styles.statValue}>{stats.pending}</div><div style={styles.statLabel}>Pending</div></div>
        <div style={styles.statCard('#ef4444')}><div style={styles.statValue}>{stats.rejected}</div><div style={styles.statLabel}>Rejected</div></div>
        <div style={styles.statCard('#8b5cf6')}><div style={styles.statValue}>{stats.totalJobs}</div><div style={styles.statLabel}>Jobs Posted</div></div>
        <div style={styles.statCard('#ec4899')}><div style={styles.statValue}>{stats.totalPlaced}</div><div style={styles.statLabel}>Students Placed</div></div>
      </div>

      {/* FILTERS */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search by name, HR, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Industries</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>HR Name</th>
              <th style={styles.th}>Industry</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Jobs</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <Building2 size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <p>No companies found</p>
                </td>
              </tr>
            ) : (
              filteredCompanies.map(company => (
                <tr key={company.id}>
                  <td style={styles.td}>
                    <div style={styles.companyName}>{company.name}</div>
                    <div style={styles.companyEmail}>{company.email}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{company.hrName}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{company.phone || ''}</div>
                  </td>
                  <td style={styles.td}>{company.industry || 'N/A'}</td>
                  <td style={styles.td}>{company.location || 'N/A'}</td>
                  <td style={styles.td}>{company.jobs || 0}</td>
                  <td style={styles.td}>
                    {getStatusBadge(company.status)}
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {company.status !== 'verified' && (
                        <button 
                          onClick={() => handleUpdateStatus(company.id, 'verified')}
                          style={{ padding: '0.15rem 0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.6rem', cursor: 'pointer' }}
                        >
                          Verify
                        </button>
                      )}
                      {company.status !== 'rejected' && (
                        <button 
                          onClick={() => handleUpdateStatus(company.id, 'rejected')}
                          style={{ padding: '0.15rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.6rem', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionIcons}>
                      <div onClick={() => fetchCompanyDetails(company.id)} style={styles.actionIcon} title="View Details">
                        <Eye size={16} color="#3b82f6" />
                      </div>
                      <div onClick={() => handleEdit(company)} style={styles.actionIcon} title="Edit">
                        <Edit2 size={16} color="#f59e0b" />
                      </div>
                      <div onClick={() => handleDelete(company.id)} style={styles.actionIcon} title="Delete">
                        <Trash2 size={16} color="#ef4444" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ============ DETAILS MODAL ============ */}
      {showDetailsModal && selectedCompany && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={styles.loadingSpinner}></div>
                <p>Loading details...</p>
              </div>
            ) : (
              <>
                <div style={styles.modalHeader}>
                  <div style={styles.modalTitle}>Company Details</div>
                  <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
                </div>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Company Name</div>
                    <div style={styles.detailValue}>{selectedCompany.name}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>HR Name</div>
                    <div style={styles.detailValue}>{selectedCompany.hrName || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Email</div>
                    <div style={styles.detailValue}>{selectedCompany.email || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Phone</div>
                    <div style={styles.detailValue}>{selectedCompany.phone || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Website</div>
                    <div style={styles.detailValue}>{selectedCompany.website || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Industry</div>
                    <div style={styles.detailValue}>{selectedCompany.industry || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Location</div>
                    <div style={styles.detailValue}>{selectedCompany.location || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Employee Count</div>
                    <div style={styles.detailValue}>{selectedCompany.employeeCount || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Since</div>
                    <div style={styles.detailValue}>{selectedCompany.since}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Status</div>
                    <div style={styles.detailValue}>{getStatusBadge(selectedCompany.status)}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Description</div>
                  <div style={styles.detailValue}>{selectedCompany.description || 'No description available'}</div>
                </div>
                <div style={styles.modalButtons}>
                  <button onClick={() => setShowDetailsModal(false)} style={styles.btnSecondary}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Add New Company</div>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Company Name *</label>
              <input type="text" value={newCompany.companyName} onChange={(e) => setNewCompany({...newCompany, companyName: e.target.value})} placeholder="Enter company name" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>HR Name *</label>
              <input type="text" value={newCompany.hrName} onChange={(e) => setNewCompany({...newCompany, hrName: e.target.value})} placeholder="Enter HR name" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email *</label>
              <input type="email" value={newCompany.email} onChange={(e) => setNewCompany({...newCompany, email: e.target.value})} placeholder="hr@company.com" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone</label>
              <input type="text" value={newCompany.phone} onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})} placeholder="+91 9876543210" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Website</label>
              <input type="text" value={newCompany.website} onChange={(e) => setNewCompany({...newCompany, website: e.target.value})} placeholder="www.company.com" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Industry</label>
              <select value={newCompany.industry} onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})} style={styles.formSelect}>
                <option value="">Select Industry</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Location</label>
              <input type="text" value={newCompany.location} onChange={(e) => setNewCompany({...newCompany, location: e.target.value})} placeholder="City, State" style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Employee Count</label>
              <select value={newCompany.employeeCount} onChange={(e) => setNewCompany({...newCompany, employeeCount: e.target.value})} style={styles.formSelect}>
                <option value="">Select Range</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Password (Optional)</label>
              <input 
                type="text" 
                value={newCompany.password || ''} 
                onChange={(e) => setNewCompany({...newCompany, password: e.target.value})} 
                placeholder="Leave empty for default: company123" 
                style={styles.formInput} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea value={newCompany.description} onChange={(e) => setNewCompany({...newCompany, description: e.target.value})} placeholder="Company description..." style={styles.formTextarea} rows="3" />
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAddModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleAddCompany} disabled={addLoading} style={styles.btnPrimary}>
                {addLoading ? 'Adding...' : 'Add Company'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedCompany && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Edit Company</div>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Company Name</label>
              <input 
                type="text" 
                value={selectedCompany?.name || selectedCompany?.company_name || ''} 
                onChange={(e) => setSelectedCompany({...selectedCompany, name: e.target.value, company_name: e.target.value})} 
                style={styles.formInput} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>HR Name</label>
              <input type="text" value={selectedCompany?.hrName || ''} onChange={(e) => setSelectedCompany({...selectedCompany, hrName: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email</label>
              <input type="email" value={selectedCompany?.email || ''} onChange={(e) => setSelectedCompany({...selectedCompany, email: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone</label>
              <input type="text" value={selectedCompany?.phone || ''} onChange={(e) => setSelectedCompany({...selectedCompany, phone: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Website</label>
              <input type="text" value={selectedCompany?.website || ''} onChange={(e) => setSelectedCompany({...selectedCompany, website: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Industry</label>
              <select value={selectedCompany?.industry || ''} onChange={(e) => setSelectedCompany({...selectedCompany, industry: e.target.value})} style={styles.formSelect}>
                <option value="">Select Industry</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Location</label>
              <input type="text" value={selectedCompany?.location || ''} onChange={(e) => setSelectedCompany({...selectedCompany, location: e.target.value})} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Employee Count</label>
              <select value={selectedCompany?.employeeCount || ''} onChange={(e) => setSelectedCompany({...selectedCompany, employeeCount: e.target.value})} style={styles.formSelect}>
                <option value="">Select Range</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea value={selectedCompany?.description || ''} onChange={(e) => setSelectedCompany({...selectedCompany, description: e.target.value})} placeholder="Company description..." style={styles.formTextarea} rows="3" />
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowEditModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleUpdateCompany} disabled={editLoading} style={styles.btnPrimary}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default CompanyManagement