import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage'; // Ensure this is correctly imported
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList';
import SearchResultsList from './SearchResultsList';

import './DashboardStyles.css';

function AdminDashboardLayout() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [adminLogoutMessage, setAdminLogoutMessage] = useState('');

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                setSearchLoading(true);
                setSearchError(null);
                setShowSearchResults(true);

                setSelectedCourse(null);
                setSelectedYear(null);
                setSelectedSemester(null);

                try {
                    const response = await fetch(`http://localhost:5000/api/search/subjects?q=${encodeURIComponent(searchTerm.trim())}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setSearchResults(data);
                } catch (e) {
                    console.error("Error fetching search results:", e);
                    setSearchError(e.message);
                } finally {
                    setSearchLoading(false);
                }
            } else if (searchTerm.trim().length === 0) {
                setShowSearchResults(false);
                setSearchResults([]);
                setSearchError(null);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedYear(null);
        setSelectedSemester(null);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSemesterSelect = (semester) => {
        setSelectedSemester(semester);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSearchResultClick = (subjectDetails) => {
        setSelectedCourse({ code: subjectDetails.courseCode, title: subjectDetails.courseName });
        setSelectedYear(subjectDetails.year);
        setSelectedSemester(subjectDetails.semester);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        console.log("Navigating to study materials for:", subjectDetails);
    };

    const resetSelection = () => {
        setSelectedCourse(null);
        setSelectedYear(null);
        setSelectedSemester(null);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleAdminLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log("Admin successfully logged out");
                setAdminLogoutMessage("Admin Successfully Logged Out!");
                localStorage.removeItem('userRole'); // Clear user role
                // localStorage.removeItem('adminAuthToken'); // If you had a separate admin token
                resetSelection();
                setTimeout(() => {
                    setAdminLogoutMessage('');
                    navigate('/login/admin');
                }, 2000);
            } else {
                const errorData = await response.json();
                console.error("Admin Logout failed:", errorData);
                setAdminLogoutMessage(`Logout Failed: ${errorData.message || 'Unknown error'}`);
                setTimeout(() => {
                    setAdminLogoutMessage('');
                }, 3000);
            }
        } catch (error) {
            console.error("Error during admin logout:", error);
            setAdminLogoutMessage(`Network Error: ${error.message}`);
            setTimeout(() => {
                setAdminLogoutMessage('');
            }, 3000);
        }
    };

    return (
        <div className="dashboard-container">
            <TopNavigation onLogout={handleAdminLogout} />
            <main className="main-content">
                {adminLogoutMessage && (
                    <div className={`logout-popup ${adminLogoutMessage.includes('Failed') || adminLogoutMessage.includes('Error') ? 'error' : 'success'}`}>
                        {adminLogoutMessage}
                    </div>
                )}

                {/* Welcome message for the Admin Dashboard */}
                {!showSearchResults && !selectedCourse && (
                    <WelcomeMessage message="Welcome, Admin! Manage Study Materials." /> /* Correctly passing the message prop */
                )}
                
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search for subjects or study materials..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                {showSearchResults ? (
                    searchLoading ? (
                        <div className="loading-message">Searching...</div>
                    ) : searchError ? (
                        <div className="error-message">Error during search: {searchError}</div>
                    ) : (
                        <SearchResultsList
                            results={searchResults}
                            onResultClick={handleSearchResultClick}
                        />
                    )
                ) : (
                    !selectedCourse ? (
                        <CourseList onCourseSelect={handleCourseSelect} />
                    ) : !selectedYear ? (
                        <YearList courseCode={selectedCourse.code} onYearSelect={handleYearSelect} />
                    ) : !selectedSemester ? (
                        <SemesterList
                            onSemesterSelect={handleSemesterSelect}
                            courseCode={selectedCourse.code}
                            selectedYear={selectedYear}
                        />
                    ) : (
                        <SubjectList
                            courseCode={selectedCourse.code}
                            year={selectedYear}
                            semester={selectedSemester}
                            onReset={resetSelection}
                        />
                    )
                )}

                {/* Admin-specific management tools */}
                <div className="admin-management-section" style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #eee' }}>
                    <h3>Admin Tools:</h3>
                    <button className="form-button" style={{ marginRight: '10px' }}>Add New Material</button>
                    <button className="form-button">Manage Existing Materials</button>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboardLayout;