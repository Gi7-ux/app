import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import { mockData } from '../../../data/data.js'; // Removed mockData
import { ICONS } from '../../../assets/icons.jsx'; // For icons

// Removed getSender as messages now include sender_name and sender_avatar

const Message = ({ msg, currentUser, onModerateMessage }) => { // Removed threadType
    // msg structure from API: id, thread_id, sender_id, text, file_id, timestamp, status, sender_name, sender_avatar
    const isCurrentUser = msg.sender_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';
    // Message status: 'approved', 'pending', 'deleted'
    const canModerate = isAdmin && msg.status === 'pending';


    const getStatusTextAndColor = () => {
        if (msg.status === 'pending') return { text: 'Pending Approval', color: 'orange' };
        if (msg.status === 'deleted') return { text: 'Message Deleted', color: 'red' };
        // 'approved' messages don't show a status text by default to non-admins.
        // Admins might want to see 'approved' status explicitly sometimes, but not implemented here.
        return { text: '', color: 'var(--gray-400)'};
    }
    const statusInfo = getStatusTextAndColor();

    return (
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '70%' }}>
                <div style={{ 
                    background: isCurrentUser ? 'var(--sidebar-active-bg)' : 'var(--gray-100)', 
                    color: isCurrentUser ? 'var(--white)' : 'var(--gray-800)',
                    padding: '0.75rem 1rem', 
                    borderRadius: '1rem',
                    opacity: msg.status === 'deleted' ? 0.6 : 1,
                }}>
                    <p style={{margin: 0, fontWeight: '500'}}>{msg.sender_name}</p>
                    {msg.status === 'deleted' ? (
                        <p style={{margin: '0.25rem 0 0 0', fontStyle: 'italic'}}>Message deleted</p>
                    ) : (
                        <p style={{margin: '0.25rem 0 0 0'}}>{msg.text}</p>
                    )}
                     {msg.file_id && msg.status !== 'deleted' && (
                        <p style={{margin: '0.25rem 0 0 0', fontSize: '0.8rem'}}>
                            <em>Attachment: <a href={`/api/files/download_file.php?id=${msg.file_id}&token=${localStorage.getItem('access_token')}`} target="_blank" rel="noopener noreferrer">View File (ID: {msg.file_id})</a></em>
                        </p>
                    )}
                    <p style={{margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: '0.7', textAlign: 'right'}}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                {/* Approval UI for Admins on Pending Messages */}
                {(canModerate) && (
                    <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem'}}>
                        <button onClick={() => onModerateMessage(msg.id, 'approved')} style={{background: 'var(--card-teal-bg)', color: 'var(--card-teal-icon)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer'}}>Approve</button>
                        <button onClick={() => onModerateMessage(msg.id, 'deleted')} style={{background: 'var(--card-red-bg)', color: 'var(--card-red-icon)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer'}}>Delete</button>
                    </div>
                )}
                {/* Status display for non-admins or non-pending for admins */}
                {(!isCurrentUser && msg.status !== 'approved' && !canModerate) && (
                     <p style={{margin: '0.25rem 0 0 0.5rem', fontSize: '0.75rem', color: statusInfo.color, textTransform: 'capitalize'}}>{statusInfo.text}</p>
                )}
                 {(isCurrentUser && msg.status !== 'approved' && msg.status !== 'deleted') && ( // Current user sees their own pending message status
                    <p style={{margin: '0.25rem 0 0 0.5rem', fontSize: '0.75rem', color: statusInfo.color, textAlign: 'right', textTransform: 'capitalize'}}>{statusInfo.text}</p>
                )}
            </div>
        </div>
    );
};

Message.propTypes = {
    msg: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    onModerateMessage: PropTypes.func, // Now optional as only admins get it
    // threadType: PropTypes.string, // Removed as it was unused in Message component
};


const AddFreelancerModal = ({ show, onClose, onAddFreelancer, projectId }) => { // Removed currentThreadId from signature
    const [projectFreelancer, setProjectFreelancer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && projectId) {
            setLoading(true); setError('');
            const fetchProjectAndFreelancer = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    // 1. Fetch project details to get freelancer_id
                    const projectRes = await fetch(`/api/projects/read_one.php?id=${projectId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!projectRes.ok) throw new Error('Failed to fetch project details.');
                    const projectData = await projectRes.json();

                    if (projectData.freelancer_id) {
                        // 2. Fetch freelancer user details
                        const userRes = await fetch(`/api/users/read_one.php?id=${projectData.freelancer_id}`, {
                             headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!userRes.ok) throw new Error('Failed to fetch freelancer details.');
                        const freelancerData = await userRes.json();
                        setProjectFreelancer(freelancerData);
                    } else {
                        setProjectFreelancer(null); // No freelancer assigned
                    }
                } catch (err) {
                    setError(err.message);
                    console.error("Error fetching freelancer for modal:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProjectAndFreelancer();
        }
    }, [show, projectId]);

    const handleAdd = () => {
        if (projectFreelancer) {
            onAddFreelancer(projectFreelancer.id);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-backdrop" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div className="modal-content" style={{background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px'}}>
                <h3>Add Freelancer to Conversation</h3>
                {loading && <p>Loading freelancer details...</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}
                {!loading && !error && (
                    projectFreelancer ? (
                        <div>
                            <p>Add <strong>{projectFreelancer.name}</strong> (Freelancer for this project) to this conversation?</p>
                            <button onClick={handleAdd} className="create-btn" style={{marginRight: '1rem'}}>Add Freelancer</button>
                        </div>
                    ) : (
                        <p>No freelancer is currently assigned to this project.</p>
                    )
                )}
                <button onClick={onClose} className="back-btn" style={{marginTop: '1rem'}}>Close</button>
            </div>
        </div>
    );
};

AddFreelancerModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddFreelancer: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    // currentThreadId: PropTypes.number, // No longer needed as thread.id is used directly if required by API
};


export const ChatWindow = ({ thread, messages, currentUser, onSendMessage, onModerateMessage, isLoading, projectId: propProjectId, onThreadUpdate }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showAddFreelancerModal, setShowAddFreelancerModal] = useState(false);
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!thread && !propProjectId) { // If no thread and no project context to imply a thread
        return <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>Select a conversation or project to start messaging.</div>;
    }
    if (isLoading && messages.length === 0) {
         return <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>Loading messages...</div>;
    }


    const handleSend = () => {
        if (newMessage.trim() === '') return;
        onSendMessage(newMessage.trim()); // fileId handled by a separate mechanism if needed alongside text
        setNewMessage('');
    };
    
    // Determine if the "Add Freelancer" button should be shown
    const canAddFreelancer = currentUser.role === 'admin' && thread && thread.type === 'client_admin' && thread.projectId;

    const handleAddFreelancerToThread = async (freelancerUserId) => {
        if (!thread || !thread.id) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/messages/add_participant.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    thread_id: thread.id,
                    user_id_to_add: freelancerUserId,
                    new_thread_type: 'project_client_admin_freelancer' // Suggest new type
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Freelancer added to conversation successfully.');
                setShowAddFreelancerModal(false);
                if(onThreadUpdate) onThreadUpdate(); // Notify parent to refresh thread/UI if needed
            } else {
                alert(`Failed to add freelancer: ${data.message}`);
            }
        } catch (error) {
            alert(`Error adding freelancer: ${error.message}`);
            console.error("Add freelancer API error:", error);
        }
    };

    const currentThreadTitle = thread?.subject || (propProjectId ? `Project ${propProjectId} Messages` : "Conversation");

    return (
        <div className="chat-window" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chat-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{margin: 0, fontSize: '1.25rem'}}>{currentThreadTitle}</h2>
                {canAddFreelancer && (
                    <button onClick={() => setShowAddFreelancerModal(true)} className="standard-btn" title="Add assigned freelancer to this conversation">
                        {ICONS.userAdd || 'Add Freelancer'} {/* Fallback text if icon isn't defined */}
                    </button>
                )}
            </div>
            <div className="chat-messages" style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {messages.length === 0 && !isLoading && (
                    <div style={{textAlign: 'center', color: 'var(--gray-500)', marginTop: '2rem'}}>No messages in this conversation yet.</div>
                )}
                {messages.map(msg => (
                    <Message
                        key={msg.id}
                        msg={msg}
                        currentUser={currentUser}
                        onModerateMessage={currentUser.role === 'admin' ? onModerateMessage : undefined}
                        threadType={thread?.type}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', background: 'var(--gray-50)' }}>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="chat-input-field" // Changed class from search-input for specific styling
                    style={{flexGrow: 1, padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem'}}
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                />
                <button className="send-message-btn" onClick={handleSend} style={{padding: '0.75rem 1rem'}}>
                    {ICONS.send || "Send"}
                </button>
            </div>
            {canAddFreelancer && (
                <AddFreelancerModal
                    show={showAddFreelancerModal}
                    onClose={() => setShowAddFreelancerModal(false)}
                    onAddFreelancer={handleAddFreelancerToThread}
                    projectId={thread.projectId}
                    // currentThreadId={thread.id} // Removed as it's not used by AddFreelancerModal
                />
            )}
        </div>
    );
};

ChatWindow.propTypes = {
    thread: PropTypes.object, // Can be null if no thread selected or found yet
    messages: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    onSendMessage: PropTypes.func.isRequired,
    onModerateMessage: PropTypes.func, // Optional, only passed for admins
    isLoading: PropTypes.bool,
    projectId: PropTypes.number, // Passed down from MessagingContainer
    onThreadUpdate: PropTypes.func, // Callback to notify parent of thread changes
};