// src/components/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import './DashboardStyles.css'; // Assuming relevant styles are here


// NEW: Import a component to render individual materials
import MaterialDisplayList from './MaterialDisplayList';

function SubjectList({ courseCode, year, semester, onReset }) {
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [errorSubjects, setErrorSubjects] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null); // To store the selected subject
    const [materials, setMaterials] = useState([]); // To store materials for the selected subject
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [errorMaterials, setErrorMaterials] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            setErrorSubjects(null);
            try {
                // This is the actual fetch call for subjects, as per your original code's intent
                const response = await fetch(`http://localhost:5000/api/courses/${courseCode}/years/${year}/semesters/${semester}/subjects`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSubjects(data);
            } catch (err) {
                setErrorSubjects(err.message);
            } finally {
                setLoadingSubjects(false);
            }
        };

        fetchSubjects();
    }, [courseCode, year, semester]);

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
    };

    // This useEffect remains the same: fetches materials when a subject is selected
    useEffect(() => {
        const fetchMaterials = async () => {
            if (!selectedSubject) return; // Don't fetch if no subject is selected

            setLoadingMaterials(true);
            setErrorMaterials(null);
            setMaterials([]); // Clear previous materials

            try {
                // Call the NEW backend endpoint to get materials for the selected subject
                const response = await fetch(`http://localhost:5000/api/materials/by_subject?courseCode=${courseCode}&year=${year}&semester=${semester}&subject=${selectedSubject}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch materials for ${selectedSubject}`);
                }
                const data = await response.json();
                setMaterials(data);
            } catch (err) {
                setErrorMaterials(err.message);
            } finally {
                setLoadingMaterials(false);
            }
        };

        fetchMaterials();
    }, [selectedSubject, courseCode, year, semester]); // Re-run when selectedSubject changes

    if (loadingSubjects) return <div className="loading-message">Loading subjects...</div>;
    if (errorSubjects) return <div className="error-message">Error loading subjects: {errorSubjects}</div>;

    return (
        <div className="list-container"> {/* Assuming 'list-container' provides styling */}
            {!selectedSubject ? (
                <>
                    <h2>Subjects for {courseCode} - Year {year} - Semester {semester}</h2>
                    <ul className="item-list"> {/* Assuming 'item-list' provides styling */}
                        {subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                // Assuming 'subject' is a string. If it's an object, adjust key and display
                                <li key={subject} className="list-item" onClick={() => handleSubjectSelect(subject)}>
                                    {subject}
                                </li>
                            ))
                        ) : (
                            <p>No subjects found for this selection. Please add materials via admin panel.</p>
                        )}
                    </ul>
                    <button onClick={onReset} className="back-button">Back to Semesters</button>
                </>
            ) : (
                <>
                    <h2>Materials for {selectedSubject}</h2>
                    {loadingMaterials ? (
                        <div className="loading-message">Loading materials for {selectedSubject}...</div>
                    ) : errorMaterials ? (
                        <div className="error-message">Error loading materials: {errorMaterials}</div>
                    ) : (
                        <MaterialDisplayList materials={materials} backendUrl="http://localhost:5000" />
                    )}
                    <button onClick={() => setSelectedSubject(null)} className="back-button">Back to Subjects</button>
                    <button onClick={onReset} className="back-button" style={{ marginLeft: '10px' }}>Back to Courses</button>
                </>
            )}
        </div>
    );
}

export default SubjectList;