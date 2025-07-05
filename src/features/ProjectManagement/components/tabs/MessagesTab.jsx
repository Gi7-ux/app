import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';

export const MessagesTab = ({ project, onUpdateProject }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const adminUser = "Admin Architex";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom()
    }, [project.messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const message = {
            id: `msg-${Date.now()}`,
            sender: adminUser,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        onUpdateProject({
            ...project,
            messages: [...project.messages, message]
        });

        setNewMessage('');
    };

    return (
        <div className="chat-container">
            <div className="chat-window">
                {project.messages.map(msg => (
                    <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === adminUser ? 'sent' : 'received'}`}>
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
    onUpdateProject: PropTypes.func.isRequired,
};