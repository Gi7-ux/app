import React from 'react';
import { MessagingContainer } from '../Messages/components/MessagingContainer.jsx';
import { mockData } from '../../data/data.js';

export const FreelancerMessages = () => {
    const currentUser = mockData.userManagement.users.find(u => u.email === 'freelancer1@example.com');
    return <MessagingContainer currentUser={currentUser} />;
};