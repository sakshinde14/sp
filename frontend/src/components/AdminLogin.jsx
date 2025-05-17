import React, { useState } from 'react';
import './AuthStyles.css';
import { Link } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ... your imports ...
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login/admin', { // Updated URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Admin login successful - you'll likely want to store a token or session here
      alert('Admin login successful!');
      navigate('/admin/dashboard'); // Redirect to admin dashboard
    } else {
      setError(data.message || 'Invalid credentials');
    }
  } catch (error) {
    setError('Failed to connect to the server. Please try again later.');
    console.error('Admin login error:', error);
  }
};
// ... your component ...

  return (
    <div className="auth-container">
      <h2 className="auth-title">Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="adminUsername" className="form-label">Username:</label>
          <input
            type="text"
            id="adminUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
            placeholder="Admin username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminPassword" className="form-label">Password:</label>
          <input
            type="password"
            id="adminPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Admin password"
          />
        </div>
        <button type="submit" className="form-button" >Login</button>
        <div className="toggle-link-container">
        <Link to="/login/student" className="toggle-link">Student Login/Signup</Link>
      </div>
    
      </form>
      
    </div>
  );
}

export default AdminLogin;