import React, { useState, useMemo } from 'react';
import { mockData } from '../../data/data.js';

export const BrowseProjects = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [applications, setApplications] = useState([]); // In a real app, this would come from a global state/context

    const handleApply = (project) => {
        if (applications.find(app => app.project === project.title)) {
            alert(`You have already applied for "${project.title}".`);
            return;
        }
        setApplications(prev => [...prev, { project: project.title, status: 'Pending', date: new Date().toLocaleDateString() }]);
        alert(`Successfully applied for "${project.title}"!`);
    };

    const openProjects = useMemo(() => {
        return mockData.projectManagement.projects.filter(p => {
            const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.skills.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
            return p.status === 'Open' && searchMatch;
        });
    }, [searchTerm]);

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Browse Projects</h1>
            </div>
             <div className="management-controls">
                <input
                    type="text"
                    placeholder="Search by title, skills..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Client</th>
                            <th>Budget (R)</th>
                            <th>Required Skills</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {openProjects.map(p => (
                            <tr key={p.id}>
                                <td>{p.title}</td>
                                <td>{p.clientName}</td>
                                <td>R {p.budget.toLocaleString()}</td>
                                <td>
                                    <div className="skills-container">
                                        {p.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-icons">
                                        <button 
                                            className="action-btn" 
                                            style={{background: 'var(--card-teal-bg)', color: 'var(--card-teal-icon)'}}
                                            onClick={() => handleApply(p)}
                                            disabled={!!applications.find(app => app.project === p.title)}
                                        >
                                            {applications.find(app => app.project === p.title) ? 'Applied' : 'Apply'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};