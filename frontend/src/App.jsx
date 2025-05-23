import React, { useEffect } from 'react'; // Added useEffect here
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// Import your core components
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentSignup';
import AdminLogin from './components/AdminLogin';
import DashboardLayout from './components/DashboardLayout'; // Student Dashboard Layout
import AdminDashboardLayout from './components/AdminDashboardLayout'; // Admin Dashboard Layout
// NEW IMPORTS for Admin Tools
import AddMaterial from './components/AddMaterial';
import ManageMaterials from './components/ManageMaterials';

// Import CSS files
import './components/AuthStyles.css';
import './components/DashboardStyles.css';

// --- INLINE ProtectedRoute Component ---
// This component handles role-based access control for routes
function ProtectedRoute({ children, allowedRoles }) {
    const userRole = localStorage.getItem('userRole'); // Get the user's role from localStorage
    const navigate = useNavigate();

    useEffect(() => {
        // If no userRole is found (not logged in) OR
        // If the user's role is not in the allowedRoles for this specific route
        if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
            if (!userRole) {
                // If not logged in at all, redirect to student login as default
                navigate('/login/student', { replace: true });
            } else {
                // If logged in but unauthorized for this specific route
                console.warn(`User with role "${userRole}" attempted to access a route for roles: ${allowedRoles}. Redirecting.`);
                
                // Redirect to their default dashboard if they have one, otherwise to student login
                if (userRole === 'student') {
                    navigate('/dashboard', { replace: true });
                } else if (userRole === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/login/student', { replace: true }); // Fallback
                }
            }
        }
    }, [userRole, allowedRoles, navigate]); // Dependencies for useEffect

    // Render children only if user is authorized, otherwise return null (redirection handled by useEffect)
    return userRole && (allowedRoles ? allowedRoles.includes(userRole) : true) ? children : null;
}

// --- INLINE AuthLayout Component ---
// This component provides the common layout for login/signup pages
function AuthLayout({ children }) {
    const currentPath = window.location.pathname; // Get current path to determine which link to show

    return (
        <div className="auth-layout">
            <div className="auth-toggle-corner">
                {/* Dynamically show the opposite login link based on current path */}
                {currentPath.includes('/login/admin') || currentPath.includes('/signup/admin') ? (
                    <Link to="/login/student" className="toggle-link">Student Login/Signup</Link>
                ) : (
                    <Link to="/login/admin" className="toggle-link">Admin Login</Link>
                )}
            </div>
            <div className="auth-visual-side">
                {/* Assuming /girlca.png is in your public folder */}
                <img src="/girlca.png" alt="Login Support" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
            </div>
            <div className="auth-form-side">
                {children} {/* Renders the actual login/signup forms here */}
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* Default route: Redirects to student login */}
                    <Route path="/" element={<Navigate to="/login/student" replace />} />
                    
                    {/* Public Authentication Routes */}
                    <Route path="/login/student" element={<AuthLayout><StudentLogin /></AuthLayout>} />
                    <Route path="/signup/student" element={<AuthLayout><StudentSignup /></AuthLayout>} />
                    <Route path="/login/admin" element={<AuthLayout><AdminLogin /></AuthLayout>} />

                    {/* Protected Student Dashboard Route */}
                    {/* Accessible by both students and admins to view study materials */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['student', 'admin']}>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Admin Dashboard Route */}
                    {/* Accessible only by admins for management tasks */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboardLayout />
                            </ProtectedRoute>
                        }
                    />

                    {/* NEW: Admin Tools Routes */}
                    <Route
                        path="/admin/materials/add"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AddMaterial />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/materials/manage"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <ManageMaterials />
                            </ProtectedRoute>
                        }
                    />



                    {/* Fallback route for any unmatched URLs */}
                    <Route path="*" element={<Navigate to="/login/student" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;