// src/components/MaterialDisplayList.jsx
import React from 'react';
import './DashboardStyles.css'; // Assuming your list styles are here

function MaterialDisplayList({ materials, backendUrl }) {
    if (!materials || materials.length === 0) {
        return <p>No study materials available for this subject yet.</p>;
    }

    return (
        <div className="material-list-container">
            <h3>Available Materials:</h3>
            <ul className="material-item-list">
                {materials.map(material => (
                    <li key={material._id} className="material-item">
                        <div className="material-info">
                            <h4>{material.title}</h4>
                            {material.description && <p>{material.description}</p>}
                            <span className="material-type-tag">{material.materialType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="material-actions">
                            {material.materialType === 'PDF_notes' || material.materialType === 'Question_Paper' ? (
                                material.filePath ? (
                                    <a
                                        href={`${backendUrl}${material.filePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-material-button"
                                        download={material.fileOriginalName || material.title} // Use original name for download
                                    >
                                        Download {material.fileOriginalName || "File"}
                                    </a>
                                ) : (
                                    <span className="no-file-message">File not available</span>
                                )
                            ) : material.materialType === 'Video_Link' || material.materialType === 'External_URL' ? (
                                material.contentUrl ? (
                                    <a
                                        href={material.contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-material-button"
                                    >
                                        View Content
                                    </a>
                                ) : (
                                    <span className="no-url-message">Link not available</span>
                                )
                            ) : (
                                <span className="unknown-type-message">Unknown Material Type</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MaterialDisplayList;