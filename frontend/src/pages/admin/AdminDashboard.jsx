import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, GraduationCap, Building2, Briefcase, Calendar,
  BarChart3, FileText, Bell, Settings, User, LogOut,
  ShieldCheck, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

// ✅ PATHS FIXED: `../../components/admin` se `./components` kar diya
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import DashboardOverview from './components/DashboardOverview'
import StudentManagement from './components/StudentManagement'
import CompanyManagement from './components/CompanyManagement'
import JobManagement from './components/JobManagement'
import PlacementDrives from './components/PlacementDrives'
import Analytics from './components/Analytics'
import Reports from './components/Reports'
import Notifications from './components/Notifications'
import SettingsComponent from './components/Settings'
import AdminProfile from './components/AdminProfile'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // ✅ TOKEN FIX: `'token'` ki jagah `'adminToken'` use kiya
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

    if (!token || storedUser?.role !== 'admin') {
      navigate('/login?role=admin')
      return
    }

    setIsAuthorized(true)
  }, [navigate])

  const handleLogout = () => {
    // ✅ TOKEN FIX
    localStorage.removeItem('adminToken')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/')
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            <StatsCards />
            <DashboardOverview />
          </>
        )
      case 'students':
        return <StudentManagement />
      case 'companies':
        return <CompanyManagement />
      case 'jobs':
        return <JobManagement />
      case 'drives':
        return <PlacementDrives />
      case 'analytics':
        return <Analytics />
      case 'reports':
        return <Reports />
      case 'notifications':
        return <Notifications />
      case 'settings':
        return <SettingsComponent />
      case 'profile':
        return <AdminProfile />
      default:
        return (
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <p>Content under development</p>
          </div>
        )
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
      display: 'flex'
    },
    mainContent: {
      marginLeft: sidebarOpen ? '260px' : '80px',
      padding: '1.5rem',
      width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 80px)',
      transition: 'all 0.3s'
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
          onLogout={handleLogout}
          onNotificationClick={() => setActiveTab('notifications')}
          onProfileClick={() => setActiveTab('profile')}
        />
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminDashboard