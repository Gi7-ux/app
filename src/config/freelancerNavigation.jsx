import React from 'react';
import { FreelancerOverview } from '../features/FreelancerDashboard/FreelancerOverview.jsx';
import { BrowseProjects } from '../features/FreelancerDashboard/BrowseProjects.jsx';
import { MyApplications } from '../features/FreelancerDashboard/MyApplications.jsx';
import { MyJobCards } from '../features/FreelancerDashboard/MyJobCards.jsx';
import { FreelancerProfile } from '../features/FreelancerDashboard/FreelancerProfile.jsx';
import { FreelancerMessages } from '../features/FreelancerDashboard/FreelancerMessages.jsx';
import TicketsPage from '../features/Tickets/TicketsPage.jsx';
import TimeLogsPage from '../features/TimeLogs/TimeLogsPage.jsx';
import Settings from '../features/Settings/Settings.jsx';

export const FREELANCER_NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: 'overview', component: <FreelancerOverview /> },
    { id: 'browse', label: 'Browse Projects', icon: 'projects', component: <BrowseProjects /> },
    { id: 'timelogs', label: 'Time Logs', icon: 'schedule', component: <TimeLogsPage /> },
    { id: 'applications', label: 'My Applications', icon: 'userManagement', component: <MyApplications /> },
    { id: 'jobcards', label: 'My Job Cards', icon: 'billing', component: <MyJobCards /> },
    { id: 'profile', label: 'My Profile', icon: 'profile', component: <FreelancerProfile /> },
    { id: 'messages', label: 'Messages', icon: 'messages', component: <FreelancerMessages /> },
    { id: 'tickets', label: 'My Tickets', icon: 'help_outline', component: <TicketsPage /> },
    { id: 'settings', label: 'Settings', icon: 'settings', component: <Settings /> },
];
