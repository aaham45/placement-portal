import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, GraduationCap, Code, Edit2, Save, X, Camera, 
  MapPin, Calendar, BookOpen, Award, Briefcase, Heart, Trash2, Plus, 
  Globe, ExternalLink, Loader, Upload, FileText, CheckCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Profile({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    regNo: '',
    email: '',
    phone: '',
    program: '',
    branch: '',
    session: '',
    semester: '',
    cgpa: 0,
    address: '',
    backlogs: 0,
    yearGap: 0,
    experienceYears: 0,
    resumeUrl: '',
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    bio: '',
    linkedin: '',
    github: '',
    portfolio: '',
    profilePic: null
  })
  
  const [profilePicPreview, setProfilePicPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regNoError, setRegNoError] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)

  const token = localStorage.getItem('studentToken')

  // ✅ Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = 'http://localhost:5000';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  // ✅ Get full resume URL
  const getFullResumeUrl = (resumePath) => {
    if (!resumePath) return null;
    if (resumePath.startsWith('http://') || resumePath.startsWith('https://')) {
      return resumePath;
    }
    const baseUrl = 'http://localhost:5000';
    const cleanPath = resumePath.startsWith('/') ? resumePath : `/${resumePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  const isValidRegNo = (regNo) => {
    return /^\d{12}$/.test(regNo)
  }

  const handleRegNoChange = (value) => {
    setEditData({...editData, regNo: value})
    if (value && !/^\d{0,12}$/.test(value)) {
      setRegNoError('Only numbers allowed (max 12 digits)')
    } else if (value && value.length !== 12) {
      setRegNoError('Registration number must be exactly 12 digits')
    } else {
      setRegNoError('')
    }
  }

  // ✅ Fetch student profile
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const studentData = response.data.profile || response.data.student
        
        const formattedProfile = {
          name: studentData.name || '',
          regNo: studentData.reg_no || studentData.regNo || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          program: studentData.program || '',
          branch: studentData.branch || '',
          session: studentData.session || '',
          semester: studentData.semester || '',
          cgpa: studentData.current_cgpa || studentData.cgpa || 0,
          address: studentData.address || '',
          backlogs: studentData.backlogs || 0,
          yearGap: studentData.year_gap || studentData.yearGap || 0,
          experienceYears: studentData.experience_years || studentData.experienceYears || 0,
          resumeUrl: studentData.resume_url || studentData.resumeUrl || '',
          skills: studentData.skills ? (typeof studentData.skills === 'string' ? studentData.skills.split(',').map(s => s.trim()).filter(s => s) : studentData.skills) : [],
          certifications: studentData.certifications ? (typeof studentData.certifications === 'string' ? studentData.certifications.split(',').map(c => c.trim()).filter(c => c) : studentData.certifications) : [],
          projects: studentData.projects ? (typeof studentData.projects === 'string' ? studentData.projects.split(',').map(p => p.trim()).filter(p => p) : studentData.projects) : [],
          languages: studentData.languages ? (typeof studentData.languages === 'string' ? studentData.languages.split(',').map(l => l.trim()).filter(l => l) : studentData.languages) : [],
          bio: studentData.bio || '',
          linkedin: studentData.linkedin || '',
          github: studentData.github || '',
          portfolio: studentData.portfolio || '',
          profilePic: studentData.profile_pic || studentData.profilePic || null
        }
        
        if (setProfile) {
          setProfile(formattedProfile)
        }
        setEditData(formattedProfile)
        console.log('📸 Profile Picture URL:', formattedProfile.profilePic);
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProfile()
    }
  }, [token])

  // ✅ Save profile
  const handleSave = async () => {
    if (editData.regNo && !isValidRegNo(editData.regNo)) {
      toast.error('Registration number must be exactly 12 digits')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        name: editData.name,
        regNo: editData.regNo,
        phone: editData.phone,
        address: editData.address,
        program: editData.program,
        branch: editData.branch,
        session: editData.session,
        semester: editData.semester,
        currentCgpa: parseFloat(editData.cgpa) || 0,
        backlogs: parseInt(editData.backlogs) || 0,
        yearGap: parseInt(editData.yearGap) || 0,
        experienceYears: parseFloat(editData.experienceYears) || 0,
        skills: editData.skills?.join(',') || '',
        certifications: editData.certifications?.join(',') || '',
        projects: editData.projects?.join(',') || '',
        languages: editData.languages?.join(',') || '',
        bio: editData.bio,
        linkedin: editData.linkedin,
        github: editData.github,
        portfolio: editData.portfolio
      }

      const response = await axios.put(`${API_URL}/student/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        if (setProfile) {
          setProfile(editData)
        }
        setIsEditing(false)
        toast.success('✅ Profile updated successfully!')
        fetchProfile()
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Upload profile picture
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB')
      return
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, JPG, GIF, WEBP images are allowed')
      return
    }
    
    const formData = new FormData()
    formData.append('profile_pic', file)
    
    setUploadingPic(true)
    try {
      console.log('📸 Uploading profile picture...')
      
      const response = await axios.post(`${API_URL}/student/profile/picture`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('📸 Upload Response:', response.data)
      
      if (response.data.success) {
        const imageUrl = response.data.profile_pic || response.data.profilePic
        console.log('📸 Image URL:', imageUrl)
        
        setProfilePicPreview(imageUrl)
        setEditData({ ...editData, profilePic: imageUrl })
        if (setProfile) {
          setProfile({ ...editData, profilePic: imageUrl })
        }
        toast.success('✅ Profile picture updated!')
        fetchProfile()
      } else {
        toast.error(response.data.message || 'Failed to upload')
      }
    } catch (error) {
      console.error('❌ Error uploading profile pic:', error)
      toast.error(error.response?.data?.message || 'Failed to upload profile picture')
    } finally {
      setUploadingPic(false)
    }
  }

  // ✅ Upload Resume
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB')
      return
    }
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, DOC, DOCX files are allowed')
      return
    }
    
    const formData = new FormData()
    formData.append('resume', file)
    
    setUploadingResume(true)
    try {
      const response = await axios.post(`${API_URL}/student/profile/resume`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        const resumeUrl = response.data.resume_url || response.data.resumeUrl
        setEditData({ ...editData, resumeUrl: resumeUrl })
        if (setProfile) {
          setProfile({ ...editData, resumeUrl: resumeUrl })
        }
        toast.success('✅ Resume uploaded successfully!')
        fetchProfile()
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleCancel = () => {
    setEditData(profile || {})
    setIsEditing(false)
    setProfilePicPreview(null)
    setRegNoError('')
  }

  const handleAddItem = (type, label) => {
    const newItem = prompt(`Enter new ${label}:`)
    if (newItem && newItem.trim()) {
      setEditData({ ...editData, [type]: [...(editData[type] || []), newItem.trim()] })
    }
  }

  const handleRemoveItem = (type, itemToRemove) => {
    setEditData({ ...editData, [type]: (editData[type] || []).filter(item => item !== itemToRemove) })
  }

  const openLink = (url) => {
    if (url && url !== 'Not set' && url !== '') {
      let fullUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url
      }
      window.open(fullUrl, '_blank')
    } else {
      toast.error('Link not available')
    }
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
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
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
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    editBtn: {
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cancelBtn: {
      padding: '0.5rem 1rem',
      background: '#e2e8f0',
      color: '#1e293b',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
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
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: saving ? 0.6 : 1
    },
    profileSection: {
      display: 'flex',
      gap: '1.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    profilePicContainer: {
      position: 'relative',
      cursor: 'pointer'
    },
    profilePic: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '2.5rem',
      overflow: 'hidden',
      flexShrink: 0
    },
    cameraIcon: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      background: '#2563eb',
      borderRadius: '50%',
      padding: '0.35rem',
      color: 'white',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    infoCard: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem'
    },
    infoItem: {
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '0.75rem 1rem'
    },
    infoLabel: {
      fontSize: '0.7rem',
      color: '#64748b',
      marginBottom: '0.25rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    formGroup: {
      marginBottom: '0.75rem'
    },
    label: {
      display: 'block',
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#64748b',
      marginBottom: '0.25rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.8rem',
      outline: 'none',
      transition: 'border 0.2s'
    },
    inputError: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #ef4444',
      borderRadius: '8px',
      fontSize: '0.8rem',
      outline: 'none',
      backgroundColor: '#fef2f2'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.7rem',
      marginTop: '0.25rem'
    },
    textarea: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.8rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    skillTag: {
      background: '#eff6ff',
      color: '#2563eb',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'currentColor',
      fontSize: '0.8rem',
      marginLeft: '0.25rem',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0'
    },
    addBtn: {
      background: 'none',
      border: '1px dashed #cbd5e1',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      color: '#64748b',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    sectionCard: {
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      marginTop: '1rem'
    },
    sectionTitle: {
      fontWeight: '600',
      marginBottom: '0.75rem',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    bioText: {
      fontSize: '0.85rem',
      color: '#475569',
      lineHeight: '1.5'
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0'
    },
    socialLink: {
      background: '#f8fafc',
      padding: '0.6rem 1rem',
      borderRadius: '12px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #e2e8f0'
    },
    resumeBox: {
      background: '#f0fdf4',
      border: '1px solid #86efac',
      borderRadius: '12px',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '0.5rem'
    },
    resumeUploadBox: {
      border: '2px dashed #cbd5e1',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    helperText: {
      fontSize: '0.6rem',
      color: '#94a3b8',
      marginTop: '0.2rem',
      display: 'block'
    }
  }

  if (loading && !profile?.name) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading profile...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ✅ VIEW MODE
  if (!isEditing) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>
            <div style={styles.titleIcon}><User size={18} color="white" /></div>
            <span>My Profile</span>
          </div>
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            <Edit2 size={14} /> Edit Profile
          </button>
        </div>

        <div style={styles.profileSection}>
          <div style={styles.profilePicContainer}>
            <div style={styles.profilePic}>
              {profile?.profilePic ? (
                <img 
                  src={getFullImageUrl(profile.profilePic)} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    console.error('❌ Image load error:', e.target.src);
                    const parent = e.target.parentElement;
                    if (parent) {
                      e.target.style.display = 'none';
                      parent.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                      parent.style.borderRadius = '50%';
                      parent.style.width = '100px';
                      parent.style.height = '100px';
                      parent.innerHTML = `<span style="font-size:2.5rem;font-weight:600;color:white">${profile?.name?.charAt(0) || 'U'}</span>`;
                    }
                  }}
                />
              ) : (
                <span>{profile?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Full Name</div>
              <div style={styles.infoValue}>{profile?.name || 'Not set'}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Registration No</div>
              <div style={styles.infoValue}>{profile?.regNo || 'Not set'}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Email ID</div>
              <div style={styles.infoValue}>{profile?.email || 'Not set'}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Phone</div>
              <div style={styles.infoValue}>{profile?.phone || 'Not set'}</div>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}><GraduationCap size={16} color="#2563eb" /> Academic Details</div>
          <div style={styles.formGrid}>
            <div><div style={styles.infoLabel}>Program</div><div style={styles.infoValue}>{profile?.program || 'Not set'}</div></div>
            <div><div style={styles.infoLabel}>Branch</div><div style={styles.infoValue}>{profile?.branch || 'Not set'}</div></div>
            <div><div style={styles.infoLabel}>Session</div><div style={styles.infoValue}>{profile?.session || 'Not set'}</div></div>
            <div><div style={styles.infoLabel}>Semester</div><div style={styles.infoValue}>{profile?.semester || 'Not set'}</div></div>
            <div><div style={styles.infoLabel}>CGPA</div><div style={styles.infoValue}><strong>{profile?.cgpa || 0}</strong> / 10</div></div>
            <div><div style={styles.infoLabel}>Address</div><div style={styles.infoValue}>{profile?.address || 'Not set'}</div></div>
          </div>
        </div>

        {/* Eligibility Details */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}><CheckCircle size={16} color="#10b981" /> Eligibility Details</div>
          <div style={styles.formGrid}>
            <div>
              <div style={styles.infoLabel}>Backlogs</div>
              <div style={styles.infoValue}>
                {profile?.backlogs === 0 ? (
                  <span style={{ color: '#10b981' }}>✅ {profile?.backlogs || 0}</span>
                ) : (
                  <span style={{ color: '#ef4444' }}>⚠️ {profile?.backlogs || 0}</span>
                )}
              </div>
            </div>
            <div>
              <div style={styles.infoLabel}>Year Gap</div>
              <div style={styles.infoValue}>
                {profile?.yearGap === 0 ? (
                  <span style={{ color: '#10b981' }}>✅ {profile?.yearGap || 0} years</span>
                ) : (
                  <span style={{ color: '#ef4444' }}>⚠️ {profile?.yearGap || 0} years</span>
                )}
              </div>
            </div>
            <div>
              <div style={styles.infoLabel}>Experience</div>
              <div style={styles.infoValue}>{profile?.experienceYears || 0} years</div>
            </div>
            <div>
              <div style={styles.infoLabel}>Resume</div>
              <div style={styles.infoValue}>
                {profile?.resumeUrl ? (
                  <a 
                    href={getFullResumeUrl(profile.resumeUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb', textDecoration: 'none' }}
                    onClick={(e) => {
                      const url = getFullResumeUrl(profile.resumeUrl);
                      if (!url) {
                        e.preventDefault();
                        toast.error('Resume URL is invalid');
                      }
                    }}
                  >
                    📄 View Resume
                  </a>
                ) : (
                  <span style={{ color: '#ef4444' }}>⚠️ Not uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}><Code size={16} color="#2563eb" /> Skills</div>
            <div style={styles.skillsContainer}>
              {profile.skills.map((skill, idx) => (
                <span key={idx} style={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile?.certifications && profile.certifications.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}><Award size={16} color="#2563eb" /> Certifications</div>
            <div style={styles.skillsContainer}>
              {profile.certifications.map((cert, idx) => (
                <span key={idx} style={{ ...styles.skillTag, background: '#fef3c7', color: '#d97706' }}>{cert}</span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {profile?.projects && profile.projects.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}><Briefcase size={16} color="#2563eb" /> Projects</div>
            <div style={styles.skillsContainer}>
              {profile.projects.map((project, idx) => (
                <span key={idx} style={{ ...styles.skillTag, background: '#d1fae5', color: '#065f46' }}>{project}</span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile?.languages && profile.languages.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}><Globe size={16} color="#2563eb" /> Languages</div>
            <div style={styles.skillsContainer}>
              {profile.languages.map((lang, idx) => (
                <span key={idx} style={{ ...styles.skillTag, background: '#fce7f3', color: '#db2777' }}>{lang}</span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile?.bio && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>📝 Bio</div>
            <p style={styles.bioText}>{profile.bio}</p>
          </div>
        )}

        {/* Social Links */}
        <div style={styles.socialLinks}>
          {profile?.linkedin && (
            <div style={styles.socialLink} onClick={() => openLink(profile.linkedin)}>
              🔗 LinkedIn <ExternalLink size={12} />
            </div>
          )}
          {profile?.github && (
            <div style={styles.socialLink} onClick={() => openLink(profile.github)}>
              🐙 GitHub <ExternalLink size={12} />
            </div>
          )}
          {profile?.portfolio && (
            <div style={styles.socialLink} onClick={() => openLink(profile.portfolio)}>
              🌐 Portfolio <ExternalLink size={12} />
            </div>
          )}
          {!profile?.linkedin && !profile?.github && !profile?.portfolio && (
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>No social links added</div>
          )}
        </div>
      </div>
    )
  }

  // ✅ EDIT MODE
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}><User size={18} color="white" /></div>
          <span>Edit Profile</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleCancel} style={styles.cancelBtn}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !!regNoError} style={styles.saveBtn}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Profile Picture */}
      <div style={styles.profileSection}>
        <div style={styles.profilePicContainer} onClick={() => document.getElementById('profilePicInput').click()}>
          <div style={styles.profilePic}>
            {profilePicPreview || editData?.profilePic ? (
              <img 
                src={getFullImageUrl(profilePicPreview || editData.profilePic)} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  console.error('❌ Image load error:', e.target.src);
                  const parent = e.target.parentElement;
                  if (parent) {
                    e.target.style.display = 'none';
                    parent.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                    parent.style.borderRadius = '50%';
                    parent.style.width = '100px';
                    parent.style.height = '100px';
                    parent.innerHTML = `<span style="font-size:2.5rem;font-weight:600;color:white">${editData?.name?.charAt(0) || 'U'}</span>`;
                  }
                }}
              />
            ) : (
              <span>{editData?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div style={styles.cameraIcon}>
            {uploadingPic ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
          </div>
          <input 
            type="file" 
            id="profilePicInput" 
            accept="image/*" 
            onChange={handleProfilePicChange} 
            style={{ display: 'none' }} 
          />
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={styles.label}>Full Name</label>
            <input type="text" value={editData?.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Registration No</label>
            <input 
              type="text" 
              value={editData?.regNo || ''} 
              onChange={(e) => handleRegNoChange(e.target.value)} 
              style={regNoError ? styles.inputError : styles.input}
              placeholder="Enter 12-digit registration number"
              maxLength="12"
            />
            {regNoError && <div style={styles.errorText}>{regNoError}</div>}
          </div>
          <div>
            <label style={styles.label}>Email</label>
            <input type="email" value={editData?.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} style={styles.input} disabled />
          </div>
          <div>
            <label style={styles.label}>Phone</label>
            <input type="text" value={editData?.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} style={styles.input} />
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}><GraduationCap size={16} color="#2563eb" /> Academic Details</div>
        <div style={styles.formGrid}>
          <div><label style={styles.label}>Program</label><input type="text" value={editData?.program || ''} onChange={(e) => setEditData({...editData, program: e.target.value})} style={styles.input} /></div>
          <div><label style={styles.label}>Branch</label><input type="text" value={editData?.branch || ''} onChange={(e) => setEditData({...editData, branch: e.target.value})} style={styles.input} /></div>
          <div><label style={styles.label}>Session</label><input type="text" value={editData?.session || ''} onChange={(e) => setEditData({...editData, session: e.target.value})} style={styles.input} /></div>
          <div><label style={styles.label}>Semester</label><input type="text" value={editData?.semester || ''} onChange={(e) => setEditData({...editData, semester: e.target.value})} style={styles.input} /></div>
          <div><label style={styles.label}>CGPA</label><input type="number" step="0.01" value={editData?.cgpa || 0} onChange={(e) => setEditData({...editData, cgpa: parseFloat(e.target.value)})} style={styles.input} /></div>
          <div><label style={styles.label}>Address</label><input type="text" value={editData?.address || ''} onChange={(e) => setEditData({...editData, address: e.target.value})} style={styles.input} /></div>
        </div>
      </div>

      {/* Eligibility Details */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}><CheckCircle size={16} color="#10b981" /> Eligibility Details</div>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Backlogs</label>
            <input 
              type="number" 
              min="0" 
              max="10" 
              value={editData?.backlogs || 0} 
              onChange={(e) => setEditData({...editData, backlogs: parseInt(e.target.value) || 0})} 
              style={styles.input} 
            />
            <small style={styles.helperText}>0 = No backlogs</small>
          </div>
          <div>
            <label style={styles.label}>Year Gap</label>
            <input 
              type="number" 
              min="0" 
              max="5" 
              value={editData?.yearGap || 0} 
              onChange={(e) => setEditData({...editData, yearGap: parseInt(e.target.value) || 0})} 
              style={styles.input} 
            />
            <small style={styles.helperText}>0 = No gap</small>
          </div>
          <div>
            <label style={styles.label}>Experience (Years)</label>
            <input 
              type="number" 
              step="0.5" 
              min="0" 
              max="10" 
              value={editData?.experienceYears || 0} 
              onChange={(e) => setEditData({...editData, experienceYears: parseFloat(e.target.value) || 0})} 
              style={styles.input} 
            />
            <small style={styles.helperText}>Work/Internship experience</small>
          </div>
          <div>
            <label style={styles.label}>Resume</label>
            {editData?.resumeUrl ? (
              <div style={styles.resumeBox}>
                <FileText size={16} color="#059669" />
                <span style={{ fontSize: '0.8rem', color: '#065f46' }}>Resume uploaded</span>
                <a 
                  href={getFullResumeUrl(editData.resumeUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: 'auto', color: '#2563eb', fontSize: '0.7rem', textDecoration: 'none' }}
                  onClick={(e) => {
                    const url = getFullResumeUrl(editData.resumeUrl);
                    if (!url) {
                      e.preventDefault();
                      toast.error('Resume URL is invalid');
                    }
                  }}
                >
                  View
                </a>
                <button 
                  onClick={() => document.getElementById('resumeUploadInput').click()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.7rem' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div 
                style={styles.resumeUploadBox}
                onClick={() => document.getElementById('resumeUploadInput').click()}
              >
                <Upload size={24} color="#94a3b8" />
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                  {uploadingResume ? 'Uploading...' : 'Click to upload resume'}
                </div>
                <small style={styles.helperText}>PDF, DOC, DOCX (max 5MB)</small>
              </div>
            )}
            <input 
              type="file" 
              id="resumeUploadInput" 
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              onChange={handleResumeUpload} 
              style={{ display: 'none' }} 
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}><Code size={16} color="#2563eb" /> Skills</div>
        <div style={styles.skillsContainer}>
          {editData?.skills?.map((skill, idx) => (
            <span key={idx} style={styles.skillTag}>
              {skill}
              <button onClick={() => handleRemoveItem('skills', skill)} style={styles.removeBtn}>✕</button>
            </span>
          ))}
          <button onClick={() => handleAddItem('skills', 'skill')} style={styles.addBtn}>
            <Plus size={12} /> Add Skill
          </button>
        </div>
      </div>

      {/* Certifications */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}><Award size={16} color="#2563eb" /> Certifications</div>
        <div style={styles.skillsContainer}>
          {editData?.certifications?.map((cert, idx) => (
            <span key={idx} style={{ ...styles.skillTag, background: '#fef3c7', color: '#d97706' }}>
              {cert}
              <button onClick={() => handleRemoveItem('certifications', cert)} style={{ ...styles.removeBtn, color: '#d97706' }}>✕</button>
            </span>
          ))}
          <button onClick={() => handleAddItem('certifications', 'certification')} style={styles.addBtn}>
            <Plus size={12} /> Add Certification
          </button>
        </div>
      </div>

      {/* Projects */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}><Briefcase size={16} color="#2563eb" /> Projects</div>
        <div style={styles.skillsContainer}>
          {editData?.projects?.map((project, idx) => (
            <span key={idx} style={{ ...styles.skillTag, background: '#d1fae5', color: '#065f46' }}>
              {project}
              <button onClick={() => handleRemoveItem('projects', project)} style={{ ...styles.removeBtn, color: '#065f46' }}>✕</button>
            </span>
          ))}
          <button onClick={() => handleAddItem('projects', 'project')} style={styles.addBtn}>
            <Plus size={12} /> Add Project
          </button>
        </div>
      </div>

      {/* Languages */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}><Globe size={16} color="#2563eb" /> Languages</div>
        <div style={styles.skillsContainer}>
          {editData?.languages?.map((lang, idx) => (
            <span key={idx} style={{ ...styles.skillTag, background: '#fce7f3', color: '#db2777' }}>
              {lang}
              <button onClick={() => handleRemoveItem('languages', lang)} style={{ ...styles.removeBtn, color: '#db2777' }}>✕</button>
            </span>
          ))}
          <button onClick={() => handleAddItem('languages', 'language')} style={styles.addBtn}>
            <Plus size={12} /> Add Language
          </button>
        </div>
      </div>

      {/* Bio */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}>📝 Bio</div>
        <textarea value={editData?.bio || ''} onChange={(e) => setEditData({...editData, bio: e.target.value})} style={styles.textarea} rows="3" placeholder="Tell us about yourself..." />
      </div>

      {/* Social Links */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}>🔗 Social Links</div>
        <div style={styles.formGrid}>
          <div><label style={styles.label}>LinkedIn</label><input type="text" value={editData?.linkedin || ''} onChange={(e) => setEditData({...editData, linkedin: e.target.value})} style={styles.input} placeholder="LinkedIn URL" /></div>
          <div><label style={styles.label}>GitHub</label><input type="text" value={editData?.github || ''} onChange={(e) => setEditData({...editData, github: e.target.value})} style={styles.input} placeholder="GitHub URL" /></div>
          <div style={styles.fullWidth}><label style={styles.label}>Portfolio</label><input type="text" value={editData?.portfolio || ''} onChange={(e) => setEditData({...editData, portfolio: e.target.value})} style={styles.input} placeholder="Portfolio URL" /></div>
        </div>
      </div>
    </div>
  )
}

export default Profile