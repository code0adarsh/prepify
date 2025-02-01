import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage">
      <header className="hero-section">
        <h1>Welcome to Prepify</h1>
        <p>Your ultimate tool for career preparation.</p>
        <Link to="/resume" className="cta-button">Get Started</Link>
      </header>
      <section className="features-section">
        <div className="feature">
          <h2>Resume Builder</h2>
          <p>Create professional resumes with ease using our intuitive builder.</p>
        </div>
        <div className="feature">
          <h2>Mock Interviews</h2>
          <p>Practice with realistic interview simulations to boost your confidence.</p>
        </div>
        <div className="feature">
          <h2>Camera Integration</h2>
          <p>Utilize your camera for live interview practice and feedback.</p>
        </div>
      </section>
    </div>
  );
}
