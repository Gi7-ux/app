import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';

export const MessagesTab = ({ project }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/messages/get_project_messages.php?project_id=${project.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setMessages(await response.json());
        };
        fetchMessages();
    }, [project.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const token = localStorage.getItem('access_token');
        await fetch('/api/messages/send_project_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ project_id: project.id, text: newMessage.trim() })
        });
        setNewMessage('');
        // Re-fetch messages
        const response = await fetch(`/api/messages/get_project_messages.php?project_id=${project.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setMessages(await response.json());
    };

    return (
        <div className="chat-container">
            <div className="chat-window">
                {messages.map(msg => (
                    <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'Admin Architex' ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                            <div className="chat-sender">{msg.sender}</div>
                            <p className="chat-text">{msg.text}</p>
                            <div className="chat-timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="chat-send-btn" data-testid="send-button">
                    {ICONS.send}
                </button>
            </form>
        </div>
    );
};

MessagesTab.propTypes = {
    project: PropTypes.object.isRequired,
};