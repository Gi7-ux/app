import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import Select from 'react-select'; // Using basic select for now, can be upgraded

const BroadcastMessageForm = ({ currentUser }) => {
    const [messageText, setMessageText] = useState('');
    const [recipientScope, setRecipientScope] = useState('all'); // 'all', 'project', 'specific_users'
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch projects for project-specific broadcast
    useEffect(() => {
        if (recipientScope === 'project') {
            const fetchProjects = async () => {
                setIsLoading(true); setError('');
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch('/api/projects/read.php', { // Assuming a general read endpoint for projects
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.status === 401) { window.location.href = '/login'; return; }
                    const data = await response.json();
                    if (response.ok) {
                        setProjects(data.records || data || []); // Adjust based on actual API response structure
                    } else {
                        throw new Error(data.message || 'Failed to fetch projects');
                    }
                } catch (err) {
                    setError(`Error fetching projects: ${err.message}`);
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProjects();
        }
    }, [recipientScope]);

    // Fetch users for specific_users broadcast
    useEffect(() => {
        if (recipientScope === 'specific_users') {
            const fetchUsers = async () => {
                setIsLoading(true); setError('');
                try {
                    const token = localStorage.getItem('access_token');
                    // Assuming /api/users/read.php lists all users (excluding current admin if needed)
                    const response = await fetch('/api/users/read.php', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.status === 401) { window.location.href = '/login'; return; }
                    const data = await response.json();
                    if (response.ok) {
                        // Filter out the current admin from the list of recipients
                        setUsers((data.records || data || []).filter(user => user.id !== currentUser.id));
                    } else {
                        throw new Error(data.message || 'Failed to fetch users');
                    }
                } catch (err) {
                    setError(`Error fetching users: ${err.message}`);
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUsers();
        }
    }, [recipientScope, currentUser.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccessMessage('');

        if (!messageText.trim()) {
            setError('Message text cannot be empty.');
            setIsLoading(false);
            return;
        }

        const payload = {
            message_text: messageText.trim(),
            recipient_scope: recipientScope,
        };

        if (recipientScope === 'project') {
            if (!selectedProjectId) {
                setError('Please select a project.');
                setIsLoading(false);
                return;
            }
            payload.project_id = selectedProjectId;
        } else if (recipientScope === 'specific_users') {
            if (selectedUserIds.length === 0) {
                setError('Please select at least one user.');
                setIsLoading(false);
                return;
            }
            payload.user_ids = selectedUserIds;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/broadcasts/send_broadcast.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json();
            if (response.ok) {
                setSuccessMessage(`Broadcast sent successfully to ${responseData.recipient_count || ''} recipients! Thread ID: ${responseData.thread_id}`);
                setMessageText(''); // Clear form
                setSelectedProjectId('');
                setSelectedUserIds([]);
                // setRecipientScope('all'); // Optionally reset scope
            } else {
                throw new Error(responseData.message || 'Failed to send broadcast.');
            }
        } catch (err) {
            setError(`Error sending broadcast: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Basic multi-select for users (can be replaced with a more advanced component)
    const handleUserSelectChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedUserIds(selectedOptions.map(id => parseInt(id, 10)));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
            <h2>Send Broadcast Message</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="messageText" style={{ display: 'block', marginBottom: '0.5rem' }}>Message:</label>
                    <textarea
                        id="messageText"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows="5"
                        required
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Recipient Scope:</label>
                    <div>
                        <label style={{ marginRight: '1rem' }}>
                            <input type="radio" value="all" checked={recipientScope === 'all'} onChange={(e) => setRecipientScope(e.target.value)} /> All Users
                        </label>
                        <label style={{ marginRight: '1rem' }}>
                            <input type="radio" value="project" checked={recipientScope === 'project'} onChange={(e) => setRecipientScope(e.target.value)} /> Specific Project
                        </label>
                        <label>
                            <input type="radio" value="specific_users" checked={recipientScope === 'specific_users'} onChange={(e) => setRecipientScope(e.target.value)} /> Specific Users
                        </label>
                    </div>
                </div>

                {recipientScope === 'project' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="projectSelect" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Project:</label>
                        <select
                            id="projectSelect"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="">-- Select Project --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                        {isLoading && <p>Loading projects...</p>}
                    </div>
                )}

                {recipientScope === 'specific_users' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="userSelect" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Users (Ctrl/Cmd + Click for multiple):</label>
                        <select
                            id="userSelect"
                            multiple
                            value={selectedUserIds.map(String)} // select expects string values
                            onChange={handleUserSelectChange}
                            required
                            style={{ width: '100%', minHeight: '150px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                        </select>
                        {isLoading && <p>Loading users...</p>}
                    </div>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

                <button type="submit" disabled={isLoading} className="create-btn">
                    {isLoading ? 'Sending...' : 'Send Broadcast'}
                </button>
            </form>
        </div>
    );
};

BroadcastMessageForm.propTypes = {
    currentUser: PropTypes.object.isRequired, // To exclude admin from specific user list
};

export default BroadcastMessageForm;
// This component would typically be routed to, e.g., /admin/broadcast
// and currentUser would be available from a context or passed via route props.
// For standalone use in a general admin section, it might need its own user fetching if not provided.
// For now, assuming currentUser is passed as a prop.
