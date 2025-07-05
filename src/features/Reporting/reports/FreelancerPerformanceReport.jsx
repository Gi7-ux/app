import React, { useState, useEffect } from 'react';

export const FreelancerPerformanceReport = () => {
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState('');

    const fetchReportData = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/reports/freelancer_performance.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
                            <th>Freelancer</th>
                            <th>Assigned Projects</th>
                            <th>Total Hours Logged</th>
                            <th>Hourly Rate (R)</th>
                            <th>Total Billed (R)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(row => (
                            <tr key={row.id}>
                                <td>{row.name}</td>
                                <td>{row.assigned_projects}</td>
                                <td>{parseFloat(row.total_hours_logged || 0).toFixed(2)}</td>
                                <td>R {row.rate}</td>
                                <td>R {(row.total_hours_logged * row.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};