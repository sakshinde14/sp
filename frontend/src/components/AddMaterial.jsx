// src/components/AddMaterial.jsx
import React, { useState } from 'react';
//import './FormStyles.css'; // You'll need to create this CSS file or integrate into existing ones

function AddMaterial() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState(null); // For file uploads
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('courseCode', courseCode);
        formData.append('year', year);
        formData.append('semester', semester);
        formData.append('subject', subject);
        if (file) {
            formData.append('materialFile', file); // 'materialFile' should match backend's expected field name
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/materials/add', {
                method: 'POST',
                body: formData, // FormData sends multipart/form-data
                // No 'Content-Type' header needed for FormData; browser sets it
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add material');
            }

            setMessage('Material added successfully!');
            // Clear form
            setTitle('');
            setDescription('');
            setCourseCode('');
            setYear('');
            setSemester('');
            setSubject('');
            setFile(null);
            document.getElementById('file-upload-input').value = ''; // Clear file input
        } catch (err) {
            console.error("Error adding material:", err);
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="add-material-container">
            <h2>Add New Study Material</h2>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="material-form">
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4"></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="courseCode">Course Code:</label>
                    <input type="text" id="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="year">Year:</label>
                    <input type="number" id="year" value={year} onChange={(e) => setYear(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="semester">Semester:</label>
                    <input type="number" id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="subject">Subject:</label>
                    <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="file-upload-input">Upload File:</label>
                    <input type="file" id="file-upload-input" onChange={(e) => setFile(e.target.files[0])} />
                    <small>Optional: You can upload a PDF, DOC, or other relevant file.</small>
                </div>
                <button type="submit" className="submit-button" disabled={uploading}>
                    {uploading ? 'Adding...' : 'Add Material'}
                </button>
            </form>
        </div>
    );
}

export default AddMaterial;