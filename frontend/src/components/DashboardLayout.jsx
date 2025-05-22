// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
import './DashboardStyles.css'; // Make sure you have your dashboard styles
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList';
import SearchResultsList from './SearchResultsList'; // Ensure this file exists and is correctly imported

function DashboardLayout() {
    // State for course/year/semester selection
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null); // This holds the full course object
    const [selectedYear, setSelectedYear] = useState(null);    // This holds the selected year (e.g., 1, 2, 3)
    const [selectedSemester, setSelectedSemester] = useState(null);

    // NEW STATES FOR SEARCH FUNCTIONALITY
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false); // Controls visibility of search results
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // --- Debounce for search input to prevent too many API calls ---
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            // Only search if term has at least 3 characters and is not just whitespace
            if (searchTerm.trim().length > 0) {
                setSearchLoading(true);
                setSearchError(null);
                setShowSearchResults(true); // Always show search results area when typing
                
                // When search is active, clear normal navigation selections
                setSelectedCourse(null);
                setSelectedYear(null);
                setSelectedSemester(null);

                try {
                    // Encode the search term for the URL
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
                // If search bar is cleared, hide search results and clear them
                setShowSearchResults(false);
                setSearchResults([]);
                setSearchError(null);
            }
            // If length is 1 or 2, do nothing (don't search, don't clear)
        }, 500); // 500ms delay after typing stops before triggering search

        return () => clearTimeout(delaySearch); // Cleanup timeout on component unmount or if searchTerm changes again
    }, [searchTerm]); // Re-run this effect whenever searchTerm changes


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // --- Handlers for regular course/year/semester selection ---
    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedYear(null);
        setSelectedSemester(null);
        setShowSearchResults(false); // Hide search results if user goes back to normal selection
        setSearchTerm('');          // Clear search term
        setSearchResults([]);       // Clear search results
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null);
        setShowSearchResults(false); // Hide search results
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSemesterSelect = (semester) => {
        setSelectedSemester(semester);
        setShowSearchResults(false); // Hide search results
        setSearchTerm('');
        setSearchResults([]);
    };

    // --- Handler for clicking a search result ---
    const handleSearchResultClick = (subjectDetails) => {
        // This function sets the state variables to navigate to the specific subject's page
        // The `SubjectList` component will then render based on these updated states.
        setSelectedCourse({ code: subjectDetails.courseCode, title: subjectDetails.courseName });
        setSelectedYear(subjectDetails.year);
        setSelectedSemester(subjectDetails.semester);
        // SubjectList expects courseCode, year, semester.
        // If SubjectList also needs the exact subject name (e.g., for highlighting),
        // you might need an additional state for selectedSubjectName.
        // For now, it will fetch all subjects for that course/year/semester and then find the study materials.
        setShowSearchResults(false); // Hide search results after selection
        setSearchTerm('');          // Clear search bar
        setSearchResults([]);       // Clear results
        console.log("Navigating to study materials for:", subjectDetails);
    };

    const resetSelection = () => {
        setSelectedCourse(null);
        setSelectedYear(null);
        setSelectedSemester(null);
        setSelectedSemester(null); // Ensure semester is also reset
        setShowSearchResults(false); // Also hide search results on full reset
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <div className="dashboard-container">
            <TopNavigation />
            <main className="main-content">
                <WelcomeMessage />
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search for subjects or study materials..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                {/* --- Conditional Rendering based on Search State --- */}
                {showSearchResults ? (
                    // Display search results if search is active
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
                ) : ( // Otherwise, display the normal course/year/semester navigation flow
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
                        // This is where SubjectList gets rendered after all selections
                        // or after a search result click sets the relevant states.
                        <SubjectList
                            courseCode={selectedCourse.code}
                            year={selectedYear}
                            semester={selectedSemester}
                            // If SubjectList needs the exact subject name to highlight/filter materials,
                            // you might need an additional state variable for 'selectedSubjectName'
                            // and pass it here. For now, it will show materials for the whole semester.
                            onReset={resetSelection}
                        />
                    )
                )}
            </main>
        </div>
    );
}

export default DashboardLayout;