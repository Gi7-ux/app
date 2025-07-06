import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../assets/icons.jsx';

const StatCard = ({ stat }) => (
    <div className="stat-card" data-color={stat.color}>
        {ICONS[stat.icon]}
        <div>
            <p>{stat.label}</p>
            <span className="value">{stat.value}</span>
        </div>
    </div>
);

StatCard.propTypes = {
    stat: PropTypes.object.isRequired,
};

export const ClientOverview = ({ setCurrentPage }) => {
    const [stats, setStats] = useState([]);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/dashboard/stats.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const statsData = [
                    { label: 'Total Projects', value: data.total_projects, icon: 'projectsTotal', color: 'blue' },
                    { label: 'Projects Awaiting/Open', value: data.projects_awaiting, icon: 'projectsApproval', color: 'orange' },
                    { label: 'Projects In Progress', value: data.projects_in_progress, icon: 'projectsProgress', color: 'yellow' },
                    { label: 'Projects Completed', value: data.projects_completed, icon: 'completed', color: 'teal' },
                ];
                setStats(statsData);
            } else {
                setError(data.message || 'Failed to fetch stats.');
            }
        } catch {
            setError('An error occurred while fetching stats.');
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <>
            <div className="content-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back! Here&apos;s a summary of your projects.</p>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="stat-grid">
                {stats.map(stat => <StatCard key={stat.label} stat={stat} />)}
            </div>
            <div className="quick-actions">
                <div className="actions-header">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn btn-action" onClick={() => setCurrentPage('projects')}>View My Projects</button>
                        <button className="action-link btn-action" onClick={() => setCurrentPage('profile')}>Edit My Profile</button>
                        <button className="action-btn btn-action btn-primary" onClick={() => setCurrentPage('createInvoice')}>Create Invoice</button>
                        <button className="action-link btn-action btn-secondary" onClick={() => setCurrentPage('generateReports')}>Generate Reports</button>
                    </div>
                </div>
            </div>
        </>
    );
};

ClientOverview.propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
};
