import React from 'react';
import PropTypes from 'prop-types';

const ChartPlaceholder = ({ title, height }) => (
    <div className="card" style={{ marginTop: '1.5rem', padding: '1rem', textAlign: 'center' }}>
        <h4>{title}</h4>
        <div style={{ height: height, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [Chart Data Would Be Here]
        </div>
    </div>
);

ChartPlaceholder.propTypes = {
    title: PropTypes.string.isRequired,
    height: PropTypes.string,
};

ChartPlaceholder.defaultProps = {
    height: '200px',
};

export default ChartPlaceholder;
