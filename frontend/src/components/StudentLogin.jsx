import React, { useState } from 'react';
import './AuthStyles.css';
import { Link, useNavigate } from 'react-router-dom';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, SetError] = useState(''); // Corrected state setter name
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    SetError(''); // Corrected state setter name

    try {
      const response = await fetch('http://localhost:5000/api/auth/login/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
  alert('Student login successful!');
  // Example: Store a token in localStorage
  localStorage.setItem('authToken', 'someGeneratedToken');
  navigate('/dashboard');
}else {
        SetError(data.message || 'Invalid credentials'); // Corrected state setter name
      }
    } catch (error) {
      SetError('Failed to connect to the server. Please try again later.'); // Corrected state setter name
      console.error('Login error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Student Login</h2>
      {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="loginEmail" className="form-label">Email Address:</label>
          <input
            type="email"
            id="loginEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="your.email@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="loginPassword" className="form-label">Password:</label>
          <input
            type="password"
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Your password"
          />
        </div>
        <button type="submit" className="form-button">Login</button>
      </form>
      <div className="toggle-link-container">
        Don't have an account? <Link to="/signup/student" className="toggle-link">Sign Up</Link>
      </div>
      <div className="toggle-link-container">
        <Link to="/login/admin" className="toggle-link">Admin Login</Link>
      </div>
    </div>
  );
}

export default StudentLogin;