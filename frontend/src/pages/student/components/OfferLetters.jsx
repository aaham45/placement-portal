import { useState, useEffect } from 'react'
import { Award, Download, Eye, Calendar, MapPin, DollarSign, Briefcase, Building, Clock, CheckCircle, Share2, Printer, Mail, Gift, TrendingUp, Users, Star, Heart, Search, FileText, Tag, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function OfferLetters() {
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  const token = localStorage.getItem('studentToken')

  // ✅ Company Logo Fallback
  const getCompanyLogo = (companyName) => {
    const logos = {
      'Amazon India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
      'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
      'Asus India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png',
      'Asus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png',
      'HP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/HP_logo_2012.svg/2560px-HP_logo_2012.svg.png',
      'Google': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
      'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png',
      'Flipkart': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flipkart_logo.svg/2560px-Flipkart_logo.svg.png',
      'TCS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/2560px-Tata_Consultancy_Services_Logo.svg.png',
      'Infosys': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/2560px-Infosys_logo.svg.png',
      'Wipro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wipro_logo.svg/2560px-Wipro_logo.svg.png'
    }
    return logos[companyName] || null
  }

  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return null
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath
    }
    const baseUrl = 'http://localhost:5000'
    const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`
    return `${baseUrl}${cleanPath}`
  }

  // ✅ Fetch offers
  const fetchOffers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📝 Offers Response:', response.data)
      
      if (response.data.success && response.data.offers) {
        const formattedOffers = response.data.offers.map(offer => ({
          id: offer.id || 0,
          company: offer.companyName || offer.company || 'Unknown Company',
          companyLogo: offer.companyLogo || offer.company_logo || null,
          role: offer.job_title || offer.title || 'Unknown Role',
          package: offer.package || '0 LPA',
          status: offer.status || 'pending',
          joiningDate: offer.joining_date || 'N/A',
          offerDate: offer.offer_date || 'N/A',
          description: offer.description || 'No description available',
          baseSalary: offer.base_salary || 'N/A',
          bonus: offer.bonus || 'N/A',
          stocks: offer.stocks || 'N/A',
          joiningBonus: offer.joining_bonus || 'N/A',
          location: offer.location || 'N/A',
          perks: offer.perks ? (Array.isArray(offer.perks) ? offer.perks : offer.perks.split(',')) : [],
          recruiter: offer.recruiter || 'HR Team',
          recruiterEmail: offer.recruiter_email || 'hr@company.com',
          probationPeriod: offer.probation_period || 'N/A',
          noticePeriod: offer.notice_period || 'N/A',
          teamSize: offer.team_size || 'N/A'
        }))
        setOffers(formattedOffers)
        console.log('✅ Formatted Offers:', formattedOffers)
      } else {
        setOffers([])
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('studentToken')
        window.location.href = '/login'
      } else {
        toast.error('Failed to load offers')
      }
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOffers()
    } else {
      setLoading(false)
    }
  }, [token])

  // ✅ Download Offer Letter - FIXED
  const handleDownload = async (offer) => {
    try {
      toast.loading('Generating offer letter...', { id: 'download' })
      
      const response = await axios.get(`${API_URL}/student/offers/${offer.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      // ✅ Check content type
      const contentType = response.headers['content-type'] || ''
      let blob, fileExtension, fileName
      
      if (contentType.includes('application/pdf')) {
        blob = new Blob([response.data], { type: 'application/pdf' })
        fileExtension = 'pdf'
      } else if (contentType.includes('text/html')) {
        blob = new Blob([response.data], { type: 'text/html' })
        fileExtension = 'html'
      } else {
        blob = new Blob([response.data])
        fileExtension = 'pdf'
      }
      
      fileName = `Offer_Letter_${offer.company.replace(/\s/g, '_')}_${offer.role.replace(/\s/g, '_')}`
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${fileName}.${fileExtension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Downloading offer letter from ${offer.company}...`, { id: 'download' })
    } catch (error) {
      console.error('Error downloading offer:', error)
      toast.error('Failed to download offer letter', { id: 'download' })
    }
  }

  // ✅ Share Offer - FIXED
  const handleShare = (offer) => {
    const shareText = `🎉 Exciting News! I received an offer from ${offer.company} for the position of ${offer.role} with package ${offer.package}! #JobOffer #Career`
    
    if (navigator.share) {
      navigator.share({
        title: `Offer from ${offer.company}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success(`Share text copied! 🎉`)
    }
  }

  // ✅ Print Offer - FIXED
  const handlePrint = (offer) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>Offer Letter - ${offer.company}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; text-align: center; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .company { font-size: 24px; font-weight: bold; color: #1e293b; }
            .content { line-height: 1.8; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; color: #475569; }
            .signature { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Offer Letter</h1>
            <div class="company">${offer.company}</div>
          </div>
          <div class="content">
            <p>Dear Candidate,</p>
            <p>We are pleased to offer you the position of <strong>${offer.role}</strong> at ${offer.company}.</p>
            
            <div class="detail"><span class="label">💰 Package:</span> ${offer.package}</div>
            <div class="detail"><span class="label">📍 Location:</span> ${offer.location}</div>
            <div class="detail"><span class="label">📅 Joining Date:</span> ${offer.joiningDate}</div>
            <div class="detail"><span class="label">📋 Status:</span> ${offer.status}</div>
            
            <p><span class="label">📝 Description:</span></p>
            <p>${offer.description}</p>
            
            ${offer.perks && offer.perks.length > 0 ? `
              <p><span class="label">✨ Perks & Benefits:</span></p>
              <ul>
                ${offer.perks.map(perk => `<li>${perk}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          <div class="signature">
            <p>Sincerely,</p>
            <p><strong>${offer.recruiter}</strong><br/>${offer.company} HR Team</p>
            <p>📧 ${offer.recruiterEmail}</p>
          </div>
          <div class="footer">
            This is a system-generated offer letter.
          </div>
          <script>
            window.onload = function() { window.print(); }
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
    toast.success(`Preparing to print offer letter from ${offer.company}`)
  }

  // ✅ View Details - FIXED
  const handleViewDetails = (offer) => {
    setSelectedOffer(offer)
    setShowDetailsModal(true)
  }

  // ✅ Accept Offer - FIXED
  const handleAcceptOffer = async (offerId) => {
    setAccepting(true)
    try {
      const response = await axios.post(`${API_URL}/student/offers/${offerId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'accepted' } : o))
        toast.success('🎉 Offer accepted successfully! Congratulations!')
      } else {
        toast.error(response.data.message || 'Failed to accept offer')
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
      toast.error(error.response?.data?.message || 'Failed to accept offer')
    } finally {
      setAccepting(false)
    }
  }

  // ✅ Decline Offer - FIXED
  const handleDeclineOffer = async (offerId) => {
    if (!confirm('Are you sure you want to decline this offer?')) return
    
    try {
      const response = await axios.post(`${API_URL}/student/offers/${offerId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'declined' } : o))
        toast.success('Offer declined')
      } else {
        toast.error(response.data.message || 'Failed to decline offer')
      }
    } catch (error) {
      console.error('Error declining offer:', error)
      toast.error(error.response?.data?.message || 'Failed to decline offer')
    }
  }

  const filteredOffers = offers.filter(offer => {
    if (!offer) return false
    
    const companyName = (offer.company || '').toLowerCase()
    const roleName = (offer.role || '').toLowerCase()
    const search = (searchTerm || '').toLowerCase()
    
    const matchesSearch = companyName.includes(search) || roleName.includes(search)
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: offers?.length || 0,
    accepted: offers?.filter(o => o?.status === 'accepted').length || 0,
    pending: offers?.filter(o => o?.status === 'pending').length || 0,
    declined: offers?.filter(o => o?.status === 'declined').length || 0,
    totalPackage: offers?.reduce((sum, o) => {
      const pkg = parseInt(o?.package) || 0
      return sum + pkg
    }, 0) || 0
  }

  const getStatusBadge = (status) => {
    const badges = {
      'accepted': { icon: '✅', text: 'Accepted', color: '#10b981', bg: '#d1fae5' },
      'pending': { icon: '⏳', text: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
      'declined': { icon: '❌', text: 'Declined', color: '#ef4444', bg: '#fee2e2' }
    }
    return badges[status] || badges['pending']
  }

  const getCompanyInitial = (company) => {
    return company?.charAt(0) || 'C'
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
      background: 'linear-gradient(135deg, #d946ef, #f59e0b)', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    searchContainer: { 
      display: 'flex', 
      gap: '0.75rem', 
      flexWrap: 'wrap' 
    },
    searchBox: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem', 
      padding: '0.5rem 1rem', 
      background: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px' 
    },
    searchInput: { 
      border: 'none', 
      background: 'transparent', 
      outline: 'none', 
      fontSize: '0.85rem', 
      width: '180px' 
    },
    filterSelect: { 
      padding: '0.5rem 1rem', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      fontSize: '0.85rem', 
      background: 'white', 
      cursor: 'pointer' 
    },
    statsRow: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
      gap: '0.75rem', 
      marginBottom: '1.5rem' 
    },
    statCard: (color) => ({ 
      background: '#f8fafc', 
      borderRadius: '16px', 
      padding: '0.75rem', 
      textAlign: 'center', 
      borderTop: `3px solid ${color}` 
    }),
    statValue: { 
      fontSize: '1.5rem', 
      fontWeight: '700', 
      color: '#1e293b' 
    },
    statLabel: { 
      fontSize: '0.65rem', 
      color: '#64748b', 
      marginTop: '0.15rem' 
    },
    loadingState: { 
      textAlign: 'center', 
      padding: '3rem', 
      color: '#64748b' 
    },
    spinner: { 
      width: '40px', 
      height: '40px', 
      border: '3px solid #e2e8f0', 
      borderTopColor: '#d946ef', 
      borderRadius: '50%', 
      animation: 'spin 0.6s linear infinite', 
      margin: '0 auto 1rem' 
    },
    offersGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
      gap: '1rem' 
    },
    offerCard: { 
      background: '#ffffff', 
      borderRadius: '16px', 
      border: '1px solid #e2e8f0', 
      overflow: 'hidden', 
      transition: 'all 0.3s ease' 
    },
    cardHeader: { 
      padding: '0.75rem 1rem', 
      background: '#fafcff', 
      borderBottom: '1px solid #e2e8f0', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem' 
    },
    companyLogo: { 
      width: '48px', 
      height: '48px', 
      background: '#ffffff', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      flexShrink: 0,
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)' 
    },
    logoImage: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain', 
      padding: '6px' 
    },
    logoPlaceholder: { 
      background: 'linear-gradient(135deg, #d946ef, #f59e0b)', 
      color: 'white', 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '1.2rem', 
      fontWeight: '600',
      borderRadius: '12px' 
    },
    companyInfo: { 
      flex: 1, 
      minWidth: 0 
    },
    companyName: { 
      fontSize: '0.95rem', 
      fontWeight: '700', 
      color: '#1e293b' 
    },
    companyRole: { 
      fontSize: '0.75rem', 
      color: '#64748b' 
    },
    statusBadge: (color, bg) => ({ 
      padding: '0.2rem 0.75rem', 
      borderRadius: '20px', 
      fontSize: '0.65rem', 
      fontWeight: '600', 
      background: bg, 
      color: color 
    }),
    cardDetails: { 
      padding: '0.5rem 1rem', 
      display: 'flex', 
      gap: '0.5rem', 
      flexWrap: 'wrap', 
      borderBottom: '1px solid #f1f5f9' 
    },
    detailItem: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.25rem', 
      fontSize: '0.65rem', 
      color: '#475569', 
      background: '#f1f5f9', 
      padding: '0.2rem 0.5rem', 
      borderRadius: '20px' 
    },
    offerAmount: { 
      padding: '0.4rem 1rem', 
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', 
      textAlign: 'center' 
    },
    amountValue: { 
      fontSize: '1rem', 
      fontWeight: '700', 
      color: '#065f46' 
    },
    amountLabel: { 
      fontSize: '0.6rem', 
      color: '#047857' 
    },
    actionButtons: { 
      padding: '0.5rem 1rem', 
      display: 'flex', 
      gap: '0.5rem', 
      background: '#fafcff',
      borderTop: '1px solid #f1f5f9',
      flexWrap: 'wrap'
    },
    btnPrimary: { 
      flex: 1, 
      padding: '0.4rem 0.6rem', 
      background: '#2563eb', 
      color: 'white', 
      border: 'none', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem',
      minWidth: '60px'
    },
    btnOutline: { 
      padding: '0.4rem 0.6rem', 
      background: 'transparent', 
      color: '#64748b', 
      border: '1px solid #e2e8f0', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem', 
      minWidth: '40px' 
    },
    btnAccept: { 
      flex: 1, 
      padding: '0.4rem 0.6rem', 
      background: '#10b981', 
      color: 'white', 
      border: 'none', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem',
      minWidth: '60px'
    },
    btnDecline: { 
      padding: '0.4rem 0.6rem', 
      background: '#ef4444', 
      color: 'white', 
      border: 'none', 
      borderRadius: '10px', 
      fontSize: '0.7rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.25rem',
      minWidth: '60px'
    },
    modalOverlay: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      backdropFilter: 'blur(4px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000 
    },
    modal: { 
      background: 'white', 
      borderRadius: '24px', 
      padding: '1.5rem', 
      maxWidth: '550px', 
      width: '90%', 
      maxHeight: '85vh', 
      overflow: 'auto' 
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
      fontSize: '1.1rem', 
      fontWeight: '600', 
      color: '#1e293b', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem' 
    },
    closeBtn: { 
      background: 'none', 
      border: 'none', 
      cursor: 'pointer', 
      color: '#64748b', 
      fontSize: '1.2rem' 
    },
    modalSection: { 
      marginBottom: '1rem' 
    },
    modalLabel: { 
      fontSize: '0.7rem', 
      fontWeight: '600', 
      color: '#64748b', 
      textTransform: 'uppercase', 
      letterSpacing: '0.5px', 
      marginBottom: '0.25rem' 
    },
    modalValue: { 
      fontSize: '0.85rem', 
      color: '#1e293b' 
    },
    perksList: { 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '0.5rem', 
      marginTop: '0.25rem' 
    },
    perkTag: { 
      background: '#eff6ff', 
      color: '#2563eb', 
      padding: '0.2rem 0.6rem', 
      borderRadius: '20px', 
      fontSize: '0.7rem' 
    },
    modalCloseBtn: {
      width: '100%',
      padding: '0.6rem',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      marginTop: '0.5rem',
      fontWeight: '500'
    },
    emptyState: { 
      textAlign: 'center', 
      padding: '3rem', 
      color: '#64748b' 
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading offers...</p>
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
            <Award size={18} color="white" />
          </div>
          <span>Offer Letters</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '400' }}>
            ({offers.length} offers)
          </span>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search company..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Offers</option>
            <option value="accepted">✅ Accepted</option>
            <option value="pending">⏳ Pending</option>
            <option value="declined">❌ Declined</option>
          </select>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Offers</div>
        </div>
        <div style={styles.statCard('#10b981')}>
          <div style={styles.statValue}>{stats.accepted}</div>
          <div style={styles.statLabel}>Accepted</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard('#ef4444')}>
          <div style={styles.statValue}>{stats.declined}</div>
          <div style={styles.statLabel}>Declined</div>
        </div>
        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statValue}>{stats.totalPackage} LPA</div>
          <div style={styles.statLabel}>Total Worth</div>
        </div>
      </div>

      {filteredOffers.length === 0 ? (
        <div style={styles.emptyState}>
          <Award size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No offer letters found</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {offers.length === 0 
              ? "You haven't received any offers yet. Keep applying!" 
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div style={styles.offersGrid}>
          {filteredOffers.map((offer) => {
            const badge = getStatusBadge(offer.status)
            
            let logoUrl = null
            if (offer.companyLogo) {
              logoUrl = getFullLogoUrl(offer.companyLogo)
            }
            if (!logoUrl) {
              logoUrl = getCompanyLogo(offer.company)
            }
            
            return (
              <div key={offer.id} style={styles.offerCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.companyLogo}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={offer.company} 
                        style={styles.logoImage}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<div style="background: linear-gradient(135deg, #d946ef, #f59e0b); color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; borderRadius: '12px';">${getCompanyInitial(offer.company)}</div>`
                        }}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>{getCompanyInitial(offer.company)}</div>
                    )}
                  </div>
                  <div style={styles.companyInfo}>
                    <div style={styles.companyName}>{offer.company}</div>
                    <div style={styles.companyRole}>{offer.role}</div>
                  </div>
                  <div style={styles.statusBadge(badge.color, badge.bg)}>
                    {badge.icon} {badge.text}
                  </div>
                </div>
                
                <div style={styles.cardDetails}>
                  <span style={styles.detailItem}>
                    <Briefcase size={12} /> {offer.role}
                  </span>
                  <span style={styles.detailItem}>
                    <Tag size={12} /> 💰 {offer.package}
                  </span>
                  <span style={styles.detailItem}>
                    <MapPin size={12} /> {offer.location}
                  </span>
                  <span style={styles.detailItem}>
                    <Calendar size={12} /> {offer.offerDate}
                  </span>
                </div>
                
                <div style={styles.offerAmount}>
                  <div style={styles.amountLabel}>Total Package</div>
                  <div style={styles.amountValue}>{offer.package}</div>
                </div>
                
                <div style={styles.actionButtons}>
                  {offer.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAcceptOffer(offer.id)} 
                        disabled={accepting}
                        style={styles.btnAccept}
                      >
                        <CheckCircle size={12} /> Accept
                      </button>
                      <button 
                        onClick={() => handleDeclineOffer(offer.id)} 
                        style={styles.btnDecline}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDownload(offer)} style={styles.btnPrimary}>
                    <Download size={12} /> Download
                  </button>
                  <button onClick={() => handleViewDetails(offer)} style={styles.btnOutline}>
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handleShare(offer)} style={styles.btnOutline}>
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOffer && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <FileText size={18} color="#d946ef" />
                {selectedOffer.company} - {selectedOffer.role}
              </div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>💰 Compensation Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={styles.detailItem}>Base: {selectedOffer.baseSalary}</span>
                <span style={styles.detailItem}>Bonus: {selectedOffer.bonus}</span>
                <span style={styles.detailItem}>Stocks: {selectedOffer.stocks}</span>
                <span style={styles.detailItem}>Joining: {selectedOffer.joiningBonus}</span>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📋 Job Details</div>
              <div style={styles.modalValue}>{selectedOffer.description}</div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📍 Location & Joining</div>
              <div style={styles.modalValue}>📍 {selectedOffer.location} | 📅 Joining: {selectedOffer.joiningDate}</div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>✨ Perks & Benefits</div>
              <div style={styles.perksList}>
                {selectedOffer.perks && selectedOffer.perks.length > 0 ? (
                  selectedOffer.perks.map((perk, idx) => (
                    <span key={idx} style={styles.perkTag}>{perk}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No perks listed</span>
                )}
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>👨‍💼 Recruiter Contact</div>
              <div style={styles.modalValue}>{selectedOffer.recruiter} - {selectedOffer.recruiterEmail}</div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📄 Offer Details</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={styles.detailItem}>Probation: {selectedOffer.probationPeriod}</span>
                <span style={styles.detailItem}>Notice: {selectedOffer.noticePeriod}</span>
                <span style={styles.detailItem}>Team: {selectedOffer.teamSize}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleDownload(selectedOffer)} style={styles.btnPrimary}>
                <Download size={14} /> Download Offer
              </button>
              <button onClick={() => handlePrint(selectedOffer)} style={styles.btnOutline}>
                <Printer size={14} /> Print
              </button>
            </div>
            
            <button onClick={() => setShowDetailsModal(false)} style={styles.modalCloseBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfferLetters