// SubjectList.jsx
import React, { useState, useEffect } from 'react';

function SubjectList({ courseCode, year, semester, onReset }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/courses/${courseCode}/years/${year}/semesters/${semester}/subjects`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSubjects(data);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [courseCode, year, semester]);

    if (loading) {
        return <div>Loading subjects...</div>;
    }

    if (error) {
        return <div>Error loading subjects: {error}</div>;
    }

    return (
        <div className="subject-list">
            <h2>Subjects</h2>
            <button onClick={onReset}>Back to Course Selection</button>
            {subjects.map((subject) => (
                <div key={subject}>{subject}</div>
            ))}
        </div>
    );
}

export default SubjectList;