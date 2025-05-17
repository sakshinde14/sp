import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentSignup';
import AdminLogin from './components/AdminLogin';
import './components/AuthStyles.css';

function App() {
  return (
    <Router>
      <div className="auth-full-page-container">
        <Routes>
          <Route path="/" element={<AuthLayout isStudent={true}><StudentLogin /></AuthLayout>} />
          <Route path="/login/student" element={<AuthLayout isStudent={true}><StudentLogin /></AuthLayout>} />
          <Route path="/signup/student" element={<AuthLayout isStudent={true}><StudentSignup /></AuthLayout>} />
          <Route path="/login/admin" element={<AuthLayout isAdmin={true}><AdminLogin /></AuthLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

function AuthLayout({ children, isStudent, isAdmin }) {
  return (
    <div className="auth-layout">
      
      <div className="auth-visual-side">
        <img src="/girlca.png" alt="Login Support"  />
      </div>
      <div className="auth-form-side">
        {children}
      </div>
    </div>
  );
}

export default App;