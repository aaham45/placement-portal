import { 
  LayoutDashboard, Briefcase, FileText, Users, UserCheck, 
  Calendar, BarChart3, Bell, Building, LogOut, 
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#f59e0b' },
    { id: 'jobs', label: 'Manage Jobs', icon: Briefcase, color: '#3b82f6' },
    { id: 'applications', label: 'Applications', icon: FileText, color: '#10b981' },
    { id: 'shortlisted', label: 'Shortlisted', icon: UserCheck, color: '#8b5cf6' },
    { id: 'interviews', label: 'Interviews', icon: Calendar, color: '#ec4899' },
    { id: 'eligible', label: 'Eligible Students', icon: Users, color: '#06b6d4' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: '#f97316' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: '#a855f7' },
    { id: 'profile', label: 'Company Profile', icon: Building, color: '#64748b' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('companyId')
    toast.success('Logged out successfully!')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }

  const styles = {
    sidebar: {
      width: sidebarOpen ? '260px' : '80px',
      background: 'white',
      transition: 'all 0.3s',
      position: 'fixed',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      zIndex: 1000
    },
    sidebarHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #059669, #10b981)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem'
    },
    logoText: {
      fontWeight: '700',
      color: '#1e293b'
    },
    toggleBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.8rem',
      color: '#64748b'
    },
    nav: {
      flex: 1,
      padding: '0.75rem'
    },
    navItem: (isActive, color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      margin: '0.25rem 0.75rem',
      background: isActive ? `${color}15` : 'transparent',
      color: isActive ? color : '#64748b',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    }),
    iconContainer: {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    navLabel: {
      fontSize: '0.85rem',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      color: '#1e293b'
    },
    tooltip: {
      position: 'absolute',
      left: '70px',
      background: '#1e293b',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '8px',
      fontSize: '0.7rem',
      whiteSpace: 'nowrap',
      zIndex: 100,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    footer: {
      padding: '1rem',
      borderTop: '1px solid #e2e8f0',
      margin: '0.75rem'
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.7rem 1rem',
      background: '#fee2e2',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#dc2626'
    }
  }

  return (
    <div style={styles.sidebar}>
      {/* Header Section */}
      <div>
        <div style={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.logoIcon}>🎓</div>
            {sidebarOpen && <span style={styles.logoText}>CUTM Recruit</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleBtn}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu */}
        <div style={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isHovered = hoveredItem === item.id
            
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={styles.navItem(isActive, item.color)}
              >
                <div style={styles.iconContainer}>
                  <Icon size={18} color={isActive ? item.color : '#64748b'} />
                </div>
                {sidebarOpen && (
                  <span style={styles.navLabel}>{item.label}</span>
                )}
                {!sidebarOpen && isHovered && (
                  <div style={styles.tooltip}>{item.label}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer - Logout Button */}
      <div style={styles.footer}>
        <div onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </div>
      </div>
    </div>
  )
}

export default Sidebar


