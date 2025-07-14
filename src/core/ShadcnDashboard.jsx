import React from 'react';
import PropTypes from 'prop-types';
import AdminDashboard from '../components/mvpblocks/dashboards/admin-dashboard-1/index.jsx';

const ShadcnDashboard = ({ userRole, onLogout }) => {
  // For now, we'll just show the admin dashboard
  // In the future, we can add role-based switching here
  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard />
    </div>
  );
};

ShadcnDashboard.propTypes = {
  userRole: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ShadcnDashboard;