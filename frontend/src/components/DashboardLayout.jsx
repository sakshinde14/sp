import React from 'react';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar'; // Import the Sidebar component
import './DashboardStyles.css';

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <TopNavigation />
      <div className="dashboard-content">
        <Sidebar /> {/* Render the Sidebar here */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;