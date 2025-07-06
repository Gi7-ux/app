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

import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService.js';

// Basic chart component placeholder
const ChartPlaceholder = ({ title }) => (
    <div className="card" style={{ margin: '1rem 0', padding: '1rem', textAlign: 'center', background: '#f9f9f9' }}>
        <h4>{title}</h4>
        <div style={{ height: '150px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
            [Chart Data Placeholder]
        </div>
    </div>
);
ChartPlaceholder.propTypes = { title: PropTypes.string.isRequired };


export const ClientOverview = ({ setCurrentPage }) => {
    const [stats, setStats] = useState([]);
    const [error, setError] = useState('');
    const [recentCommunications, setRecentCommunications] = useState([]);
    const [projectSpending, setProjectSpending] = useState(null); // Example: { total: 5000, recent: 1200 }
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        setError('');
        const token = AuthService.getAccessToken();
        if (!token || !AuthService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        try {
            // Fetch dashboard stats
            const response = await fetch('/api/dashboard/stats.php', {
                headers: { 'Authorization': `Bearer ${token}` }
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
                // Mocked data for new sections, replace with API calls when available
                setProjectSpending(data.project_spending || { total_spent: "N/A", last_invoice: "N/A" });

            } else {
                setError(data.message || 'Failed to fetch stats.');
            }

            // Fetch recent communications (e.g., last 5 messages related to client's projects)
            // This is a placeholder, actual endpoint might be /api/messages/get_threads.php?user_id=X&limit=5
            // Or /api/activity/get.php?user_id=X&type=communication&limit=5
            const commsResponse = await fetch(`/api/activity/get.php?user_id=${AuthService.getUserId()}&limit=3&type=communication`, { // Assuming API supports this
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (commsResponse.ok) {
                const commsData = await commsResponse.json();
                setRecentCommunications(commsData.length > 0 ? commsData : [{ action: "No recent communications.", created_at: new Date().toISOString(), user_name:"System" }]);
            } else {
                 setRecentCommunications([{ action: "Could not load communications.", created_at: new Date().toISOString(), user_name:"Error" }]);
            }


            // Fetch upcoming project deadlines & milestones
            // Placeholder: /api/projects/deadlines?client_id=X
             const deadlinesResponse = await fetch(`/api/projects/read.php?client_id=${AuthService.getUserId()}&status=In Progress&limit=3`, { // Mocking with existing endpoint + params
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (deadlinesResponse.ok) {
                const deadlinesData = await deadlinesResponse.json();
                const formattedDeadlines = (deadlinesData.records || deadlinesData || []).map(p => ({
                    id: p.id,
                    title: p.title,
                    due_date: p.due_date || "Not set", // Assuming project object has due_date
                    milestone: p.current_milestone || "N/A" // Assuming project object has milestone info
                })).slice(0,3); // Take first 3 for summary
                setUpcomingDeadlines(formattedDeadlines.length > 0 ? formattedDeadlines : [{id:0, title:"No upcoming deadlines for active projects.", due_date:"", milestone:""}]);
            } else {
                setUpcomingDeadlines([{id:0, title:"Could not load deadlines.", due_date:"", milestone:""}]);
            }


        } catch (err) {
            setError('An error occurred while fetching dashboard data: ' + err.message);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="content-header">
                <h1>Client Dashboard</h1>
                <p>Welcome back! Here&apos;s a summary of your projects and activity.</p>
            </div>
            {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}

            <div className="stat-grid">
                {stats.map(stat => <StatCard key={stat.label} stat={stat} />)}
            </div>

            <div className="dashboard-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <ChartPlaceholder title="Project Progress Overview" />
                <ChartPlaceholder title="Budget Tracking (Monthly)" />
            </div>

            <div className="dashboard-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card">
                    <h3 className="card-header">Project Spending & Payments</h3>
                    {projectSpending ? (
                        <div style={{padding: '1rem'}}>
                            <p>Total Spent: {projectSpending.total_spent}</p>
                            <p>Last Invoice Amount: {projectSpending.last_invoice}</p>
                            {/* Link to full billing page */}
                            <button className="action-link" style={{marginTop: '0.5rem'}} onClick={() => setCurrentPage('billing')}>View Payment History</button>
                        </div>
                    ) : <p style={{padding: '1rem'}}>Loading spending data...</p>}
                </div>

                <div className="card">
                    <h3 className="card-header">Recent Communications</h3>
                     <ul className="activity-list" style={{maxHeight: '200px', overflowY: 'auto', padding: '0 1rem 1rem 1rem'}}>
                        {recentCommunications.map((item, i) => (
                            <li key={i} className="activity-item" style={{padding: '0.5rem 0', borderBottom: '1px solid #eee'}}>
                                <div className="activity-content">
                                    <p style={{margin:0}}>{item.action} {(item.user_name && item.user_name !== "System" && item.user_name !== "Error") ? `(with ${item.user_name})` : ''}</p>
                                    <span className="time" style={{fontSize: '0.8em'}}>{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 className="card-header">Upcoming Project Deadlines & Milestones</h3>
                {upcomingDeadlines.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: '1rem'}}>
                        {upcomingDeadlines.map(deadline => (
                            <li key={deadline.id} style={{borderBottom: '1px solid #eee', padding: '0.5rem 0', display:'flex', justifyContent:'space-between'}}>
                                <span><strong>{deadline.title}</strong> {deadline.milestone !== "N/A" ? `(${deadline.milestone})` : ''}</span>
                                <span>{deadline.due_date ? `Due: ${deadline.due_date}`: ''}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p style={{padding: '1rem'}}>No upcoming deadlines or milestones.</p>}
            </div>

            <div className="quick-actions" style={{marginTop: '1.5rem'}}>
                <div className="actions-header">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn btn-action" onClick={() => setCurrentPage('projects')}>View My Projects</button>
                        <button className="action-btn btn-action btn-primary" onClick={() => setCurrentPage('createProject')}>Start New Project</button> {/* Assuming 'createProject' is a page ID */}
                        <button className="action-link btn-action" onClick={() => setCurrentPage('profile')}>Edit My Profile</button>
                    </div>
                </div>
            </div>
        </>
    );
};

ClientOverview.propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
};
