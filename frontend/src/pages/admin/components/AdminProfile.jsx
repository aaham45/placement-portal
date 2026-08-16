import React, { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Edit2, Save, X, Lock, Award, Users, Building2, 
  TrendingUp, DollarSign, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    employeeId: '',
    joiningDate: '',
    location: '',
    bio: '',
    achievements: [],
    profilePic: null,
    stats: {
      studentsPlaced: 0,
      companiesOnboarded: 0,
      placementDrives: 0,
      avgPackage: 0
    }
  })

  const [tempProfile, setTempProfile] = useState({ ...profile })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  // Fetch Profile
  const fetchProfile = async () => {
    setFetching(true)
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        setFetching(false)
        return
      }

      const response = await axios.get(`${API_URL}/admin/profile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        const data = response.data.profile || {}
        setProfile({
          name: data.name || 'Admin',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || 'Administrator',
          department: data.department || 'Placement Cell',
          employeeId: data.employee_id || data.employeeId || '',
          joiningDate: data.joining_date || data.joiningDate || '',
          location: data.location || '',
          bio: data.bio || '',
          achievements: data.achievements || [],
          profilePic: data.profile_pic || data.profilePic || null,
          stats: profile.stats
        })
        setTempProfile({
          name: data.name || 'Admin',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || 'Administrator',
          department: data.department || 'Placement Cell',
          employeeId: data.employee_id || data.employeeId || '',
          joiningDate: data.joining_date || data.joiningDate || '',
          location: data.location || '',
          bio: data.bio || '',
          achievements: data.achievements || [],
          profilePic: data.profile_pic || data.profilePic || null,
          stats: profile.stats
        })
      } else {
        toast.error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Default values
      setProfile(prev => ({
        ...prev,
        name: 'Admin',
        email: localStorage.getItem('userEmail') || 'admin@cutm.ac.in',
        designation: 'Administrator',
        department: 'Placement Cell',
        bio: 'Placement Portal Administrator'
      }))
    } finally {
      setFetching(false)
    }
  }

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        const stats = response.data.stats || {}
        setProfile(prev => ({
          ...prev,
          stats: {
            studentsPlaced: stats.totalStudents || stats.studentsPlaced || 0,
            companiesOnboarded: stats.totalCompanies || stats.companiesOnboarded || 0,
            placementDrives: stats.ongoingDrives || stats.placementDrives || 0,
            avgPackage: stats.avgPackage || 0
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleEdit = () => {
    setTempProfile({ ...profile })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempProfile({ ...profile })
  }

  const handleSave = async () => {
    if (!tempProfile.name || !tempProfile.email) {
      toast.error('Name and Email are required fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await axios.put(`${API_URL}/admin/profile`, tempProfile, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        setProfile(tempProfile)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTempProfile(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await axios.post(`${API_URL}/admin/change-password`, 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      )
      
      if (response.data.success) {
        toast.success('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(response.data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error('Please select an image')
      return
    }

    const formData = new FormData()
    formData.append('avatar', avatarFile)

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.post(`${API_URL}/admin/upload-avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        setProfile(prev => ({ ...prev, profilePic: response.data.url }))
        setTempProfile(prev => ({ ...prev, profilePic: response.data.url }))
        toast.success('Avatar updated successfully!')
        setShowAvatarModal(false)
        setAvatarFile(null)
      } else {
        toast.error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'A'
    const names = name.split(' ')
    if (names.length === 1) return names[0][0].toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
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
      background: 'linear-gradient(135deg, #059669, #10b981)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    editBtn: {
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
    cancelBtn: {
      padding: '0.5rem 1rem',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    saveBtn: {
      padding: '0.5rem 1rem',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: loading ? 0.6 : 1,
      pointerEvents: loading ? 'none' : 'auto'
    },
    profileHeader: {
      display: 'flex',
      gap: '1.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    avatarContainer: {
      position: 'relative',
      width: '120px',
      height: '120px'
    },
    avatar: {
      width: '120px',
      height: '120px',
      background: 'linear-gradient(135deg, #059669, #10b981)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'white',
      objectFit: 'cover'
    },
    avatarImage: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    avatarUploadBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      background: '#059669',
      borderRadius: '50%',
      padding: '8px',
      cursor: 'pointer',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    name: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    roleBadge: {
      background: '#d1fae5',
      color: '#059669',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '500'
    },
    statsRow: {
      display: 'flex',
      gap: '2rem',
      marginTop: '1rem',
      flexWrap: 'wrap'
    },
    statValue: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#059669'
    },
    statLabel: {
      fontSize: '0.65rem',
      color: '#64748b'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem'
    },
    infoCard: {
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      border: '1px solid #e2e8f0',
      marginBottom: '1rem'
    },
    infoLabel: {
      fontSize: '0.65rem',
      color: '#64748b',
      marginBottom: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    infoValue: {
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    editInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      marginTop: '0.25rem',
      background: 'white'
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.85rem',
      marginTop: '0.25rem',
      resize: 'vertical',
      minHeight: '80px',
      background: 'white'
    },
    achievementsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    achievementBadge: {
      background: '#d1fae5',
      color: '#065f46',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
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
      maxWidth: '450px',
      width: '90%'
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
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      color: '#64748b'
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
      outline: 'none',
      background: 'white'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    btnPrimary: {
      flex: 1,
      padding: '0.6rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer'
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
    loadingState: {
      textAlign: 'center',
      padding: '3rem'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#059669',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    }
  }

  if (fetching) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading profile...</p>
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
            <User size={18} color="white" />
          </div>
          <span>Admin Profile</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPasswordModal(true)} style={{ ...styles.editBtn, background: '#64748b' }}>
            <Lock size={14} /> Change Password
          </button>
          {!isEditing ? (
            <button onClick={handleEdit} style={styles.editBtn}>
              <Edit2 size={14} /> Edit Profile
            </button>
          ) : (
            <>
              <button onClick={handleCancel} style={styles.cancelBtn}>
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} style={styles.saveBtn} disabled={loading}>
                <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarContainer}>
          {profile.profilePic ? (
            <img src={profile.profilePic} alt="Profile" style={styles.avatarImage} />
          ) : (
            <div style={styles.avatar}>
              {profile.name ? getInitials(profile.name) : 'A'}
            </div>
          )}
          <div style={styles.avatarUploadBtn} onClick={() => setShowAvatarModal(true)}>
            <Camera size={16} color="white" />
          </div>
        </div>
        <div>
          {isEditing ? (
            <input
              name="name"
              value={tempProfile.name}
              onChange={handleChange}
              style={{ ...styles.editInput, fontSize: '1.2rem', fontWeight: '600', width: '300px' }}
            />
          ) : (
            <div style={styles.name}>{profile.name || 'Admin'}</div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {isEditing ? (
              <input 
                name="designation" 
                value={tempProfile.designation} 
                onChange={handleChange} 
                style={{ ...styles.editInput, width: '200px' }} 
              />
            ) : (
              <span style={styles.roleBadge}>{profile.designation || 'Administrator'}</span>
            )}
            {isEditing ? (
              <input 
                name="department" 
                value={tempProfile.department} 
                onChange={handleChange} 
                style={{ ...styles.editInput, width: '180px' }} 
              />
            ) : (
              <span style={{ ...styles.roleBadge, background: '#dbeafe', color: '#2563eb' }}>
                {profile.department || 'Admin'}
              </span>
            )}
          </div>
          <div style={styles.statsRow}>
            <div>
              <div style={styles.statValue}>{profile.stats?.studentsPlaced?.toLocaleString() || 0}</div>
              <div style={styles.statLabel}>Students Placed</div>
            </div>
            <div>
              <div style={styles.statValue}>{profile.stats?.companiesOnboarded || 0}</div>
              <div style={styles.statLabel}>Companies</div>
            </div>
            <div>
              <div style={styles.statValue}>{profile.stats?.placementDrives || 0}</div>
              <div style={styles.statLabel}>Drives Conducted</div>
            </div>
            <div>
              <div style={styles.statValue}>{profile.stats?.avgPackage || 0} LPA</div>
              <div style={styles.statLabel}>Avg Package</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumnGrid}>
        {/* Left Column */}
        <div>
          <div style={styles.sectionTitle}>
            <User size={16} color="#059669" />
            Personal Information
          </div>
          
          <div style={styles.infoCard}>
            <div style={styles.infoLabel}><Mail size={12} /> Email</div>
            {isEditing ? (
              <input name="email" value={tempProfile.email} onChange={handleChange} style={styles.editInput} />
            ) : (
              <div style={styles.infoValue}>{profile.email}</div>
            )}
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}><Phone size={12} /> Phone</div>
            {isEditing ? (
              <input name="phone" value={tempProfile.phone} onChange={handleChange} style={styles.editInput} />
            ) : (
              <div style={styles.infoValue}>{profile.phone || 'Not set'}</div>
            )}
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}><Briefcase size={12} /> Employee ID</div>
            {isEditing ? (
              <input name="employeeId" value={tempProfile.employeeId} onChange={handleChange} style={styles.editInput} />
            ) : (
              <div style={styles.infoValue}>{profile.employeeId || 'Not set'}</div>
            )}
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}><Calendar size={12} /> Joining Date</div>
            {isEditing ? (
              <input name="joiningDate" value={tempProfile.joiningDate} onChange={handleChange} style={styles.editInput} type="date" />
            ) : (
              <div style={styles.infoValue}>
                {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not set'}
              </div>
            )}
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}><MapPin size={12} /> Location</div>
            {isEditing ? (
              <input name="location" value={tempProfile.location} onChange={handleChange} style={styles.editInput} />
            ) : (
              <div style={styles.infoValue}>{profile.location || 'Not set'}</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div style={styles.sectionTitle}>
            <Award size={16} color="#10b981" />
            Bio & Achievements
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}>Bio</div>
            {isEditing ? (
              <textarea name="bio" value={tempProfile.bio} onChange={handleChange} style={styles.textarea} rows="3" />
            ) : (
              <div style={styles.infoValue}>{profile.bio || 'No bio added yet.'}</div>
            )}
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}>Achievements</div>
            <div style={styles.achievementsList}>
              {profile.achievements && profile.achievements.length > 0 ? (
                profile.achievements.map((achievement, idx) => (
                  <span key={idx} style={styles.achievementBadge}>
                    <Award size={10} /> {achievement}
                  </span>
                ))
              ) : (
                <div style={styles.infoValue}>No achievements added yet</div>
              )}
            </div>
            {isEditing && (
              <div style={{ marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Add new achievement (comma separated)" 
                  style={styles.editInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.target.value.trim()
                      if (value) {
                        const newAchievements = value.split(',').map(a => a.trim()).filter(Boolean)
                        setTempProfile(prev => ({
                          ...prev,
                          achievements: [...prev.achievements, ...newAchievements]
                        }))
                        e.target.value = ''
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Change Password</div>
              <button onClick={() => setShowPasswordModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={styles.formInput}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={styles.formInput}
                  required
                  minLength="6"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={styles.formInput}
                  required
                />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={styles.btnSecondary}>Cancel</button>
                <button type="submit" style={styles.btnPrimary} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAvatarModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Update Profile Picture</div>
              <button onClick={() => setShowAvatarModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Choose Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                style={styles.formInput}
              />
            </div>
            {avatarFile && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img 
                  src={URL.createObjectURL(avatarFile)} 
                  alt="Preview" 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              </div>
            )}
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAvatarModal(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={handleAvatarUpload} style={styles.btnPrimary} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProfile