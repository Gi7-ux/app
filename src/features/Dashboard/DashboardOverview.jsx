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
    // eslint-disable-next-line no-unused-vars
    const [recentCommunications, setRecentCommunications] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [platformEarnings, setPlatformEarnings] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);


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
                    // These are currently mocked in the API, will need backend implementation
                    { label: 'Messages Pending Approval', value: statsData.messages_pending_approval || 0, icon: 'messagesApproval', color: 'red' },
                    { label: 'Projects Pending Approval', value: statsData.projects_pending_approval || 0, icon: 'projectsApproval', color: 'orange' }
                ];
                setStats(statsArray);

                // Placeholder for platform earnings - assuming it might come from stats or a dedicated endpoint
                setPlatformEarnings(statsData.platform_earnings || { total_revenue: "N/A", monthly_revenue: "N/A" });
            } else {
                setError(statsData.message || 'Failed to fetch stats.');
            }

            // Fetch activity (doubles as recent communications for now)
            const activityResponse = await fetch('/api/activity/get.php?limit=5', { // Assuming API supports limit
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const activityData = await activityResponse.json();
            if (activityResponse.ok) {
                setActivity(activityData);
                setRecentCommunications(activityData); // Using activity as placeholder
            } else {
                setError(prevError => prevError + (activityData.message || ' Failed to fetch activity.'));
            }

            // Placeholder for upcoming deadlines - needs a dedicated API endpoint
            // Example: /api/projects/deadlines?role=admin
            // For now, using a static example:
            setUpcomingDeadlines([
                { id: 1, title: "Finalize Q3 Report", due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: "Report" },
                { id: 2, title: "Review New Client Proposals", due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: "Task" },
            ]);


        } catch (err) {
            setError('An error occurred while fetching dashboard data.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Basic chart component placeholder
    const ChartPlaceholder = ({ title }) => (
        <div className="card" style={{ marginTop: '1.5rem', padding: '1rem', textAlign: 'center' }}>
            <h4>{title}</h4>
            <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                [Chart Data Would Be Here]
            </div>
        </div>
    );
    ChartPlaceholder.propTypes = { title: PropTypes.string.isRequired };


    return (
        <>
            <div className="content-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, Admin! Here&apos;s a quick look at your platform activity.</p>
            </div>
            {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}

            <div className="stat-grid">
                {stats.map(stat => <StatCard key={stat.label} stat={stat} />)}
            </div>

            <div className="dashboard-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <ChartPlaceholder title="User Activity Over Time" />
                <ChartPlaceholder title="Platform Growth (Users/Projects)" />
            </div>

            <div className="dashboard-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card">
                    <h3 className="card-header">Platform Earnings</h3>
                    {platformEarnings ? (
                        <div style={{padding: '1rem'}}>
                            <p>Total Revenue: {platformEarnings.total_revenue}</p>
                            <p>Monthly Revenue (Current): {platformEarnings.monthly_revenue}</p>
                            {/* More detailed financial metrics can be added here */}
                        </div>
                    ) : <p style={{padding: '1rem'}}>Loading earnings data...</p>}
                </div>

                <div className="card">
                    <h3 className="card-header">Recent Communications Summary</h3>
                    <ul className="activity-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {recentCommunications.length > 0 ? recentCommunications.map((item, i) => (
                            <li key={i} className="activity-item" style={{padding: '0.5rem 1rem'}}>
                                <div className="activity-content">
                                    <p>{item.action} (by {item.user_name || 'System'})</p>
                                    <span className="time">{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                            </li>
                        )) : <p style={{padding: '1rem'}}>No recent communications to display.</p>}
                    </ul>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 className="card-header">Upcoming Deadlines & Overdue Tasks</h3>
                {upcomingDeadlines.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: '1rem'}}>
                        {upcomingDeadlines.map(deadline => (
                            <li key={deadline.id} style={{borderBottom: '1px solid #eee', padding: '0.5rem 0'}}>
                                <strong>{deadline.title}</strong> ({deadline.type}) - Due: {deadline.due_date}
                                {/* Add logic for overdue status */}
                            </li>
                        ))}
                    </ul>
                ) : <p style={{padding: '1rem'}}>No upcoming deadlines or overdue tasks.</p>}
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 className="card-header">Recent Platform Activity</h3>
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