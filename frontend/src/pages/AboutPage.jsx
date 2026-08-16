import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, Briefcase, Award, TrendingUp, Target, Eye, Heart, Star } from 'lucide-react'

// ✅ Import company logos
import amazonLogo from '../assets/company-logos/amazon.png'
import googleLogo from '../assets/company-logos/google.png'
import microsoftLogo from '../assets/company-logos/microsoft.png'
import tcsLogo from '../assets/company-logos/tcs.png'
import infosysLogo from '../assets/company-logos/infosys.png'
import wiproLogo from '../assets/company-logos/wipro.png'
import accentureLogo from '../assets/company-logos/accenture.png'
import deloitteLogo from '../assets/company-logos/deloitte.png'
import cognizantLogo from '../assets/company-logos/cognizant.png'
import adobeLogo from '../assets/company-logos/adobe.png'
import metaLogo from '../assets/company-logos/meta.png'
import goldmanSachsLogo from '../assets/company-logos/goldman-sachs.png'

function AboutPage() {
  const [stats, setStats] = useState([
    { value: '5000+', label: 'Students Placed', icon: Users, color: '#3b82f6', target: 5000, current: 0 },
    { value: '200+', label: 'Recruiters', icon: Building2, color: '#10b981', target: 200, current: 0 },
    { value: '85%', label: 'Placement Rate', icon: TrendingUp, color: '#f59e0b', target: 85, current: 0 },
    { value: '52 LPA', label: 'Highest Package', icon: Award, color: '#ec4899', target: 52, current: 0 }
  ])
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!animated) {
      setAnimated(true)
      const interval = setInterval(() => {
        setStats(prevStats => 
          prevStats.map(stat => {
            if (stat.current < stat.target) {
              const increment = Math.ceil(stat.target / 50)
              const newValue = Math.min(stat.current + increment, stat.target)
              let displayValue
              if (stat.label === 'Highest Package') {
                displayValue = `${newValue} LPA`
              } else if (stat.label === 'Placement Rate') {
                displayValue = `${newValue}%`
              } else {
                displayValue = `${newValue}+`
              }
              return { ...stat, current: newValue, value: displayValue }
            }
            return stat
          })
        )
      }, 30)
      setTimeout(() => clearInterval(interval), 1500)
      return () => clearInterval(interval)
    }
  }, [animated])

  const team = [
    { name: 'Dr. Suresh Patnaik', role: 'Placement Director', avatar: '👨‍💼', desc: '20+ years of experience in corporate relations', expertise: ['Corporate Relations', 'Strategic Planning'] },
    { name: 'Prof. Priyanka Mohanty', role: 'Training Officer', avatar: '👩‍🏫', desc: 'PhD in Career Counseling, certified soft skills trainer', expertise: ['Soft Skills', 'Personality Development'] },
    { name: 'Mr. Rajesh Das', role: 'Corporate Relations', avatar: '👨‍💻', desc: 'Former HR at Amazon, building strong industry partnerships', expertise: ['Industry Relations', 'Recruitment'] },
    { name: 'Ms. Sweta Pati', role: 'Placement Coordinator', avatar: '👩‍💼', desc: 'Expert in student placement coordination', expertise: ['Coordination', 'Student Support'] }
  ]

  const achievements = [
    { year: '2024', title: 'Highest Package ₹52 LPA', company: 'Google', icon: Award },
    { year: '2024', title: '500+ Students Placed', company: 'Top MNCs', icon: Users },
    { year: '2023', title: 'Best Placement Cell Award', company: 'AICTE', icon: Star },
    { year: '2023', title: '100% Placement in CSE', company: 'CUTM', icon: Award }
  ]

  const recruiters = [
    { name: 'Amazon', logo: amazonLogo },
    { name: 'Google', logo: googleLogo },
    { name: 'Microsoft', logo: microsoftLogo },
    { name: 'TCS', logo: tcsLogo },
    { name: 'Infosys', logo: infosysLogo },
    { name: 'Wipro', logo: wiproLogo },
    { name: 'Accenture', logo: accentureLogo },
    { name: 'Deloitte', logo: deloitteLogo },
    { name: 'Cognizant', logo: cognizantLogo },
    { name: 'Adobe', logo: adobeLogo },
    { name: 'Meta', logo: metaLogo },
    { name: 'Goldman Sachs', logo: goldmanSachsLogo }
  ]

  const testimonials = [
    { name: 'Ankit Kumar', role: 'Software Engineer at Amazon', package: '24 LPA', quote: 'The placement cell at CUTM is incredibly supportive!', avatar: '👨‍💻', rating: 5 },
    { name: 'Priya Singh', role: 'SDE at Google', package: '32 LPA', quote: 'Thanks to CUTM placement team, I got my dream job at Google!', avatar: '👩‍💻', rating: 5 },
    { name: 'Rahul Verma', role: 'Systems Engineer at Infosys', package: '9 LPA', quote: 'Great support from faculty and placement team.', avatar: '👨‍🎓', rating: 4 }
  ]

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' },
    hero: { background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '3rem', marginBottom: '1rem', fontWeight: '800' },
    heroSubtitle: { fontSize: '1.2rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto' },
    section: { padding: '60px 20px' },
    containerCenter: { maxWidth: '1200px', margin: '0 auto' },
    sectionTitle: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '2rem', color: '#1e293b' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' },
    statCard: { background: 'white', padding: '1.5rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    statValue: { fontSize: '2rem', fontWeight: '800', color: '#2563eb' },
    statLabel: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' },
    missionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' },
    missionCard: { background: 'white', padding: '2rem', borderRadius: '20px', textAlign: 'center' },
    missionIcon: { width: '60px', height: '60px', background: '#eff6ff', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
    missionTitle: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' },
    missionDesc: { color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' },
    achievementsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' },
    achievementCard: { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '1rem', borderRadius: '16px', textAlign: 'center' },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' },
    teamCard: { background: 'white', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' },
    teamAvatar: { width: '80px', height: '80px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' },
    teamName: { fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' },
    teamRole: { color: '#2563eb', fontSize: '0.75rem', marginBottom: '0.5rem' },
    teamDesc: { color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' },
    expertiseTag: { display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.6rem', margin: '0.2rem' },
    recruitersGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' },
    recruiterCard: { background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' },
    recruiterLogo: { width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto', marginBottom: '0.5rem' },
    recruiterName: { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' },
    testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' },
    testimonialCard: { background: 'white', borderRadius: '20px', padding: '1.5rem' },
    cta: { background: 'linear-gradient(135deg, #1e40af, #2563eb)', padding: '60px 20px', textAlign: 'center', color: 'white' },
    btnPrimary: { display: 'inline-block', padding: '12px 24px', background: 'white', color: '#2563eb', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', marginRight: '1rem' },
    btnOutline: { display: 'inline-block', padding: '12px 24px', background: 'transparent', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', border: '2px solid white' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>About CUTM Placement Portal</h1>
        <p style={styles.heroSubtitle}>Empowering students to achieve their dream careers through innovative placement solutions</p>
      </div>

      <div style={styles.section}>
        <div style={styles.containerCenter}>
          {/* Stats */}
          <div style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <div key={idx} style={styles.statCard}>
                <stat.icon size={32} color={stat.color} style={{ marginBottom: '1rem' }} />
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mission & Vision */}
          <div style={styles.missionGrid}>
            <div style={styles.missionCard}>
              <div style={styles.missionIcon}><Target size={28} color="#2563eb" /></div>
              <h3 style={styles.missionTitle}>Our Mission</h3>
              <p style={styles.missionDesc}>Bridge the gap between academia and industry by providing quality placement opportunities.</p>
            </div>
            <div style={styles.missionCard}>
              <div style={styles.missionIcon}><Eye size={28} color="#2563eb" /></div>
              <h3 style={styles.missionTitle}>Our Vision</h3>
              <p style={styles.missionDesc}>100% placement assistance for every deserving student with top MNCs.</p>
            </div>
            <div style={styles.missionCard}>
              <div style={styles.missionIcon}><Heart size={28} color="#2563eb" /></div>
              <h3 style={styles.missionTitle}>Our Values</h3>
              <p style={styles.missionDesc}>Transparency, Excellence, Innovation, and Student-First approach.</p>
            </div>
          </div>

          {/* Achievements */}
          <h2 style={styles.sectionTitle}>🏆 Key Achievements</h2>
          <div style={styles.achievementsGrid}>
            {achievements.map((item, idx) => (
              <div key={idx} style={styles.achievementCard}>
                <item.icon size={24} color="#d97706" />
                <div style={{ fontWeight: '700', marginTop: '0.5rem', fontSize: '0.8rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.7rem', color: '#92400e' }}>{item.company}</div>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <h2 style={styles.sectionTitle}>👥 Meet Our Team</h2>
          <div style={styles.teamGrid}>
            {team.map((member, idx) => (
              <div key={idx} style={styles.teamCard}>
                <div style={styles.teamAvatar}>{member.avatar}</div>
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={styles.teamRole}>{member.role}</p>
                <p style={styles.teamDesc}>{member.desc}</p>
                <div>
                  {member.expertise.map((skill, i) => <span key={i} style={styles.expertiseTag}>{skill}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* Top Recruiters */}
          <h2 style={styles.sectionTitle}>🏢 Top Recruiters</h2>
          <div style={styles.recruitersGrid}>
            {recruiters.map((recruiter, idx) => (
              <div key={idx} style={styles.recruiterCard}>
                <img src={recruiter.logo} alt={recruiter.name} style={styles.recruiterLogo} />
                <div style={styles.recruiterName}>{recruiter.name}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <h2 style={styles.sectionTitle}>⭐ What Our Students Say</h2>
          <div style={styles.testimonialGrid}>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} style={styles.testimonialCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{testimonial.avatar}</div>
                <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.85rem', marginBottom: '0.5rem' }}>"{testimonial.quote}"</p>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{testimonial.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981' }}>{testimonial.role}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>💰 {testimonial.package}</div>
                <div style={{ color: '#f59e0b', marginTop: '0.5rem' }}>{'⭐'.repeat(testimonial.rating)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Start Your Journey?</h2>
        <p style={{ marginBottom: '1.5rem' }}>Join thousands of successful students who got placed through our portal</p>
        <Link to="/register" style={styles.btnPrimary}>Register Now →</Link>
        <Link to="/contact" style={styles.btnOutline}>Contact Us</Link>
      </div>
    </div>
  )
}

export default AboutPage