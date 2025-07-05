import React from 'react';
import { FreelancerOverview } from '../features/FreelancerDashboard/FreelancerOverview.jsx';
import { BrowseProjects } from '../features/FreelancerDashboard/BrowseProjects.jsx';
import { MyApplications } from '../features/FreelancerDashboard/MyApplications.jsx';
import { MyJobCards } from '../features/FreelancerDashboard/MyJobCards.jsx';
import { FreelancerProfile } from '../features/FreelancerDashboard/FreelancerProfile.jsx';
import { FreelancerMessages } from '../features/FreelancerDashboard/FreelancerMessages.jsx';

export const FREELANCER_NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: 'overview', component: <FreelancerOverview /> },
    { id: 'browse', label: 'Browse Projects', icon: 'projects', component: <BrowseProjects /> },
    { id: 'applications', label: 'My Applications', icon: 'userManagement', component: <MyApplications /> },
    { id: 'jobcards', label: 'My Job Cards', icon: 'billing', component: <MyJobCards /> },
    { id: 'profile', label: 'My Profile', icon: 'profile', component: <FreelancerProfile /> },
    { id: 'messages', label: 'Messages', icon: 'messages', component: <FreelancerMessages /> },
];
