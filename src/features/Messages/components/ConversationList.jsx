import React from 'react';
import PropTypes from 'prop-types';
import { mockData } from '../../../data/data.js';

const getThreadDisplayName = (thread, currentUser) => {
    if (thread.type === 'direct') {
        const otherUserEmail = thread.participants.find(p => p !== currentUser.email);
        const otherUser = mockData.userManagement.users.find(u => u.email === otherUserEmail);
        return otherUser ? `${otherUser.name} (DM)` : 'Direct Message';
    }
    const project = mockData.projectManagement.projects.find(p => p.id === thread.projectId);
    let typeName = '';
    if (thread.type === 'project_client_admin_freelancer') typeName = 'All Chat';
    if (thread.type === 'project_admin_client') typeName = 'Admin/Client';
    if (thread.type === 'project_admin_freelancer') typeName = 'Admin/Freelancer';
    
    return `${project?.title} - ${typeName}`;
};

export const ConversationList = ({ threads, onSelectThread, activeThreadId, currentUser }) => (
    <div className="conversations-list" style={{ width: '320px', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column' }}>
        <div className="messages-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
            <h1>Messages</h1>
        </div>
        <div className="conversation-items" style={{ overflowY: 'auto', flexGrow: 1 }}>
            {threads.map(thread => (
                <div 
                    key={thread.id} 
                    onClick={() => onSelectThread(thread)} 
                    style={{ 
                        padding: '1rem 1.5rem', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid var(--gray-200)', 
                        background: activeThreadId === thread.id ? 'var(--gray-100)' : 'transparent' 
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '0.875rem' }}>{getThreadDisplayName(thread, currentUser)}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {thread.messages[thread.messages.length - 1]?.text}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

ConversationList.propTypes = {
    threads: PropTypes.array.isRequired,
    onSelectThread: PropTypes.func.isRequired,
    activeThreadId: PropTypes.string,
    currentUser: PropTypes.object.isRequired,
};