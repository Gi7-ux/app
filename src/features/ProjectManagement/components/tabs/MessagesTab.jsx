import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import { ICONS } from '../../../../assets/icons.jsx'; // No longer directly sending messages here
import { MessagingContainer } from '../../../Messages/components/MessagingContainer.jsx';
import './MessagesTab.css'; // Assuming you might want specific styles for the tab container

export const MessagesTab = ({ project }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [errorUser, setErrorUser] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            setLoadingUser(true);
            setErrorUser('');
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setErrorUser('No access token found. Please login.');
                    // Potentially redirect to login: window.location.href = '/login';
                    return;
                }
                // Attempt to read current user data from /api/users/read_one.php?id=current or similar
                // For now, using a placeholder if a dedicated "current user" endpoint isn't confirmed.
                // Let's assume /api/auth/me endpoint exists or /api/users/read_one.php can take 'me' or no ID for current user.
                // Using the one from Messages.jsx for consistency for now:
                const response = await fetch('/api/users/read_one.php', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) { window.location.href = '/login'; return; }
                const data = await response.json();
                if (response.ok) {
                    setCurrentUser(data);
                } else {
                    setErrorUser(data.message || 'Failed to fetch current user data.');
                    console.error(data.message || 'Failed to fetch current user data.');
                }
            } catch (error) {
                setErrorUser('An error occurred while fetching user data.');
                console.error('An error occurred while fetching user data:', error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    if (loadingUser) {
        return <div style={{ padding: '1.5rem', textAlign: 'center' }}>Loading user data...</div>;
    }

    if (errorUser) {
        return <div style={{ color: 'red', padding: '1.5rem' }}>Error loading user: {errorUser}</div>;
    }

    if (!currentUser) {
        return <div style={{ padding: '1.5rem', textAlign: 'center' }}>User data not available. Cannot load messages.</div>;
    }

    if (!project || !project.id) {
        return <div style={{ padding: '1.5rem', textAlign: 'center' }}>Project data not available.</div>;
    }

    return (
        <div className="messages-tab-container">
            {/*
                The MessagingContainer is now responsible for fetching threads and messages
                based on the projectId. It will also handle sending new messages.
            */}
            <MessagingContainer
                currentUser={currentUser}
                projectId={project.id}
            />
        </div>
    );
};

MessagesTab.propTypes = {
    project: PropTypes.object.isRequired,
    // onUpdateProject is no longer needed here as MessagingContainer handles its own data.
};