import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { mockData } from '../../../data/data.js';

const getSender = (email) => {
    return mockData.userManagement.users.find(u => u.email === email) || { name: 'Unknown User' };
};

const Message = ({ msg, currentUser, onModerateMessage, threadType }) => {
    const sender = getSender(msg.sender);
    const isCurrentUser = msg.sender === currentUser.email;
    const isAdmin = currentUser.role === 'admin';
    const needsApproval = msg.status === 'pending' && threadType === 'project_client_admin_freelancer';

    const getStatusColor = () => {
        if (msg.status === 'pending') return 'orange';
        if (msg.status === 'rejected') return 'red';
        return 'var(--gray-400)';
    }

    return (
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '70%' }}>
                <div style={{ 
                    background: isCurrentUser ? 'var(--sidebar-active-bg)' : 'var(--gray-100)', 
                    color: isCurrentUser ? 'white' : 'var(--gray-800)', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '1rem' 
                }}>
                    <p style={{margin: 0, fontWeight: '500'}}>{sender.name}</p>
                    <p style={{margin: '0.25rem 0 0 0'}}>{msg.text}</p>
                    <p style={{margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: '0.7', textAlign: 'right'}}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
                {/* Approval UI */}
                {(isAdmin && needsApproval) && (
                    <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem'}}>
                        <button onClick={() => onModerateMessage(msg.id, 'approved')} style={{background: 'var(--card-teal-bg)', color: 'var(--card-teal-icon)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer'}}>Approve</button>
                        <button onClick={() => onModerateMessage(msg.id, 'rejected')} style={{background: 'var(--card-red-bg)', color: 'var(--card-red-icon)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer'}}>Reject</button>
                    </div>
                )}
                {(!isAdmin && msg.status !== 'approved') && (
                     <p style={{margin: '0.25rem 0 0 0.5rem', fontSize: '0.75rem', color: getStatusColor(), textTransform: 'capitalize'}}>{msg.status}</p>
                )}
            </div>
        </div>
    );
};

Message.propTypes = {
    msg: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    onModerateMessage: PropTypes.func.isRequired,
    threadType: PropTypes.string.isRequired,
};

export const ChatWindow = ({ thread, messages, currentUser, onSendMessage, onModerateMessage }) => {
    const [newMessage, setNewMessage] = useState('');

    if (!thread) {
        return <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>Select a conversation to start messaging.</div>;
    }

    const handleSend = () => {
        onSendMessage(newMessage);
        setNewMessage('');
    };
    
    const messagesToShow = messages.filter(msg => {
        if (currentUser.role === 'admin') return true; // Admin sees all
        if (msg.sender === currentUser.email) return true; // Users always see their own messages
        return msg.status === 'approved'; // Others see only approved messages
    });

    return (
        <div className="chat-window" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="chat-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                <h2 style={{margin: 0}}>Conversation</h2>
            </div>
            <div className="chat-messages" style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                <div className="message-list">
                    {messagesToShow.slice().reverse().map(msg => (
                        <Message 
                            key={msg.id} 
                            msg={msg} 
                            currentUser={currentUser} 
                            onModerateMessage={(messageId, status) => onModerateMessage(thread.id, messageId, status)}
                            threadType={thread.type}
                        />
                    ))}
                </div>
            </div>
            <div className="chat-input" style={{ padding: '1.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '1rem' }}>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="search-input" 
                    style={{flexGrow: 1}} 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                />
                <button className="create-btn" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

ChatWindow.propTypes = {
    thread: PropTypes.object,
    messages: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    onSendMessage: PropTypes.func.isRequired,
    onModerateMessage: PropTypes.func.isRequired,
};