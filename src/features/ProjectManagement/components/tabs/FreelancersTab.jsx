import React from 'react';
import PropTypes from 'prop-types';

export const FreelancersTab = ({ project }) => {
    // This is a placeholder. A real implementation would be more complex,
    // allowing assignment, viewing profiles, etc.
    return (
        <div className="card">
            <h3 className="card-header">Assigned Freelancer</h3>
            <p>{project.freelancerName}</p>
        </div>
    )
};

FreelancersTab.propTypes = {
    project: PropTypes.object.isRequired,
};