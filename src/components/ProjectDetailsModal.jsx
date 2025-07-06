import React from 'react';
import './ProjectDetailsModal.css';
import { ICONS } from '../assets/icons';

const ProjectDetailsModal = ({ project, onClose, onAcceptApplication, onManageTasks }) => {
    if (!project) return null;

    // Mock data for pending applications as it's not in the API
    const pendingApplications = [
        {
            id: 1,
            freelancerName: 'Bob Builder',
            freelancerHandle: 'freelancer2',
            bid: 12000,
            note: 'I am proficient in CAD and have a quick turnaround for schematic designs. My bid is competitive.'
        },
        {
            id: 2,
            freelancerName: 'Alice Architect',
            freelancerHandle: 'freelancer1',
            bid: 14000,
            note: 'My expertise in sustainable kitchen design and modern aesthetics aligns perfectly with the project needs.'
        }
    ];

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
                        {pendingApplications.map(app => (
                            <div key={app.id} className="application-card">
                                <div className="application-header">
                                    <strong>{app.freelancerName}</strong> ({app.freelancerHandle})
                                    <span className="bid">Bid: R {app.bid.toLocaleString()}</span>
                                </div>
                                <p>"{app.note}"</p>
                                <button className="accept-btn" onClick={() => handleAccept(app)}>{ICONS.accept} Accept Application</button>
                            </div>
                        ))}
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
