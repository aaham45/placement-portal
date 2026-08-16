import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ✅ Import company logos
import googleLogo from '../assets/company-logos/google.png'
import microsoftLogo from '../assets/company-logos/microsoft.png'
import amazonLogo from '../assets/company-logos/amazon.png'
import tcsLogo from '../assets/company-logos/tcs.png'
import infosysLogo from '../assets/company-logos/infosys.png'
import wiproLogo from '../assets/company-logos/wipro.png'
import deloitteLogo from '../assets/company-logos/deloitte.png'
import accentureLogo from '../assets/company-logos/accenture.png'

// ✅ Import App.css
import '../App.css'

function HomePage() {
  const navigate = useNavigate()

  // ✅ State for counting animation
  const [counts, setCounts] = useState({
    students: 0,
    recruiters: 0,
    placementRate: 0,
    highestPackage: 0
  })

  const companies = [
    { name: 'Google', logo: googleLogo },
    { name: 'Microsoft', logo: microsoftLogo },
    { name: 'Amazon', logo: amazonLogo },
    { name: 'TCS', logo: tcsLogo },
    { name: 'Infosys', logo: infosysLogo },
    { name: 'Wipro', logo: wiproLogo },
    { name: 'Deloitte', logo: deloitteLogo },
    { name: 'Accenture', logo: accentureLogo }
  ]

  // ✅ Counting Animation Effect
  useEffect(() => {
    const targetValues = {
      students: 5000,
      recruiters: 200,
      placementRate: 85,
      highestPackage: 30
    }

    const duration = 2000 // 2 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutQuad = (t) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      setCounts({
        students: Math.floor(easedProgress * targetValues.students),
        recruiters: Math.floor(easedProgress * targetValues.recruiters),
        placementRate: Math.floor(easedProgress * targetValues.placementRate),
        highestPackage: Math.floor(easedProgress * targetValues.highestPackage)
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [])

  return (
    <div>
      {/* ✅ Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1>🚀 Your Dream Career Starts Here</h1>
          <p>
            Connect students with top recruiters through a smart placement
            management platform designed for CUTM.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/register')} className="btn-primary">
              Get Started
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary">
              Explore Companies
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">👨‍🎓</div>
              <div className="stat-number">{counts.students}+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏢</div>
              <div className="stat-number">{counts.recruiters}+</div>
              <div className="stat-label">Recruiters</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-number">{counts.placementRate}%</div>
              <div className="stat-label">Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Statistics Section */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Statistics</span>
            <h2 className="section-title">Placement Statistics</h2>
            <p className="section-subtitle">Our achievements in numbers</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="number">{counts.students}+</div>
              <div className="label">Total Students</div>
            </div>
            <div className="stat-card">
              <div className="number">{counts.recruiters}+</div>
              <div className="label">Recruiters</div>
            </div>
            <div className="stat-card">
              <div className="number">{counts.placementRate}%</div>
              <div className="label">Placement Rate</div>
            </div>
            <div className="stat-card">
              <div className="number">{counts.highestPackage} LPA</div>
              <div className="label">Highest Package</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ How It Works */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2 className="section-title">How It Works?</h2>
            <p className="section-subtitle">Simple 4-step process to get placed</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Register</h3>
              <p className="step-desc">Create your profile and upload resume</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Apply</h3>
              <p className="step-desc">Browse jobs & apply to eligible companies</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Shortlisted</h3>
              <p className="step-desc">Track application & interview status</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Get Placed 🎉</h3>
              <p className="step-desc">Receive offer letter & confirmation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Top Companies with Logos */}
      <section className="section companies-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Recruiters</span>
            <h2 className="section-title">Top Recruiting Companies</h2>
            <p className="section-subtitle">Our prestigious hiring partners</p>
          </div>
          <div className="companies-grid">
            {companies.map((company, idx) => (
              <div key={idx} className="company-card">
                <img src={company.logo} alt={company.name} className="company-logo" />
                <span className="company-name">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Features */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Powerful features for students & recruiters</p>
          </div>
          <div className="features-grid">
            <div className="feature-card student">
              <div className="feature-icon">👨‍🎓</div>
              <h3 className="feature-title">Student Features</h3>
              <ul className="feature-list">
                <li>Resume Upload & Management</li>
                <li>Smart Job Applications</li>
                <li>Placement Eligibility Check</li>
                <li>Interview Schedule Tracking</li>
                <li>Real-time Notifications</li>
                <li>Placement Preparation Resources</li>
              </ul>
            </div>
            <div className="feature-card company">
              <div className="feature-icon">🏢</div>
              <h3 className="feature-title">Company Features</h3>
              <ul className="feature-list">
                <li>Post Job Openings</li>
                <li>AI-Powered Candidate Filtering</li>
                <li>Manage Recruitment Process</li>
                <li>Schedule & Conduct Interviews</li>
                <li>Download Resumes</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Testimonials */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Success Stories</span>
            <h2 className="section-title">Student Success Stories</h2>
            <p className="section-subtitle">Real stories from our placed students</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-icon">⭐</div>
              <p className="testimonial-text">"Placed at Amazon with 24 LPA package. The placement portal made the entire process seamless!"</p>
              <p className="testimonial-author">- Rajesh Kumar, CSE 2024</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-icon">⭐</div>
              <p className="testimonial-text">"Got my dream job at Microsoft. The eligibility checker helped me find the right opportunities."</p>
              <p className="testimonial-author">- Priya Singh, IT 2024</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-icon">⭐</div>
              <p className="testimonial-text">"18 LPA package from Google. The portal is very user-friendly and efficient."</p>
              <p className="testimonial-author">- Aditya Sharma, CSE 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ CTA Section */}
      <section className="cta">
        <h2>Ready to Start Your Placement Journey?</h2>
        <p>Join 5000+ students who have already registered for placement drives</p>
        <div className="cta-buttons">
          <button onClick={() => navigate('/register')} className="btn-cta-primary">
            Register Now →
          </button>
          <button onClick={() => navigate('/login')} className="btn-cta-secondary">
            Learn More
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage