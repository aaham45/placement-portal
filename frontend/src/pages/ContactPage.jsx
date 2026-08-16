import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, Globe, MessageCircle, Share2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

// ✅ Navbar aur Footer ka import HATA diya (Kyunki wo App.jsx se aa rahe hain)
// import Navbar from './Navbar'  // ❌ Ye line delete kar di

const API_URL = import.meta.env.VITE_API_URL || '/api'

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true); 
    try {
      const response = await axios.post(`${API_URL}/contact/send`, formData)
      if (response.data.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ✅ Gmail Compose directly opens in new tab
  const handleEmailClick = () => {
    const to = 'aahamkumararya1@gmail.com'
    const subject = encodeURIComponent('Placement Query from CUTM Student')
    const body = encodeURIComponent(
      'Hello Placement Team,\n\n' +
      'I have a query regarding placements at CUTM.\n\n' +
      '----------------------------------------\n' +
      'Student Details:\n' +
      'Name: \n' +
      'Registration No: \n' +
      'Branch: \n' +
      'Semester: \n' +
      'CGPA: \n' +
      '----------------------------------------\n\n' +
      'My Query:\n' +
      '(Please write your query here)\n\n' +
      '----------------------------------------\n\n' +
      'Thank you,\n' +
      '[Your Full Name]\n' +
      '[Your Phone Number]'
    )
    
    // Gmail compose URL - opens Gmail in new tab
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`
    window.open(gmailComposeUrl, '_blank')
  }

  // ✅ Phone click handler
  const handlePhoneClick = () => {
    window.location.href = 'tel:+916370016071'
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CUTM Placement Portal',
          text: 'Check out CUTM Placement Portal!',
          url: window.location.href
        })
        toast.success('Shared successfully!')
      } catch {
        toast.error('Sharing was cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello, I have a query about placements at CUTM.')
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank')
  }

  const handleWebsite = () => {
    window.open('https://cutm.ac.in', '_blank')
  }

  const handleRateUs = () => {
    toast.success('Thanks for rating us! ⭐')
  }

  const contactInfo = [
    { icon: MapPin, title: 'Address', details: 'CUTM, Paralakhemundi, Odisha - 761211', action: null, isClickable: false },
    { icon: Phone, title: 'Phone', details: '+91 674 123 4567', action: handlePhoneClick, isClickable: true, hint: 'Click to call' },
    { icon: Mail, title: 'Email', details: 'aahamkumararya1@gmail.com', action: handleEmailClick, isClickable: true, hint: 'Click to send email' },
    { icon: Clock, title: 'Working Hours', details: 'Mon-Fri: 10:00 AM - 6:00 PM', action: null, isClickable: false }
  ]

  const socialLinks = [
    { icon: Globe, color: '#3b82f6', name: 'Website', action: handleWebsite },
    { icon: MessageCircle, color: '#25D366', name: 'WhatsApp', action: handleWhatsApp },
    { icon: Share2, color: '#1da1f2', name: 'Share', action: handleShare },
    { icon: Star, color: '#f59e0b', name: 'Rate Us', action: handleRateUs }
  ]

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' },
    hero: { background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' },
    heroSubtitle: { fontSize: '1.1rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto' },
    section: { padding: '60px 20px' },
    containerCenter: { maxWidth: '1200px', margin: '0 auto' },
    contactGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' },
    infoCard: { background: 'white', padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    infoTitle: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' },
    infoIcon: { width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    infoDetails: { flex: 1 },
    infoDetailText: (isClickable) => ({ 
      fontSize: '0.85rem', 
      color: isClickable ? '#2563eb' : '#1e293b',
      fontWeight: isClickable ? '500' : 'normal',
      textDecoration: isClickable ? 'underline' : 'none'
    }),
    infoHint: { fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem' },
    formCard: { background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    formTitle: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#64748b' },
    input: { width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '0.85rem' },
    textarea: { width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', resize: 'vertical', minHeight: '100px' },
    submitBtn: { width: '100%', padding: '0.6rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
    socialLinks: { display: 'flex', gap: '1rem', marginTop: '1rem' },
    socialLink: (color) => ({ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: color }),
    mapContainer: { marginTop: '2rem', borderRadius: '20px', overflow: 'hidden' },
    iframe: { width: '100%', height: '300px', border: 'none' }
  }

  return (
    <div style={styles.container}>
      {/* ❌ Navbar ko yahan se hata diya, kyunki wo App.jsx se aa raha hai */}
      
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Us</h1>
        <p style={styles.heroSubtitle}>Have questions? We're here to help you with your placement journey</p>
      </div>
      <div style={styles.section}>
        <div style={styles.containerCenter}>
          <div style={styles.contactGrid}>
            {/* Left Column */}
            <div>
              {contactInfo.map((item, idx) => (
                <div key={idx} style={styles.infoCard}>
                  <h3 style={styles.infoTitle}>{item.title}</h3>
                  <div style={styles.infoItem} onClick={item.action}>
                    <div style={styles.infoIcon}>
                      <item.icon size={18} color="#2563eb" />
                    </div>
                    <div style={styles.infoDetails}>
                      <div style={styles.infoDetailText(item.isClickable)}>
                        {item.details}
                      </div>
                      {item.isClickable && (
                        <div style={styles.infoHint}>{item.hint}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Social Links */}
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Follow Us</h3>
                <div style={styles.socialLinks}>
                  {socialLinks.map((social, idx) => (
                    <div 
                      key={idx} 
                      style={styles.socialLink(social.color)} 
                      onClick={social.action}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <social.icon size={18} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Send us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} style={styles.textarea} required />
                </div>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Google Map */}
          <div style={styles.mapContainer}>
            <iframe 
              title="CUTM Location" 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3739.123456789!2d85.823456!3d20.273456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19a7bff1234567%3A0x123456789abcdef!2sCenturion%20University%20of%20Technology%20and%20Management!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin" 
              style={styles.iframe} 
              allowFullScreen 
              loading="lazy" 
            />
          </div>
        </div>
      </div>
      {/* ❌ Footer ko yahan se bhi hata diya, kyunki wo App.jsx se aa raha hai */}
    </div>
  )
}

export default ContactPage