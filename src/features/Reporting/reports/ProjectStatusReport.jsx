import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div style={{ width: '100%', background: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, background: color, height: '20px', textAlign: 'center', color: 'white', lineHeight: '20px' }}>
                {Math.round(percentage)}%
            </div>
        </div>
    );
};

ProgressBar.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
};

export const ProjectStatusReport = () => {
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState('');

    const fetchReportData = async () => {
        setError('');
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/reports/project_status.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setReportData(data);
            } else {
                setError(data.message || 'Failed to fetch report data.');
            }
        } catch {
            setError('An error occurred while fetching the report.');
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Task Progress</th>
                            <th>Budget Usage</th>
                            <th>Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(row => (
                            <tr key={row.id}>
                                <td>{row.title}</td>
                                <td>{row.client_name}</td>
                                <td><span className={`status-pill status-${row.status.replace(' ', '.')}`}>{row.status}</span></td>
                                <td>
                                    <ProgressBar value={row.completed_tasks} max={row.total_tasks} color="var(--card-teal-bg)" />
                                </td>
                                <td>
                                    <ProgressBar value={row.hours_logged * 700} max={row.budget} color="var(--card-blue-bg)" />
                                </td>
                                <td>{new Date(row.deadline).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};