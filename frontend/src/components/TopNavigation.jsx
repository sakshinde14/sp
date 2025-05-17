import React from 'react';
import { Link } from 'react-router-dom';

function TopNavigation() {
  return (
    <nav className="top-navigation">
      <div className="top-left">Study Portal</div>
      <div className="top-right">
        {/* We can add these later */}
        {/* <Link to="/personal-storage">Personal Storage</Link> */}
        <Link to="/profile">Profile</Link>
        <Link to="/logout">Logout</Link>
        {/* <button>Go Back</button> */}
      </div>
    </nav>
  );
}

export default TopNavigation;