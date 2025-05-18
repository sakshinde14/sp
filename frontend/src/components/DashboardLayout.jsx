import React, { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
import './DashboardStyles.css';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList'; // Create this component later
import SemesterList from './SemesterList'; // Create this component later
import SubjectList from './SubjectList'; // Create this component later

function DashboardLayout() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Implement search logic later
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedYear(null);
        setSelectedSemester(null);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null);
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
                    <YearList courseCode={selectedCourse.code} onYearSelect={handleYearSelect} />
                ) : !selectedSemester ? (
                    <SemesterList onSemesterSelect={handleSemesterSelect} />
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