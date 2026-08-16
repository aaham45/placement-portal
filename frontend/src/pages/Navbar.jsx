import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <style>{`
        /* ===== MODERN NAVBAR WITH GLASS EFFECT ===== */
        .navbar-premium {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          padding: 0.5rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .navbar-premium-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Logo */
        .navbar-premium-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .navbar-premium-logo:hover {
          transform: scale(1.02);
        }

        .navbar-premium-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        .navbar-premium-text {
          display: flex;
          flex-direction: column;
        }

        .navbar-premium-main {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .navbar-premium-sub {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* Links */
        .navbar-premium-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .navbar-premium-links a {
          color: #475569;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
          padding: 0.5rem 0;
        }

        .navbar-premium-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #1e40af, #3b82f6);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .navbar-premium-links a:hover {
          color: #1e40af;
        }

        .navbar-premium-links a:hover::after {
          width: 100%;
        }

        /* Buttons */
        .navbar-premium-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .btn-premium-student {
          padding: 0.6rem 1.5rem;
          background: white;
          color: #1e40af;
          border: 2px solid #dbeafe;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-premium-student:hover {
          background: #1e40af;
          color: white;
          border-color: #1e40af;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25);
        }

        .btn-premium-company {
          padding: 0.6rem 1.5rem;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(30, 64, 175, 0.3);
        }

        .btn-premium-company:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30, 64, 175, 0.4);
          background: linear-gradient(135deg, #1e3a8a, #1e40af);
        }

        /* Mobile */
        .menu-btn-premium {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #1e293b;
          transition: all 0.3s ease;
        }

        .menu-btn-premium:hover {
          color: #1e40af;
        }

        .nav-overlay-premium {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        .nav-overlay-premium.open {
          display: block;
        }

        @media (max-width: 768px) {
          .menu-btn-premium {
            display: block;
          }

          .navbar-premium-links {
            display: none;
            flex-direction: column;
            width: 100%;
            padding: 1rem 0;
            gap: 0.75rem;
            background: white;
            border-radius: 16px;
            margin-top: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .navbar-premium-links.open {
            display: flex;
          }

          .navbar-premium-container {
            flex-wrap: wrap;
            padding: 0.5rem 1rem;
          }

          .navbar-premium-buttons {
            display: none;
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .navbar-premium-buttons.open {
            display: flex;
          }

          .btn-premium-student,
          .btn-premium-company {
            width: 100%;
            justify-content: center;
            padding: 0.7rem;
          }

          .navbar-premium-links a {
            padding: 0.6rem 0;
            width: 100%;
            text-align: center;
          }

          .navbar-premium-links a::after {
            display: none;
          }

          .navbar-premium-links a:hover {
            background: #f1f5f9;
            border-radius: 8px;
            color: #1e40af;
          }
        }

        @media (min-width: 769px) {
          .navbar-premium-links {
            display: flex !important;
          }
          .navbar-premium-buttons {
            display: flex !important;
          }
        }
      `}</style>

      <nav className="navbar-premium">
        <div className="navbar-premium-container">
          {/* ===== LOGO ===== */}
          <Link 
            to="/" 
            className="navbar-premium-logo"
            onClick={(e) => {
              e.preventDefault()
              window.location.href = '/'
              closeMenu()
            }}
          >
            <div className="navbar-premium-icon">🎓</div>
            <div className="navbar-premium-text">
              <span className="navbar-premium-main">CUTM Placement</span>
              <span className="navbar-premium-sub">Management Portal</span>
            </div>
          </Link>

          {/* ===== MOBILE MENU BUTTON ===== */}
          <button className="menu-btn-premium" onClick={toggleMenu}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* ===== NAV LINKS ===== */}
          <div className={`navbar-premium-links ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/companies" onClick={closeMenu}>Companies</Link>
            <Link to="/statistics" onClick={closeMenu}>Statistics</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
          </div>

          {/* ===== BUTTONS ===== */}
          <div className={`navbar-premium-buttons ${isMenuOpen ? 'open' : ''}`}>
            <button 
              onClick={() => {
                navigate('/login?role=student')
                closeMenu()
              }} 
              className="btn-premium-student"
            >
              👨‍🎓 Student Login
            </button>
            <button 
              onClick={() => {
                navigate('/login?role=company')
                closeMenu()
              }} 
              className="btn-premium-company"
            >
              🏢 Company Login
            </button>
          </div>
        </div>
      </nav>

      {/* ===== OVERLAY ===== */}
      <div 
        className={`nav-overlay-premium ${isMenuOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      ></div>
    </>
  )
}

export default Navbar