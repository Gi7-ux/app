import React, { useState, useEffect } from 'react';
import { MessagingContainer } from './components/MessagingContainer.jsx';

export const Messages = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('/api/users/read_one.php', { // Assuming an endpoint to get current user
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setCurrentUser(data);
                } else {
                    console.error(data.message || 'Failed to fetch user data.');
                }
            } catch (error) {
                console.error('An error occurred while fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    if (!currentUser) {
        return <div>Loading...</div>; // Or some other loading state
    }

    return <MessagingContainer currentUser={currentUser} />;
};
