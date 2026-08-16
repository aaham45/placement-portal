// frontend/src/App.jsx
// ✅ GoogleOAuthProvider WAPAS ADD KARO

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CompaniesPage from './pages/CompaniesPage';
import ContactPage from './pages/ContactPage';
import StatisticsPage from './pages/StatisticsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CompanyRegister from './pages/auth/CompanyRegister';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Student Components
import Notifications from './pages/student/components/Notifications';
import MyApplications from './pages/student/components/MyApplications';
import SavedJobs from './pages/student/components/SavedJobs';
import InterviewSchedule from './pages/student/components/InterviewSchedule';
import OfferLetters from './pages/student/components/OfferLetters';
import EligibilityChecker from './pages/student/components/EligibilityChecker';
import Profile from './pages/student/components/Profile';
import Settings from './pages/student/components/Settings';
import AvailableJobs from './pages/student/components/AvailableJobs';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '938835428639-nk8g86nqr5hqb8pnoso6eo8qf99j9nhr.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <HomePage />
              </div>
              <Footer />
            </div>
          } />
          
          <Route path="/about" element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <AboutPage />
              </div>
              <Footer />
            </div>
          } />
          
          <Route path="/companies" element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <CompaniesPage />
              </div>
              <Footer />
            </div>
          } />
          
          <Route path="/contact" element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <ContactPage />
              </div>
              <Footer />
            </div>
          } />
          
          <Route path="/statistics" element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <StatisticsPage />
              </div>
              <Footer />
            </div>
          } />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/company-register" element={<CompanyRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* STUDENT DASHBOARD ROUTES */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/applications" element={<MyApplications />} />
          <Route path="/student/saved-jobs" element={<SavedJobs />} />
          <Route path="/student/interviews" element={<InterviewSchedule />} />
          <Route path="/student/offers" element={<OfferLetters />} />
          <Route path="/student/eligibility" element={<EligibilityChecker />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/settings" element={<Settings />} />
          <Route path="/student/jobs" element={<AvailableJobs />} />

          {/* COMPANY & ADMIN DASHBOARD */}
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;