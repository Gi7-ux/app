import React from 'react';
import PropTypes from 'prop-types';

const getThreadTypeName = (type) => {
    switch(type) {
        case 'project_client_admin_freelancer': return 'All-Hands (Client, Admin, Freelancer)';
        case 'project_admin_client': return 'Private (Admin, Client)';
        case 'project_admin_freelancer': return 'Private (Admin, Freelancer)';
        default: return 'Unknown Thread';
    }
}

export const AdminProjectSelector = ({ projects, threads, onSelectThread, activeThreadId }) => (
    <div className="conversations-list" style={{ width: '320px', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column' }}>
        <div className="messages-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
            <h1>Project Threads</h1>
        </div>
        <div className="conversation-items" style={{ overflowY: 'auto', flexGrow: 1 }}>
            {projects && projects.map(project => {
                const projectThreads = threads.filter(t => t.projectId === project.id);
                return (
                    <div key={project.id} style={{padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)'}}>
                        <h3 style={{margin: '0 0 0.5rem 0'}}>{project.title}</h3>
                        {projectThreads.map(thread => (
                            <div 
                                key={thread.id}
                                onClick={() => onSelectThread(thread)}
                                style={{
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    background: activeThreadId === thread.id ? 'var(--gray-200)' : 'transparent'
                                }}
                            >
                                <p style={{margin: 0, fontSize: '0.875rem'}}>{getThreadTypeName(thread.type)}</p>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    </div>
);

AdminProjectSelector.propTypes = {
    projects: PropTypes.array.isRequired,
    threads: PropTypes.array.isRequired,
    onSelectThread: PropTypes.func.isRequired,
    activeThreadId: PropTypes.string,
};
