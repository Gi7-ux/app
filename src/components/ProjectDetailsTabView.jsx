import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ProjectDetailsTab from './ProjectDetailsTab';
import ProjectTasksTab from './ProjectTasksTab';
import ProjectMessagesTab from './ProjectMessagesTab';
import ProjectFilesTab from './ProjectFilesTab';
import ProjectTimeLogsTab from './ProjectTimeLogsTab';

const ProjectDetailsTabView = ({ project: initialProject, onClose, onSave }) => {
    const [project, setProject] = useState(initialProject);
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        budget: project?.budget || 0,
        deadline: project?.deadline ? project.deadline.split('T')[0] : '',
        status: project?.status || 'Open',
    });
    const [quickTaskData, setQuickTaskData] = useState({
        title: '',
        description: ''
    });

    // Get additional project data if needed
    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!project?.id) return;

            setLoading(true);
            setError('');
            try {
                // Get the token and check if it exists
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setError('You are not authenticated. Please log in to view project details.');
                    // Redirect to login or show a login modal here if needed
                    console.error('Authentication token not found');
                    setLoading(false);
                    return;
                }

                // Add debug logging for the request
                console.log('Making API request to:', `/api/projects/read_one.php?id=${project.id}`);
                console.log('With token:', token.substring(0, 10) + '...');

                const response = await fetch(`/api/projects/read_one.php?id=${project.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                console.log('API response status:', response.status);
                console.log('API response data:', data);

                if (response.ok) {
                    setProject(data);
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        budget: data.budget || 0,
                        deadline: data.deadline ? data.deadline.split('T')[0] : '',
                        status: data.status || 'Open',
                    });
                } else {
                    if (response.status === 401) {
                        // When we get a 401, check the token validity directly
                        const validationToken = localStorage.getItem('access_token');
                        if (validationToken) {
                            console.log('Verifying token validity...');
                            // Try to validate the token with our check_token endpoint
                            fetch('/api/auth/check_token.php', {
                                headers: { 'Authorization': `Bearer ${validationToken}` }
                            })
                                .then(tokenResp => tokenResp.json())
                                .then(tokenData => {
                                    console.log('Token check response:', tokenData);
                                    if (tokenData.message !== "Token is valid") {
                                        // Token is indeed invalid
                                        setError('Your session has expired. Please log in again.');
                                        localStorage.removeItem('access_token');
                                        setTimeout(() => {
                                            window.location.href = '/login';
                                        }, 3000);
                                    } else {
                                        // Token is valid, but access to this project is denied
                                        setError('You do not have permission to access this project.');
                                    }
                                })
                                .catch(err => {
                                    console.error('Token check error:', err);
                                    setError('Authentication error. Please try logging in again.');
                                    localStorage.removeItem('access_token');
                                });
                        } else {
                            setError('No authentication token found. Please log in.');
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 3000);
                        }
                    } else if (response.status === 500 && data.error && data.error.includes('SQLSTATE')) {
                        // Handle SQL errors with a more user-friendly message
                        setError('Database error occurred. Our team has been notified.');
                        console.error('SQL Error:', data.error);
                    } else {
                        setError(data.message || 'Failed to fetch project details.');
                    }
                }
            } catch (err) {
                setError('An error occurred while fetching project details.');
                console.error('Error fetching project details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [project?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === 'budget') {
                const parsedValue = parseFloat(value);
                // If the parsed value is NaN (e.g., empty string or invalid input), set it to 0
                return { ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('You are not authenticated. Please log in to update project details.');
                setLoading(false);
                return;
            }

            console.log('Making update request to: /api/projects/update_tabs.php');
            console.log('Update request data:', { id: project.id, ...formData });

            const response = await fetch('/api/projects/update_tabs.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: project.id,
                    ...formData
                })
            });

            const data = await response.json();
            console.log('Update API response status:', response.status);
            console.log('Update API response data:', data);

            if (response.ok) {
                // If we get back the full updated project object
                if (data.id) {
                    setProject(data);
                    if (onSave) {
                        onSave(data);
                    }
                } else {
                    // Fallback to updating with form data if we don't get full object back
                    setProject({ ...project, ...formData });
                    if (onSave) {
                        onSave({ ...project, ...formData });
                    }
                }
                setError('');
            } else {
                if (response.status === 401) {
                    // Check token validity when we get a 401
                    const validationToken = localStorage.getItem('access_token');
                    if (validationToken) {
                        console.log('Verifying token validity in submit handler...');
                        // Try to validate the token with our check_token endpoint
                        fetch('/api/auth/check_token.php', {
                            headers: { 'Authorization': `Bearer ${validationToken}` }
                        })
                            .then(tokenResp => tokenResp.json())
                            .then(tokenData => {
                                console.log('Token check response:', tokenData);
                                if (tokenData.message !== "Token is valid") {
                                    // Token is indeed invalid
                                    setError('Your session has expired. Please log in again.');
                                    localStorage.removeItem('access_token');
                                    setTimeout(() => {
                                        window.location.href = '/login';
                                    }, 3000);
                                } else {
                                    // Token is valid, but access to this operation is denied
                                    setError('You do not have permission to update this project.');
                                }
                            })
                            .catch(err => {
                                console.error('Token check error:', err);
                                setError('Authentication error. Please try logging in again.');
                                localStorage.removeItem('access_token');
                            });
                    } else {
                        setError('Your session has expired. Please log in again.');
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 3000);
                    }
                } else if (response.status === 500 && data.error && data.error.includes('SQLSTATE')) {
                    // Handle SQL errors with a more user-friendly message
                    setError('Database error occurred. The technical team has been notified.');
                    console.error('SQL Error:', data.error);
                } else {
                    setError(data.message || 'Failed to update project.');
                }
            }
        } catch (err) {
            setError('An error occurred while saving the project.');
            console.error('Error updating project:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        // Validate task data
        if (!quickTaskData.title.trim()) {
            setError('Task title is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('You are not authenticated. Please log in to create tasks.');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/assignments/save.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: project.id,
                    title: quickTaskData.title,
                    description: quickTaskData.description
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update the project with the new task
                setProject(prevProject => ({
                    ...prevProject,
                    assignments: [...(prevProject.assignments || []), data]
                }));

                // Clear the form after successful submission
                setQuickTaskData({ title: '', description: '' });
                setError('Task created successfully!'); // Using error state for success message temporarily
            } else {
                setError(data.message || 'Failed to create task.');
            }
        } catch (err) {
            setError('An error occurred while creating the task.');
            console.error('Error creating task:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'messages', label: 'Messages' },
        { id: 'files', label: 'Files' },
        { id: 'timelogs', label: 'Time Logs' },
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <ProjectDetailsTab
                        project={project}
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        loading={loading}
                        onClose={onClose}
                        onSave={onSave}
                    />
                );
            case 'tasks':
                return (
                    <ProjectTasksTab
                        project={project}
                        quickTaskData={quickTaskData}
                        setQuickTaskData={setQuickTaskData}
                        handleCreateTask={handleCreateTask}
                        loading={loading}
                        onClose={onClose}
                    />
                );
            case 'messages':
                return <ProjectMessagesTab onClose={onClose} />;
            case 'files':
                return <ProjectFilesTab onClose={onClose} />;
            case 'timelogs':
                return <ProjectTimeLogsTab project={project} onClose={onClose} />;
            default:
                return (
                    <ProjectDetailsTab
                        project={project}
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        loading={loading}
                        onClose={onClose}
                        onSave={onSave}
                    />
                );
        }
    };

    if (loading) return <div className="loading-indicator">Loading project details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!project) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content project-details-modal">
                <div className="modal-sidebar">
                    <div className="modal-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-content-area">
                    <div className="modal-header">
                        <h2>Project: {project.title}</h2>
                        <button onClick={onClose} className="close-button">&times;</button>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                            <button className="error-close-btn" onClick={() => setError('')}>×</button>
                        </div>
                    )}

                    <div className="modal-body">
                        {renderActiveTab()}
                    </div>
                </div>
            </div>
        </div>
    );
};

ProjectDetailsTabView.propTypes = {
    project: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func
};

export default ProjectDetailsTabView;
