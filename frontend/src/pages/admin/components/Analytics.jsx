import React, { useState, useEffect, useCallback } from 'react'
import { 
  BarChart3, TrendingUp, Users, Briefcase, Award, 
  Calendar, Download, Target, Zap, Clock, CheckCircle,
  AlertCircle, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Analytics() {
  const [chartType, setChartType] = useState('applications')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  
  const [stats, setStats] = useState({
    totalApplications: 0,
    shortlisted: 0,
    offersSent: 0,
    hiringRate: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    avgPackage: 0,
    highestPackage: 0,
    placementRate: 0
  })
  
  const [monthlyData, setMonthlyData] = useState({
    applications: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    shortlisted: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    selected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  })
  
  const [branchData, setBranchData] = useState([
    { name: 'CSE', count: 0, percentage: 0, color: '#3b82f6' },
    { name: 'IT', count: 0, percentage: 0, color: '#10b981' },
    { name: 'ECE', count: 0, percentage: 0, color: '#f59e0b' },
    { name: 'EE', count: 0, percentage: 0, color: '#8b5cf6' },
    { name: 'ME', count: 0, percentage: 0, color: '#ec4899' },
    { name: 'Other', count: 0, percentage: 0, color: '#94a3b8' }
  ])
  
  const [packageData, setPackageData] = useState([
    { range: '3-6 LPA', count: 0, percentage: 0, color: '#10b981' },
    { range: '6-10 LPA', count: 0, percentage: 0, color: '#3b82f6' },
    { range: '10-15 LPA', count: 0, percentage: 0, color: '#f59e0b' },
    { range: '15-20 LPA', count: 0, percentage: 0, color: '#8b5cf6' },
    { range: '20+ LPA', count: 0, percentage: 0, color: '#ec4899' }
  ])
  
  const [hiringFunnel, setHiringFunnel] = useState([
    { stage: 'Applications Received', count: 0, percentage: 0, color: '#3b82f6' },
    { stage: 'Shortlisted', count: 0, percentage: 0, color: '#10b981' },
    { stage: 'Selected', count: 0, percentage: 0, color: '#8b5cf6' }
  ])
  
  const [recentActivities, setRecentActivities] = useState([])
  const [insights, setInsights] = useState({
    applicationGrowth: '+0%',
    shortlistedRate: '0%',
    selectedRate: '0%',
    topBranch: 'N/A',
    topBranchPercentage: 0,
    highestPackage: '0 LPA',
    placementRate: '0%'
  })

  const token = localStorage.getItem('adminToken')

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success) {
        // Stats set karo
        const statsData = response.data.stats || {}
        setStats({
          totalStudents: statsData.totalStudents || 0,
          totalCompanies: statsData.totalCompanies || 0,
          totalJobs: statsData.totalJobs || 0,
          avgPackage: statsData.avgPackage || 0,
          highestPackage: statsData.highestPackage || 0,
          placementRate: statsData.placementRate || 0,
          totalApplications: statsData.totalApplications || 0,
          shortlisted: statsData.shortlisted || 0,
          offersSent: statsData.offersSent || 0,
          hiringRate: statsData.hiringRate || 0
        })
        
        // Monthly Data
        if (response.data.monthlyData) {
          setMonthlyData({
            applications: response.data.monthlyData.applications || [0,0,0,0,0,0,0,0,0,0,0,0],
            shortlisted: response.data.monthlyData.shortlisted || [0,0,0,0,0,0,0,0,0,0,0,0],
            selected: response.data.monthlyData.selected || [0,0,0,0,0,0,0,0,0,0,0,0],
            months: response.data.monthlyData.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          })
        }
        
        // Branch Data
        if (response.data.branchData && response.data.branchData.length > 0) {
          setBranchData(response.data.branchData)
        }
        
        // Package Data
        if (response.data.packageData && response.data.packageData.length > 0) {
          setPackageData(response.data.packageData)
        }
        
        // Hiring Funnel
        if (response.data.hiringFunnel && response.data.hiringFunnel.length > 0) {
          setHiringFunnel(response.data.hiringFunnel)
        }
        
        // Recent Activities
        if (response.data.recentActivities && response.data.recentActivities.length > 0) {
          setRecentActivities(response.data.recentActivities)
        }
        
        // ✅ Insights set karo
        if (response.data.insights) {
          setInsights({
            applicationGrowth: response.data.insights.applicationGrowth || '+0%',
            shortlistedRate: response.data.insights.shortlistedRate || '0%',
            selectedRate: response.data.insights.selectedRate || '0%',
            topBranch: response.data.insights.topBranch || 'N/A',
            topBranchPercentage: response.data.insights.topBranchPercentage || 0,
            highestPackage: response.data.insights.highestPackage || '0 LPA',
            placementRate: response.data.insights.placementRate || '0%'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchAnalyticsData()
    } else {
      setLoading(false)
    }
  }, [token, fetchAnalyticsData])

  // --- EXPORT TO EXCEL ---
  const handleDownload = () => {
    setExporting(true)
    try {
      const wb = XLSX.utils.book_new()
      
      // Sheet 1: Monthly Trends
      const monthlyExportData = monthlyData.months.map((month, idx) => ({
        'Month': month,
        'Applications': monthlyData.applications[idx] || 0,
        'Shortlisted': monthlyData.shortlisted[idx] || 0,
        'Selected': monthlyData.selected[idx] || 0
      }))
      const ws1 = XLSX.utils.json_to_sheet(monthlyExportData)
      XLSX.utils.book_append_sheet(wb, ws1, 'Monthly Trends')
      
      // Sheet 2: Branch Distribution
      const branchExportData = branchData.map(b => ({
        'Branch': b.name,
        'Count': b.count || 0,
        'Percentage': (b.percentage || 0) + '%'
      }))
      const ws2 = XLSX.utils.json_to_sheet(branchExportData)
      XLSX.utils.book_append_sheet(wb, ws2, 'Branch Distribution')
      
      // Sheet 3: Package Distribution
      const packageExportData = packageData.map(p => ({
        'Package Range': p.range,
        'Offers': p.count || 0,
        'Percentage': (p.percentage || 0) + '%'
      }))
      const ws3 = XLSX.utils.json_to_sheet(packageExportData)
      XLSX.utils.book_append_sheet(wb, ws3, 'Package Distribution')
      
      // Sheet 4: Hiring Funnel
      const funnelExportData = hiringFunnel.map(f => ({
        'Stage': f.stage,
        'Count': f.count || 0,
        'Percentage': (f.percentage || 0) + '%'
      }))
      const ws4 = XLSX.utils.json_to_sheet(funnelExportData)
      XLSX.utils.book_append_sheet(wb, ws4, 'Hiring Funnel')
      
      // Sheet 5: Key Stats
      const statsExportData = [
        { 'Metric': 'Total Students', 'Value': stats.totalStudents },
        { 'Metric': 'Total Companies', 'Value': stats.totalCompanies },
        { 'Metric': 'Active Jobs', 'Value': stats.totalJobs },
        { 'Metric': 'Total Applications', 'Value': stats.totalApplications },
        { 'Metric': 'Shortlisted', 'Value': stats.shortlisted },
        { 'Metric': 'Offers Sent', 'Value': stats.offersSent },
        { 'Metric': 'Placement Rate', 'Value': stats.placementRate + '%' },
        { 'Metric': 'Hiring Rate', 'Value': stats.hiringRate + '%' },
        { 'Metric': 'Average Package', 'Value': stats.avgPackage + ' LPA' },
        { 'Metric': 'Highest Package', 'Value': stats.highestPackage + ' LPA' }
      ]
      const ws5 = XLSX.utils.json_to_sheet(statsExportData)
      XLSX.utils.book_append_sheet(wb, ws5, 'Key Statistics')
      
      XLSX.writeFile(wb, `analytics_report_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Analytics report downloaded successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to download report')
    } finally {
      setExporting(false)
    }
  }

  // --- CHART HELPER FUNCTIONS ---
  const getMaxValue = () => {
    const data = chartType === 'applications'
      ? monthlyData.applications
      : chartType === 'shortlisted'
        ? monthlyData.shortlisted
        : monthlyData.selected
    if (!data || data.length === 0) return 1
    return Math.max(...data, 1)
  }

  const getBarHeight = (value) => {
    const max = getMaxValue()
    return (value / max) * 150
  }

  // ============ STYLES ============
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
    downloadBtn: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      color: '#059669',
      border: '1px solid #059669',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: (color) => ({
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      borderTop: `3px solid ${color}`
    }),
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.65rem',
      color: '#64748b'
    },
    chartCard: {
      background: '#fafcff',
      borderRadius: '20px',
      padding: '1.25rem',
      border: '1px solid #e2e8f0',
      marginBottom: '1.5rem'
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    chartTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    tabsContainer: {
      display: 'flex',
      gap: '0.5rem',
      background: '#f1f5f9',
      padding: '0.25rem',
      borderRadius: '12px'
    },
    tab: (active) => ({
      padding: '0.25rem 0.75rem',
      background: active ? 'white' : 'transparent',
      color: active ? '#059669' : '#64748b',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.7rem',
      fontWeight: '500'
    }),
    chartContainer: {
      position: 'relative',
      height: '200px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '1rem',
      padding: '0.5rem 0'
    },
    barWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    },
    bar: (height, color) => ({
      width: '100%',
      height: `${height}px`,
      background: color,
      borderRadius: '8px',
      transition: 'height 0.5s ease',
      minHeight: '4px'
    }),
    barLabel: {
      fontSize: '0.6rem',
      color: '#64748b',
      textAlign: 'center'
    },
    legend: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.7rem',
      color: '#64748b'
    },
    legendColor: (color) => ({
      width: '12px',
      height: '12px',
      background: color,
      borderRadius: '3px'
    }),
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    funnelContainer: {
      marginTop: '1rem'
    },
    funnelStep: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      padding: '0.5rem',
      background: '#f8fafc',
      borderRadius: '12px'
    },
    funnelStage: {
      width: '140px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#1e293b'
    },
    funnelBar: (percentage, color) => ({
      flex: 1,
      height: '8px',
      background: color,
      borderRadius: '4px',
      width: `${percentage}%`,
      transition: 'width 0.5s ease',
      maxWidth: '100%'
    }),
    funnelCount: {
      width: '60px',
      textAlign: 'right',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    funnelPercentage: {
      width: '50px',
      textAlign: 'right',
      fontSize: '0.65rem',
      color: '#64748b'
    },
    activitiesList: {
      marginTop: '0.5rem',
      maxHeight: '300px',
      overflowY: 'auto'
    },
    activityItem: (type) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '0.75rem',
      color: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'
    }),
    insightCard: {
      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      borderRadius: '16px',
      padding: '1rem'
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading analytics...</p>
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
          <span>Placement Analytics</span>
        </div>
        <button onClick={handleDownload} style={styles.downloadBtn} disabled={exporting}>
          <Download size={14} /> {exporting ? 'Exporting...' : 'Download Report'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.totalStudents || 0}</div>
          <div style={styles.statLabel}>Total Students</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.totalCompanies || 0}</div>
          <div style={styles.statLabel}>Companies</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.totalJobs || 0}</div>
          <div style={styles.statLabel}>Active Jobs</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.avgPackage || 0} LPA</div>
          <div style={styles.statLabel}>Avg Package</div>
        </div>
      </div>

      {/* Application Trends Chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div style={styles.chartTitle}>
            <TrendingUp size={16} color="#059669" />
            <span>Application Trends</span>
          </div>
          <div style={styles.tabsContainer}>
            <button onClick={() => setChartType('applications')} style={styles.tab(chartType === 'applications')}>Applications</button>
            <button onClick={() => setChartType('shortlisted')} style={styles.tab(chartType === 'shortlisted')}>Shortlisted</button>
            <button onClick={() => setChartType('selected')} style={styles.tab(chartType === 'selected')}>Selected</button>
          </div>
        </div>
        <div style={styles.chartContainer}>
          {monthlyData.months.map((month, idx) => {
            const value = chartType === 'applications'
              ? monthlyData.applications[idx] || 0
              : chartType === 'shortlisted'
                ? monthlyData.shortlisted[idx] || 0
                : monthlyData.selected[idx] || 0
            const color = chartType === 'applications'
              ? '#3b82f6'
              : chartType === 'shortlisted'
                ? '#10b981'
                : '#8b5cf6'
            return (
              <div key={month} style={styles.barWrapper}>
                <div style={styles.bar(getBarHeight(value), color)} title={`${value} ${chartType}`}></div>
                <div style={styles.barLabel}>{month}</div>
              </div>
            )
          })}
        </div>
        <div style={styles.legend}>
          <div style={styles.legendItem}><div style={styles.legendColor('#3b82f6')}></div><span>Applications</span></div>
          <div style={styles.legendItem}><div style={styles.legendColor('#10b981')}></div><span>Shortlisted</span></div>
          <div style={styles.legendItem}><div style={styles.legendColor('#8b5cf6')}></div><span>Selected</span></div>
        </div>
      </div>

      {/* Branch Wise & Package Distribution */}
      <div style={styles.twoColumnGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}><Users size={16} color="#059669" /> Branch Wise Distribution</div>
          {branchData.every(b => b.count === 0) ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>No branch data available</p>
          ) : (
            branchData.filter(b => b.count > 0).map(branch => (
              <div key={branch.name} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{branch.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{branch.percentage || 0}% ({branch.count || 0})</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${branch.percentage || 0}%`, height: '100%', background: branch.color || '#94a3b8', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}><Award size={16} color="#059669" /> Package Distribution</div>
          {packageData.every(p => p.count === 0) ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>No package data available</p>
          ) : (
            packageData.filter(p => p.count > 0).map(pkg => (
              <div key={pkg.range} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{pkg.range}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{pkg.percentage || 0}% ({pkg.count || 0})</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pkg.percentage || 0}%`, height: '100%', background: pkg.color || '#94a3b8', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hiring Funnel */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}><Target size={16} color="#059669" /> Hiring Funnel</div>
        <div style={styles.funnelContainer}>
          {hiringFunnel.every(f => f.count === 0) ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem 0' }}>No funnel data available</p>
          ) : (
            hiringFunnel.map((stage) => (
              <div key={stage.stage} style={styles.funnelStep}>
                <div style={styles.funnelStage}>{stage.stage}</div>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={styles.funnelBar(stage.percentage || 0, stage.color)}></div>
                  </div>
                </div>
                <div style={styles.funnelCount}>{stage.count || 0}</div>
                <div style={styles.funnelPercentage}>{stage.percentage || 0}%</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activities & Insights */}
      <div style={styles.twoColumnGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}><Clock size={16} color="#059669" /> Recent Activities</div>
          <div style={styles.activitiesList}>
            {recentActivities.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem 0' }}>No recent activities</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={activity.id || index} style={styles.activityItem(activity.type || 'info')}>
                  {activity.type === 'success' ? <CheckCircle size={12} /> : activity.type === 'warning' ? <AlertCircle size={12} /> : <Bell size={12} />}
                  <span style={{ flex: 1 }}>{activity.action || 'New activity'}</span>
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{activity.time || 'Just now'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.insightCard}>
          <div style={styles.chartTitle}><Zap size={16} color="#059669" /> Key Insights</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#059669' }}>{insights.applicationGrowth || '+0%'}</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Application Growth</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#059669' }}>{insights.topBranchPercentage || 0}%</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{insights.topBranch || 'N/A'} Students</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#059669' }}>{insights.highestPackage || '0 LPA'}</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Highest Package</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#059669' }}>{insights.placementRate || '0%'}</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Placement Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics