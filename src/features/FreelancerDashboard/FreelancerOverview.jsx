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

export const FreelancerOverview = ({ setCurrentPage }) => {
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
                    { label: 'Open Projects', value: data.open_projects, icon: 'projects', color: 'blue' },
                    { label: 'My Applications', value: data.my_applications, icon: 'userManagement', color: 'teal' },
                    { label: 'Assigned Projects', value: data.assigned_projects, icon: 'billing', color: 'yellow' },
                    { label: 'Tasks In Progress', value: data.tasks_in_progress, icon: 'projectsProgress', color: 'orange' },
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
                <h1>Overview</h1>
                <p>Welcome back! Here&apos;s what&apos;s happening.</p>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="stat-grid">
                {stats.map(stat => <StatCard key={stat.label} stat={stat} />)}
            </div>
            <div className="quick-actions">
                <div className="actions-header">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn btn-action" onClick={() => setCurrentPage('browse')}>Browse Projects</button>
                        <button className="action-link btn-action" onClick={() => setCurrentPage('profile')}>Edit My Profile</button>
                        <button className="action-btn btn-action btn-primary" onClick={() => setCurrentPage('newTask')}>Submit Time Logs</button>
                        <button className="action-link btn-action btn-secondary" onClick={() => setCurrentPage('viewNotifications')}>View Notifications</button>
                    </div>
                </div>
            </div>
            {/* Remainder of the component with mock data for now */}
        </>
    );
};

FreelancerOverview.propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
};
