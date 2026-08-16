// company/components/DocumentationPage.jsx

import React, { useState } from 'react'
import { 
  BookOpen, Users, Briefcase, Calendar, 
  CheckCircle, Clock, HelpCircle,
  FileText, Mail, Phone, MessageCircle,
  ChevronRight, Search, ExternalLink, 
  Award, UserCheck, XCircle, Video, Home,
  TrendingUp, BarChart3, Settings, Shield,
  ArrowRight, Sparkles, GraduationCap, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('getting-started')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const sections = [
    { id: 'getting-started', label: '🚀 Getting Started', icon: Home },
    { id: 'jobs', label: '💼 Managing Jobs', icon: Briefcase },
    { id: 'applications', label: '📋 Applications', icon: FileText },
    { id: 'shortlisting', label: '✅ Shortlisting', icon: UserCheck },
    { id: 'interviews', label: '🎯 Interviews', icon: Calendar },
    { id: 'profile', label: '👤 Profile', icon: Settings },
    { id: 'faq', label: '❓ FAQ', icon: HelpCircle },
  ]

  const faqs = [
    {
      id: 1,
      question: 'How do I post a new job?',
      answer: 'Go to Manage Jobs → Click "Post New Job" → Fill in job details (Title, Salary, Location, Skills, Eligibility, Deadline) → Click "Submit" to publish.'
    },
    {
      id: 2,
      question: 'How do I shortlist candidates?',
      answer: 'Go to Applications → Review each candidate\'s profile → Click "Shortlist" on suitable candidates → They will appear in the "Shortlisted" tab.'
    },
    {
      id: 3,
      question: 'How do I schedule an interview?',
      answer: 'Go to Shortlisted tab → Click "Schedule Interview" on a candidate → Select Date, Time, Mode (Online/Offline) → Add Meeting Link (if online) → Click "Schedule".'
    },
    {
      id: 4,
      question: 'How do I update my company profile?',
      answer: 'Go to Company Profile → Edit company information (Name, HR Name, Phone, Industry, Location, Website) → Click "Save" to update.'
    },
    {
      id: 5,
      question: 'How do I change my password?',
      answer: 'Go to Settings → Security tab → Click "Change Password" → Enter current password and new password → Click "Update".'
    },
    {
      id: 6,
      question: 'What does the Recruitment Pipeline show?',
      answer: 'It shows the complete hiring funnel: Applied → Shortlisted → Interview → Selected → Rejected. This helps you track candidate progress at a glance.'
    },
    {
      id: 7,
      question: 'How do I view application details?',
      answer: 'Go to Applications → Click on any application card → Full candidate profile will open with details like skills, experience, CGPA, and resume.'
    }
  ]

  const styles = {
    container: {
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '2rem',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '1.5rem'
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    titleBadge: {
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      color: 'white',
      padding: '0.2rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '500'
    },
    subtitle: {
      fontSize: '0.95rem',
      color: '#64748b',
      marginTop: '0.5rem'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      marginTop: '1rem',
      maxWidth: '500px',
      transition: 'all 0.3s ease'
    },
    searchInput: {
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '0.85rem',
      width: '100%',
      color: '#1e293b'
    },
    contentWrapper: {
      display: 'flex',
      gap: '2rem'
    },
    sidebar: {
      width: '240px',
      flexShrink: 0,
      position: 'sticky',
      top: '1rem',
      alignSelf: 'flex-start',
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto'
    },
    sidebarTitle: {
      fontSize: '0.65rem',
      fontWeight: '600',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '0.75rem',
      paddingLeft: '0.5rem'
    },
    sidebarItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      padding: '0.6rem 0.8rem',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.8rem',
      color: active ? '#7c3aed' : '#64748b',
      background: active ? '#f3e8ff' : 'transparent',
      fontWeight: active ? '600' : '400',
      marginBottom: '0.15rem'
    }),
    mainContent: {
      flex: 1,
      minWidth: 0
    },
    sectionContent: {
      animation: 'fadeIn 0.3s ease'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    card: {
      background: '#f8fafc',
      borderRadius: '14px',
      padding: '1.25rem',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    },
    cardHover: {
      ':hover': {
        borderColor: '#7c3aed',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)'
      }
    },
    cardTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    stepList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    stepItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '0.5rem 0',
      fontSize: '0.85rem',
      color: '#475569',
      borderBottom: '1px solid #f1f5f9'
    },
    stepNumber: {
      minWidth: '28px',
      height: '28px',
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.6rem',
      fontWeight: '700',
      flexShrink: 0
    },
    tipBox: {
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      borderRadius: '10px',
      padding: '0.75rem 1rem',
      marginTop: '0.5rem',
      fontSize: '0.8rem',
      color: '#92400e',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem'
    },
    statCard: (color) => ({
      padding: '0.75rem',
      background: 'white',
      borderRadius: '10px',
      textAlign: 'center',
      borderTop: `3px solid ${color}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }),
    statValue: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.65rem',
      color: '#64748b',
      marginTop: '0.2rem'
    },
    faqItem: {
      padding: '0.75rem 1rem',
      background: 'white',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    faqQuestion: {
      fontWeight: '600',
      fontSize: '0.85rem',
      color: '#1e293b',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    faqAnswer: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginTop: '0.5rem',
      paddingTop: '0.5rem',
      borderTop: '1px solid #e2e8f0',
      lineHeight: '1.6'
    },
    badge: {
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
      fontWeight: '500'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginTop: '0.5rem'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.6rem',
      background: 'white',
      borderRadius: '8px',
      fontSize: '0.75rem',
      color: '#475569'
    }
  }

  // ============ SECTION CONTENT ============

  const renderGettingStarted = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <Sparkles size={24} color="#7c3aed" />
        Getting Started
      </h3>
      
      <div style={{...styles.card, ...styles.cardHover}}>
        <div style={styles.cardTitle}>
          <Building2 size={18} color="#7c3aed" />
          Welcome to Placement Portal
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.7' }}>
          This comprehensive guide will help you master the Company Dashboard. 
          Learn how to post jobs, review applications, shortlist candidates, 
          schedule interviews, and track your hiring progress efficiently.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📊 Dashboard Overview</div>
        <div style={styles.grid3}>
          <div style={styles.statCard('#3b82f6')}>
            <div style={styles.statValue}>4</div>
            <div style={styles.statLabel}>Total Jobs</div>
          </div>
          <div style={styles.statCard('#10b981')}>
            <div style={styles.statValue}>20</div>
            <div style={styles.statLabel}>Applications</div>
          </div>
          <div style={styles.statCard('#f59e0b')}>
            <div style={styles.statValue}>7</div>
            <div style={styles.statLabel}>Shortlisted</div>
          </div>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
          Stats update automatically as you manage your hiring process
        </p>
      </div>

      <div style={styles.tipBox}>
        <Sparkles size={16} />
        <span><strong>Pro Tip:</strong> Use the sidebar to navigate between different sections of the dashboard.</span>
      </div>
    </div>
  )

  const renderJobs = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <Briefcase size={24} color="#3b82f6" />
        Managing Jobs
      </h3>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📝 Post a New Job</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Manage Jobs</strong> from the sidebar</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>Click <strong>"Post New Job"</strong> button</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span>Fill in job details:
              <ul style={{ marginLeft: '1.5rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                <li>• Job Title & Description</li>
                <li>• Salary Range & Location</li>
                <li>• Required Skills & Eligibility</li>
                <li>• Application Deadline</li>
              </ul>
            </span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>4</span>
            <span>Click <strong>"Submit"</strong> to publish the job</span>
          </li>
        </ul>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>✏️ Edit or Close a Job</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Manage Jobs</strong></span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>Find the job you want to modify</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span>Click <strong>✏️ Edit</strong> to update details or <strong>🔒 Close</strong> to stop accepting applications</span>
          </li>
        </ul>
      </div>

      <div style={styles.tipBox}>
        <HelpCircle size={16} />
        <span><strong>Tip:</strong> Clear and detailed job descriptions attract better candidates.</span>
      </div>
    </div>
  )

  const renderApplications = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <FileText size={24} color="#8b5cf6" />
        Applications
      </h3>

      <div style={styles.card}>
        <div style={styles.cardTitle}>👀 Viewing Applications</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Applications</strong> from the sidebar</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>All applications for your jobs are listed here</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span><strong>Click</strong> on any application to view full candidate details</span>
          </li>
        </ul>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📊 Application Statuses</div>
        <div style={styles.grid2}>
          <div style={{ padding: '0.5rem', background: '#dbeafe', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>🟦 Pending</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>Initial Review</div>
          </div>
          <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>🟨 Shortlisted</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>Next Round</div>
          </div>
          <div style={{ padding: '0.5rem', background: '#d1fae5', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#10b981' }}>🟩 Selected</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>Offer Given</div>
          </div>
          <div style={{ padding: '0.5rem', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>🟥 Rejected</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>Not Selected</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderShortlisting = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <UserCheck size={24} color="#f59e0b" />
        Shortlisting
      </h3>

      <div style={styles.card}>
        <div style={styles.cardTitle}>🎯 How to Shortlist</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Applications</strong></span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>Review each candidate's profile thoroughly</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span>Click <strong>"Shortlist"</strong> on suitable candidates</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>4</span>
            <span>Shortlisted candidates appear in the <strong>"Shortlisted"</strong> tab</span>
          </li>
        </ul>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📋 What to Check</div>
        <div style={styles.featureGrid}>
          <div style={styles.featureItem}>📄 Resume & Experience</div>
          <div style={styles.featureItem}>🎓 Education & Degree</div>
          <div style={styles.featureItem}>⭐ CGPA / Academic Score</div>
          <div style={styles.featureItem}>🛠️ Technical Skills</div>
          <div style={styles.featureItem}>💼 Past Work Experience</div>
          <div style={styles.featureItem}>🏆 Certifications</div>
        </div>
      </div>

      <div style={styles.tipBox}>
        <Award size={16} />
        <span><strong>Tip:</strong> Focus on candidates who match job requirements and show growth potential.</span>
      </div>
    </div>
  )

  const renderInterviews = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <Calendar size={24} color="#06b6d4" />
        Interviews
      </h3>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📅 Schedule an Interview</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Shortlisted</strong> tab</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>Click <strong>"Schedule Interview"</strong> on a candidate</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span>Fill in:
              <ul style={{ marginLeft: '1.5rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                <li>• Date & Time</li>
                <li>• Mode: Online/Offline/Phone</li>
                <li>• Meeting Link (for online)</li>
              </ul>
            </span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>4</span>
            <span>Click <strong>"Schedule"</strong> to confirm</span>
          </li>
        </ul>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📋 Interview Status</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ ...styles.badge, background: '#fef3c7', color: '#d97706' }}>🟡 Scheduled</span>
          <span style={{ ...styles.badge, background: '#d1fae5', color: '#059669' }}>🟢 Completed</span>
          <span style={{ ...styles.badge, background: '#fee2e2', color: '#dc2626' }}>🔴 Cancelled</span>
          <span style={{ ...styles.badge, background: '#dbeafe', color: '#3b82f6' }}>🔵 Rescheduled</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
          Update interview status to keep the pipeline accurate.
        </p>
      </div>

      <div style={styles.tipBox}>
        <Video size={16} />
        <span><strong>Tip:</strong> Always send the meeting link to the candidate before the interview.</span>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <Settings size={24} color="#8b5cf6" />
        Profile
      </h3>

      <div style={styles.card}>
        <div style={styles.cardTitle}>✏️ Update Profile</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Company Profile</strong> from the sidebar</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>Update company information:
              <ul style={{ marginLeft: '1.5rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                <li>• Company Name</li>
                <li>• HR Name & Phone</li>
                <li>• Industry & Location</li>
                <li>• Website</li>
              </ul>
            </span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span>Click <strong>"Save"</strong> to update changes</span>
          </li>
        </ul>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>🔑 Change Password</div>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>1</span>
            <span>Go to <strong>Settings</strong></span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>2</span>
            <span>Go to <strong>Security</strong> tab</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>3</span>
            <span>Click <strong>"Change Password"</strong></span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>4</span>
            <span>Enter current password and new password</span>
          </li>
          <li style={styles.stepItem}>
            <span style={styles.stepNumber}>5</span>
            <span>Click <strong>"Update"</strong> to confirm</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const renderFaq = () => (
    <div>
      <h3 style={styles.sectionTitle}>
        <HelpCircle size={24} color="#ef4444" />
        Frequently Asked Questions
      </h3>

      {faqs.map((faq, index) => (
        <div 
          key={faq.id}
          style={styles.faqItem}
          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
        >
          <div style={styles.faqQuestion}>
            <span>{faq.question}</span>
            <ChevronRight 
              size={16} 
              color="#94a3b8" 
              style={{ 
                transform: expandedFaq === faq.id ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} 
            />
          </div>
          {expandedFaq === faq.id && (
            <div style={styles.faqAnswer}>
              {faq.answer}
            </div>
          )}
        </div>
      ))}

      <div style={styles.tipBox}>
        <MessageCircle size={16} />
        <span><strong>Still have questions?</strong> Contact us at <a href="mailto:support@placementportal.com" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500' }}>support@placementportal.com</a></span>
      </div>
    </div>
  )

  // ============ RENDER SECTION ============
  const renderSection = () => {
    switch(activeSection) {
      case 'getting-started': return renderGettingStarted()
      case 'jobs': return renderJobs()
      case 'applications': return renderApplications()
      case 'shortlisting': return renderShortlisting()
      case 'interviews': return renderInterviews()
      case 'profile': return renderProfile()
      case 'faq': return renderFaq()
      default: return renderGettingStarted()
    }
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.titleWrapper}>
          <div>
            <div style={styles.title}>
              <BookOpen size={32} color="#7c3aed" />
              Documentation
              <span style={styles.titleBadge}>v1.0</span>
            </div>
            <div style={styles.subtitle}>
              Everything you need to know about the Company Dashboard
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            alignItems: 'center',
            padding: '0.3rem 0.8rem',
            background: '#f1f5f9',
            borderRadius: '8px',
            fontSize: '0.7rem',
            color: '#64748b'
          }}>
            <Calendar size={14} />
            Updated: August 2026
          </div>
        </div>
        
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search documentation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.contentWrapper}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>📚 Sections</div>
          {sections.map(section => {
            const Icon = section.icon
            return (
              <div 
                key={section.id}
                style={styles.sidebarItem(activeSection === section.id)}
                onClick={() => setActiveSection(section.id)}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.background = '#f1f5f9'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Icon size={16} />
                <span>{section.label}</span>
                {activeSection === section.id && <ChevronRight size={14} color="#7c3aed" style={{ marginLeft: 'auto' }} />}
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.sectionContent}>
            {renderSection()}
          </div>
          
          {/* Footer */}
          <div style={{ 
            marginTop: '2.5rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                📄 Documentation v1.0
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                • Last updated: August 2026
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Need more help?</span>
              <a 
                href="mailto:support@placementportal.com" 
                style={{ 
                  fontSize: '0.7rem', 
                  color: '#7c3aed', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Mail size={12} /> Contact Support
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '0.7rem', 
                  color: '#10b981', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default DocumentationPage