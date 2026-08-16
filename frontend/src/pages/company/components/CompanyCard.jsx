import { useState, useEffect } from 'react'
import { Briefcase, MapPin, DollarSign, Calendar, Users, Clock, CheckCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function CompanyCard({ job, onApply }) {
  const [companyLogo, setCompanyLogo] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch company logo from backend
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      try {
        if (job.companyId) {
          const response = await axios.get(`${API_URL}/companies/${job.companyId}/logo`)
          if (response.data.logo) {
            setCompanyLogo(response.data.logo)
          }
        }
      } catch (error) {
        console.error('Error fetching company logo:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCompanyLogo()
  }, [job.companyId])

  const styles = {
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    },
    cardHeader: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      alignItems: 'center'
    },
    logo: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      objectFit: 'cover',
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white'
    },
    companyInfo: {
      flex: 1
    },
    companyName: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#64748b'
    },
    jobTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    details: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.7rem',
      color: '#64748b'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    skillBadge: {
      background: '#f3e8ff',
      color: '#7c3aed',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.65rem',
      fontWeight: '500'
    },
    deadline: {
      fontSize: '0.65rem',
      color: '#f59e0b',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    applyBtn: {
      width: '100%',
      padding: '0.5rem',
      background: '#7c3aed',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      transition: 'background 0.2s ease'
    },
    appliedBtn: {
      width: '100%',
      padding: '0.5rem',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem'
    }
  }

  const handleApply = () => {
    if (onApply) {
      onApply(job.id)
    }
  }

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.logo}>
          {companyLogo ? (
            <img src={companyLogo} alt={job.companyName} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
          ) : (
            <span>{job.companyName?.charAt(0) || 'C'}</span>
          )}
        </div>
        <div style={styles.companyInfo}>
          <div style={styles.companyName}>{job.companyName}</div>
          <div style={styles.jobTitle}>{job.title}</div>
        </div>
      </div>

      <div style={styles.details}>
        <span style={styles.detailItem}><DollarSign size={12} /> {job.package}</span>
        <span style={styles.detailItem}><MapPin size={12} /> {job.location}</span>
        <span style={styles.detailItem}><Briefcase size={12} /> {job.jobType}</span>
        <span style={styles.detailItem}><Clock size={12} /> {job.experience}</span>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div style={styles.skillsContainer}>
          {job.skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} style={styles.skillBadge}>{skill}</span>
          ))}
          {job.skills.length > 4 && (
            <span style={styles.skillBadge}>+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <div style={styles.deadline}>
        <Calendar size={10} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
      </div>

      {job.hasApplied ? (
        <button style={styles.appliedBtn} disabled>
          <CheckCircle size={12} /> Applied
        </button>
      ) : (
        <button onClick={handleApply} style={styles.applyBtn}>
          Apply Now
        </button>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default CompanyCard



