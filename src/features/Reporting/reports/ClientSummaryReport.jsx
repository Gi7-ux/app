import React, { useState, useEffect } from 'react';

export const ClientSummaryReport = () => {
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState('');

    const fetchReportData = async () => {
        setError('');
        try {
            const { AuthService } = await import('../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/reports/client_summary.php', {
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
                            <th>Client</th>
                            <th>Company</th>
                            <th>Total Projects</th>
                            <th>Total Budget (R)</th>
                            <th>Total Spend (R)</th>
                            <th>Avg. Project Duration (Days)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(row => (
                            <tr key={row.id}>
                                <td>{row.name}</td>
                                <td>{row.company}</td>
                                <td>{row.total_projects}</td>
                                <td>R {parseFloat(row.total_budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td>R {parseFloat(row.total_spend || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td>{Math.round(row.avg_project_duration_days || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};