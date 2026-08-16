import { TrendingUp, Users, Briefcase, Award, Clock, CheckCircle, UserCheck, UserPlus, FileText, XCircle, Building2 } from 'lucide-react'

function StatsCards({ stats }) {
  const statCards = [
    { 
      title: 'Employees', 
      value: stats.employeeCount || stats.employees || 0, 
      icon: Users, 
      color: '#3b82f6', 
      bg: '#dbeafe',
      subtitle: 'Total Staff'
    },
    { 
      title: 'Total Jobs', 
      value: stats.totalJobs || 0, 
      icon: Briefcase, 
      color: '#10b981', 
      bg: '#d1fae5',
      subtitle: `${stats.activeJobs || 0} Active`
    },
    { 
      title: 'Applications', 
      value: stats.totalApplications || 0, 
      icon: FileText, 
      color: '#8b5cf6', 
      bg: '#ede9fe',
      subtitle: `${stats.pending || 0} Pending`
    },
    { 
      title: 'Shortlisted', 
      value: stats.shortlisted || 0, 
      icon: UserCheck, 
      color: '#f59e0b', 
      bg: '#fef3c7',
      subtitle: `${stats.interview || 0} Interview`
    },
    { 
      title: 'Offers Sent', 
      value: stats.offersSent || 0, 
      icon: Award, 
      color: '#ec4899', 
      bg: '#fce7f3',
      subtitle: `${stats.hiringRate || 0}% Hiring Rate`
    },
    { 
      title: 'Rejected', 
      value: stats.rejected || 0, 
      icon: XCircle, 
      color: '#ef4444', 
      bg: '#fee2e2',
      subtitle: 'Not selected'
    }
  ]

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    card: (color, bg) => ({
      background: 'white',
      borderRadius: '20px',
      padding: '1rem',
      borderTop: `3px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      cursor: 'default'
    }),
    value: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' },
    title: { fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' },
    subtitle: { fontSize: '0.55rem', color: '#94a3b8', marginTop: '0.15rem' },
    iconWrapper: (color) => ({
      width: '36px',
      height: '36px',
      background: color,
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.8
    })
  }

  return (
    <div style={styles.container}>
      {statCards.map(stat => {
        const Icon = stat.icon
        return (
          <div key={stat.title} style={styles.card(stat.color, stat.bg)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={styles.value}>{stat.value}</div>
                <div style={styles.title}>{stat.title}</div>
                {stat.subtitle && <div style={styles.subtitle}>{stat.subtitle}</div>}
              </div>
              <div style={styles.iconWrapper(stat.color)}>
                <Icon size={18} color="white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards