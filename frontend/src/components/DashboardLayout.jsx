// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import TopNavigation from './TopNavigation';
import './DashboardStyles.css'; // Ensure this contains your new message styles
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList';
import SearchResultsList from './SearchResultsList';

function DashboardLayout() {
    const navigate = useNavigate();

    // Existing states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // --- NEW STATE for logout message ---
    const [logoutMessage, setLogoutMessage] = useState('');

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

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log("Successfully logged out");
                setLogoutMessage("Successfully Logged Out!"); // Set success message
                resetSelection(); // Clear dashboard selections
                
                // Delay redirection to show the message
                setTimeout(() => {
                    setLogoutMessage(''); // Clear message after it has been seen
                    navigate('/login/student'); // Redirect
                }, 2000); // Display message for 2 seconds (2000 milliseconds)
            } else {
                const errorData = await response.json();
                console.error("Logout failed:", errorData);
                setLogoutMessage(`Logout Failed: ${errorData.message || 'Unknown error'}`); // Set error message
                setTimeout(() => {
                    setLogoutMessage(''); // Clear message after a delay even on error
                }, 3000); // Show error message a bit longer
            }
        } catch (error) {
            console.error("Error during logout:", error);
            setLogoutMessage(`Network Error: ${error.message}`); // Set network error message
            setTimeout(() => {
                setLogoutMessage('');
            }, 3000);
        }
    };

    return (
        <div className="dashboard-container">
            <TopNavigation onLogout={handleLogout} />
            <main className="main-content">
                {/* --- NEW: Display logout message --- */}
                {logoutMessage && (
                    <div className={`logout-popup ${logoutMessage.includes('Failed') || logoutMessage.includes('Error') ? 'error' : 'success'}`}>
                        {logoutMessage}
                    </div>
                )}
                {/* --- End NEW --- */}

                {
                    !showSearchResults && !selectedCourse && <WelcomeMessage />
                }
                
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
            </main>
        </div>
    );
}

export default DashboardLayout;