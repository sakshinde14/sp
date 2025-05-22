// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
import './DashboardStyles.css';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage'; // This component will be conditionally rendered
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList';
import SearchResultsList from './SearchResultsList';

function DashboardLayout() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.trim().length > 0) { // Changed threshold to > 0 (for 1 or more chars) or > 2 as per previous discussion
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

    return (
        <div className="dashboard-container">
            <TopNavigation />
            <main className="main-content">
                {/* Conditional rendering for WelcomeMessage */}
                {
                    // Show WelcomeMessage ONLY IF:
                    // 1. No search results are active AND
                    // 2. No course has been selected yet (meaning we are on the initial CourseList screen)
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

                {/* Conditional Rendering for Search Results vs. Regular Navigation */}
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
                ) : ( // Render normal navigation if no search results are shown
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