import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Briefcase, Users, Star, Eye } from 'lucide-react'

// ✅ Import logos from assets
import amazonLogo from '../assets/company-logos/amazon.png'
import googleLogo from '../assets/company-logos/google.png'
import microsoftLogo from '../assets/company-logos/microsoft.png'
import tcsLogo from '../assets/company-logos/tcs.png'
import infosysLogo from '../assets/company-logos/infosys.png'
import wiproLogo from '../assets/company-logos/wipro.png'
import deloitteLogo from '../assets/company-logos/deloitte.png'
import accentureLogo from '../assets/company-logos/accenture.png'
import cognizantLogo from '../assets/company-logos/cognizant.png'
import adobeLogo from '../assets/company-logos/adobe.png'
import metaLogo from '../assets/company-logos/meta.png'
import goldmanSachsLogo from '../assets/company-logos/goldman-sachs.png'

function CompaniesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showJobsModal, setShowJobsModal] = useState(false)

  const companies = [
    { id: 1, name: 'Amazon India', logo: amazonLogo, industry: 'E-commerce', location: 'Bangalore', jobs: 5, hired: 42, rating: 4.8, description: 'Leading e-commerce and cloud computing company' },
    { id: 2, name: 'Google India', logo: googleLogo, industry: 'Technology', location: 'Hyderabad', jobs: 3, hired: 28, rating: 4.9, description: 'Global technology leader in search and cloud' },
    { id: 3, name: 'Microsoft India', logo: microsoftLogo, industry: 'Technology', location: 'Bangalore', jobs: 4, hired: 35, rating: 4.8, description: 'Software development and cloud services' },
    { id: 4, name: 'TCS', logo: tcsLogo, industry: 'IT Services', location: 'Mumbai', jobs: 8, hired: 120, rating: 4.5, description: 'Leading IT services and consulting company' },
    { id: 5, name: 'Infosys', logo: infosysLogo, industry: 'IT Services', location: 'Pune', jobs: 6, hired: 85, rating: 4.4, description: 'Global IT and consulting services' },
    { id: 6, name: 'Wipro', logo: wiproLogo, industry: 'IT Services', location: 'Bangalore', jobs: 4, hired: 56, rating: 4.3, description: 'IT, consulting and business process services' },
    { id: 7, name: 'Deloitte', logo: deloitteLogo, industry: 'Consulting', location: 'Hyderabad', jobs: 3, hired: 32, rating: 4.6, description: 'Professional services network' },
    { id: 8, name: 'Accenture', logo: accentureLogo, industry: 'Consulting', location: 'Bangalore', jobs: 5, hired: 48, rating: 4.5, description: 'Global professional services company' },
    { id: 9, name: 'Cognizant', logo: cognizantLogo, industry: 'IT Services', location: 'Chennai', jobs: 7, hired: 95, rating: 4.3, description: 'IT and business consulting services' },
    { id: 10, name: 'Adobe', logo: adobeLogo, industry: 'Technology', location: 'Noida', jobs: 3, hired: 22, rating: 4.7, description: 'Creative and digital experience solutions' },
    { id: 11, name: 'Meta', logo: metaLogo, industry: 'Technology', location: 'Hyderabad', jobs: 2, hired: 15, rating: 4.8, description: 'Social media and technology company' },
    { id: 12, name: 'Goldman Sachs', logo: goldmanSachsLogo, industry: 'Banking', location: 'Bangalore', jobs: 3, hired: 18, rating: 4.7, description: 'Investment banking and financial services' }
  ]

  const companyJobs = {
    1: [
      { id: 101, title: 'Software Development Engineer', package: '24 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-31' },
      { id: 102, title: 'Frontend Developer', package: '18 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-31' },
      { id: 103, title: 'DevOps Engineer', package: '22 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-31' }
    ],
    2: [
      { id: 201, title: 'Software Engineer', package: '28 LPA', location: 'Hyderabad', type: 'Full-time', deadline: '2024-12-20' },
      { id: 202, title: 'Site Reliability Engineer', package: '26 LPA', location: 'Hyderabad', type: 'Full-time', deadline: '2024-12-20' }
    ],
    3: [
      { id: 301, title: 'Software Engineer', package: '26 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-25' },
      { id: 302, title: 'Backend Developer', package: '24 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-25' }
    ],
    4: [
      { id: 401, title: 'Digital Engineer', package: '9 LPA', location: 'Mumbai', type: 'Full-time', deadline: '2024-12-15' },
      { id: 402, title: 'System Engineer', package: '8 LPA', location: 'Mumbai', type: 'Full-time', deadline: '2024-12-15' }
    ],
    5: [
      { id: 501, title: 'Systems Engineer', package: '8 LPA', location: 'Pune', type: 'Full-time', deadline: '2024-12-18' },
      { id: 502, title: 'Power Programmer', package: '12 LPA', location: 'Pune', type: 'Full-time', deadline: '2024-12-18' }
    ],
    6: [
      { id: 601, title: 'Project Engineer', package: '7.5 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-22' }
    ],
    7: [
      { id: 701, title: 'Analyst', package: '12 LPA', location: 'Hyderabad', type: 'Full-time', deadline: '2024-12-30' },
      { id: 702, title: 'Consultant', package: '15 LPA', location: 'Hyderabad', type: 'Full-time', deadline: '2024-12-30' }
    ],
    8: [
      { id: 801, title: 'Associate Software Engineer', package: '10 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-28' },
      { id: 802, title: 'Application Development Analyst', package: '12 LPA', location: 'Bangalore', type: 'Full-time', deadline: '2024-12-28' }
    ]
  }

  const industries = ['all', 'Technology', 'E-commerce', 'IT Services', 'Consulting', 'Banking']

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter
    return matchesSearch && matchesIndustry
  })

  const handleViewJobs = (company) => {
    setSelectedCompany(company)
    setShowJobsModal(true)
  }

  const handleApplyNow = (job) => {
    navigate('/student/jobs', { state: { selectedJob: job } })
  }

  const handleBrowseAllJobs = () => {
    navigate('/student/jobs')
  }

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)', fontFamily: "'Inter', sans-serif" },
    hero: { background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' },
    heroSubtitle: { fontSize: '1.1rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto' },
    filterBar: { display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '12px', width: '300px', border: '1px solid #e2e8f0' },
    searchInput: { border: 'none', outline: 'none', flex: 1 },
    filterSelect: { padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' },
    companiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' },
    companyCard: { background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', cursor: 'pointer' },
    companyHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
    companyLogo: { width: '60px', height: '60px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0', padding: '8px' },
    logoImage: { width: '100%', height: '100%', objectFit: 'contain' },
    companyName: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem' },
    companyIndustry: { fontSize: '0.75rem', color: '#64748b' },
    companyDetails: { display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
    detailItem: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#64748b' },
    rating: { display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' },
    section: { padding: '60px 20px' },
    containerCenter: { maxWidth: '1200px', margin: '0 auto' },
    sectionTitle: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '1rem', color: '#1e293b' },
    emptyState: { textAlign: 'center', padding: '3rem', color: '#64748b' },
    btnView: { width: '100%', padding: '0.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '24px', padding: '1.5rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' },
    modalTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' },
    jobsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    jobItem: { background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0' },
    jobTitle: { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' },
    jobMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
    jobMetaItem: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#64748b' },
    applyBtn: { padding: '0.3rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' },
    browseBtn: { marginTop: '1rem', padding: '0.5rem 1rem', background: '#f1f5f9', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'center' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Recruiting Partners</h1>
        <p style={styles.heroSubtitle}>Top companies that trust CUTM for their hiring needs</p>
      </div>

      <div style={styles.section}>
        <div style={styles.containerCenter}>
          <h2 style={styles.sectionTitle}>Top Recruiters</h2>
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
            </div>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} style={styles.filterSelect}>
              <option value="all">All Industries</option>
              {industries.filter(i => i !== 'all').map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {filteredCompanies.length === 0 ? (
            <div style={styles.emptyState}>No companies found</div>
          ) : (
            <div style={styles.companiesGrid}>
              {filteredCompanies.map(company => (
                <div key={company.id} style={styles.companyCard}>
                  <div style={styles.companyHeader}>
                    <div style={styles.companyLogo}>
                      <img src={company.logo} alt={company.name} style={styles.logoImage} />
                    </div>
                    <div>
                      <div style={styles.companyName}>{company.name}</div>
                      <div style={styles.companyIndustry}>{company.industry}</div>
                    </div>
                  </div>
                  <div style={styles.companyDetails}>
                    <span style={styles.detailItem}><MapPin size={12} /> {company.location}</span>
                    <span style={styles.detailItem}><Briefcase size={12} /> {company.jobs} jobs</span>
                    <span style={styles.detailItem}><Users size={12} /> {company.hired} hired</span>
                    <span style={styles.rating}><Star size={12} /> {company.rating}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>{company.description}</p>
                  <button 
                    style={styles.btnView}
                    onClick={() => handleViewJobs(company)}
                  >
                    <Eye size={14} /> View Jobs ({company.jobs})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs Modal */}
      {showJobsModal && selectedCompany && (
        <div style={styles.modalOverlay} onClick={() => setShowJobsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <img src={selectedCompany.logo} alt={selectedCompany.name} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                {selectedCompany.name} - Open Positions
              </div>
              <button onClick={() => setShowJobsModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.jobsList}>
              {(companyJobs[selectedCompany.id] || []).map(job => (
                <div key={job.id} style={styles.jobItem}>
                  <div style={styles.jobTitle}>{job.title}</div>
                  <div style={styles.jobMeta}>
                    <span style={styles.jobMetaItem}><Briefcase size={10} /> {job.package}</span>
                    <span style={styles.jobMetaItem}><MapPin size={10} /> {job.location}</span>
                    <span style={styles.jobMetaItem}>{job.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleApplyNow(job)} style={styles.applyBtn}>Apply Now →</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.browseBtn} onClick={handleBrowseAllJobs}>Browse All Jobs →</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompaniesPage