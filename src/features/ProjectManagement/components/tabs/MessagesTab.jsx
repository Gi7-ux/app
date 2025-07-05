import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';

export const MessagesTab = ({ project, onUpdateProject }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Assuming the user's own ID is available, e.g., from a global context or localStorage after login.
    // For this example, let's try to get it from localStorage, assuming it's stored there.
    // In a real app, this would be handled more robustly (e.g. Redux store, React Context).
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
                setCurrentUserId(payload.data.id);
            }
        } catch (e) {
            console.error("Failed to parse token or get user ID:", e);
            // setError("Could not identify current user. Messages may not work correctly.");
        }
    }, []);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [project.messages]); // project.messages should be updated by parent via onUpdateProject

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || loading) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/project_messages/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: project.id,
                    message_text: newMessage.trim()
                    // sender_id is handled by the backend using the token
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to send message.');
            }

            setNewMessage('');
            onUpdateProject(); // This will trigger a re-fetch in ProjectDetailsView, updating messages
            // The new message will be part of project.messages after refresh
            // scrollToBottom will be called by useEffect when project.messages updates

        } catch (err) {
            setError(err.message);
            // console.error("Send message error:", err); // Keep for debugging
        } finally {
            setLoading(false);
        }
    };

    const projectMessages = Array.isArray(project.messages) ? project.messages : [];

    return (
        <div className="chat-container">
            {error && <p className="error-message" style={{paddingBottom: '10px', color: 'red'}}>{error}</p>}
            <div className="chat-window">
                {projectMessages.map(msg => (
                    // Compare msg.user_id (sender's ID from backend) with currentUserId
                    <div key={msg.id} className={`chat-bubble-wrapper ${msg.user_id === currentUserId ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                            <div className="chat-sender">{msg.sender_name}</div> {/* Assuming sender_name is provided by API */}
                            <p className="chat-text">{msg.message_text}</p>
                            <div className="chat-timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                 {projectMessages.length === 0 && !loading && <p className="no-messages-info">No messages in this project yet.</p>}
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