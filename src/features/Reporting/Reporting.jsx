import React, { useState } from 'react';
import { FreelancerPerformanceReport } from './reports/FreelancerPerformanceReport';
import { ProjectStatusReport } from './reports/ProjectStatusReport';
import { ClientSummaryReport } from './reports/ClientSummaryReport';

const TABS = [
    { id: 'freelancer', label: 'Freelancer Performance' },
    { id: 'projects', label: 'Project Status' },
    { id: 'clients', label: 'Client Summary' },
];

export const Reporting = () => {
    const [activeTab, setActiveTab] = useState('freelancer');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'freelancer':
                return <FreelancerPerformanceReport />;
            case 'projects':
                return <ProjectStatusReport />;
            case 'clients':
                return <ClientSummaryReport />;
            default:
                return null;
        }
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Reporting</h1>
            </div>
            <div className="project-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content" style={{ padding: '1.5rem' }}>
                {renderTabContent()}
            </div>
        </div>
    );
};