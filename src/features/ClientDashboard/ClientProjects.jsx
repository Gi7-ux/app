import React from 'react';
import { mockData } from '../../data/data.js';
import { ICONS } from '../../assets/icons.jsx';

export const ClientProjects = () => {
    const clientName = "Client Architex";
    const projects = mockData.projectManagement.projects.filter(p => p.clientName === clientName);

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>My Projects</h1>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Freelancer</th>
                            <th>Status</th>
                            <th>Budget (R)</th>
                            <th>Spend (R)</th>
                            <th>Deadline</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => {
                            const isPastDue = new Date(p.deadline) < new Date() && p.status !== 'Completed';
                            return (
                            <tr key={p.id}>
                                <td>{p.title}</td>
                                <td>{p.freelancerName}</td>
                                <td><span className={`status-pill status-${p.status.replace(' ','.')}`}>{p.status}</span></td>
                                <td>R {p.budget.toLocaleString()}</td>
                                <td>R {p.spend.toLocaleString()}</td>
                                <td className={isPastDue ? 'deadline-passed' : ''}>{new Date(p.deadline).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-icons">
                                        <span title="View Details">{ICONS.view}</span>
                                        <span title="Upload Files">{ICONS.upload}</span>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
};