import React, { useState, useEffect, useCallback } from 'react'
import { 
  FileText, Download, Calendar, Printer, Mail, 
  RefreshCw, Users, Building2, Briefcase, Award,
  TrendingUp, PieChart, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Reports() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('placement')
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  
  const [reportData, setReportData] = useState(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')

  const token = localStorage.getItem('adminToken')

  // --- FETCH REPORT DATA ---
  const fetchReport = useCallback(async () => {
    setGenerating(true)
    setLoading(true)
    setReportData(null)
    
    try {
      const params = new URLSearchParams({
        type: reportType,
        dateRange: dateRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const response = await axios.get(`${API_URL}/admin/reports/${reportType}?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success && response.data.report) {
        setReportData(response.data.report)
        toast.success('Report generated successfully!')
      } else {
        setReportData(null)
        toast.error(response.data.message || 'No data found for the selected criteria')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setReportData(null)
      toast.error('Failed to fetch report data from server')
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }, [reportType, dateRange, startDate, endDate, token])

  useEffect(() => {
    if (token) {
      fetchReport()
    } else {
      setReportData(null)
      setLoading(false)
    }
  }, [reportType, dateRange, fetchReport, token])

  // --- DOWNLOAD PDF ---
  const handleDownloadPDF = () => {
    if (!reportData) {
      toast.error('No report data to download')
      return
    }
    
    try {
      const printContent = document.getElementById('report-content')
      if (!printContent) {
        toast.error('No content to generate PDF')
        return
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportData.title || 'Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #059669; text-align: center; font-size: 24px; }
            .date { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
            .summary-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px; }
            .summary-card { flex: 1; min-width: 150px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; border-top: 3px solid #059669; }
            .summary-value { font-size: 24px; font-weight: bold; color: #059669; }
            .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #059669; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px; color: #333; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
        </html>
      `
      
      const blob = new Blob([htmlContent], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${(reportData.title || 'report').toLowerCase().replace(/ /g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  // --- EXPORT TO EXCEL ---
  const handleDownloadExcel = () => {
    if (!reportData) {
      toast.error('No report data to download')
      return
    }
    
    try {
      const wb = XLSX.utils.book_new()
      let hasData = false
      
      if (reportType === 'placement') {
        // Summary Sheet
        const summaryData = [
          ['Metric', 'Value'],
          ['Total Students', reportData.summary?.totalStudents || 0],
          ['Total Placed', reportData.summary?.totalPlaced || 0],
          ['Placement Rate', `${reportData.summary?.placementRate || 0}%`],
          ['Highest Package', `${reportData.summary?.highestPackage || 0} LPA`],
          ['Average Package', `${reportData.summary?.avgPackage || 0} LPA`],
          ['Total Companies', reportData.summary?.totalCompanies || 0]
        ]
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary')
        hasData = true
        
        // Branch Wise Sheet
        if (reportData.branchWise && reportData.branchWise.length > 0) {
          const branchData = [['Branch', 'Total Students', 'Placed', 'Rate']]
          reportData.branchWise.forEach(b => branchData.push([b.branch, b.total, b.placed, `${b.rate}%`]))
          const ws2 = XLSX.utils.aoa_to_sheet(branchData)
          XLSX.utils.book_append_sheet(wb, ws2, 'Branch Wise')
          hasData = true
        }
        
        // Company Wise Sheet
        if (reportData.companyWise && reportData.companyWise.length > 0) {
          const companyData = [['Company', 'Offers', 'Highest Package', 'Avg Package']]
          reportData.companyWise.forEach(c => companyData.push([c.company, c.offers, `${c.highestPackage} LPA`, `${c.avgPackage} LPA`]))
          const ws3 = XLSX.utils.aoa_to_sheet(companyData)
          XLSX.utils.book_append_sheet(wb, ws3, 'Company Wise')
          hasData = true
        }
      } else if (reportType === 'student') {
        // Top Performers Sheet
        if (reportData.topPerformers && reportData.topPerformers.length > 0) {
          const performerData = [['Name', 'Branch', 'CGPA', 'Placed At', 'Package']]
          reportData.topPerformers.forEach(p => performerData.push([p.name, p.branch, p.cgpa, p.placed, p.package]))
          const ws1 = XLSX.utils.aoa_to_sheet(performerData)
          XLSX.utils.book_append_sheet(wb, ws1, 'Top Performers')
          hasData = true
        }
        
        // CGPA Distribution Sheet
        if (reportData.cgpaDistribution && reportData.cgpaDistribution.length > 0) {
          const cgpaData = [['CGPA Range', 'Students', 'Percentage']]
          reportData.cgpaDistribution.forEach(c => cgpaData.push([c.range, c.count, `${c.percentage}%`]))
          const ws2 = XLSX.utils.aoa_to_sheet(cgpaData)
          XLSX.utils.book_append_sheet(wb, ws2, 'CGPA Distribution')
          hasData = true
        }
      } else if (reportType === 'company') {
        // Company Wise Sheet
        if (reportData.companies && reportData.companies.length > 0) {
          const companyData = [['Company', 'Total Hired', 'Avg Package', 'Top Branch']]
          reportData.companies.forEach(c => companyData.push([c.name, c.totalHired, `${c.avgPackage} LPA`, c.topBranch]))
          const ws1 = XLSX.utils.aoa_to_sheet(companyData)
          XLSX.utils.book_append_sheet(wb, ws1, 'Company Wise')
          hasData = true
        }
        
        // Industry Wise Sheet
        if (reportData.industryWise && reportData.industryWise.length > 0) {
          const industryData = [['Industry', 'Companies', 'Percentage']]
          reportData.industryWise.forEach(i => industryData.push([i.industry, i.count, `${i.percentage}%`]))
          const ws2 = XLSX.utils.aoa_to_sheet(industryData)
          XLSX.utils.book_append_sheet(wb, ws2, 'Industry Wise')
          hasData = true
        }
      }
      
      if (!hasData) {
        toast.error('No data available to export')
        return
      }
      
      XLSX.writeFile(wb, `${(reportData.title || 'report').toLowerCase().replace(/ /g, '_')}.xlsx`)
      toast.success('Excel file downloaded successfully!')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to export Excel')
    }
  }

  // --- PRINT REPORT ---
  const handlePrint = () => {
    if (!reportData) {
      toast.error('No content to print')
      return
    }
    
    const printContent = document.getElementById('report-content')
    if (!printContent) {
      toast.error('No content to print')
      return
    }
    
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      toast.error('Please allow popups for this site')
      return
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportData.title || 'Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #059669; text-align: center; font-size: 24px; }
            .date { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
            .summary-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px; }
            .summary-card { flex: 1; min-width: 150px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; border-top: 3px solid #059669; }
            .summary-value { font-size: 24px; font-weight: bold; color: #059669; }
            .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #059669; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px; color: #333; }
            .report-header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 500)
    
    toast.success('Print dialog opened!')
  }

  // --- SEND EMAIL ---
  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setSendingEmail(true)
    try {
      const response = await axios.post(`${API_URL}/admin/reports/send-email`, {
        email: emailAddress,
        reportType: reportType,
        reportData: reportData
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.data.success) {
        toast.success(`Report sent to ${emailAddress} successfully!`)
        setEmailModalOpen(false)
        setEmailAddress('')
      } else {
        toast.error(response.data.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('Email send error:', error)
      toast.error('Failed to send email to server')
    } finally {
      setSendingEmail(false)
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
    actionBtns: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    actionBtn: {
      padding: '0.4rem 0.8rem',
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    filtersBar: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '16px'
    },
    filterGroup: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    filterLabel: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#64748b'
    },
    reportTypeBtn: (isActive) => ({
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      background: isActive ? '#059669' : '#f1f5f9',
      color: isActive ? 'white' : '#64748b',
      transition: 'all 0.2s ease'
    }),
    dateSelect: {
      padding: '0.4rem 0.8rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.7rem',
      background: 'white',
      cursor: 'pointer'
    },
    generateBtn: {
      padding: '0.4rem 1rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    reportContainer: {
      marginTop: '1rem'
      // ✅ Scrolling hata diya
    },
    reportHeader: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e2e8f0'
    },
    reportTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    reportDate: {
      fontSize: '0.7rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    summaryCard: (color) => ({
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      textAlign: 'center',
      borderTop: `3px solid ${color}`
    }),
    summaryValue: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    summaryLabel: {
      fontSize: '0.6rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '1.5rem'
    },
    th: {
      textAlign: 'left',
      padding: '0.5rem',
      borderBottom: '2px solid #e2e8f0',
      fontSize: '0.7rem',
      fontWeight: '600',
      color: '#64748b'
    },
    td: {
      padding: '0.5rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '0.75rem'
    },
    chartContainer: {
      marginBottom: '1.5rem'
    },
    chartBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    chartLabel: {
      width: '80px',
      fontSize: '0.7rem',
      color: '#64748b'
    },
    chartBarFill: (width, color) => ({
      flex: 1,
      height: '24px',
      background: color,
      width: `${Math.min(width, 100)}%`,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '0.5rem',
      fontSize: '0.6rem',
      color: 'white',
      fontWeight: '500',
      minWidth: '30px'
    }),
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
    },
    noData: {
      textAlign: 'center',
      padding: '3rem',
      color: '#94a3b8'
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
      padding: '1.5rem',
      maxWidth: '450px',
      width: '90%'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
    },
    modalTitle: {
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      color: '#64748b'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#64748b',
      marginBottom: '0.25rem'
    },
    formInput: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.85rem',
      outline: 'none'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    btnPrimary: {
      flex: 1,
      padding: '0.6rem',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    btnSecondary: {
      flex: 1,
      padding: '0.6rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Generating report...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  const renderPlacementReport = () => (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard('#3b82f6')}>
          <div style={styles.summaryValue}>{reportData?.summary?.totalStudents || 0}</div>
          <div style={styles.summaryLabel}>Total Students</div>
        </div>
        <div style={styles.summaryCard('#10b981')}>
          <div style={styles.summaryValue}>{reportData?.summary?.totalPlaced || 0}</div>
          <div style={styles.summaryLabel}>Total Placed</div>
        </div>
        <div style={styles.summaryCard('#f59e0b')}>
          <div style={styles.summaryValue}>{reportData?.summary?.placementRate || 0}%</div>
          <div style={styles.summaryLabel}>Placement Rate</div>
        </div>
        <div style={styles.summaryCard('#8b5cf6')}>
          <div style={styles.summaryValue}>{reportData?.summary?.highestPackage || 0} LPA</div>
          <div style={styles.summaryLabel}>Highest Package</div>
        </div>
        <div style={styles.summaryCard('#ec4899')}>
          <div style={styles.summaryValue}>{reportData?.summary?.avgPackage || 0} LPA</div>
          <div style={styles.summaryLabel}>Avg Package</div>
        </div>
        <div style={styles.summaryCard('#06b6d4')}>
          <div style={styles.summaryValue}>{reportData?.summary?.totalCompanies || 0}</div>
          <div style={styles.summaryLabel}>Companies</div>
        </div>
      </div>

      <div style={styles.sectionTitle}><Users size={16} color="#3b82f6" /> Branch-wise Placement</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Branch</th>
            <th style={styles.th}>Total Students</th>
            <th style={styles.th}>Placed</th>
            <th style={styles.th}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.branchWise && reportData.branchWise.length > 0 ? (
            reportData.branchWise.map((item) => (
              <tr key={item.branch}>
                <td style={styles.td}>{item.branch}</td>
                <td style={styles.td}>{item.total}</td>
                <td style={styles.td}>{item.placed}</td>
                <td style={styles.td}>{item.rate}%</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No branch data available</td></tr>
          )}
        </tbody>
      </table>

      <div style={styles.sectionTitle}><Building2 size={16} color="#10b981" /> Company-wise Hiring</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Company</th>
            <th style={styles.th}>Offers</th>
            <th style={styles.th}>Highest Package</th>
            <th style={styles.th}>Avg Package</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.companyWise && reportData.companyWise.length > 0 ? (
            reportData.companyWise.map((item) => (
              <tr key={item.company}>
                <td style={styles.td}>{item.company}</td>
                <td style={styles.td}>{item.offers}</td>
                <td style={styles.td}>{item.highestPackage} LPA</td>
                <td style={styles.td}>{item.avgPackage} LPA</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No company data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const renderStudentReport = () => (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard('#3b82f6')}>
          <div style={styles.summaryValue}>{reportData?.topPerformers?.length || 0}</div>
          <div style={styles.summaryLabel}>Top Performers</div>
        </div>
        <div style={styles.summaryCard('#10b981')}>
          <div style={styles.summaryValue}>{reportData?.cgpaDistribution?.[0]?.count || 0}</div>
          <div style={styles.summaryLabel}>CGPA 9.0+</div>
        </div>
        <div style={styles.summaryCard('#f59e0b')}>
          <div style={styles.summaryValue}>{reportData?.cgpaDistribution?.[2]?.percentage || 0}%</div>
          <div style={styles.summaryLabel}>Average Range</div>
        </div>
      </div>

      <div style={styles.sectionTitle}><Award size={16} color="#f59e0b" /> Top Performers</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Branch</th>
            <th style={styles.th}>CGPA</th>
            <th style={styles.th}>Placed At</th>
            <th style={styles.th}>Package</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.topPerformers && reportData.topPerformers.length > 0 ? (
            reportData.topPerformers.map((student, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{student.name}</td>
                <td style={styles.td}>{student.branch}</td>
                <td style={styles.td}>{student.cgpa}</td>
                <td style={styles.td}>{student.placed}</td>
                <td style={styles.td}>{student.package}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No top performers data available</td></tr>
          )}
        </tbody>
      </table>

      <div style={styles.sectionTitle}><PieChart size={16} color="#8b5cf6" /> CGPA Distribution</div>
      <div style={styles.chartContainer}>
        {reportData?.cgpaDistribution && reportData.cgpaDistribution.length > 0 ? (
          reportData.cgpaDistribution.map((item) => {
            const max = Math.max(...reportData.cgpaDistribution.map(c => c.percentage || 0), 1)
            const width = ((item.percentage || 0) / max) * 100
            return (
              <div key={item.range} style={styles.chartBar}>
                <div style={styles.chartLabel}>{item.range}</div>
                <div style={styles.chartBarFill(width, '#8b5cf6')}>{item.percentage || 0}%</div>
              </div>
            )
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No CGPA distribution data available</p>
        )}
      </div>
    </div>
  )

  const renderCompanyReport = () => (
    <div>
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard('#10b981')}>
          <div style={styles.summaryValue}>{reportData?.companies?.length || 0}</div>
          <div style={styles.summaryLabel}>Active Companies</div>
        </div>
        <div style={styles.summaryCard('#f59e0b')}>
          <div style={styles.summaryValue}>{reportData?.companies?.[0]?.totalHired || 0}</div>
          <div style={styles.summaryLabel}>Max Hired</div>
        </div>
        <div style={styles.summaryCard('#8b5cf6')}>
          <div style={styles.summaryValue}>{reportData?.companies?.[0]?.avgPackage || 0} LPA</div>
          <div style={styles.summaryLabel}>Max Avg Package</div>
        </div>
      </div>

      <div style={styles.sectionTitle}><Building2 size={16} color="#10b981" /> Company-wise Hiring</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Company</th>
            <th style={styles.th}>Total Hired</th>
            <th style={styles.th}>Avg Package</th>
            <th style={styles.th}>Top Branch</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.companies && reportData.companies.length > 0 ? (
            reportData.companies.map((company, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{company.name}</td>
                <td style={styles.td}>{company.totalHired}</td>
                <td style={styles.td}>{company.avgPackage} LPA</td>
                <td style={styles.td}>{company.topBranch}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No company data available</td></tr>
          )}
        </tbody>
      </table>

      <div style={styles.sectionTitle}><PieChart size={16} color="#ec4899" /> Industry-wise Distribution</div>
      <div style={styles.chartContainer}>
        {reportData?.industryWise && reportData.industryWise.length > 0 ? (
          reportData.industryWise.map((item) => {
            const max = Math.max(...reportData.industryWise.map(i => i.percentage || 0), 1)
            const width = ((item.percentage || 0) / max) * 100
            return (
              <div key={item.industry} style={styles.chartBar}>
                <div style={styles.chartLabel}>{item.industry}</div>
                <div style={styles.chartBarFill(width, '#ec4899')}>{item.percentage || 0}%</div>
              </div>
            )
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No industry data available</p>
        )}
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={styles.titleIcon}>
            <FileText size={18} color="white" />
          </div>
          <span>Reports & Analytics</span>
        </div>
        <div style={styles.actionBtns}>
          <button onClick={handlePrint} style={styles.actionBtn}>
            <Printer size={14} /> Print
          </button>
          <button onClick={() => setEmailModalOpen(true)} style={styles.actionBtn}>
            <Mail size={14} /> Email
          </button>
          <button onClick={handleDownloadPDF} style={styles.actionBtn}>
            <Download size={14} /> PDF
          </button>
          <button onClick={handleDownloadExcel} style={styles.actionBtn}>
            <Download size={14} /> Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersBar}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Report Type:</span>
          <button 
            onClick={() => setReportType('placement')} 
            style={styles.reportTypeBtn(reportType === 'placement')}
          >
            Placement
          </button>
          <button 
            onClick={() => setReportType('student')} 
            style={styles.reportTypeBtn(reportType === 'student')}
          >
            Student
          </button>
          <button 
            onClick={() => setReportType('company')} 
            style={styles.reportTypeBtn(reportType === 'company')}
          >
            Company
          </button>
        </div>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Date Range:</span>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)} 
            style={styles.dateSelect}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          {dateRange === 'custom' && (
            <>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={styles.dateSelect} 
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                style={styles.dateSelect} 
              />
            </>
          )}
        </div>
        <button 
          onClick={fetchReport} 
          style={styles.generateBtn} 
          disabled={generating}
        >
          <RefreshCw size={12} className={generating ? 'spin' : ''} /> 
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Content */}
      {reportData ? (
        <div id="report-content" style={styles.reportContainer}>
          <div style={styles.reportHeader}>
            <div style={styles.reportTitle}>{reportData.title || 'Report'}</div>
            <div style={styles.reportDate}>
              Generated on: {reportData.generatedOn || new Date().toLocaleString()}
            </div>
          </div>

          {reportType === 'placement' && renderPlacementReport()}
          {reportType === 'student' && renderStudentReport()}
          {reportType === 'company' && renderCompanyReport()}
        </div>
      ) : (
        <div style={styles.noData}>
          <FileText size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No data available for this report.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Select a date range and generate the report to view data.
          </p>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setEmailModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Send Report via Email</div>
              <button 
                onClick={() => setEmailModalOpen(false)} 
                style={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email Address</label>
              <input 
                type="email" 
                value={emailAddress} 
                onChange={(e) => setEmailAddress(e.target.value)} 
                placeholder="recipient@example.com" 
                style={styles.formInput} 
              />
            </div>
            <div style={styles.modalButtons}>
              <button 
                onClick={() => setEmailModalOpen(false)} 
                style={styles.btnSecondary}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail} 
                disabled={sendingEmail} 
                style={styles.btnPrimary}
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports