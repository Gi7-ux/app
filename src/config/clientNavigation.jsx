import React from 'react';
import { ClientOverview } from '../features/ClientDashboard/ClientOverview.jsx';
import { ClientProjects } from '../features/ClientDashboard/ClientProjects.jsx';
import { ClientProfile } from '../features/ClientDashboard/ClientProfile.jsx';
import { ClientMessages } from '../features/ClientDashboard/ClientMessages.jsx';
import TicketsPage from '../features/Tickets/TicketsPage.jsx';

export const CLIENT_NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: 'overview', component: <ClientOverview /> },
    { id: 'projects', label: 'My Projects', icon: 'projects', component: <ClientProjects /> },
    { id: 'profile', label: 'My Profile', icon: 'profile', component: <ClientProfile /> },
    { id: 'messages', label: 'Messages', icon: 'messages', component: <ClientMessages /> },
    { id: 'tickets', label: 'My Tickets', icon: 'help_outline', component: <TicketsPage /> },
];
