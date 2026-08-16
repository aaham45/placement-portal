import React from 'react'  // ✅ Ye fix kiya (Pehle 'react' likha tha)
import { Link } from 'react-router-dom'

function Footer() {
  const styles = {
    footer: {
      background: '#0f172a',
      color: 'white',
      padding: '3rem 2rem 2rem',
      marginTop: '2rem'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem'
    },
    logo: { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' },
    text: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' },
    title: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' },
    links: { listStyle: 'none', padding: 0 },
    link: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', lineHeight: '2' },
    bottom: { textAlign: 'center', paddingTop: '2rem', marginTop: '2rem', borderTop: '1px solid #1e293b', color: '#64748b', fontSize: '0.8rem' }
  }

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div>
          <h3 style={styles.logo}>🎓 CUTM Placement Portal</h3>
          <p style={styles.text}>Your gateway to dream jobs and successful career.</p>
        </div>
        <div>
          <h4 style={styles.title}>Quick Links</h4>
          <ul style={styles.links}>
            <li><Link to="/about" style={styles.link}>About Us</Link></li>
            <li><Link to="/contact" style={styles.link}>Contact</Link></li>
            <li><Link to="#" style={styles.link}>Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={styles.title}>For Students</h4>
          <ul style={styles.links}>
            <li><Link to="#" style={styles.link}>How to Apply</Link></li>
            <li><Link to="#" style={styles.link}>Placement Process</Link></li>
            <li><Link to="#" style={styles.link}>FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={styles.title}>Contact</h4>
          <ul style={styles.links}>
            <li style={styles.link}>📞 +91-XXX-XXX-XXXX</li>
            <li style={styles.link}>✉️ placement@cutm.ac.in</li>
            <li style={styles.link}>📍 Bhubaneswar, Odisha</li>
          </ul>
        </div>
      </div>
      <div style={styles.bottom}>
        <p>&copy; 2024 CUTM Placement Portal. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer