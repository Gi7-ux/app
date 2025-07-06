import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons';
import { getToken } from '../services/AuthService'; // Assuming you have a way to get the auth token
import './ProjectFilesTab.css'; // Import the CSS file

const API_URL = import.meta.env.VITE_API_URL || ''; // Adjust if your API URL is configured differently

const ProjectFilesTab = ({ onClose, projectId, currentUser }) => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // File upload form state
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState('document');
    const [fileDescription, setFileDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);


    const fetchFiles = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        setError(null);
        const token = getToken();

        try {
            const response = await fetch(`${API_URL}/api/files/get_files.php?project_id=${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setFiles(data);
        } catch (e) {
            setError(e.message);
            console.error("Failed to fetch files:", e);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles, projectId]);

    const handleFileDownload = async (fileId, fileName) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/api/files/download_file.php?id=${fileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorText = await response.text(); // Or response.json() if API returns JSON error
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (e) {
            console.error("Failed to download file:", e);
            alert(`Failed to download file: ${e.message}`);
        }
    };

    const handleFileDelete = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/api/files/delete.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_id: fileId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            await response.json(); // Or handle success message
            setFiles(files.filter(file => file.id !== fileId)); // Refresh file list
        } catch (e) {
            console.error("Failed to delete file:", e);
            alert(`Failed to delete file: ${e.message}`);
        }
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile || !projectId) {
            setUploadError("Please select a file and ensure project ID is available.");
            return;
        }
        setIsUploading(true);
        setUploadError(null);
        const token = getToken();
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('project_id', projectId);
        formData.append('file_type', fileType); // Optional: if your API uses this
        formData.append('description', fileDescription); // Optional: if your API uses this

        try {
            const response = await fetch(`${API_URL}/api/files/upload.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' is automatically set by browser for FormData
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            await response.json(); // Or handle success message
            fetchFiles(); // Refresh file list
            setSelectedFile(null);
            setFileDescription('');
            setFileType('document');
            event.target.reset(); // Reset the form
        } catch (e) {
            setUploadError(e.message);
            console.error("Failed to upload file:", e);
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Project Files</span>
                            {/* Button to trigger upload form or modal can be here if needed */}
                        </div>
                        <div className="files-list tab-section-content">
                            {isLoading && <div>Loading files...</div>}
                            {error && <div className="error-message">Error: {error}</div>}
                            {!isLoading && !error && files.length === 0 && <div>No files uploaded yet.</div>}
                            {!isLoading && !error && files.length > 0 && (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Size (KB)</th>
                                            <th>Uploaded By</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map(file => (
                                            <tr key={file.id}>
                                                <td>{file.name}</td>
                                                <td>{file.type}</td>
                                                <td>{(file.size / 1024).toFixed(2)}</td>
                                                <td>{file.uploader_name}</td>
                                                <td>{new Date(file.uploaded_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button onClick={() => handleFileDownload(file.id, file.name)} className="btn-icon" title="Download">
                                                        {ICONS.download}
                                                    </button>
                                                    {currentUser && currentUser.role === 'admin' && (
                                                        <button onClick={() => handleFileDelete(file.id)} className="btn-icon btn-danger" title="Delete">
                                                            {ICONS.delete}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Upload New File</div>
                        <form onSubmit={handleFileUpload} className="tab-section-content">
                            {uploadError && <div className="error-message">{uploadError}</div>}
                            <div className="form-group">
                                <label htmlFor="fileType">File Type</label>
                                <select id="fileType" value={fileType} onChange={e => setFileType(e.target.value)}>
                                    <option value="document">Document</option>
                                    <option value="image">Image</option>
                                    <option value="drawing">Drawing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fileDescription">Description (Optional)</label>
                                <input
                                    type="text"
                                    id="fileDescription"
                                    value={fileDescription}
                                    onChange={e => setFileDescription(e.target.value)}
                                    placeholder="Brief description of the file"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fileInput">File</label>
                                <input
                                    type="file"
                                    id="fileInput"
                                    onChange={handleFileSelect}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : <>{ICONS.upload} Upload File</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

ProjectFilesTab.propTypes = {
    onClose: PropTypes.func.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currentUser: PropTypes.shape({ // Assuming you pass current user info for role checks
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        role: PropTypes.string,
        // Add other user properties if needed
    }),
};

export default ProjectFilesTab;
