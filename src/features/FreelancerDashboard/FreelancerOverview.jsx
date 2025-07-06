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


export const FreelancerOverview = ({ setCurrentPage }) => {
    const [stats, setStats] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [recentCommunications, setRecentCommunications] = useState([]);
    const [earningsSummary, setEarningsSummary] = useState(null); // Example: { current_month: 1200, pending: 300, lifetime: 15000 }
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);


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
                    { label: 'Open Projects (Platform)', value: data.open_projects, icon: 'projects', color: 'blue' },
                    { label: 'My Active Applications', value: data.my_applications, icon: 'userManagement', color: 'teal' }, // This is 'my_applications' from API
                    { label: 'My Assigned Projects', value: data.assigned_projects, icon: 'projectsProgress', color: 'yellow' }, // This is 'assigned_projects' from API
                    { label: 'My Tasks In Progress', value: data.tasks_in_progress, icon: 'projectsApproval', color: 'orange' }, // This is 'tasks_in_progress' from API
                ];
                setStats(statsData);

                // Use new data from API if available, otherwise use mocked
                setEarningsSummary(data.earnings_summary || { current_month: "N/A", pending_payments: "N/A", lifetime_earnings: "N/A" });

            } else {
                setError(data.message || 'Failed to fetch stats.');
            }

            // Fetch recent communications (e.g., last 3 messages related to freelancer's projects)
            // Placeholder: /api/activity/get.php?user_id=X&type=communication&limit=3
            const commsResponse = await fetch(`/api/activity/get.php?user_id=${AuthService.getUserId()}&limit=3&type=communication`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (commsResponse.ok) {
                const commsData = await commsResponse.json();
                setRecentCommunications(commsData.length > 0 ? commsData : [{ action: "No recent communications.", created_at: new Date().toISOString(), user_name:"System" }]);
            } else {
                 setRecentCommunications([{ action: "Could not load communications.", created_at: new Date().toISOString(), user_name:"Error" }]);
            }


            // Fetch upcoming project deadlines for assigned projects
            // Placeholder: /api/projects/read.php?freelancer_id=X&status=In Progress&limit=3
            const deadlinesResponse = await fetch(`/api/projects/read.php?freelancer_id=${AuthService.getUserId()}&status=In Progress&limit=3`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (deadlinesResponse.ok) {
                const deadlinesData = await deadlinesResponse.json();
                 const formattedDeadlines = (deadlinesData.records || deadlinesData || []).map(p => ({
                    id: p.id,
                    title: p.title,
                    due_date: p.due_date || "Not set",
                    // Assuming tasks might be part of project data or fetched separately
                    next_task: (p.tasks && p.tasks.find(t => t.status !== 'Completed')?.title) || "N/A"
                })).slice(0,3);
                setUpcomingDeadlines(formattedDeadlines.length > 0 ? formattedDeadlines : [{id:0, title:"No upcoming deadlines for active projects.", due_date: "", next_task:""}]);
            } else {
                setUpcomingDeadlines([{id:0, title:"Could not load deadlines.", due_date:"", next_task:""}]);
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
                <h1>Freelancer Dashboard</h1>
                <p>Welcome back! Here&apos;s what&apos;s happening with your projects and earnings.</p>
            </div>
            {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}

            <div className="stat-grid">
                {stats.map(stat => <StatCard key={stat.label} stat={stat} />)}
            </div>

            <div className="dashboard-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <ChartPlaceholder title="Earnings Overview (Monthly)" />
                <ChartPlaceholder title="Project Completion Rate" />
                {/* Client satisfaction could be a number or small chart */}
            </div>

            <div className="dashboard-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card">
                    <h3 className="card-header">Earnings Summary</h3>
                    {earningsSummary ? (
                        <div style={{padding: '1rem'}}>
                            <p>Current Month Earnings: {earningsSummary.current_month}</p>
                            <p>Pending Payments: {earningsSummary.pending_payments}</p>
                            <p>Lifetime Earnings: {earningsSummary.lifetime_earnings}</p>
                            {/* Link to full earnings/payment history page */}
                            <button className="action-link" style={{marginTop: '0.5rem'}} onClick={() => setCurrentPage('earningsHistory')}>View Detailed Earnings</button>
                        </div>
                    ) : <p style={{padding: '1rem'}}>Loading earnings data...</p>}
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
                <h3 className="card-header">Upcoming Deadlines & Tasks</h3>
                 {upcomingDeadlines.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: '1rem'}}>
                        {upcomingDeadlines.map(deadline => (
                            <li key={deadline.id} style={{borderBottom: '1px solid #eee', padding: '0.5rem 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <strong>{deadline.title}</strong>
                                    <br />
                                    <small>Next Task: {deadline.next_task}</small>
                                </div>
                                <span>{deadline.due_date ? `Due: ${deadline.due_date}`: ''}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p style={{padding: '1rem'}}>No upcoming deadlines or tasks for active projects.</p>}
            </div>


            <div className="quick-actions" style={{marginTop: '1.5rem'}}>
                <div className="actions-header">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn btn-action" onClick={() => setCurrentPage('browse')}>Browse Projects</button>
                        <button className="action-btn btn-action" onClick={() => setCurrentPage('myProjects')}>View My Projects</button> {/* Added My Projects */}
                        <button className="action-btn btn-action btn-primary" onClick={() => setCurrentPage('timeTracker')}>Submit Time Logs</button> {/* Changed from newTask */}
                        <button className="action-link btn-action" onClick={() => setCurrentPage('profile')}>Edit My Profile</button>
                    </div>
                </div>
            </div>
        </>
    );
};

FreelancerOverview.propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
};
