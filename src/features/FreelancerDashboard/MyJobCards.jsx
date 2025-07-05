import React, { useState } from 'react';
import { mockData } from '../../data/data.js';
import { TimeTracker } from './TimeTracker.jsx'; // We will create this component next

export const MyJobCards = () => {
    const freelancerName = "Alice Architect"; // Hardcoded for now
    const assignedProjects = mockData.projectManagement.projects.filter(p => p.freelancerName === freelancerName);
    const jobCards = assignedProjects.flatMap(p => p.assignments.map(a => ({...a, projectTitle: p.title, projectHours: p.purchasedHours, hoursSpent: p.hoursSpent })));

    const [trackingTask, setTrackingTask] = useState(null);

    if (trackingTask) {
        return <TimeTracker task={trackingTask} project={jobCards.find(j => j.id === trackingTask.assignmentId)} onBack={() => setTrackingTask(null)} />;
    }

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>My Job Cards</h1>
            </div>
            <div className="table-container">
                 {jobCards.map(card => (
                    <div key={card.id} className="card" style={{marginBottom: '1.5rem'}}>
                        <h3 className="card-header">{card.projectTitle} - {card.title}</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {card.tasks.map(task => (
                                    <tr key={task.id}>
                                        <td>{task.description}</td>
                                        <td><span className={`status-pill status-${task.status.replace(' ','.')}`}>{task.status}</span></td>
                                        <td>
                                            <button className="action-btn" onClick={() => setTrackingTask({...task, assignmentId: card.id})}>Start Timer</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ))}
            </div>
        </div>
    );
};