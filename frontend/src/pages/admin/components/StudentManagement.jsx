import React, { useState, useEffect, useCallback } from 'react'
import { 
  Users, Search, Filter, Eye, Edit2, Trash2, 
  Plus, Mail, Phone, MapPin, GraduationCap, 
  Download, Upload, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Clock, AlertCircle, Award,
  Calendar, BookOpen, Briefcase, DollarSign, TrendingUp,
  UserPlus, UserCheck, UserX, FileText, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [editCgpa, setEditCgpa] = useState('')
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBranch, setEditBranch] = useState('')
  const [editDob, setEditDob] = useState('')
  const [editAddress, setEditAddress] = useState('')
  
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    active: 0,
    placedPercentage: 0,
    avgCgpa: 0,
    totalApplications: 0
  })

  const token = localStorage.getItem('adminToken')
  const fileInputRef = React.useRef(null)

  const getNormalizedBranch = useCallback((branch) => {
    const branchMap = {
      'cse': 'CSE', 'computer science': 'CSE', 'computer science engineering': 'CSE', 'cs': 'CSE',
      'it': 'IT', 'information technology': 'IT',
      'ece': 'ECE', 'electronics': 'ECE', 'electronics and communication': 'ECE', 'electronics & communication': 'ECE',
      'ee': 'EE', 'electrical': 'EE', 'electrical engineering': 'EE',
      'me': 'ME', 'mechanical': 'ME', 'mechanical engineering': 'ME',
      'ce': 'CE', 'civil': 'CE', 'civil engineering': 'CE'
    }
    if (!branch) return 'Other'
    const normalized = branchMap[branch.toLowerCase()]
    return normalized || branch
  }, [])

  const branches = ['all', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE']

  // ============ FETCH STUDENTS ============
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/students`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        const data = response.data.students || response.data.data || []
        const formattedStudents = data.map(s => ({
          id: s.id,
          regNo: s.regNo || s.reg_no || s.registration_number || `REG${String(s.id).padStart(6, '0')}`,
          name: s.name || s.fullName || 'Student',
          email: s.email || '',
          phone: s.phone || '',
          branch: getNormalizedBranch(s.branch || s.branch_name),
          semester: s.semester || 1,
          currentCgpa: parseFloat(s.currentCgpa || s.cgpa || s.current_cgpa || 0),
          placed: s.placed === 1 || s.placed === true || s.is_placed === 1 || s.is_placed === true,
          company: s.company || s.placed_company || null,
          package: s.package || s.package_lpa || null,
          appliedJobs: s.appliedJobs || s.applied_jobs || 0,
          shortlisted: s.shortlisted || 0,
          interviews: s.interviews || 0,
          address: s.address || '',
          dob: s.dob || s.date_of_birth || '',
          skills: s.skills ? (Array.isArray(s.skills) ? s.skills : String(s.skills).split(',').map(skill => skill.trim()).filter(Boolean)) : [],
          achievements: s.achievements ? (Array.isArray(s.achievements) ? s.achievements : String(s.achievements).split(',').map(ach => ach.trim()).filter(Boolean)) : [],
          certifications: s.certifications ? (Array.isArray(s.certifications) ? s.certifications : String(s.certifications).split(',').map(c => c.trim()).filter(Boolean)) : [],
          projects: s.projects ? (Array.isArray(s.projects) ? s.projects : String(s.projects).split(',').map(p => p.trim()).filter(Boolean)) : [],
          languages: s.languages ? (Array.isArray(s.languages) ? s.languages : String(s.languages).split(',').map(l => l.trim()).filter(Boolean)) : [],
          linkedin: s.linkedin || '',
          github: s.github || '',
          portfolio: s.portfolio || '',
          bio: s.bio || ''
        }))
        setStudents(formattedStudents)
        calculateStats(formattedStudents)
      } else {
        setStudents([])
        calculateStats([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
      calculateStats([])
      toast.error('Failed to fetch students from server')
    } finally {
      setLoading(false)
    }
  }, [token, getNormalizedBranch])

  const calculateStats = useCallback((data) => {
    const total = data.length
    const placed = data.filter(s => s.placed === true || s.placed === 1).length
    const active = total - placed
    const placedPercentage = total > 0 ? Math.round((placed / total) * 100) : 0
    const avgCgpa = total > 0 ? (data.reduce((sum, s) => sum + (parseFloat(s.currentCgpa) || 0), 0) / total).toFixed(1) : 0
    const totalApplications = data.reduce((sum, s) => sum + (s.appliedJobs || 0), 0)
    setStats({ total, placed, active, placedPercentage, avgCgpa, totalApplications })
  }, [])

  useEffect(() => {
    if (token) {
      fetchStudents()
    } else {
      setLoading(false)
    }
  }, [token, fetchStudents])

  // ============ FETCH STUDENT DETAILS ============
  const fetchStudentDetails = async (studentId) => {
    console.log('📋 Fetching details for student:', studentId)
    setDetailsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/students/${studentId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Student details response:', response.data)
      
      if (response.data.success) {
        setSelectedStudent(response.data.student)
        setShowDetailsModal(true)
      } else {
        toast.error('Failed to fetch student details')
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
      toast.error('Failed to fetch student details')
    } finally {
      setDetailsLoading(false)
    }
  }

  // ============ DELETE STUDENT ============
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    
    try {
      const response = await axios.delete(`${API_URL}/admin/students/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Student deleted successfully!')
        fetchStudents()
      } else {
        toast.error(response.data.message || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
  }

  // ============ ADD STUDENT ============
  const handleAddStudent = async () => {
    const name = document.getElementById('addName')?.value
    const email = document.getElementById('addEmail')?.value
    const phone = document.getElementById('addPhone')?.value
    const branch = document.getElementById('addBranch')?.value
    const regYear = document.getElementById('addRegYear')?.value || '23'
    const regNo = document.getElementById('addRegNo')?.value
    const semester = parseInt(document.getElementById('addSemester')?.value) || 1
    const cgpa = parseFloat(document.getElementById('addCgpa')?.value) || 0
    
    if (!name || !email) {
      toast.error('Please fill name and email')
      return
    }
    
    const finalRegNo = regNo || `${regYear}0101120${String(students.length + 1).padStart(3, '0')}`
    
    const newStudent = {
      name: name,
      regNo: finalRegNo,
      email: email,
      phone: phone || '',
      branch: branch || 'CSE',
      semester: semester,
      currentCgpa: cgpa,
      address: '',
      dob: ''
    }
    
    setAddLoading(true)
    try {
      const response = await axios.post(`${API_URL}/admin/students`, newStudent, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success('Student added successfully!')
        setShowAddModal(false)
        fetchStudents()
        // Clear form
        document.getElementById('addName').value = ''
        document.getElementById('addEmail').value = ''
        document.getElementById('addPhone').value = ''
        document.getElementById('addBranch').value = 'CSE'
        document.getElementById('addRegYear').value = '23'
        document.getElementById('addRegNo').value = ''
        document.getElementById('addSemester').value = '1'
        document.getElementById('addCgpa').value = ''
      } else {
        toast.error(response.data.message || 'Failed to add student')
      }
    } catch (error) {
      console.error('Error adding student:', error)
      toast.error(error.response?.data?.message || 'Failed to add student')
    } finally {
      setAddLoading(false)
    }
  }

  // ============ OPEN EDIT MODAL ============
  const openEditModal = (student) => {
    console.log('📝 Opening edit modal for:', student)
    setSelectedStudent(student)
    setEditName(student.name || '')
    setEditEmail(student.email || '')
    setEditPhone(student.phone || '')
    setEditBranch(student.branch || 'CSE')
    setEditCgpa(String(student.currentCgpa || student.cgpa || 0))
    setEditDob(student.dob ? new Date(student.dob).toISOString().split('T')[0] : '')
    setEditAddress(student.address || '')
    setShowEditModal(true)
  }

  // ============ UPDATE STUDENT ============
const handleUpdateStudent = async () => {
  if (!selectedStudent) {
    toast.error('No student selected')
    return
  }
  
  const cgpaValue = parseFloat(editCgpa) || 0;
  
  let dobValue = editDob || '';
  if (dobValue) {
    dobValue = new Date(dobValue).toISOString().split('T')[0];
  }
  
  const updatedData = {
    name: editName || selectedStudent.name,
    email: editEmail || selectedStudent.email,
    phone: editPhone || selectedStudent.phone,
    branch: editBranch || selectedStudent.branch,
    currentCgpa: cgpaValue,  // ✅ currentCgpa use karo
    program: selectedStudent.program || 'B.Tech',
    semester: selectedStudent.semester || 1,
    address: editAddress || selectedStudent.address || '',
    dob: dobValue,
    skills: Array.isArray(selectedStudent.skills) ? selectedStudent.skills.join(',') : '',
    certifications: Array.isArray(selectedStudent.certifications) ? selectedStudent.certifications.join(',') : '',
    projects: Array.isArray(selectedStudent.projects) ? selectedStudent.projects.join(',') : '',
    languages: Array.isArray(selectedStudent.languages) ? selectedStudent.languages.join(',') : '',
    linkedin: selectedStudent.linkedin || '',
    github: selectedStudent.github || '',
    portfolio: selectedStudent.portfolio || '',
    bio: selectedStudent.bio || ''
  }

  console.log('📤 Updating student with data:', updatedData)
  
  setEditLoading(true)
  try {
    const response = await axios.put(`${API_URL}/admin/students/${selectedStudent.id}`, updatedData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.data.success) {
      toast.success('Student updated successfully!')
      fetchStudents()
      setShowEditModal(false)
      setSelectedStudent(null)
      resetEditFields()
    } else {
      toast.error(response.data.message || 'Failed to update student')
    }
  } catch (error) {
    console.error('Error updating student:', error)
    toast.error(error.response?.data?.message || 'Failed to update student')
  } finally {
    setEditLoading(false)
  }
}

  const resetEditFields = () => {
    setEditCgpa('')
    setEditName('')
    setEditEmail('')
    setEditPhone('')
    setEditBranch('')
    setEditDob('')
    setEditAddress('')
  }

  // ============ EXPORT TO EXCEL ============
  const handleExport = useCallback(() => {
    if (students.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const exportData = students.map(s => ({
        'Registration No': s.regNo,
        'Name': s.name,
        'Email': s.email,
        'Phone': s.phone,
        'Branch': s.branch,
        'Semester': s.semester,
        'CGPA': s.currentCgpa || 0,
        'Status': s.placed ? 'Placed' : 'Active',
        'Company': s.company || '-',
        'Package': s.package || '-',
        'Applied Jobs': s.appliedJobs || 0,
        'Shortlisted': s.shortlisted || 0,
        'Interviews': s.interviews || 0,
        'Address': s.address || '-',
        'Skills': Array.isArray(s.skills) ? s.skills.join(', ') : (s.skills || '-')
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Students')
      XLSX.writeFile(wb, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Students data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    }
  }, [students])

  // ============ BULK IMPORT ============
  const handleBulkImport = useCallback((event) => {
    const file = event.target.files[0]
    if (!file) return
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large! Maximum 10MB allowed.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    
    setFileUploading(true)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet)
        
        if (rows.length === 0) {
          toast.error('No data found in file')
          setFileUploading(false)
          return
        }
        
        const newStudents = rows.map((row, index) => ({
          id: Date.now() + index,
          regNo: row['Registration No'] || row['regNo'] || `23${String(students.length + index + 1).padStart(8, '0')}`,
          name: row['Name'] || row['name'] || 'New Student',
          email: row['Email'] || row['email'] || `student${Date.now() + index}@cutm.ac.in`,
          phone: row['Phone'] || row['phone'] || '',
          branch: getNormalizedBranch(row['Branch'] || row['branch'] || 'CSE'),
          semester: row['Semester'] || row['semester'] || 1,
          currentCgpa: parseFloat(row['CGPA'] || row['cgpa'] || 0),
          placed: (row['Status'] || row['status']) === 'Placed' || false,
          company: row['Company'] || row['company'] || null,
          package: row['Package'] || row['package'] || null,
          appliedJobs: parseInt(row['Applied Jobs'] || row['appliedJobs'] || 0),
          shortlisted: parseInt(row['Shortlisted'] || row['shortlisted'] || 0),
          interviews: parseInt(row['Interviews'] || row['interviews'] || 0),
          address: row['Address'] || row['address'] || '',
          skills: row['Skills'] ? (typeof row['Skills'] === 'string' ? row['Skills'].split(',').map(s => s.trim()).filter(Boolean) : []) : [],
          achievements: []
        }))
        
        setStudents([...newStudents, ...students])
        calculateStats([...newStudents, ...students])
        toast.success(`${newStudents.length} students imported successfully!`)
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import file')
      } finally {
        setFileUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }, [students, getNormalizedBranch, calculateStats])

  const getStatusBadge = useCallback((placed) => {
    if (placed) {
      return { bg: '#d1fae5', color: '#059669', icon: CheckCircle, label: 'Placed' }
    }
    return { bg: '#dbeafe', color: '#2563eb', icon: Clock, label: 'Active' }
  }, [])

  // ============ FILTERED STUDENTS ============
  const filteredStudents = useCallback(() => {
    return students.filter(student => {
      const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.regNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const normalizedStudentBranch = getNormalizedBranch(student.branch)
      const normalizedFilterBranch = branchFilter === 'all' ? 'all' : getNormalizedBranch(branchFilter)
      
      const matchesBranch = branchFilter === 'all' || normalizedStudentBranch === normalizedFilterBranch
      const matchesStatus = statusFilter === 'all' ? true : 
                            statusFilter === 'placed' ? (student.placed === true || student.placed === 1) : (student.placed !== true && student.placed !== 1)
      return matchesSearch && matchesBranch && matchesStatus
    })
  }, [students, searchTerm, branchFilter, statusFilter, getNormalizedBranch])

  const displayStudents = filteredStudents()

  // ============ STYLES ============
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
      overflowX: 'auto',
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
    studentName: {
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.2rem'
    },
    studentRegNo: {
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
          <p>Loading students...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* ============ HEADER ============ */}
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <Users size={18} color="white" />
          </div>
          <span>Student Management</span>
        </div>
        <div style={styles.actionBtns}>
          <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>
            <UserPlus size={14} /> Add Student
          </button>
          <input type="file" ref={fileInputRef} accept=".xlsx, .xls, .csv" onChange={handleBulkImport} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} style={styles.btnOutline} disabled={fileUploading}>
            <Upload size={14} /> {fileUploading ? 'Importing...' : 'Import'}
          </button>
          <button onClick={handleExport} style={styles.btnOutline}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Students</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.placed}</div>
          <div style={styles.statLabel}>Placed</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.placedPercentage}%</div>
          <div style={styles.statLabel}>Placement Rate</div>
        </div>
        <div style={styles.statCard('#ec4899')}>
          <div style={styles.statValue}>{stats.avgCgpa}</div>
          <div style={styles.statLabel}>Avg CGPA</div>
        </div>
        <div style={styles.statCard('#06b6d4')}>
          <div style={styles.statValue}>{stats.totalApplications}</div>
          <div style={styles.statLabel}>Applications</div>
        </div>
      </div>

      {/* ============ FILTERS ============ */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by name, reg no, email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput} 
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Branches</option>
            {branches.filter(b => b !== 'all').map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="placed">Placed</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {/* ============ STUDENTS TABLE ============ */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Reg No</th>
              <th style={styles.th}>Branch</th>
              <th style={styles.th}>CGPA</th>
              <th style={styles.th}>Applied</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <Users size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <p>No students found</p>
                </td>
              </tr>
            ) : (
              displayStudents.map(student => {
                const status = getStatusBadge(student.placed === true || student.placed === 1)
                const StatusIcon = status.icon
                const displayCgpa = student.currentCgpa || 0
                return (
                  <tr key={student.id}>
                    <td style={styles.td}>
                      <div style={styles.studentName}>{student.name}</div>
                      <div style={styles.studentRegNo}>{student.email}</div>
                    </td>
                    <td style={styles.td}>{student.regNo}</td>
                    <td style={styles.td}>{student.branch}</td>
                    <td style={styles.td}>{displayCgpa}</td>
                    <td style={styles.td}>{student.appliedJobs || 0}</td>
                    <td style={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '500', background: status.bg, color: status.color }}>
                        <StatusIcon size={10} /> {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionIcons}>
                        <div 
                          onClick={() => fetchStudentDetails(student.id)} 
                          style={styles.actionIcon} 
                          title="View Details"
                        >
                          <Eye size={16} color="#3b82f6" />
                        </div>
                        <div 
                          onClick={() => openEditModal(student)} 
                          style={styles.actionIcon} 
                          title="Edit"
                        >
                          <Edit2 size={16} color="#f59e0b" />
                        </div>
                        <div 
                          onClick={() => handleDelete(student.id)} 
                          style={styles.actionIcon} 
                          title="Delete"
                        >
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

      {/* ============ DETAILS MODAL ============ */}
      {showDetailsModal && selectedStudent && (
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
                  <div style={styles.modalTitle}>Student Details</div>
                  <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
                </div>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Full Name</div>
                    <div style={styles.detailValue}>{selectedStudent.name}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Registration No</div>
                    <div style={styles.detailValue}>{selectedStudent.regNo}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Email</div>
                    <div style={styles.detailValue}>{selectedStudent.email}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Phone</div>
                    <div style={styles.detailValue}>{selectedStudent.phone || 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Branch</div>
                    <div style={styles.detailValue}>{selectedStudent.branch}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Semester</div>
                    <div style={styles.detailValue}>{selectedStudent.semester}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>CGPA</div>
                    <div style={styles.detailValue}>{selectedStudent.currentCgpa || 0}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Date of Birth</div>
                    <div style={styles.detailValue}>{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>Address</div>
                    <div style={styles.detailValue}>{selectedStudent.address || 'N/A'}</div>
                  </div>
                  {selectedStudent.placed && (
                    <>
                      <div style={styles.detailItem}>
                        <div style={styles.detailLabel}>Placed Company</div>
                        <div style={styles.detailValue}>{selectedStudent.company}</div>
                      </div>
                      <div style={styles.detailItem}>
                        <div style={styles.detailLabel}>Package</div>
                        <div style={styles.detailValue}>{selectedStudent.package}</div>
                      </div>
                    </>
                  )}
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Skills</div>
                  <div style={styles.skillsList}>
                    {selectedStudent.skills && Array.isArray(selectedStudent.skills) && selectedStudent.skills.length > 0 ? (
                      selectedStudent.skills.map(skill => <span key={skill} style={styles.skillBadge}>{skill}</span>)
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No skills listed</span>
                    )}
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Achievements</div>
                  <div style={styles.skillsList}>
                    {selectedStudent.achievements && Array.isArray(selectedStudent.achievements) && selectedStudent.achievements.length > 0 ? (
                      selectedStudent.achievements.map(ach => <span key={ach} style={{...styles.skillBadge, background: '#fef3c7', color: '#d97706'}}>{ach}</span>)
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No achievements listed</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{selectedStudent.appliedJobs || 0}</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Applied Jobs</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{selectedStudent.shortlisted || 0}</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Shortlisted</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{selectedStudent.interviews || 0}</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Interviews</div>
                  </div>
                </div>

                <div style={styles.modalButtons}>
                  <button onClick={() => setShowDetailsModal(false)} style={styles.btnSecondary}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {showEditModal && selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Edit Student - {selectedStudent.name}</div>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={styles.formInput} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={styles.formInput} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone</label>
              <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={styles.formInput} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Branch</label>
                <select value={editBranch} onChange={(e) => setEditBranch(e.target.value)} style={styles.formSelect}>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EE">EE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>CGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="10"
                  value={editCgpa} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditCgpa(val);
                    // ✅ Update selected student's CGPA too
                    setSelectedStudent(prev => ({
                      ...prev,
                      currentCgpa: parseFloat(val) || 0
                    }));
                  }} 
                  style={styles.formInput} 
                  placeholder="Enter CGPA (0-10)"
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Date of Birth</label>
                <input 
                  type="date" 
                  value={editDob} 
                  onChange={(e) => setEditDob(e.target.value)} 
                  style={styles.formInput} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Address</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)} 
                  style={styles.formInput} 
                  placeholder="Enter address" 
                />
              </div>
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowEditModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleUpdateStudent} disabled={editLoading} style={styles.btnPrimary}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD STUDENT MODAL ============ */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Add New Student</div>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name *</label>
              <input id="addName" type="text" placeholder="Enter full name" style={styles.formInput} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email *</label>
              <input id="addEmail" type="email" placeholder="student@cutm.ac.in" style={styles.formInput} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone</label>
              <input id="addPhone" type="text" placeholder="+91 XXXXXXXXXX" style={styles.formInput} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Branch</label>
                <select id="addBranch" style={styles.formSelect}>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EE">EE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Semester</label>
                <select id="addSemester" style={styles.formSelect}>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>CGPA</label>
                <input id="addCgpa" type="number" step="0.01" min="0" max="10" placeholder="0.00" style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Registration Year</label>
                <select id="addRegYear" style={styles.formSelect}>
                  <option value="23">2023-2027</option>
                  <option value="24">2024-2028</option>
                  <option value="25">2025-2029</option>
                </select>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Registration No (Optional)</label>
              <input id="addRegNo" type="text" placeholder="e.g., 230101120001" style={styles.formInput} />
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAddModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleAddStudent} disabled={addLoading} style={styles.btnPrimary}>
                {addLoading ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement