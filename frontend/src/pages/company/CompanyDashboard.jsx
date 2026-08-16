import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

// ✅ Components
import Analytics from './components/Analytics'
import InterviewManagement from './components/InterviewManagement'
import ManageJobs from './components/ManageJobs'
import ApplicationsList from './components/ApplicationsList'
import EligibleStudents from './components/EligibleStudents'
import ShortlistedStudents from './components/ShortlistedStudents'
import Notifications from './components/Notifications'
import CompanyProfile from './components/CompanyProfile'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import PostJob from './components/PostJob'
import RecruitmentPipeline from './components/RecruitmentPipeline'
import DocumentationPage from './components/DocumentationPage'

// ✅ API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getStoredCompany = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  const displayName = storedUser?.companyName || storedUser?.name || 'Company'

  return {
    name: displayName,
    email: storedUser?.email || '',
    logo: displayName[0] || 'C',
    website: '',
    industry: '',
    hrName: storedUser?.name || displayName,
    phone: '',
    location: ''
  }
}

function CompanyDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [company, setCompany] = useState(getStoredCompany)

  useEffect(() => {
    const token = localStorage.getItem('companyToken')
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

    if (!token || storedUser?.role !== 'company') {
      navigate('/login?role=company')
      return
    }

    setIsAuthorized(true)
    setCompany(getStoredCompany())
  }, [navigate])

  // ✅ Stats - ADD employeeCount
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    offersSent: 0,
    hiringRate: 0,
    employeeCount: 0,  // ✅ ADD THIS
    activeJobs: 0,     // ✅ ADD THIS
    rejected: 0        // ✅ ADD THIS
  })

  // Jobs Data
  const [jobs, setJobs] = useState([])

  // Applications Data
  const [applications, setApplications] = useState([])

  // Notifications
  const [notifications, setNotifications] = useState([])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!isAuthorized) return

    const token = localStorage.getItem('companyToken')
    const headers = { Authorization: `Bearer ${token}` }

    const loadDashboardData = async () => {
      try {
        const storedCompany = getStoredCompany()
        
        const [profileResponse, statsResponse, jobsResponse, applicationsResponse, notificationsResponse] = await Promise.all([
          axios.get(`${API_URL}/company/profile`, { headers }),
          axios.get(`${API_URL}/company/stats/dashboard`, { headers }),
          axios.get(`${API_URL}/company/jobs`, { headers }),
          axios.get(`${API_URL}/company/applications`, { headers }),
          axios.get(`${API_URL}/company/notifications`, { headers })
        ])

        // Profile
        if (profileResponse.data?.success) {
          const profile = profileResponse.data
          const displayName = profile.companyName || profile.name || storedCompany.name
          setCompany({
            name: displayName,
            email: profile.email || profile.hrEmail || storedCompany.email,
            logo: profile.logo || displayName?.[0] || 'C',
            website: profile.website || '',
            industry: profile.industry || '',
            hrName: profile.hrName || profile.name || displayName,
            phone: profile.phone || '',
            location: profile.location || ''
          })
        }

        // ✅ Stats - Log and set
        if (statsResponse.data?.success && statsResponse.data.stats) {
          console.log('📊 Stats from backend:', statsResponse.data.stats)
          setStats(statsResponse.data.stats)
        }

        // Jobs
        if (jobsResponse.data?.success && jobsResponse.data.jobs) {
          setJobs(jobsResponse.data.jobs)
        }

        // Applications
        if (applicationsResponse.data?.success && applicationsResponse.data.applications) {
          setApplications(applicationsResponse.data.applications)
        }

        // Notifications
        if (notificationsResponse.data?.success && notificationsResponse.data.notifications) {
          setNotifications(notificationsResponse.data.notifications)
        }
      } catch (error) {
        console.error('Error loading company dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [isAuthorized])

  const handleLogout = () => {
    localStorage.removeItem('companyToken')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleUpdateJobStatus = (jobId, newStatus) => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job))
    toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'}!`)
  }

  const handleDeleteJob = (jobId) => {
    setJobs(jobs.filter(job => job.id !== jobId))
    toast.success('Job deleted!')
  }

  const handleAddJob = (newJob) => {
    const formattedJob = {
      id: newJob.id || Date.now(),
      title: newJob.title,
      package: newJob.package,
      location: newJob.location,
      applications: 0,
      status: 'active',
      deadline: newJob.deadline ? new Date(newJob.deadline).toLocaleDateString() : 'N/A',
      eligibility: newJob.eligibility || 0,
      skills: newJob.skills || [],
      type: newJob.jobType || 'Full-time',
      postedDate: new Date().toLocaleDateString(),
      openings: newJob.openings || 1
    }
    setJobs(prevJobs => [formattedJob, ...prevJobs])
    setStats(prevStats => ({
      ...prevStats,
      totalJobs: prevStats.totalJobs + 1
    }))
    setShowPostJobModal(false)
  }

  const handleUpdateStatus = (applicationId, newStatus) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ))
    toast.success(`Application ${newStatus} successfully!`)
  }

  // ============ RENDER CONTENT ============
  const renderContent = () => {
    console.log('📄 Current Active Tab:', activeTab);
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            <StatsCards stats={stats} />
            <RecruitmentPipeline applications={applications} />
          </>
        )
      case 'jobs':
        return <ManageJobs 
          jobs={jobs} 
          onUpdate={setJobs} 
          onDelete={handleDeleteJob} 
          onPostJob={() => setShowPostJobModal(true)} 
        />
      case 'applications':
        return <ApplicationsList applications={applications} onUpdateStatus={handleUpdateStatus} />
      case 'shortlisted':
        return <ShortlistedStudents />
      case 'interviews':
        return <InterviewManagement applications={applications} />
      case 'eligible':
        return <EligibleStudents />
      case 'analytics':
        return <Analytics />
      case 'notifications':
        return <Notifications notifications={notifications} setNotifications={setNotifications} />
      case 'profile':
        return <CompanyProfile />
      case 'documentation':
        return <DocumentationPage />
      default:
        return (
          <>
            <StatsCards stats={stats} />
            <RecruitmentPipeline applications={applications} />
          </>
        )
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
      display: 'flex'
    },
    mainContent: {
      marginLeft: sidebarOpen ? '280px' : '80px',
      padding: '1.5rem',
      width: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
      maxWidth: '700px',
      width: '90%',
      maxHeight: '85vh',
      overflow: 'auto',
      position: 'relative'
    }
  }

  if (!isAuthorized) return null

  return (
  <div style={styles.container}>
    <Sidebar 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen} 
    />
    <div style={styles.mainContent}>
      <Header 
        company={company}
        stats={stats}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        onNotificationClick={() => setActiveTab('notifications')}
        onProfileClick={() => setActiveTab('profile')}
        onDocumentationClick={() => setActiveTab('documentation')}
      />
      {renderContent()}
    </div>

    {showPostJobModal && (
      <div style={styles.modalOverlay} onClick={() => setShowPostJobModal(false)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <PostJob onJobPosted={handleAddJob} onClose={() => setShowPostJobModal(false)} />
        </div>
      </div>
    )}
  </div>
)
}

export default CompanyDashboard