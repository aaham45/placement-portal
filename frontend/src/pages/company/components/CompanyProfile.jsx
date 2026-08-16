import { useState, useEffect, useRef } from 'react'
import { 
  Building2, Mail, Phone, MapPin, Globe, Users, 
  Briefcase, Award, Calendar, Edit2, Save, X,
  User, AtSign, FileText, Upload, Image as ImageIcon,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function CompanyProfile() {
  const [profile, setProfile] = useState({
    companyName: '',
    hrName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    location: '',
    employeeCount: '',
    description: '',
    logo: '',
    status: '',
    activeJobs: 0,
    applications: 0,
    shortlisted: 0
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  const fileInputRef = useRef(null)
  const token = localStorage.getItem('companyToken')

  // ✅ Fetch company profile
  const fetchProfile = async () => {
    setLoading(true)
    try {
      console.log('📋 Fetching company profile...')
      
      const response = await axios.get(`${API_URL}/company/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📊 Profile Response:', response.data)
      
      if (response.data.success) {
        const data = response.data
        const profileData = {
          companyName: data.companyName || data.name || 'N/A',
          hrName: data.hrName || data.hr_name || 'N/A',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          website: data.website || 'N/A',
          industry: data.industry || 'N/A',
          location: data.location || data.company_location || 'N/A',
          employeeCount: data.employeeCount || data.employee_count || 'N/A',
          description: data.description || 'No description provided.',
          logo: data.logo || null,
          status: data.status || 'pending',
          activeJobs: data.activeJobs || 0,
          applications: data.applications || 0,
          shortlisted: data.shortlisted || 0
        }
        console.log('✅ Profile Data:', profileData)
        setProfile(profileData)
        setEditForm(profileData)
        
        if (data.logo) {
          if (data.logo.startsWith('http://') || data.logo.startsWith('https://')) {
            setLogoPreview(data.logo)
          } else {
            setLogoPreview(`${API_URL}/${data.logo}`)
          }
        } else {
          setLogoPreview(null)
        }
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  // ✅ Handle logo file selection
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP, SVG)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo size must be less than 5MB')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target.result)
    }
    reader.readAsDataURL(file)
    toast.success('Logo selected. Click Save to upload.')
    
    // ✅ Reset input so same file can be selected again
    e.target.value = ''
  }

  // ✅ Upload logo to server
  const uploadLogo = async () => {
    if (!logoFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)

      console.log('📤 Uploading logo...')
      console.log('📁 File:', logoFile.name, logoFile.size, logoFile.type)
      
      const response = await axios.post(
        `${API_URL}/company/profile/logo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      console.log('📥 Upload Response:', response.data)

      if (response.data.success) {
        toast.success('Logo uploaded successfully!')
        return response.data.logoUrl || response.data.fullUrl
      } else {
        toast.error(response.data.message || 'Failed to upload logo')
        return null
      }
    } catch (error) {
      console.error('❌ Error uploading logo:', error)
      console.error('❌ Error response:', error.response?.data)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to upload logo. Please try again.')
      }
      return null
    } finally {
      setUploading(false)
    }
  }

  // ✅ Update profile with logo
  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      let logoUrl = editForm.logo || profile.logo || null

      // ✅ Upload logo if selected
      if (logoFile) {
        const uploadedLogo = await uploadLogo()
        if (uploadedLogo) {
          logoUrl = uploadedLogo
          // ✅ Update preview immediately
          if (uploadedLogo.startsWith('http://') || uploadedLogo.startsWith('https://')) {
            setLogoPreview(uploadedLogo)
          } else {
            setLogoPreview(`${API_URL}/${uploadedLogo}`)
          }
        }
      }

      const updateData = {
        companyName: editForm.companyName || profile.companyName,
        hrName: editForm.hrName || profile.hrName,
        email: editForm.email || profile.email,
        phone: editForm.phone || profile.phone,
        website: editForm.website || profile.website,
        industry: editForm.industry || profile.industry,
        location: editForm.location || profile.location,
        employeeCount: editForm.employeeCount || profile.employeeCount,
        description: editForm.description || profile.description,
        logo: logoUrl
      }

      console.log('📝 Updating profile with data:', updateData)
      
      const response = await axios.put(
        `${API_URL}/company/profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('📥 Update Response:', response.data)
      
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        
        // ✅ Update all states
        setProfile(updateData)
        setEditForm(updateData)
        setLogoFile(null)
        
        // ✅ Set logo preview
        if (logoUrl) {
          if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            setLogoPreview(logoUrl)
          } else {
            setLogoPreview(`${API_URL}/${logoUrl}`)
          }
        }
        
        setEditing(false)
        
        // ✅ Fetch fresh profile after delay
        setTimeout(() => {
          fetchProfile()
        }, 1000)
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      console.error('❌ Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { bg: '#d1fae5', color: '#059669', label: 'Verified' },
      'pending': { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
      'rejected': { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' }
    }
    return statusMap[status?.toLowerCase()] || statusMap['pending']
  }

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
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    logoContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      color: '#94a3b8',
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
      border: '2px solid #e2e8f0'
    },
    logoImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    logoUploadBtn: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'rgba(0,0,0,0.6)',
      color: 'white',
      padding: '0.2rem',
      fontSize: '0.55rem',
      textAlign: 'center',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.2rem',
      backdropFilter: 'blur(4px)'
    },
    companyInfo: {
      flex: 1
    },
    companyName: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    companyMeta: {
      display: 'flex',
      gap: '1.5rem',
      marginTop: '0.5rem',
      flexWrap: 'wrap',
      fontSize: '0.8rem',
      color: '#64748b'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '2rem'
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
    section: {
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    },
    infoItem: {
      padding: '0.75rem',
      background: '#f8fafc',
      borderRadius: '12px'
    },
    infoLabel: {
      fontSize: '0.6rem',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#1e293b',
      marginTop: '0.2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    descriptionBox: {
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '12px',
      fontSize: '0.85rem',
      color: '#475569',
      lineHeight: '1.6'
    },
    btnPrimary: {
      padding: '0.5rem 1rem',
      background: '#7c3aed',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    btnPrimaryDisabled: {
      padding: '0.5rem 1rem',
      background: '#94a3b8',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'not-allowed',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: 0.6
    },
    btnOutline: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnSuccess: {
      padding: '0.5rem 1rem',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      outline: 'none',
      transition: 'all 0.2s ease',
      background: 'white'
    },
    formTextarea: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit'
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
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#7c3aed',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    },
    hiddenInput: {
      display: 'none'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ color: '#64748b' }}>Loading profile...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  const status = getStatusBadge(profile.status)
  const isSaving = saving || uploading

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <Building2 size={18} color="white" />
          </div>
          <span>Company Profile</span>
          <span style={styles.statusBadge(status.bg, status.color)}>
            {status.label}
          </span>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={styles.btnPrimary}>
            <Edit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => { 
                setEditing(false); 
                setEditForm(profile); 
                setLogoFile(null); 
                setLogoPreview(profile.logo ? (profile.logo.startsWith('http://') || profile.logo.startsWith('https://') ? profile.logo : `${API_URL}/${profile.logo}`) : null) 
              }} 
              style={styles.btnOutline}
            >
              <X size={14} /> Cancel
            </button>
            <button onClick={handleUpdateProfile} disabled={isSaving} style={isSaving ? styles.btnPrimaryDisabled : styles.btnSuccess}>
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Header with Logo */}
      <div style={styles.profileHeader}>
        <div style={styles.logoContainer}>
          {logoPreview ? (
            <img src={logoPreview} alt="Company Logo" style={styles.logoImage} />
          ) : profile.logo ? (
            <img src={profile.logo.startsWith('http://') || profile.logo.startsWith('https://') ? profile.logo : `${API_URL}/${profile.logo}`} alt="Company Logo" style={styles.logoImage} />
          ) : (
            <Building2 size={36} color="#94a3b8" />
          )}
          {editing && (
            <div 
              style={styles.logoUploadBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={12} /> Upload
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={styles.hiddenInput}
          />
        </div>
        <div style={styles.companyInfo}>
          <div style={styles.companyName}>
            {editing ? (
              <input
                type="text"
                name="companyName"
                value={editForm.companyName || ''}
                onChange={handleEditChange}
                style={{ ...styles.formInput, fontSize: '1.2rem', fontWeight: '600' }}
              />
            ) : (
              profile.companyName
            )}
          </div>
          <div style={styles.companyMeta}>
            <span>🏢 {editing ? (
              <input
                type="text"
                name="industry"
                value={editForm.industry || ''}
                onChange={handleEditChange}
                style={{ ...styles.formInput, display: 'inline-block', width: '150px' }}
              />
            ) : profile.industry || 'N/A'}</span>
            <span>📍 {editing ? (
              <input
                type="text"
                name="location"
                value={editForm.location || ''}
                onChange={handleEditChange}
                style={{ ...styles.formInput, display: 'inline-block', width: '200px' }}
              />
            ) : profile.location}</span>
            <span>🌐 {editing ? (
              <input
                type="text"
                name="website"
                value={editForm.website || ''}
                onChange={handleEditChange}
                style={{ ...styles.formInput, display: 'inline-block', width: '200px' }}
              />
            ) : profile.website}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{profile.employeeCount || 0}</div>
          <div style={styles.statLabel}>Employees</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{profile.activeJobs || 0}</div>
          <div style={styles.statLabel}>Active Jobs</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{profile.applications || 0}</div>
          <div style={styles.statLabel}>Applications</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{profile.shortlisted || 0}</div>
          <div style={styles.statLabel}>Shortlisted</div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <Mail size={16} color="#3b82f6" />
          Contact Information
        </div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Email</div>
            <div style={styles.infoValue}>
              <Mail size={14} color="#94a3b8" />
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  style={styles.formInput}
                />
              ) : profile.email}
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Phone</div>
            <div style={styles.infoValue}>
              <Phone size={14} color="#94a3b8" />
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                  style={styles.formInput}
                />
              ) : profile.phone}
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Location</div>
            <div style={styles.infoValue}>
              <MapPin size={14} color="#94a3b8" />
              {editing ? (
                <input
                  type="text"
                  name="location"
                  value={editForm.location || ''}
                  onChange={handleEditChange}
                  style={styles.formInput}
                />
              ) : profile.location}
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Website</div>
            <div style={styles.infoValue}>
              <Globe size={14} color="#94a3b8" />
              {editing ? (
                <input
                  type="text"
                  name="website"
                  value={editForm.website || ''}
                  onChange={handleEditChange}
                  style={styles.formInput}
                />
              ) : profile.website}
            </div>
          </div>
        </div>
      </div>

      {/* HR Information */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <User size={16} color="#8b5cf6" />
          HR Information
        </div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>HR Name</div>
            <div style={styles.infoValue}>
              <User size={14} color="#94a3b8" />
              {editing ? (
                <input
                  type="text"
                  name="hrName"
                  value={editForm.hrName || ''}
                  onChange={handleEditChange}
                  style={styles.formInput}
                />
              ) : profile.hrName}
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>HR Email</div>
            <div style={styles.infoValue}>
              <AtSign size={14} color="#94a3b8" />
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  style={styles.formInput}
                />
              ) : profile.email}
            </div>
          </div>
        </div>
      </div>

      {/* About Company */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <FileText size={16} color="#f59e0b" />
          About Company
        </div>
        {editing ? (
          <textarea
            name="description"
            value={editForm.description || ''}
            onChange={handleEditChange}
            style={styles.formTextarea}
            placeholder="Write about your company..."
          />
        ) : (
          <div style={styles.descriptionBox}>
            {profile.description}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyProfile