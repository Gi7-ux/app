import React, { useState } from 'react';

export const MyApplications = () => {
    // Mocked data for now - in a real app, this would be managed in a global state
    const [applications, setApplications] = useState([
        { project: 'Open Concept Kitchen Remodel Schematics', status: 'Pending', date: '2025-07-02' },
        { project: 'Eco-Friendly Cafe Design', status: 'Viewed', date: '2025-06-28' },
    ]);

    const handleWithdraw = (projectName) => {
        if (window.confirm(`Are you sure you want to withdraw your application for "${projectName}"?`)) {
            setApplications(current => current.filter(app => app.project !== projectName));
        }
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>My Applications</h1>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Status</th>
                            <th>Date Applied</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app.project}>
                                <td>{app.project}</td>
                                <td>{app.status}</td>
                                <td>{app.date}</td>
                                <td>
                                    <button className="action-link" onClick={() => handleWithdraw(app.project)}>Withdraw</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};