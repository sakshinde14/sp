import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentSignup';
import AdminLogin from './components/AdminLogin';
import DashboardLayout from './components/DashboardLayout'; // Import the layout
import WelcomeMessage from './components/WelcomeMessage'; // Import the component
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute
import './components/AuthStyles.css';
import './components/DashboardStyles.css'; // Import dashboard styles

function App() {
  return (
    <Router>
      <div className="app-container"> {/* Add a basic container for app-level styling if needed */}
        <Routes>
          <Route path="/" element={<AuthLayout isStudent={true}><StudentLogin /></AuthLayout>} />
          <Route path="/login/student" element={<AuthLayout isStudent={true}><StudentLogin /></AuthLayout>} />
          <Route path="/signup/student" element={<AuthLayout isStudent={true}><StudentSignup /></AuthLayout>} />
          <Route path="/login/admin" element={<AuthLayout isAdmin={true}><AdminLogin /></AuthLayout>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><WelcomeMessage /></DashboardLayout></ProtectedRoute>} /> {/* Protected dashboard route */}
        </Routes>
      </div>
    </Router>
  );
}

function AuthLayout({ children, isStudent, isAdmin }) {
  return (
    <div className="auth-layout">
      <div className="auth-toggle-corner">
        {isAdmin ? (
          <Link to="/login/student" className="toggle-link">Student Login/Signup</Link>
        ) : (
          <Link to="/login/admin" className="toggle-link">Admin Login</Link>
        )}
      </div>
      <div className="auth-visual-side">
        <img src="/girlca.png" alt="Login Support" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
      </div>
      <div className="auth-form-side">
        {children}
      </div>
    </div>
  );
}

export default App;