// SemesterList.jsx
import React, { useState, useEffect } from 'react';

function SemesterList({ onSemesterSelect }) {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                // Assuming you don't need courseCode or year here, but you might later
                const response = await fetch(`http://localhost:5000/api/courses/dummy/years/1/semesters`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSemesters(data);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        };

        fetchSemesters();
    }, []);

    if (loading) {
        return <div>Loading semesters...</div>;
    }

    if (error) {
        return <div>Error loading semesters: {error}</div>;
    }

    return (
        <div className="semester-list">
            <h2>Select Semester</h2>
            {semesters.map((semester) => (
                <button key={semester} onClick={() => onSemesterSelect(semester)} className="semester-button">
                    Semester {semester}
                </button>
            ))}
        </div>
    );
}

export default SemesterList;