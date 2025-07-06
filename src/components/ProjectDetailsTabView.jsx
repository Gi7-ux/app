import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ProjectDetailsModal.css';
import './ProjectDetailsTabView.css';
import { ICONS } from '../assets/icons';

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

    const renderDetailsTab = () => (
        <div className="tab-content-container">
            <form onSubmit={handleSubmit} className="project-details-form">
                <div className="form-content">
                    <div className="form-column">
                        <div className="form-group">
                            <label htmlFor="title">Project Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="skills-section tab-section">
                            <div className="tab-section-header">Skills Required:</div>
                            <div className="skills-container tab-section-content">
                                {Array.isArray(project.skills) && project.skills.length > 0 ? (
                                    project.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)
                                ) : (
                                    <p>No skills specified.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-column">
                        <div className="details-grid">
                            <div className="form-group">
                                <label htmlFor="budget">Budget (R)</label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Pending Approval">Pending Approval</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="client-freelancer-section tab-section">
                            <div className="tab-section-header">Project Team</div>
                            <div className="tab-section-content">
                                <div><strong>Client:</strong> {project.clientName || 'Not assigned'}</div>
                                <div><strong>Freelancer:</strong> {project.freelancerName || 'Not assigned'}</div>
                                <div><strong>Created:</strong> {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}</div>
                            </div>
                        </div>

                        <div className="budget-section tab-section">
                            <div className="tab-section-header">Budget Information</div>
                            <div className="tab-section-content">
                                <div><strong>Budget:</strong> R {(project.budget || 0).toLocaleString()}</div>
                                <div><strong>Spent:</strong> R {(project.spend || 0).toLocaleString()}</div>
                                <div><strong>Remaining:</strong> R {((project.budget || 0) - (project.spend || 0)).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderTasksTab = () => (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Assigned Tasks</span>
                            <button className="btn-primary task-add-btn">
                                {ICONS.add} Add Task
                            </button>
                        </div>
                        <div className="tasks-list tab-section-content">
                            {project.assignments && project.assignments.length > 0 ? (
                                project.assignments.map(task => (
                                    <div key={task.id} className="task-item">
                                        <div className="task-header">
                                            <strong>{task.title}</strong>
                                            <span className="task-status">{task.status || 'Todo'}</span>
                                        </div>
                                        <p>{task.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div>No tasks assigned yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Task Summary</div>
                        <div className="tab-section-content">
                            <div><strong>Total Tasks:</strong> {project.assignments?.length || 0}</div>
                            <div><strong>Completed:</strong> {project.assignments?.filter(a => a.status === 'Completed').length || 0}</div>
                            <div><strong>In Progress:</strong> {project.assignments?.filter(a => a.status === 'In Progress').length || 0}</div>
                            <div><strong>Todo:</strong> {project.assignments?.filter(a => a.status !== 'Completed' && a.status !== 'In Progress').length || 0}</div>
                        </div>
                    </div>

                    <div className="tab-section">
                        <div className="tab-section-header">Create Quick Task</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label htmlFor="task-title">Task Title</label>
                                <input
                                    type="text"
                                    id="task-title"
                                    placeholder="Enter task title"
                                    value={quickTaskData.title}
                                    onChange={(e) => setQuickTaskData({ ...quickTaskData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="task-description">Description</label>
                                <textarea
                                    id="task-description"
                                    placeholder="Enter task description"
                                    value={quickTaskData.description}
                                    onChange={(e) => setQuickTaskData({ ...quickTaskData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={handleCreateTask}
                                disabled={loading || !quickTaskData.title.trim()}
                            >
                                {loading ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
                <button type="button" className="btn-primary">Save Tasks</button>
            </div>
        </div>
    );

    const renderMessagesTab = () => (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Project Messages</div>
                        <div className="messages-list tab-section-content">
                            <div>No messages yet for this project.</div>
                        </div>
                    </div>
                    <div className="message-composer">
                        <textarea placeholder="Write a message..."></textarea>
                        <button className="btn-primary">{ICONS.send} Send</button>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Message Settings</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label>Notifications</label>
                                <select>
                                    <option value="all">All Messages</option>
                                    <option value="mentions">Mentions Only</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Message Recipients</label>
                                <select>
                                    <option value="all">All Team Members</option>
                                    <option value="client">Client Only</option>
                                    <option value="freelancer">Freelancer Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="tab-section">
                        <div className="tab-section-header">Quick Templates</div>
                        <div className="tab-section-content">
                            <button className="btn-secondary">Request Update</button>
                            <button className="btn-secondary">Schedule Meeting</button>
                            <button className="btn-secondary">Payment Reminder</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );

    const renderFilesTab = () => (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Project Files</span>
                            <button className="btn-primary file-upload-btn">
                                {ICONS.upload} Upload
                            </button>
                        </div>
                        <div className="files-list tab-section-content">
                            <div>No files uploaded yet.</div>
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Upload New File</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label>File Type</label>
                                <select>
                                    <option value="document">Document</option>
                                    <option value="image">Image</option>
                                    <option value="drawing">Drawing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input type="text" placeholder="Brief description of the file" />
                            </div>
                            <div className="form-group">
                                <label>File</label>
                                <input type="file" />
                            </div>
                            <button className="btn-primary">{ICONS.upload} Upload File</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );

    const renderTimeLogsTab = () => (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="total-time">
                        <strong>Total Time Logged:</strong> {project.totalTime || '00:00'}
                    </div>
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Time Entries</span>
                            <button className="btn-primary timelog-add-btn">
                                {ICONS.clock} Log Time
                            </button>
                        </div>
                        <div className="timelogs-list tab-section-content">
                            <div>No time logs recorded yet.</div>
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Record New Time</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" />
                            </div>
                            <div className="form-group">
                                <label>Hours</label>
                                <input type="number" min="0.25" step="0.25" />
                            </div>
                            <div className="form-group">
                                <label>Task</label>
                                <select>
                                    <option value="">Select a task</option>
                                    {project.assignments?.map(task => (
                                        <option key={task.id} value={task.id}>{task.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Briefly describe the work done"></textarea>
                            </div>
                            <button className="btn-primary">{ICONS.clock} Save Time Entry</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'details':
                return renderDetailsTab();
            case 'tasks':
                return renderTasksTab();
            case 'messages':
                return renderMessagesTab();
            case 'files':
                return renderFilesTab();
            case 'timelogs':
                return renderTimeLogsTab();
            default:
                return renderDetailsTab();
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
