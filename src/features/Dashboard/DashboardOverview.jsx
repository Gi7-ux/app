import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/AuthService.js';
import { useNavigate } from 'react-router-dom';
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


export const DashboardOverview = () => {
    const [stats, setStats] = useState([]);
    const [activity, setActivity] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        setError('');
        const token = AuthService.getAccessToken();
        const role = AuthService.getRole();
        if (!token || !AuthService.isAuthenticated()) {
            navigate('/login');
            return;
        }
        if (role !== 'admin') {
            setError('Access denied: Admins only.');
            return;
        }
        try {
            // Fetch stats
            const statsResponse = await fetch('/api/dashboard/stats.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsResponse.json();
            if (statsResponse.ok) {
                const statsArray = [
                    { label: 'Total Users', value: statsData.total_users, icon: 'users', color: 'blue' },
                    { label: 'Total Projects', value: statsData.total_projects, icon: 'projectsTotal', color: 'teal' },
                    { label: 'Projects in Progress', value: statsData.projects_in_progress, icon: 'projectsProgress', color: 'yellow' },
                    { label: 'Messages Pending Approval', value: statsData.messages_pending_approval, icon: 'messagesApproval', color: 'red' },
                    { label: 'Projects Pending Approval', value: statsData.projects_pending_approval, icon: 'projectsApproval', color: 'orange' }
                ];
                setStats(statsArray);
            } else {
                setError(statsData.message || 'Failed to fetch stats.');
            }

            // Fetch activity
            const activityResponse = await fetch('/api/activity/get.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const activityData = await activityResponse.json();
            if (activityResponse.ok) {
                setActivity(activityData);
            } else {
                setError(activityData.message || 'Failed to fetch activity.');
            }
        } catch (err) {
            setError('An error occurred while fetching dashboard data.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <div className="content-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Admin Architex! Here&apos;s a quick look at your platform activity.</p>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="stat-grid">
                {stats.slice(0, 4).map(stat => <StatCard key={stat.label} stat={stat} />)}
            </div>
            <div className="stat-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1.5rem' }}>
                {stats.length > 4 && <StatCard stat={stats[4]} />}
            </div>
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 className="card-header">Recent Activity</h3>
                <ul className="activity-list">
                    {activity.map((item, i) => (
                        <li key={i} className="activity-item">
                            <div className="timeline-dot"></div>
                            <div className="activity-content">
                                <p>{item.user_name} {item.action}</p>
                                <span className="time">{new Date(item.created_at).toLocaleString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};