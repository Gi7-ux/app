import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import { ICONS } from '../../../assets/icons.jsx'; // Removed as it's not used directly here
import { AssignmentsTab } from './tabs/AssignmentsTab.jsx';
import { FilesTab } from './tabs/FilesTab.jsx';
import { MessagesTab } from './tabs/MessagesTab.jsx';
import { ProjectDetailsOverview } from './tabs/ProjectDetailsOverview.jsx';
import { FreelancersTab } from './tabs/FreelancersTab.jsx';

export const ProjectDetailsView = ({ project: initialProject, onBack }) => {
    const [project, setProject] = useState(initialProject);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');

    const fetchProjectDetails = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/projects/read_one.php?id=${initialProject.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        { id: 'overview', label: 'Overview' },
        { id: 'assignments', label: 'Assignments & Tasks' },
        { id: 'messages', label: 'Messages' },
        { id: 'files', label: 'Files' },
        { id: 'freelancers', label: 'Freelancers' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <ProjectDetailsOverview project={project} />;
            case 'assignments':
                return <AssignmentsTab project={project} onUpdateProject={handleUpdateProject} />;
            case 'messages':
                return <MessagesTab project={project} onUpdateProject={handleUpdateProject} />;
            case 'files':
                return <FilesTab project={project} onUpdateProject={handleUpdateProject} />;
            case 'freelancers':
                return <FreelancersTab project={project} />;
            default:
                return null;
        }
    }

    if (error) {
        return <div style={{ color: 'red', padding: '1.5rem' }}>{error}</div>;
    }

    if (!project) {
        return <div>Loading project details...</div>;
    }

    return (
        <div>
            <button onClick={onBack} className="back-btn">
                <svg className="icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span>Back to All Projects</span>
            </button>
            <div className="project-details-header">
                <h1 className="project-details-title">{project.title}</h1>
                <p>Client: {project.clientName}</p>
            </div>
            <div className="project-details-tabs">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
                        {tab.label}
                    </button>
                ))}
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