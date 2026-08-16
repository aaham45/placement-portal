import { useState, useEffect } from 'react'
import { 
  Plus, X, Briefcase, MapPin, DollarSign, Calendar, Users, 
  FileText, Tag, Building, Mail, Phone, Globe, Clock,
  CheckCircle, AlertCircle, Upload, Trash2, Eye, Save,
  Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ✅ STYLES OBJECT
const styles = {
  container: {
    background: 'white',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
    paddingRight: '2rem'
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
    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  section: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  formLabel: {
    fontSize: '0.7rem',
    fontWeight: '500',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  required: {
    color: '#ef4444'
  },
  formInput: {
    padding: '0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#f8fafc'
  },
  formTextarea: {
    padding: '0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.85rem',
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit'
  },
  select: {
    padding: '0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.85rem',
    outline: 'none',
    background: '#f8fafc',
    cursor: 'pointer'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  skillBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.6rem',
    background: '#ede9fe',
    color: '#7c3aed',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '500'
  },
  skillInputGroup: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  skillInput: {
    flex: 1,
    padding: '0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.85rem',
    outline: 'none',
    background: '#f8fafc'
  },
  addBtn: {
    padding: '0.6rem 1rem',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.7rem',
    cursor: 'pointer'
  },
  btnPrimary: {
    padding: '0.6rem 1.2rem',
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
  btnOutline: {
    padding: '0.6rem 1.2rem',
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  previewCard: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1rem'
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  previewLogo: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    objectFit: 'cover',
    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'white'
  },
  previewCompanyInfo: {
    flex: 1
  },
  previewCompanyName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  previewTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  previewMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  previewMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    color: '#64748b'
  },
  previewSection: {
    marginBottom: '1rem'
  },
  previewSectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  previewText: {
    fontSize: '0.75rem',
    color: '#475569',
    lineHeight: '1.5'
  },
  successMessage: {
    padding: '1rem',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '12px',
    color: '#065f46',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
}

function PostJob({ onJobPosted, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    salary_range: '',
    location: '',
    job_type: 'Full-time',
    experience: '0-2 years',
    openings: 1,
    eligibility: 7.5,
    application_deadline: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    skills: [],
    skillInput: ''
  })

  const [previewMode, setPreviewMode] = useState(false)
  const [companyLogo, setCompanyLogo] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobPosted, setJobPosted] = useState(false)
  const [lastJob, setLastJob] = useState(null)

  const token = localStorage.getItem('companyToken')

  // Fetch company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/company/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data) {
          setCompanyName(response.data.companyName || response.data.name || 'Company')
          setCompanyLogo(response.data.logo || null)
        }
      } catch (error) {
        console.error('Error fetching company profile:', error)
        setCompanyName('Company')
      }
    }
    if (token) {
      fetchCompanyProfile()
    }
  }, [token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddSkill = () => {
    if (formData.skillInput.trim() && !formData.skills.includes(formData.skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: ''
      })
    }
  }

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.salary_range || !formData.location || !formData.application_deadline) {
      toast.error('Please fill all required fields')
      return
    }

    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill')
      return
    }

    setLoading(true)
    setJobPosted(false)
    
    try {
      const requestData = {
        title: formData.title,
        description: formData.description || '',
        salary_range: formData.salary_range,
        location: formData.location,
        job_type: formData.job_type,
        eligibility: parseFloat(formData.eligibility) || 0,
        skills: formData.skills.join(','),
        openings: parseInt(formData.openings) || 1,
        application_deadline: formData.application_deadline
      }

      console.log('📤 Sending job data:', requestData)

      const response = await axios.post(
        `${API_URL}/company/jobs`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('📥 Response:', response.data)
      
      if (response.data.success) {
        setJobPosted(true)
        setLastJob(response.data.job)
        toast.success('Job posted successfully! 🎉')
        
        // ✅ Reset form after successful post
        setFormData({
          title: '',
          department: '',
          salary_range: '',
          location: '',
          job_type: 'Full-time',
          experience: '0-2 years',
          openings: 1,
          eligibility: 7.5,
          application_deadline: '',
          description: '',
          responsibilities: '',
          requirements: '',
          benefits: '',
          skills: [],
          skillInput: ''
        })
        
        if (onJobPosted) onJobPosted(response.data.job)
        
        // ✅ Auto close after 3 seconds
        setTimeout(() => {
          if (onClose) onClose()
        }, 3000)
      } else {
        toast.error(response.data.message || 'Failed to post job')
      }
    } catch (error) {
      console.error('❌ Error posting job:', error)
      console.error('❌ Response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) onClose()
  }

  return (
    <div style={styles.container}>
      <div style={styles.closeBtn} onClick={handleClose}>
        <X size={16} />
      </div>

      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <Plus size={18} color="white" />
          </div>
          <span>Post New Job</span>
        </div>
        <div>
          <button onClick={() => setPreviewMode(!previewMode)} style={styles.btnOutline}>
            <Eye size={14} /> {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
        </div>
      </div>

      {jobPosted && lastJob && (
        <div style={styles.successMessage}>
          <CheckCircle size={20} />
          <div>
            <strong>Job posted successfully!</strong>
            <div style={{ fontSize: '0.8rem', color: '#065f46' }}>
              {lastJob.title} - {lastJob.salary_range} • {lastJob.location}
            </div>
          </div>
        </div>
      )}

      {previewMode ? (
        <div style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <div style={styles.previewLogo}>
              {companyLogo ? (
                <img src={companyLogo} alt="Company Logo" style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }} />
              ) : (
                <span>{companyName.charAt(0) || 'C'}</span>
              )}
            </div>
            <div style={styles.previewCompanyInfo}>
              <div style={styles.previewCompanyName}>{companyName}</div>
              <div style={styles.previewTitle}>{formData.title || 'Job Title'}</div>
            </div>
          </div>

          <div style={styles.previewMeta}>
            <span style={styles.previewMetaItem}><DollarSign size={12} /> {formData.salary_range || 'Not specified'}</span>
            <span style={styles.previewMetaItem}><MapPin size={12} /> {formData.location || 'Location not specified'}</span>
            <span style={styles.previewMetaItem}><Briefcase size={12} /> {formData.job_type}</span>
            <span style={styles.previewMetaItem}><Clock size={12} /> {formData.experience}</span>
            <span style={styles.previewMetaItem}><Users size={12} /> {formData.openings} openings</span>
            <span style={styles.previewMetaItem}><Calendar size={12} /> Deadline: {formData.application_deadline ? new Date(formData.application_deadline).toLocaleDateString() : 'Not set'}</span>
          </div>
          
          {formData.skills.length > 0 && (
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>Required Skills</div>
              <div style={styles.skillsContainer}>
                {formData.skills.map(skill => (
                  <span key={skill} style={styles.skillBadge}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {formData.description && (
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>Job Description</div>
              <div style={styles.previewText}>{formData.description}</div>
            </div>
          )}

          {formData.responsibilities && (
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>Key Responsibilities</div>
              <div style={styles.previewText}>{formData.responsibilities}</div>
            </div>
          )}

          {formData.requirements && (
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>Requirements & Qualifications</div>
              <div style={styles.previewText}>{formData.requirements}</div>
            </div>
          )}

          {formData.benefits && (
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>Benefits & Perks</div>
              <div style={styles.previewText}>{formData.benefits}</div>
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button onClick={() => setPreviewMode(false)} style={styles.btnOutline}>
              Edit
            </button>
            <button onClick={handleSubmit} disabled={loading} style={styles.btnPrimary}>
              <Save size={14} /> {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Company Information */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <Building size={16} color="#7c3aed" /> Company Information
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Company Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Building size={24} color="#94a3b8" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{companyName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Logo will be automatically added from company profile</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <Briefcase size={16} color="#7c3aed" /> Basic Information
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Job Title <span style={styles.required}>*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Senior Software Engineer" style={styles.formInput} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Engineering" style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Salary Range (LPA) <span style={styles.required}>*</span></label>
                <input type="text" name="salary_range" value={formData.salary_range} onChange={handleInputChange} placeholder="e.g., 18-24 LPA" style={styles.formInput} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Location <span style={styles.required}>*</span></label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Bengaluru, Karnataka" style={styles.formInput} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Job Type</label>
                <select name="job_type" value={formData.job_type} onChange={handleInputChange} style={styles.select}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Experience Required</label>
                <select name="experience" value={formData.experience} onChange={handleInputChange} style={styles.select}>
                  <option value="Fresher">Fresher</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="5-8 years">5-8 years</option>
                  <option value="8+ years">8+ years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <Tag size={16} color="#7c3aed" /> Requirements
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Minimum CGPA</label>
                <input type="number" step="0.1" name="eligibility" value={formData.eligibility} onChange={handleInputChange} style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Number of Openings</label>
                <input type="number" name="openings" value={formData.openings} onChange={handleInputChange} style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Application Deadline <span style={styles.required}>*</span></label>
                <input type="date" name="application_deadline" value={formData.application_deadline} onChange={handleInputChange} style={styles.formInput} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Required Skills <span style={styles.required}>*</span></label>
                <div style={styles.skillInputGroup}>
                  <input 
                    type="text" 
                    value={formData.skillInput} 
                    onChange={(e) => setFormData({...formData, skillInput: e.target.value})} 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} 
                    placeholder="e.g., React, Java, Python" 
                    style={styles.skillInput} 
                  />
                  <button type="button" onClick={handleAddSkill} style={styles.addBtn}>Add</button>
                </div>
                <div style={styles.skillsContainer}>
                  {formData.skills.map(skill => (
                    <span key={skill} style={styles.skillBadge}>
                      {skill} 
                      <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveSkill(skill)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <FileText size={16} color="#7c3aed" /> Job Description
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Write a detailed job description..." style={styles.formTextarea} rows="3" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Key Responsibilities</label>
              <textarea name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} placeholder="List the key responsibilities..." style={styles.formTextarea} rows="3" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Requirements & Qualifications</label>
              <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} placeholder="List the requirements..." style={styles.formTextarea} rows="3" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Benefits & Perks</label>
              <textarea name="benefits" value={formData.benefits} onChange={handleInputChange} placeholder="What benefits do you offer?" style={styles.formTextarea} rows="2" />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={() => {
                setFormData({
                  title: '', department: '', salary_range: '', location: '', job_type: 'Full-time',
                  experience: '0-2 years', openings: 1, eligibility: 7.5, application_deadline: '',
                  description: '', responsibilities: '', requirements: '', benefits: '',
                  skills: [], skillInput: ''
                })
              }} 
              style={styles.btnOutline}
            >
              <Trash2 size={14} /> Clear Form
            </button>
            <button type="submit" disabled={loading} style={styles.btnPrimary}>
              <Plus size={14} /> {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PostJob