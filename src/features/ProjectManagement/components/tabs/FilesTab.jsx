import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const FilesTab = ({ project }) => {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    const fetchFiles = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/files/get_files.php?project_id=${project.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setFiles(data);
            } else {
                setError(data.message || 'Failed to fetch files.');
            }
        } catch {
            setError('An error occurred while fetching files.');
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [project.id]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('project_id', project.id);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/files/upload.php', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                fetchFiles(); // Refresh file list
            } else {
                alert(data.message || 'File upload failed.');
            }
        } catch {
            alert('An error occurred during upload.');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (window.confirm(`Are you sure you want to delete this file?`)) {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('/api/files/delete.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ file_id: fileId })
                });
                const data = await response.json();
                if (response.ok) {
                    fetchFiles(); // Refresh file list
                } else {
                    alert(data.message || 'Failed to delete file.');
                }
            } catch {
                alert('An error occurred while deleting the file.');
            }
        }
    };

    return (
        <div className="files-tab-container">
            <div className="files-header">
                <h3>Project Files ({files.length})</h3>
                <button className="upload-btn" onClick={handleUploadClick}>
                    {ICONS.upload}
                    <span>Upload Files</span>
                </button>
                <input
                    data-testid="file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {files.length > 0 ? (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Uploader</th>
                                <th>Size</th>
                                <th>Date Uploaded</th>
                                <th>Download</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.id}>
                                    <td>
                                        <div className="file-name-cell">
                                            {/* Basic icon logic, can be expanded */}
                                            {ICONS[file.type === 'pdf' ? 'pdf' : (file.type === 'jpg' || file.type === 'png' || file.type === 'jpeg' || file.type === 'gif' ? 'image' : 'file')]}
                                            <span>{file.name}</span>
                                        </div>
                                    </td>
                                    <td>{file.uploader_name}</td>
                                    <td>{formatBytes(file.size)}</td>
                                    <td>{new Date(file.uploaded_at).toLocaleDateString()}</td>
                                    <td>
                                        <a
                                            href={`/api/files/download_file.php?id=${file.id}&token=${localStorage.getItem('access_token')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="download-link-icon"
                                            title={`Download ${file.name}`}
                                        >
                                            {ICONS.download || 'Download'}
                                        </a>
                                    </td>
                                    <td>
                                        <div className="action-icons">
                                            {/* Assuming currentUser info would be needed here to show delete for uploader or admin */}
                                            {/* For now, delete is kept as is. Permissions should be backend enforced. */}
                                            <span className="delete-icon" onClick={() => handleDeleteFile(file.id)} title="Delete file">{ICONS.delete}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-files-message">
                    <p>No files have been uploaded to this project yet.</p>
                </div>
            )}
        </div>
    );
};

FilesTab.propTypes = {
    project: PropTypes.object.isRequired,
};