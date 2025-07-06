import React from 'react';
import { DashboardOverview } from '../features/Dashboard/DashboardOverview.jsx';
import { UserManagement } from '../features/UserManagement/UserManagement.jsx';
import { ProjectManagement } from '../features/ProjectManagement/ProjectManagement.jsx';
import { Billing } from '../features/Billing/Billing.jsx';
import { TimeReports } from '../features/TimeReports/TimeReports.jsx';
import { Profile } from '../features/Profile/Profile.jsx';
import { Messages } from '../features/Messages/Messages.jsx';
import { Reporting } from '../features/Reporting/Reporting.jsx';
import BroadcastMessageForm from '../features/Admin/BroadcastMessageForm.jsx'; // Import the new component

export const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: 'overview', component: <DashboardOverview /> },
    { id: 'userManagement', label: 'User Management', icon: 'userManagement', component: <UserManagement /> },
    { id: 'projects', label: 'Projects', icon: 'projects', component: <ProjectManagement /> },
    { id: 'messages', label: 'Messages', icon: 'messages', component: <Messages /> },
    { id: 'broadcast', label: 'Broadcast Messages', icon: 'campaign', component: <BroadcastMessageForm /> }, // Added new item
    { id: 'billing', label: 'Billing', icon: 'billing', component: <Billing /> },
    { id: 'timeReports', label: 'Time Reports', icon: 'timeReports', component: <TimeReports /> },
    { id: 'reporting', label: 'Reporting', icon: 'reports', component: <Reporting /> },
    { id: 'profile', label: 'My Profile', icon: 'profile', component: <Profile /> },
];