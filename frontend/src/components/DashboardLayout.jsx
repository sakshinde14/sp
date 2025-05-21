// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
import './DashboardStyles.css';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList';
import SemesterList from './SemesterList'; // Ensure this is the CORRECTED SemesterList.jsx
import SubjectList from './SubjectList';

function DashboardLayout() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null); // This holds the full course object
    const [selectedYear, setSelectedYear] = useState(null);    // This holds the selected year (e.g., 1, 2, 3)
    const [selectedSemester, setSelectedSemester] = useState(null);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Implement search logic later
    };

    const handleCourseSelect = (course) => {
        // 'course' here is the full course object with 'code', 'title', 'years' etc.
        setSelectedCourse(course);
        setSelectedYear(null);       // Reset year when a new course is selected
        setSelectedSemester(null);   // Reset semester
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null); // Reset semester when a new year is selected
    };

    const handleSemesterSelect = (semester) => {
        setSelectedSemester(semester);
    };

    const resetSelection = () => {
        setSelectedCourse(null);
        setSelectedYear(null);
        setSelectedSemester(null);
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
                {/* Conditionally render components based on selection */}
                {!selectedCourse ? (
                    <CourseList onCourseSelect={handleCourseSelect} />
                ) : !selectedYear ? (
                    // YearList already correctly receives courseCode
                    <YearList courseCode={selectedCourse.code} onYearSelect={handleYearSelect} />
                ) : !selectedSemester ? (
                    // *** THIS IS THE CRUCIAL CHANGE FOR SEMESTERLIST ***
                    <SemesterList
                        onSemesterSelect={handleSemesterSelect}
                        courseCode={selectedCourse.code} // Pass the course code from the selectedCourse object
                        selectedYear={selectedYear}     // Pass the selected year state
                    />
                ) : (
                    <SubjectList
                        courseCode={selectedCourse.code}
                        year={selectedYear}
                        semester={selectedSemester}
                        onReset={resetSelection}
                    />
                )}
            </main>
        </div>
    );
}

export default DashboardLayout;