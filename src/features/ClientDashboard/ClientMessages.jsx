import React from 'react';
import { MessagingContainer } from '../Messages/components/MessagingContainer.jsx';
import { mockData } from '../../data/data.js';

export const ClientMessages = () => {
    const currentUser = mockData.userManagement.users.find(u => u.email === 'client1@example.com');
    return <MessagingContainer currentUser={currentUser} />;
};