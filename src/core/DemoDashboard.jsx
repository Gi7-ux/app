import React from 'react';
import AdminDashboard from '../components/mvpblocks/dashboards/admin-dashboard-1/index.jsx';

// Demo component for testing the Shadcn dashboard without authentication
const DemoDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard />
    </div>
  );
};

export default DemoDashboard;