import { useState, useEffect } from 'react'
import { BookOpen, Download, Eye, Search, Filter, ChevronDown, FileText, Video, FileCheck, Briefcase, GraduationCap, Code, Award, TrendingUp, ExternalLink, Bookmark, Heart, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function PlacementResources() {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [savedResources, setSavedResources] = useState([])
  const [selectedResource, setSelectedResource] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('studentToken')

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'aptitude', name: 'Aptitude', icon: GraduationCap },
    { id: 'interview', name: 'Interview Questions', icon: Briefcase },
    { id: 'experience', name: 'Experiences', icon: Award },
    { id: 'coding', name: 'Coding Resources', icon: Code },
    { id: 'resume', name: 'Resume Tips', icon: FileText },
    { id: 'certification', name: 'Certifications', icon: Award },
  ]

  // ✅ Category Images Mapping
  const categoryImages = {
    'aptitude': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4d8.png',
    'interview': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4cb.png',
    'coding': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4bb.png',
    'resume': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c3.png',
    'experience': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4d6.png',
    'certification': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c6.png',
    'default': 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c4.png'
  }

  // ✅ Get Category Image
  const getCategoryImage = (category) => {
    return categoryImages[category] || categoryImages['default']
  }

  // ✅ Fetch resources
  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/student/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📝 Resources Response:', response.data)
      
      if (response.data.success && response.data.resources) {
        setResources(response.data.resources)
      } else {
        setResources([])
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      setResources([])
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch saved resources
  const fetchSavedResources = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/saved-resources`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success && response.data.savedResources) {
        setSavedResources(response.data.savedResources)
      } else {
        setSavedResources([])
      }
    } catch (error) {
      console.error('Error fetching saved resources:', error)
      setSavedResources([])
    }
  }

  useEffect(() => {
    if (token) {
      fetchResources()
      fetchSavedResources()
    } else {
      setLoading(false)
    }
  }, [token])

  // ✅ Save/Unsave resource
  const handleSaveResource = async (id) => {
    const isSaved = savedResources.includes(id)
    
    try {
      if (isSaved) {
        await axios.delete(`${API_URL}/student/saved-resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSavedResources(savedResources.filter(i => i !== id))
        toast.success('Removed from saved')
      } else {
        await axios.post(`${API_URL}/student/saved-resources/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSavedResources([...savedResources, id])
        toast.success('Saved for later! ❤️')
      }
    } catch (error) {
      console.error('Error saving resource:', error)
      toast.error('Failed to save resource')
    }
  }

  // ✅ Handle View Details
  const handleViewDetails = (resource) => {
    setSelectedResource(resource)
    setShowDetailsModal(true)
  }

  // ✅ Handle Download
  const handleDownload = async (resource) => {
    try {
      if (resource.link && resource.link !== '#' && resource.link.startsWith('http')) {
        window.open(resource.link, '_blank')
        toast.success(`Opening ${resource.title}...`)
        return
      }
      
      if (resource.file_url) {
        const fileUrl = resource.file_url.startsWith('http') 
          ? resource.file_url 
          : `http://localhost:5000${resource.file_url}`
        
        if (resource.file_url.endsWith('.pdf')) {
          const win = window.open('', '_blank')
          if (win) {
            win.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${resource.title}</title>
                  <style>
                    body { margin: 0; padding: 0; height: 100vh; overflow: hidden; font-family: Arial, sans-serif; }
                    .header { 
                      background: #1e293b; 
                      color: white; 
                      padding: 12px 20px; 
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    }
                    .close-btn {
                      background: #ef4444;
                      color: white;
                      border: none;
                      padding: 6px 16px;
                      border-radius: 6px;
                      cursor: pointer;
                      font-size: 14px;
                    }
                    .close-btn:hover { background: #dc2626; }
                    iframe { width: 100%; height: calc(100vh - 52px); border: none; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <span>📄 ${resource.title}</span>
                    <button class="close-btn" onclick="window.close()">✕ Close</button>
                  </div>
                  <iframe src="${fileUrl}" allow="fullscreen"></iframe>
                </body>
              </html>
            `)
            win.document.close()
            toast.success(`Opening ${resource.title}...`)
          } else {
            window.open(fileUrl, '_blank')
          }
        } else {
          window.open(fileUrl, '_blank')
          toast.success(`Opening ${resource.title}...`)
        }
        return
      }
      
      toast.info('No download available for this resource')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to open resource')
    }
  }

  // ✅ Format topics
  const formatTopics = (topics) => {
    if (!topics) return []
    if (Array.isArray(topics)) return topics
    if (typeof topics === 'string') {
      return topics.split(',').map(t => t.trim()).filter(t => t)
    }
    return []
  }

  const filteredResources = resources.filter(resource => {
    if (!resource) return false
    const matchesSearch = (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (resource.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = category === 'all' || resource.category === category
    return matchesSearch && matchesCategory
  })

  const colors = {
    primary: '#15803d',
    primaryLight: '#166534',
    primaryBg: '#f0fdf4',
    primaryHover: '#14532d',
    textLight: '#f1f5f9',
    border: '#166534'
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
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
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
      width: '200px'
    },
    categoriesContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '1rem'
    },
    categoryBtn: (active) => ({
      padding: '0.4rem 1rem',
      background: active ? colors.primary : '#f1f5f9',
      color: active ? 'white' : '#64748b',
      border: 'none',
      borderRadius: '20px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s ease'
    }),
    loadingState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: colors.primary,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto 1rem'
    },
    resourcesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '1rem'
    },
    resourceCard: {
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    resourceHeader: {
      padding: '0.75rem 1rem',
      background: '#fafcff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    resourceIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      background: '#f1f5f9',
      border: '1px solid #e2e8f0'
    },
    resourceIconImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '8px'
    },
    resourceInfo: {
      flex: 1
    },
    resourceTitle: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.15rem'
    },
    resourceMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.35rem',
      fontSize: '0.6rem',
      color: '#64748b'
    },
    resourceDesc: {
      padding: '0.6rem 1rem',
      fontSize: '0.7rem',
      color: '#64748b',
      lineHeight: '1.4',
      borderBottom: '1px solid #f1f5f9',
      minHeight: '40px'
    },
    actionButtons: {
      padding: '0.5rem 1rem',
      display: 'flex',
      gap: '0.5rem',
      background: '#fafcff'
    },
    btnPrimary: {
      flex: 1,
      padding: '0.4rem',
      background: colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.65rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s ease'
    },
    btnOutline: {
      padding: '0.4rem 0.6rem',
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.65rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      minWidth: '36px'
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
    modalIcon: {
      width: '40px',
      height: '40px',
      objectFit: 'contain',
      marginRight: '0.5rem'
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
    topicsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.25rem'
    },
    topicTag: {
      background: '#eff6ff',
      color: '#2563eb',
      padding: '0.15rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.65rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
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
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading resources...</p>
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
            <BookOpen size={18} color="white" />
          </div>
          <span>Placement Resources</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '400' }}>
            ({resources.length} resources)
          </span>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={styles.categoriesContainer}>
        {categories.map(cat => {
          const Icon = cat.icon
          return (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={styles.categoryBtn(category === cat.id)}>
              <Icon size={12} /> {cat.name}
            </button>
          )
        })}
      </div>

      {filteredResources.length === 0 ? (
        <div style={styles.emptyState}>
          <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p>No resources found</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {resources.length === 0 
              ? 'No resources available at the moment. Check back later!' 
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div style={styles.resourcesGrid}>
          {filteredResources.map((resource) => {
            const isSaved = savedResources.includes(resource.id)
            const category = resource.category || 'default'
            const imageUrl = getCategoryImage(category)
            
            return (
              <div key={resource.id} style={styles.resourceCard}>
                <div style={styles.resourceHeader}>
                  <div style={styles.resourceIcon}>
                    <img 
                      src={imageUrl} 
                      alt={category} 
                      style={styles.resourceIconImage}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<span style="font-size: 1.5rem;">📄</span>`
                      }}
                    />
                  </div>
                  <div style={styles.resourceInfo}>
                    <div style={styles.resourceTitle}>{resource.title}</div>
                    <div style={styles.resourceMeta}>
                      {resource.type && <span>{resource.type}</span>}
                      {resource.size && <span>• {resource.size}</span>}
                      {resource.rating && <span>• ⭐ {resource.rating}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleSaveResource(resource.id)} style={styles.btnOutline}>
                    {isSaved ? '❤️' : '🤍'}
                  </button>
                </div>
                <div style={styles.resourceDesc}>
                  {resource.description && resource.description.length > 100 
                    ? resource.description.substring(0, 100) + '...' 
                    : resource.description || 'No description available'}
                </div>
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => handleViewDetails(resource)} 
                    style={styles.btnOutline}
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={() => handleDownload(resource)} 
                    style={styles.btnPrimary}
                    title={resource.type === 'Link' ? 'Visit Resource' : 'Download Resource'}
                  >
                    <Download size={12} /> {resource.type === 'Link' ? 'Visit' : 'Download'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ✅ Details Modal */}
      {showDetailsModal && selectedResource && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <img 
                  src={getCategoryImage(selectedResource.category || 'default')} 
                  alt={selectedResource.category}
                  style={styles.modalIcon}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                {selectedResource.title}
              </div>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📋 Resource Details</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {selectedResource.type && <span style={styles.detailItem}>📄 Type: {selectedResource.type}</span>}
                {selectedResource.category && <span style={styles.detailItem}>📂 {selectedResource.category}</span>}
                {selectedResource.size && <span style={styles.detailItem}>💾 {selectedResource.size}</span>}
                {selectedResource.pages && <span style={styles.detailItem}>📄 {selectedResource.pages} pages</span>}
                {selectedResource.rating && <span style={styles.detailItem}>⭐ {selectedResource.rating}/5</span>}
                {selectedResource.downloads && <span style={styles.detailItem}>📥 {selectedResource.downloads.toLocaleString()}</span>}
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>📝 Description</div>
              <div style={styles.modalValue}>{selectedResource.description || 'No description available'}</div>
            </div>

            {selectedResource.topics && (
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>✅ Topics Covered</div>
                <div style={styles.topicsList}>
                  {formatTopics(selectedResource.topics).map((topic, idx) => (
                    <span key={idx} style={styles.topicTag}>{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedResource.author && (
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>👨‍🎓 Author</div>
                <div style={styles.modalValue}>{selectedResource.author} {selectedResource.batch && `- Batch ${selectedResource.batch}`}</div>
              </div>
            )}

            {selectedResource.company && (
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>🏢 Company</div>
                <div style={styles.modalValue}>{selectedResource.company} {selectedResource.package && `- ${selectedResource.package}`}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleDownload(selectedResource)} 
                style={{ ...styles.btnPrimary, flex: 1 }}
              >
                <Download size={14} /> {selectedResource.type === 'Link' ? 'Open Resource' : 'Download Now'}
              </button>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                style={styles.btnOutline}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlacementResources