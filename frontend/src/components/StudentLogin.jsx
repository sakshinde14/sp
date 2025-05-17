import React, { useState } from 'react';
import './AuthStyles.css';
import { Link } from 'react-router-dom';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ... your imports ...
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login/student', { // Updated URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful - you'll likely want to store a token or session here
      alert('Student login successful!');
      navigate('/dashboard'); // Redirect to student dashboard
    } else {
      setError(data.message || 'Invalid credentials');
    }
  } catch (error) {
    setError('Failed to connect to the server. Please try again later.');
    console.error('Login error:', error);
  }
};
// ... your component ...

  return (
    <div className="auth-container">
      <h2 className="auth-title">Student Login</h2>
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