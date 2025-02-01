import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import ResumeBuilder from './components/ResumeBuilder';
import MockInterview from './components/MockInterview';
import HomePage from './components/HomePage.jsx';
import './Navbar.css';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Router>
      <nav className="prepify-nav">
      <Link to="/" className="nav-logo">
          Prepify
        </Link>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          ☰
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/resume" className="nav-link" onClick={toggleMobileMenu}>
            Resume Builder
          </Link>
          <Link to="/interview" className="nav-link" onClick={toggleMobileMenu}>
            Mock Interview
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/interview" element={<MockInterview />} />
      </Routes>
    </Router>
  );
}
