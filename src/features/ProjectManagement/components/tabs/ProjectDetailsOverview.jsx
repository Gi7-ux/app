import React from 'react';
import PropTypes from 'prop-types';

export const ProjectDetailsOverview = ({ project, progress = 0 }) => {
    const safeProject = {
        ...project,
        spend: project.spend || 0,
        purchasedHours: project.purchasedHours || 0,
        hoursSpent: project.hoursSpent || 0,
        skills: project.skills || []
    };

    const budgetProgress = safeProject.budget > 0 ? (safeProject.spend / safeProject.budget) * 100 : 0;
    const hoursProgress = safeProject.purchasedHours > 0 ? (safeProject.hoursSpent / safeProject.purchasedHours) * 100 : 0;

    return (
        <div className="project-overview-grid">
            <div className="overview-card">
                <h3>Overall Progress</h3>
                <div className="overview-stat-large">
                    {progress}% <span className="sub">Complete</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="overview-card">
                <h3>Budget</h3>
                <div className="overview-stat-large">
                    R {safeProject.spend.toLocaleString()} <span className="sub">/ R {safeProject.budget.toLocaleString()}</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${budgetProgress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="overview-card">
                <h3>Hours</h3>
                <div className="overview-stat-large">
                    {safeProject.hoursSpent} <span className="sub">/ {safeProject.purchasedHours} hrs</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${hoursProgress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="overview-card" style={{ gridColumn: '1 / -1' }}>
                <h3>Project Description</h3>
                <p>{safeProject.description}</p>
            </div>
            <div className="overview-card">
                <h3>Required Skills</h3>
                <div className="skills-container">
                    {safeProject.skills.length > 0 ? safeProject.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>) : <p>No skills listed.</p>}
                </div>
            </div>
            <div className="overview-card">
                <h3>Assigned Freelancers</h3>
                <p>{safeProject.freelancerName}</p>
            </div>
        </div>
    );
};

ProjectDetailsOverview.propTypes = {
    project: PropTypes.object.isRequired,
    progress: PropTypes.number
};