import React, { useState, useEffect, useRef } from 'react';
import './ProjectDetailsModal.css';
import { ICONS } from '../assets/icons';
import { AuthService } from '../services/AuthService.js';

const ProjectDetailsModal = ({ project, onClose, onAcceptApplication, onManageTasks }) => {
    const [pendingApplications, setPendingApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [errorApplications, setErrorApplications] = useState(null);
    const isMounted = useRef(true);

    if (!project) return null;

    useEffect(() => {
        if (!project || !project.id) {
            setLoadingApplications(false);
            return;
        }

        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchApplications = async () => {
            try {
                if (isMounted.current) setLoadingApplications(true);
                if (isMounted.current) setErrorApplications(null);

                const token = AuthService.getAccessToken();
                // Using query parameter format like other endpoints
                const response = await fetch(`/api/projects/applications.php?project_id=${project.id}`, {
                    signal,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (isMounted.current) setPendingApplications(data);
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error("Error fetching pending applications:", error);
                    if (isMounted.current) setErrorApplications(error);
                }
            } finally {
                if (isMounted.current) setLoadingApplications(false);
            }
        };

        fetchApplications();

        return () => {
            isMounted.current = false;
            abortController.abort();
        };
    }, [project]);

    useEffect(() => {
        // Reset the ref when component mounts
        isMounted.current = true;

        // Cleanup on unmount
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleAccept = (application) => {
        console.log('Accepted application:', application);
        if (onAcceptApplication) {
            onAcceptApplication(application);
        }
    };

    const handleManage = () => {
        console.log('Manage tasks for project:', project);
        if (onManageTasks) {
            onManageTasks(project);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Details: {project.title}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>Description:</strong> {project.description}</p>
                    <div className="details-grid">
                        <div><strong>Budget:</strong> R {project.budget?.toLocaleString() ?? 'N/A'}</div>
                        <div><strong>Spend:</strong> R {project.spend?.toLocaleString() ?? 'N/A'}</div>
                        <div><strong>Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</div>
                        <div><strong>Client:</strong> {project.clientName ?? 'N/A'}</div>
                        <div><strong>Status:</strong> <span className={`status-pill status-${project.status?.replace(' ', '.')}`}>{project.status ?? 'N/A'}</span></div>
                    </div>

                    <div className="columns-container">
                        <div className="skills-section column">
                            <h3>Skills Required:</h3>
                            <div className="skills-container">
                                {project.skills && project.skills.length > 0 ? (
                                    project.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)
                                ) : (
                                    <p>No skills specified.</p>
                                )}
                            </div>
                        </div>

                        <div className="tasks-section column">
                            <h3>Job Cards / Tasks:</h3>
                            <ul>
                                {project.assignments && project.assignments.length > 0 ? (
                                    project.assignments.map(task => <li key={task.id}>{task.title} - ToDo</li>)
                                ) : (
                                    <li>No tasks assigned yet.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="applications-section">
                        <h3>Pending Applications ({pendingApplications.length})</h3>
                        {loadingApplications ? (
                            <p>Loading applications...</p>
                        ) : errorApplications ? (
                            <p className="error-message">Error loading applications: {errorApplications.message}</p>
                        ) : pendingApplications.length > 0 ? (
                            pendingApplications.map(app => (
                                <div key={app.id} className="application-card">
                                    <div className="application-header">
                                        <strong>{app.freelancerName}</strong> ({app.freelancerHandle})
                                        <span className="bid">Bid: R {app.bid.toLocaleString()}</span>
                                    </div>
                                    <p>"{app.note}"</p>
                                    <button className="accept-btn" onClick={() => handleAccept(app)}>{ICONS.accept} Accept Application</button>
                                </div>
                            ))
                        ) : (
                            <p>No pending applications.</p>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn-primary" onClick={handleManage}>Manage Tasks</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;
