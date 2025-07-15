import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

const TimeLogsPage = () => {
    const [timeLogs, setTimeLogs] = useState([]);
    const [purchasedHours, setPurchasedHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const logsRes = await apiClient.get('/api/timelogs/get.php');
                const hoursRes = await apiClient.get('/api/purchased_hours/get.php');
                setTimeLogs(logsRes.data);
                setPurchasedHours(hoursRes.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch data');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Helper: correlate purchased hours to logged hours by project
    const getProjectSummary = () => {
        const summary = {};
        purchasedHours.forEach(ph => {
            summary[ph.project_id] = {
                project_id: ph.project_id,
                client_id: ph.client_id,
                hours_purchased: ph.hours_purchased,
                amount: ph.amount,
                hours_logged: 0,
                logs: []
            };
        });
        timeLogs.forEach(log => {
            if (summary[log.project_id]) {
                summary[log.project_id].hours_logged += parseFloat(log.hours_logged);
                summary[log.project_id].logs.push(log);
            }
        });
        return Object.values(summary);
    };

    if (loading) {
        return <div>Loading time logs...</div>;
    }
    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    const projectSummary = getProjectSummary();

    return (
        <div className="timelogs-page">
            <h2>Time Logs</h2>
            <p>Below are time logs correlated to hours purchased by clients for projects submitted by freelancers.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1em' }}>
                <thead>
                    <tr>
                        <th>Project ID</th>
                        <th>Client ID</th>
                        <th>Hours Purchased</th>
                        <th>Hours Logged</th>
                        <th>Amount</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {projectSummary.map(row => (
                        <tr key={row.project_id} style={{ background: row.hours_logged > row.hours_purchased ? '#ffe5e5' : '#e5ffe5' }}>
                            <td>{row.project_id}</td>
                            <td>{row.client_id}</td>
                            <td>{row.hours_purchased}</td>
                            <td>{row.hours_logged}</td>
                            <td>{row.amount || '-'}</td>
                            <td>
                                <details>
                                    <summary>Show Logs</summary>
                                    <ul>
                                        {row.logs.map(log => (
                                            <li key={log.id}>
                                                <b>Date:</b> {log.date} | <b>Freelancer:</b> {log.freelancer_id} | <b>Hours:</b> {log.hours_logged} | <b>Status:</b> {log.status} <br />
                                                <b>Description:</b> {log.description}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p style={{ marginTop: '1em' }}>Rows highlighted in <span style={{ background: '#ffe5e5' }}>red</span> indicate hours logged exceed hours purchased.</p>
        </div>
    );
};

export default TimeLogsPage;
