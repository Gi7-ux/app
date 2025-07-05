import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../assets/icons.jsx';
import { messageData } from '../data/messages.js';
import { mockData } from '../../../data/data.js';

export const ChatInterface = ({ currentUser }) => {
    const [conversations, setConversations] = useState(messageData.conversations);
    const [activeConversation, setActiveConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState('');

    const userConversations = conversations.filter(c => c.participants.includes(currentUser.name));

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        const message = {
            id: `msg-${Date.now()}`,
            sender: currentUser.name,
            text: newMessage,
            timestamp: new Date().toLocaleString()
        };

        const updatedConversations = conversations.map(c => {
            if (c.projectId === activeConversation.projectId) {
                return { ...c, messages: [...c.messages, message] };
            }
            return c;
        });

        setConversations(updatedConversations);
        setActiveConversation(updatedConversations.find(c => c.projectId === activeConversation.projectId));
        setNewMessage('');
    };
    
    const getProjectTitle = (projectId) => {
        const project = mockData.projectManagement.projects.find(p => p.id === projectId);
        return project ? project.title : 'Unknown Project';
    }

    return (
        <div className="messages-page" style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'var(--white)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)' }}>
            <div className="conversations-list" style={{ width: '320px', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column' }}>
                <div className="messages-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Messages</h1>
                    <button className="create-btn" style={{padding: '0.5rem'}} title="New Message">{ICONS.newMessage}</button>
                </div>
                <div className="search-bar" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                    <input type="text" placeholder="Search messages..." className="search-input" />
                </div>
                <div className="conversation-items" style={{ overflowY: 'auto', flexGrow: 1 }}>
                    {userConversations.map(convo => (
                        <div key={convo.projectId} onClick={() => setActiveConversation(convo)} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid var(--gray-200)', background: activeConversation.projectId === convo.projectId ? 'var(--gray-100)' : 'transparent' }}>
                            <div style={{ flexGrow: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '0.875rem' }}>{getProjectTitle(convo.projectId)}</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-500)' }}>{convo.messages[convo.messages.length - 1].text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-window" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                 <div className="chat-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center' }}>
                    <h2 style={{margin: 0}}>{getProjectTitle(activeConversation.projectId)}</h2>
                </div>
                <div className="chat-messages" style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                    <div className="message-list">
                        {activeConversation.messages.slice().reverse().map(msg => (
                            <div key={msg.id} style={{ marginBottom: '1rem', display: 'flex', justifyContent: msg.sender === currentUser.name ? 'flex-end' : 'flex-start' }}>
                                <div style={{ background: msg.sender === currentUser.name ? 'var(--sidebar-active-bg)' : 'var(--gray-100)', color: msg.sender === currentUser.name ? 'white' : 'var(--gray-800)', padding: '0.75rem 1rem', borderRadius: '1rem', maxWidth: '70%' }}>
                                    <p style={{margin: 0, fontWeight: '500'}}>{msg.sender}</p>
                                    <p style={{margin: '0.25rem 0 0 0'}}>{msg.text}</p>
                                    <p style={{margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: '0.7', textAlign: 'right'}}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-input" style={{ padding: '1.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="Type a message..." className="search-input" style={{flexGrow: 1}} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button className="create-btn" onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

ChatInterface.propTypes = {
    currentUser: PropTypes.object.isRequired,
};