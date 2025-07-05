import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ConversationList } from './ConversationList.jsx';
import { ChatWindow } from './ChatWindow.jsx';
import { AdminProjectSelector } from './AdminProjectSelector.jsx';
import { mockData } from '../../../data/data.js'; // Keep for project titles for now

export const MessagingContainer = ({ currentUser }) => {
    const [threads, setThreads] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);

    const fetchThreads = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/messages/get_threads.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setThreads(data);
            } else {
                console.error(data.message || 'Failed to fetch threads.');
            }
        } catch {
            console.error('An error occurred while fetching threads.');
        }
    };

    const fetchMessages = async (threadId) => {
        if (!threadId) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/messages/get_messages.php?thread_id=${threadId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setMessages(data);
            } else {
                console.error(data.message || 'Failed to fetch messages.');
            }
        } catch {
            console.error('An error occurred while fetching messages.');
        }
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    useEffect(() => {
        if (activeThread) {
            fetchMessages(activeThread.id);
        }
    }, [activeThread]);

    const handleSendMessage = async (text) => {
        if (!activeThread) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/messages/send_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ thread_id: activeThread.id, text })
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (response.ok) {
                fetchMessages(activeThread.id); // Refresh messages
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to send message.');
            }
        } catch {
            alert('An error occurred while sending the message.');
        }
    };

    const handleModerateMessage = async (messageId, newStatus) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/messages/moderate_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message_id: messageId, status: newStatus })
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (response.ok) {
                fetchMessages(activeThread.id); // Refresh messages
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to moderate message.');
            }
        } catch {
            alert('An error occurred while moderating the message.');
        }
    };

    if (currentUser && currentUser.role === 'admin') {
        return (
            <div className="messages-page" style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'var(--white)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)' }}>
                <AdminProjectSelector
                    projects={mockData.projectManagement.projects}
                    threads={threads}
                    onSelectThread={setActiveThread}
                    activeThreadId={activeThread?.id}
                />
                <ChatWindow
                    thread={activeThread}
                    messages={messages}
                    currentUser={currentUser}
                    onSendMessage={handleSendMessage}
                    onModerateMessage={handleModerateMessage}
                />
            </div>
        );
    }

    return (
        <div className="messages-page" style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'var(--white)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)' }}>
            <ConversationList
                threads={threads}
                onSelectThread={setActiveThread}
                activeThreadId={activeThread?.id}
                currentUser={currentUser}
            />
            <ChatWindow
                thread={activeThread}
                messages={messages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
};

MessagingContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
};