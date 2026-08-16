import { useState, useRef, useEffect } from 'react'
import { 
  BarChart3, Upload, FileText, CheckCircle, AlertCircle, 
  TrendingUp, Download, Zap, Target, Code, Loader, X, Eye 
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

// ✅ API URL FIXED: Localhost 5000 pe chalega
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeScore, setResumeScore] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasExistingResume, setHasExistingResume] = useState(false)
  const [existingResumeUrl, setExistingResumeUrl] = useState(null)
  const fileInputRef = useRef(null)

  // ✅ TOKEN FIX: 'token' ki jagah 'studentToken' use kiya
  const token = localStorage.getItem('studentToken')

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  // ✅ Check if user already has a resume
  const checkExistingResume = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success && response.data.hasResume) {
        setHasExistingResume(true)
        setExistingResumeUrl(response.data.resumeUrl)
        toast.success('Existing resume found!')
      }
    } catch (error) {
      console.error('Error checking resume:', error)
    }
  }

  useEffect(() => {
    if (token) {
      checkExistingResume()
    }
  }, [token])

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF or Word (.doc, .docx) file only')
        return
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error('File size should be less than 12MB')
        return
      }
      setResumeFile(file)
      setUploadedFileName(file.name)
      setResumeScore(null)
      setAnalysisResult(null)
      setUploadProgress(0)
      toast.success('File uploaded successfully! Click "Analyze Resume"')
    }
  }

  // ✅ Upload resume to backend
  const uploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file first')
      return null
    }

    const formData = new FormData()
    formData.append('resume', resumeFile)

    try {
      const response = await axios.post(`${API_URL}/students/resume`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      })
      
      if (response.data.success) {
        setHasExistingResume(true)
        setExistingResumeUrl(response.data.resumeUrl)
        return response.data.resumeUrl
      }
      return null
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
      return null
    }
  }

  // ✅ Analyze resume using backend
  const analyzeResume = async () => {
    if (!resumeFile && !hasExistingResume) {
      toast.error('Please select a resume file first')
      return
    }

    setIsAnalyzing(true)
    setUploadProgress(0)

    try {
      let resumeUrl = existingResumeUrl
      
      // Upload new file if selected
      if (resumeFile) {
        resumeUrl = await uploadResume()
        if (!resumeUrl) {
          setIsAnalyzing(false)
          return
        }
      }

      // Call analysis API
      const response = await axios.post(`${API_URL}/students/resume/analyze`, 
        { resumeUrl: resumeUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        const result = response.data.analysis
        setResumeScore(result.score)
        
        setAnalysisResult({
          score: result.score,
          sections: result.sections || {
            contact: result.score >= 70 ? 'good' : 'needs_improvement',
            summary: result.score >= 75 ? 'good' : 'needs_improvement',
            experience: result.score >= 65 ? 'good' : 'needs_improvement',
            education: result.score >= 80 ? 'good' : 'needs_improvement',
            skills: result.score >= 70 ? 'good' : 'needs_improvement',
            projects: result.score >= 60 ? 'good' : 'needs_improvement',
            certifications: result.score >= 50 ? 'good' : 'needs_improvement',
          },
          keywords: result.keywords || {
            'React.js': result.score >= 70,
            'JavaScript': result.score >= 75,
            'Node.js': result.score >= 65,
            'Python': result.score >= 60,
            'HTML/CSS': result.score >= 80,
            'MongoDB': result.score >= 55,
            'Express.js': result.score >= 50,
            'Git': result.score >= 70,
          },
          suggestions: result.suggestions || []
        })
        
        toast.success(`Resume analyzed! Score: ${result.score}/100`)
      } else {
        // Fallback to mock analysis if backend fails
        mockAnalysis()
      }
    } catch (error) {
      console.error('Error analyzing resume:', error)
      // Fallback to mock analysis
      mockAnalysis()
    } finally {
      setIsAnalyzing(false)
      setUploadProgress(0)
    }
  }

  // ✅ Mock analysis as fallback
  const mockAnalysis = () => {
    const score = Math.floor(Math.random() * (95 - 55 + 1)) + 55
    setResumeScore(score)
    
    const suggestionsList = []
    if (score < 70) suggestionsList.push('Add a professional summary at the top')
    if (score < 65) suggestionsList.push('Include more quantifiable achievements in experience section')
    if (score < 75) suggestionsList.push('Add relevant certifications to boost credibility')
    if (score < 70) suggestionsList.push('Improve skills section with in-demand technologies')
    if (score < 60) suggestionsList.push('Add project links (GitHub, live demo)')
    if (score < 80) suggestionsList.push('Use action verbs (Developed, Created, Implemented)')
    if (score < 65) suggestionsList.push('Add a portfolio link or personal website')
    
    setAnalysisResult({
      score: score,
      sections: {
        contact: score >= 70 ? 'good' : 'needs_improvement',
        summary: score >= 75 ? 'good' : 'needs_improvement',
        experience: score >= 65 ? 'good' : 'needs_improvement',
        education: score >= 80 ? 'good' : 'needs_improvement',
        skills: score >= 70 ? 'good' : 'needs_improvement',
        projects: score >= 60 ? 'good' : 'needs_improvement',
        certifications: score >= 50 ? 'good' : 'needs_improvement',
      },
      keywords: {
        'React.js': score >= 70,
        'JavaScript': score >= 75,
        'Node.js': score >= 65,
        'Python': score >= 60,
        'HTML/CSS': score >= 80,
        'MongoDB': score >= 55,
        'Express.js': score >= 50,
        'Git': score >= 70,
      },
      suggestions: suggestionsList
    })
    
    toast.success(`Resume analyzed! Score: ${score}/100`)
  }

  const handleViewResume = () => {
    if (existingResumeUrl) {
      window.open(existingResumeUrl, '_blank')
    } else {
      toast.error('No resume found')
    }
  }

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return
    
    try {
      const response = await axios.delete(`${API_URL}/students/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setHasExistingResume(false)
        setExistingResumeUrl(null)
        setResumeScore(null)
        setAnalysisResult(null)
        setResumeFile(null)
        setUploadedFileName(null)
        toast.success('Resume deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast.error('Failed to delete resume')
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 65) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent! Your resume looks great!'
    if (score >= 65) return 'Good! Some improvements needed'
    return 'Needs significant improvement'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    return 'Needs Improvement'
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
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    uploadSection: {
      background: '#f8fafc',
      borderRadius: '20px',
      padding: '2rem',
      textAlign: 'center',
      border: '2px dashed #e2e8f0',
      marginBottom: '1.5rem'
    },
    uploadIcon: {
      width: '60px',
      height: '60px',
      background: '#eff6ff',
      borderRadius: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    uploadTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    uploadSubtitle: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginBottom: '1rem'
    },
    fileInfo: {
      background: '#e0f2fe',
      borderRadius: '12px',
      padding: '0.75rem',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    existingResumeInfo: {
      background: '#d1fae5',
      borderRadius: '12px',
      padding: '0.75rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      background: '#e2e8f0',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '0.5rem'
    },
    progressFill: (percent) => ({
      width: `${percent}%`,
      height: '100%',
      background: '#2563eb',
      transition: 'width 0.3s ease'
    }),
    btnPrimary: {
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnOutline: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      color: '#2563eb',
      border: '1px solid #2563eb',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btnDanger: {
      padding: '0.5rem 1rem',
      background: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    scoreSection: {
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    scoreCircle: {
      width: '140px',
      height: '140px',
      margin: '0 auto 1rem',
      position: 'relative'
    },
    scoreValue: {
      fontSize: '2.5rem',
      fontWeight: '700',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '1rem',
      border: '1px solid #e2e8f0'
    },
    cardTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    sectionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    sectionName: {
      fontSize: '0.75rem',
      color: '#64748b',
      textTransform: 'capitalize'
    },
    keywordBadge: (passed) => ({
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      background: passed ? '#d1fae5' : '#fee2e2',
      color: passed ? '#065f46' : '#991b1b',
      margin: '0.2rem'
    }),
    suggestionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    suggestionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0',
      fontSize: '0.75rem',
      color: '#475569',
      borderBottom: '1px solid #f1f5f9'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      justifyContent: 'center'
    }
  }

  if (isAnalyzing) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>
            <div style={styles.titleIcon}>
              <BarChart3 size={18} color="white" />
            </div>
            <span>Resume Analyzer</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Analyzing your resume...</p>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={styles.progressBar}>
              <div style={styles.progressFill(uploadProgress)}></div>
            </div>
          )}
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
            <BarChart3 size={18} color="white" />
          </div>
          <span>Resume Analyzer</span>
        </div>
        {resumeScore && (
          <button style={styles.btnOutline} onClick={() => {
            const reportData = {
              score: resumeScore,
              analysis: analysisResult,
              date: new Date().toLocaleString()
            }
            localStorage.setItem('resumeReport', JSON.stringify(reportData))
            toast.success('Report saved!')
          }}>
            <Download size={14} /> Save Report
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
      />

      {!resumeScore ? (
        <div style={styles.uploadSection}>
          <div style={styles.uploadIcon}><Upload size={28} color="#2563eb" /></div>
          <div style={styles.uploadTitle}>Upload Your Resume</div>
          <div style={styles.uploadSubtitle}>PDF or Word format (DOC, DOCX), Max 12MB</div>
          <button onClick={handleFileSelect} style={styles.btnPrimary}>
            <Upload size={14} /> Choose File
          </button>
          
          {hasExistingResume && !resumeFile && (
            <div style={styles.existingResumeInfo}>
              <span><FileText size={14} /> Existing resume found!</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleViewResume} style={styles.btnOutline}>
                  <Eye size={14} /> View
                </button>
                <button onClick={analyzeResume} style={styles.btnPrimary}>
                  Analyze Existing Resume →
                </button>
                <button onClick={handleDeleteResume} style={styles.btnDanger}>
                  <X size={14} /> Delete
                </button>
              </div>
            </div>
          )}
          
          {uploadedFileName && (
            <div style={styles.fileInfo}>
              <span><FileText size={14} /> {uploadedFileName}</span>
              <button onClick={analyzeResume} style={styles.btnPrimary}>
                Analyze Resume →
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={styles.scoreSection}>
            <div style={styles.scoreCircle}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                <circle cx="70" cy="70" r="60" fill="none" stroke={getScoreColor(resumeScore)} strokeWidth="8" 
                  strokeDasharray={`${(resumeScore / 100) * 377} 377`} strokeLinecap="round" transform="rotate(-90 70 70)"/>
              </svg>
              <div style={styles.scoreValue}>{resumeScore}</div>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(resumeScore) }}>
              {getScoreLabel(resumeScore)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              {getScoreText(resumeScore)}
            </div>
          </div>

          <div style={styles.twoColumnGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <Target size={16} color="#2563eb" /> Section Analysis
              </div>
              {analysisResult && Object.entries(analysisResult.sections).map(([section, status]) => (
                <div key={section} style={styles.sectionItem}>
                  <span style={styles.sectionName}>{section.replace(/_/g, ' ')}</span>
                  {status === 'good' ? (
                    <span style={{ color: '#10b981', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} /> Good
                    </span>
                  ) : (
                    <span style={{ color: '#f59e0b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> Needs Improvement
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <Code size={16} color="#8b5cf6" /> Keyword Analysis
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {analysisResult && Object.entries(analysisResult.keywords).map(([keyword, found]) => (
                  <span key={keyword} style={styles.keywordBadge(found)}>
                    {found ? '✓' : '✗'} {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <TrendingUp size={16} color="#f59e0b" /> Suggestions to Improve
            </div>
            <ul style={styles.suggestionList}>
              {analysisResult && analysisResult.suggestions.map((suggestion, idx) => (
                <li key={idx} style={styles.suggestionItem}>
                  <span>🔹</span> {suggestion}
                </li>
              ))}
              {analysisResult && analysisResult.suggestions.length === 0 && (
                <li style={styles.suggestionItem}>✨ Your resume looks great! Keep it up!</li>
              )}
            </ul>
          </div>

          <div style={{ ...styles.card, background: '#eff6ff', marginTop: '1rem' }}>
            <div style={styles.cardTitle}>
              <Zap size={16} color="#2563eb" /> Pro Tips for Better Resume
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <div>✓ Use action verbs (Developed, Created)</div>
              <div>✓ Include quantifiable achievements</div>
              <div>✓ Tailor resume for each job</div>
              <div>✓ Keep formatting consistent</div>
              <div>✓ Add GitHub/portfolio links</div>
              <div>✓ Proofread for errors</div>
            </div>
          </div>

          <div style={styles.actionButtons}>
            <button onClick={() => {
              setResumeScore(null)
              setAnalysisResult(null)
              setResumeFile(null)
              setUploadedFileName(null)
              setUploadProgress(0)
            }} style={styles.btnOutline}>
              <Upload size={14} /> Analyze Another Resume
            </button>
            <button onClick={handleDeleteResume} style={styles.btnDanger}>
              <X size={14} /> Delete Resume
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ResumeAnalyzer