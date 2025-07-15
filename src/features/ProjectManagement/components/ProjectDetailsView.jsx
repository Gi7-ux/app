import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../assets/icons.jsx';
import { AssignmentsTab } from './tabs/AssignmentsTab.jsx';
import { FilesTab } from './tabs/FilesTab.jsx';
import { MessagesTab } from './tabs/MessagesTab.jsx';
import { ProjectDetailsOverview } from './tabs/ProjectDetailsOverview.jsx';
import { FreelancersTab } from './tabs/FreelancersTab.jsx';
import { TimeLogsTab } from './tabs/TimeLogsTab.jsx';
import JobCard from './JobCard.jsx';

const getStatusColor = (status) => {
    switch (status) {
        case 'Open':
            return 'status-open';
        case 'In Progress':
            return 'status-in-progress';
        case 'Pending Approval':
            return 'status-pending-approval';
        case 'Completed':
            return 'status-completed';
        case 'Archived':
            return 'status-archived';
        default:
            return 'status-default';
    }
};

export const ProjectDetailsView = ({ project: initialProject, onBack }) => {
    const [project, setProject] = useState(initialProject);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');
    const [jobCards, setJobCards] = useState([]);
    const [isAddingJobCard, setIsAddingJobCard] = useState(false);
    const [newJobCard, setNewJobCard] = useState({
        title: '',
        description: '',
        dueDate: '',
        assignedTo: []
    });

    const fetchProjectDetails = async () => {
        setError('');
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch(`/api/projects/read_one.php?id=${initialProject.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setProject(data);
            } else {
                setError(data.message || 'Failed to fetch project details.');
            }
        } catch {
            setError('An error occurred while fetching project details.');
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [initialProject.id]);

    const handleUpdateProject = () => {
        // Re-fetch the project details to get the latest data
        fetchProjectDetails();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ICONS.overview },
        { id: 'tasks', label: 'Tasks & Job Cards', icon: ICONS.tasks },
        { id: 'assignments', label: 'Assignments', icon: ICONS.assignments },
        { id: 'team', label: 'Team', icon: ICONS.team },
        { id: 'messages', label: 'Messages', icon: ICONS.messages },
        { id: 'files', label: 'Files', icon: ICONS.files },
        { id: 'timelogs', label: 'Time Logs', icon: ICONS.clock }
    ];

    // Initialize job cards from project assignments
    useEffect(() => {
        if (project.assignments) {
            const cards = project.assignments.map(assignment => ({
                id: assignment.id,
                title: assignment.title,
                description: assignment.description || 'No description available',
                dueDate: assignment.deadline || project.deadline,
                assignedTo: assignment.assignedTo || [],
                tasks: assignment.tasks || []
            }));
            setJobCards(cards);
        }
    }, [project]);

    const handleTaskAdd = (jobCardId, taskTitle) => {
        setJobCards(jobCards.map(card => {
            if (card.id === jobCardId) {
                return {
                    ...card,
                    tasks: [
                        ...card.tasks,
                        {
                            id: Date.now().toString(),
                            title: taskTitle,
                            completed: false
                        }
                    ]
                };
            }
            return card;
        }));
    };

    const handleTaskToggle = (jobCardId, taskId) => {
        setJobCards(jobCards.map(card => {
            if (card.id === jobCardId) {
                return {
                    ...card,
                    tasks: card.tasks.map(task => {
                        if (task.id === taskId) {
                            return { ...task, completed: !task.completed };
                        }
                        return task;
                    })
                };
            }
            return card;
        }));
    };

    const handleJobCardDelete = (jobCardId) => {
        setJobCards(jobCards.filter(card => card.id !== jobCardId));
    };

    const handleAddJobCard = () => {
        if (newJobCard.title && newJobCard.description && newJobCard.dueDate) {
            const newCard = {
                id: Date.now().toString(),
                title: newJobCard.title,
                description: newJobCard.description,
                dueDate: newJobCard.dueDate,
                assignedTo: newJobCard.assignedTo,
                tasks: []
            };
            setJobCards([...jobCards, newCard]);
            setNewJobCard({
                title: '',
                description: '',
                dueDate: '',
                assignedTo: []
            });
            setIsAddingJobCard(false);
        }
    };

    const calculateProgress = () => {
        if (jobCards.length === 0) return 0;

        const totalTasks = jobCards.reduce((sum, card) => sum + card.tasks.length, 0);
        const completedTasks = jobCards.reduce(
            (sum, card) => sum + card.tasks.filter(task => task.completed).length,
            0
        );

        return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <ProjectDetailsOverview project={project} progress={calculateProgress()} />;
            case 'tasks':
                return (
                    <div className="tasks-tab-content">
                        <div className="tasks-header">
                            <h3>Job Cards & Tasks</h3>
                            <button
                                className="add-job-card-btn primary-btn"
                                onClick={() => setIsAddingJobCard(true)}
                            >
                                {ICONS.plus}
                                <span>Add Job Card</span>
                            </button>
                        </div>

                        <div className="job-cards-grid">
                            {jobCards.map(card => (
                                <JobCard
                                    key={card.id}
                                    id={card.id}
                                    title={card.title}
                                    description={card.description}
                                    dueDate={card.dueDate}
                                    assignedTo={card.assignedTo}
                                    tasks={card.tasks}
                                    onTaskAdd={handleTaskAdd}
                                    onTaskToggle={handleTaskToggle}
                                    onDelete={handleJobCardDelete}
                                />
                            ))}

                            {isAddingJobCard && (
                                <div className="new-job-card-form">
                                    <h4>Create New Job Card</h4>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={newJobCard.title}
                                            onChange={(e) => setNewJobCard({ ...newJobCard, title: e.target.value })}
                                            placeholder="Enter job card title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={newJobCard.description}
                                            onChange={(e) => setNewJobCard({ ...newJobCard, description: e.target.value })}
                                            placeholder="Describe the job requirements"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            value={newJobCard.dueDate}
                                            onChange={(e) => setNewJobCard({ ...newJobCard, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="cancel-btn secondary-btn"
                                            onClick={() => setIsAddingJobCard(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="save-btn primary-btn"
                                            onClick={handleAddJobCard}
                                        >
                                            Create Job Card
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'assignments':
                return <AssignmentsTab project={project} onUpdateProject={handleUpdateProject} />;
            case 'team':
                return <FreelancersTab project={project} />;
            case 'messages':
                return <MessagesTab project={project} onUpdateProject={handleUpdateProject} />;
            case 'files':
                return <FilesTab project={project} onUpdateProject={handleUpdateProject} />;
            case 'timelogs':
                return <TimeLogsTab project={project} onUpdateProject={handleUpdateProject} />;
            default:
                return null;
        }
    };

    if (error) {
        return <div style={{ color: 'red', padding: '1.5rem' }}>{error}</div>;
    }

    if (!project) {
        return <div>Loading project details...</div>;
    }

    return (
        <div className="project-details-view">
            <div className="project-details-header">
                <button onClick={onBack} className="back-btn">
                    <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Back to Projects</span>
                </button>

                <div className="project-header-info">
                    <div className="project-title-section">
                        <div className="title-row">
                            <h1 className="project-title">{project.title}</h1>
                            <span className={`status-badge ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                        </div>
                        <div className="project-meta">
                            <span className="client-info">
                                <strong>Client:</strong> {project.clientName}
                            </span>
                            <span className="freelancer-info">
                                <strong>Assigned to:</strong> {project.freelancerName}
                            </span>
                        </div>
                    </div>

                    <div className="project-stats-summary">
                        <div className="stat-card">
                            <div className="stat-value">{calculateProgress()}%</div>
                            <div className="stat-label">Progress</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">R {parseFloat(project.budget || 0).toLocaleString()}</div>
                            <div className="stat-label">Budget</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{new Date(project.deadline).toLocaleDateString()}</div>
                            <div className="stat-label">Deadline</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="project-details-tabs">
                <div className="tabs-container">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

ProjectDetailsView.propTypes = {
    project: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
};