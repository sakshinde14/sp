import React, { useState } from 'react';
import './AuthStyles.css';
import { Link, useNavigate } from 'react-router-dom';

function StudentSignup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // For programmatic navigation

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup/student', { // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful
        alert('Account created successfully! You can now log in.');
        navigate('/login/student'); // Redirect to login page
      } else {
        // Signup failed, display error from the server
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setError('Failed to connect to the server. Please try again later.');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Student Sign Up</h2>
      {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="signupFullName" className="form-label">Full Name:</label>
          <input
            type="text"
            id="signupFullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="form-input"
            placeholder="Your full name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupEmail" className="form-label">Email Address:</label>
          <input
            type="email"
            id="signupEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="your.email@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupPassword" className="form-label">Password:</label>
          <input
            type="password"
            id="signupPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Choose a password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupConfirmPassword" className="form-label">Confirm Password:</label>
          <input
            type="password"
            id="signupConfirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Confirm your password"
          />
        </div>
        <button type="submit" className="form-button">Sign Up</button>
      </form>
      <div className="toggle-link-container">
        Already have an account? <Link to="/login/student" className="toggle-link">Login</Link>
      </div>
      <div className="toggle-link-container">
        <Link to="/login/admin" className="toggle-link">Admin Login</Link>
      </div>
    </div>
  );
}

export default StudentSignup;