import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AuthService } from '../../services/AuthService.js';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../../assets/icons.jsx';

const StatCard = ({ stat }) => (
    <div className="stat-card" data-color={stat.color}>
        <div className="stat-icon">
            {ICONS[stat.icon]}
        </div>
        <div className="stat-content">
            <p className="stat-label">{stat.label}</p>
            <span className="stat-value">{stat.value}</span>
        </div>
    </div>
);

StatCard.propTypes = {
    stat: PropTypes.object.isRequired,
};

export const DashboardOverview = ({ setCurrentPage }) => {
    const [stats, setStats] = useState([]);
    const [activity, setActivity] = useState([]);
    const [recentFileUploads, setRecentFileUploads] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
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
                        { label: 'Messages Pending Approval', value: statsData.messages_pending_approval || 2, icon: 'messagesApproval', color: 'red' },
                        { label: 'Projects Pending Approval', value: statsData.projects_pending_approval || 1, icon: 'projectsApproval', color: 'orange' }
                    ];
                    setStats(statsArray);
                } else {
                    setError(statsData.message || 'Failed to fetch stats.');
                }

                // Fetch activity
                const activityResponse = await fetch('/api/activity/get.php?limit=5', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const activityData = await activityResponse.json();
                if (activityResponse.ok) {
                    // Ensure each activity item has an id for proper key generation
                    const processedActivity = Array.isArray(activityData)
                        ? activityData.map((item, index) => ({
                            ...item,
                            id: item.id || `activity-${index}-${Date.now()}`
                        }))
                        : [];
                    setActivity(processedActivity);
                } else {
                    // Set sample activity data if API fails
                    setActivity([
                        { id: 1, action: "Project 'Modern Residential House' status updated to In Progress.", user_name: "Admin Architex", created_at: "2025-07-08T10:30:00Z" },
                        { id: 2, action: "New application received for 'Open Concept Kitchen Remodel'.", user_name: "System", created_at: "2025-07-08T09:15:00Z" },
                        { id: 3, action: "Your application for 'Urban Park Landscape' was accepted!", user_name: "Client", created_at: "2025-07-08T08:45:00Z" },
                        { id: 4, action: "Job card 'Concept Sketches' for 'Modern Residential House' is now in Progress.", user_name: "Freelancer", created_at: "2025-07-07T16:20:00Z" },
                        { id: 5, action: "Alice Architect logged 4 hours on 'Concept Sketches'.", user_name: "Alice Architect", created_at: "2025-07-07T15:10:00Z" }
                    ]);
                }

                // Set sample file uploads data
                setRecentFileUploads([
                    { id: 1, filename: "Initial_Brief.pdf", type: "pdf", uploaded_by: "Charlie Client", project: "Modern Residential House Design", date: "7/8/2025" },
                    { id: 2, filename: "Concept_Sketches_RevA.png", type: "image", uploaded_by: "Alice Architect", project: "Modern Residential House Design", date: "7/8/2025" },
                    { id: 3, filename: "Site_Survey.dwg", type: "dwg", uploaded_by: "Admin Axis", project: "Urban Park Landscape Architecture", date: "6/30/2025" }
                ]);

            } catch (err) {
                setError('An error occurred while fetching dashboard data.');
                console.error(err);
            }
        };

        fetchData();
    }, [navigate]);

    const handleQuickAction = (action) => {
        switch (action) {
            case 'createProject':
                setCurrentPage('project-management');
                break;
            case 'manageUsers':
                setCurrentPage('user-management');
                break;
            case 'viewTimeReports':
                setCurrentPage('time-reports');
                break;
            case 'editProfile':
                setCurrentPage('profile');
                break;
            default:
                break;
        }
    };

    return (
        <>
            <div className="content-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Admin Architex! Here&apos;s a quick look at your platform activity.</p>
            </div>

            {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}

            <div className="stat-grid">
                {stats.map((stat, index) => <StatCard key={stat.label || `stat-${index}`} stat={stat} />)}
            </div>

            <div className="quick-actions">
                <div className="actions-header">
                    <h2>Quick Actions</h2>
                </div>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => handleQuickAction('createProject')}>
                        Create New Project
                    </button>
                    <button className="action-btn" onClick={() => handleQuickAction('manageUsers')}>
                        Manage Users
                    </button>
                    <button className="action-btn" onClick={() => handleQuickAction('viewTimeReports')}>
                        View Time Reports
                    </button>
                    <button className="action-link" onClick={() => handleQuickAction('editProfile')}>
                        Edit My Profile
                    </button>
                </div>
            </div>

            <div className="main-grid">
                <div className="card">
                    <h3 className="card-header">Recent Activity</h3>
                    <ul className="activity-list">
                        {activity.map((item, index) => (
                            <li key={item.id || `activity-${index}`} className="activity-item">
                                <div className="timeline-dot"></div>
                                <div className="activity-content">
                                    <p>{item.action}</p>
                                    <span className="time">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h3 className="card-header">Recent File Uploads</h3>
                    <ul className="upload-list">
                        {recentFileUploads.map((file, index) => (
                            <li key={file.id || `file-${index}`} className="upload-item">
                                <div className="file-icon">
                                    {file.type === 'pdf' && ICONS.filePdf}
                                    {file.type === 'image' && ICONS.fileImage}
                                    {file.type === 'dwg' && ICONS.fileDocument}
                                </div>
                                <div className="file-info">
                                    <p>{file.filename}</p>
                                    <div className="details">
                                        Uploaded by {file.uploaded_by} to project {file.project}
                                    </div>
                                </div>
                                <div className="file-date">{file.date}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

DashboardOverview.propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
};
