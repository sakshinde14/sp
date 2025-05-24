// src/components/AddMaterial.jsx
import React, { useState } from 'react';
//import './FormStyles.css'; // Ensure this CSS file exists for form styling

function AddMaterial() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [materialType, setMaterialType] = useState('PDF_notes'); // NEW: Default to PDF_notes
    const [file, setFile] = useState(null); // For file uploads
    const [contentUrl, setContentUrl] = useState(''); // NEW: For URLs
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
        formData.append('materialType', materialType); // NEW

        // Conditionally append file or URL
        if (materialType === 'PDF_notes' || materialType === 'Question_Paper') {
            if (file) {
                formData.append('materialFile', file);
            } else {
                setError('Please upload a file for this material type.');
                setUploading(false);
                return;
            }
        } else if (materialType === 'Video_Link' || materialType === 'External_URL') {
            if (contentUrl.trim()) {
                formData.append('contentUrl', contentUrl.trim());
            } else {
                setError('Please provide a URL for this material type.');
                setUploading(false);
                return;
            }
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/materials/add', {
                method: 'POST',
                body: formData, // FormData sends multipart/form-data
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
            setMaterialType('PDF_notes'); // Reset to default
            setFile(null);
            setContentUrl('');
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

                {/* NEW: Material Type Selector */}
                <div className="form-group">
                    <label htmlFor="materialType">Material Type:</label>
                    <select id="materialType" value={materialType} onChange={(e) => setMaterialType(e.target.value)} required>
                        <option value="PDF_notes">PDF Notes</option>
                        <option value="Video_Link">Video Link</option>
                        <option value="External_URL">External URL</option>
                        <option value="Question_Paper">Question Paper</option>
                    </select>
                </div>

                {/* Conditionally render file input or URL input */}
                {(materialType === 'PDF_notes' || materialType === 'Question_Paper') && (
                    <div className="form-group">
                        <label htmlFor="file-upload-input">Upload File:</label>
                        <input type="file" id="file-upload-input" onChange={(e) => setFile(e.target.files[0])} />
                        <small>Supported formats: PDF, DOC, PPT, etc.</small>
                    </div>
                )}

                {(materialType === 'Video_Link' || materialType === 'External_URL') && (
                    <div className="form-group">
                        <label htmlFor="contentUrl">Content URL:</label>
                        <input type="url" id="contentUrl" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="e.g., https://www.youtube.com/watch?v=..." />
                        <small>Provide a direct link to the video or external resource.</small>
                    </div>
                )}

                <button type="submit" className="submit-button" disabled={uploading}>
                    {uploading ? 'Adding...' : 'Add Material'}
                </button>
            </form>
        </div>
    );
}

export default AddMaterial;