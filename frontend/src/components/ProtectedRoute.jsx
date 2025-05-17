import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('authToken'); // Example: Check for a token
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login/student', { replace: true });
    }
  }, [navigate]); // Only depend on navigate, as isAuthenticated check is immediate

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;