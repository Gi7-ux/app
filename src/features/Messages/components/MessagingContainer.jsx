import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ConversationList } from './ConversationList.jsx';
import { ChatWindow } from './ChatWindow.jsx';
import { AdminProjectSelector } from './AdminProjectSelector.jsx';
// import { mockData } from '../../../data/data.js'; // Keep for project titles for now - No longer needed for AdminProjectSelector if it fetches real projects

export const MessagingContainer = ({ currentUser, projectId = null }) => { // Added projectId prop
    const [threads, setThreads] = useState([]);
    const [projects, setProjects] = useState([]); // New state for projects
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetches all threads for the current user (used when no projectId is specified)
    const fetchUserThreads = async () => {
        setIsLoading(true); setError('');
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/messages/get_threads.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setThreads(data);
                if (data.length > 0 && !activeThread) {
                    // setActiveThread(data[0]); // Optionally auto-select first thread
                }
            } else {
                setError(data.message || 'Failed to fetch threads.');
                console.error(data.message || 'Failed to fetch threads.');
            }
        } catch (err) {
            setError('An error occurred while fetching threads.');
            console.error('An error occurred while fetching threads:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // New function to fetch projects
    const fetchProjects = async () => {
        setIsLoading(true); setError('');
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/projects/read.php', { // Assuming read.php fetches all projects
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setProjects(data.records || []); // Assuming data has a 'records' key
            } else {
                setError(data.message || 'Failed to fetch projects.');
                console.error(data.message || 'Failed to fetch projects.');
            }
        } catch (err) {
            setError('An error occurred while fetching projects.');
            console.error('An error occurred while fetching projects:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Ensures and fetches threads for a specific project
    const ensureAndFetchProjectThreads = async () => {
        if (!projectId) return;
        setIsLoading(true); setError('');
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            // Ensure 'project_communication' thread
            const ensureCommThreadResponse = await fetch('/api/messages/ensure_thread.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ project_id: projectId, type: 'project_communication' })
            });
            if (ensureCommThreadResponse.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const commThreadData = await ensureCommThreadResponse.json();
            if (!ensureCommThreadResponse.ok) throw new Error(commThreadData.message || 'Failed to ensure project communication thread.');

            let projectThreads = [{ id: commThreadData.thread_id, type: 'project_communication', projectId: projectId, subject: `Project Channel` }]; // Mock subject

            // If client or admin, also ensure 'client_admin' thread
            if (currentUser.role === 'client' || currentUser.role === 'admin') {
                const ensureClientAdminThreadResponse = await fetch('/api/messages/ensure_thread.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ project_id: projectId, type: 'client_admin' })
                });
                if (ensureClientAdminThreadResponse.status === 401) {
                    await AuthService.logout();
                    window.location.href = '/login';
                    return;
                }
                const clientAdminThreadData = await ensureClientAdminThreadResponse.json();
                if (!ensureClientAdminThreadResponse.ok) throw new Error(clientAdminThreadData.message || 'Failed to ensure client_admin thread.');

                // Avoid duplicates if by some chance they are the same (should not happen with correct types)
                if (clientAdminThreadData.thread_id !== commThreadData.thread_id) {
                    projectThreads.push({ id: clientAdminThreadData.thread_id, type: 'client_admin', projectId: projectId, subject: `Admin Channel` });
                }
            }

            setThreads(projectThreads);
            // Auto-select the 'project_communication' thread by default for projects, or the first one if only one exists.
            const defaultThread = projectThreads.find(t => t.type === 'project_communication') || projectThreads[0];
            if (defaultThread) {
                setActiveThread(defaultThread);
            }

        } catch (err) {
            setError(`Error setting up project messages: ${err.message}`);
            console.error(`Error setting up project messages:`, err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetches messages for the active thread OR for a project_id
    const fetchCurrentMessages = async () => {
        if (!activeThread && !projectId) return;
        setIsLoading(true); setError('');

        let url = '';
        if (projectId && !activeThread) {
            // If projectId is set and no specific thread is active yet, fetch all project messages
            // This relies on get_messages.php handling project_id to fetch from relevant threads
            url = `/api/messages/get_messages.php?project_id=${projectId}`;
        } else if (activeThread) {
            url = `/api/messages/get_messages.php?thread_id=${activeThread.id}`;
        } else {
            setIsLoading(false); return; // Should not happen if logic is correct
        }

        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setMessages(data);
            } else {
                setError(data.message || 'Failed to fetch messages.');
                console.error(data.message || 'Failed to fetch messages.');
            }
        } catch (err) {
            setError('An error occurred while fetching messages.');
            console.error('An error occurred while fetching messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            ensureAndFetchProjectThreads(); // This will also set an activeThread
        } else {
            fetchUserThreads(); // General messaging page
            if (currentUser.role === 'admin') { // Only fetch projects if admin and not in project context
                fetchProjects();
            }
        }
    }, [projectId, currentUser.id, currentUser.role]); // Re-run if projectId changes or user changes, or role changes

    useEffect(() => {
        // This effect now primarily relies on activeThread being set by the thread fetching logic.
        // If activeThread is set (either from user selection or auto-selection for projects), fetch its messages.
        if (activeThread) {
            fetchCurrentMessages();
        } else if (projectId) {
            // If it's a project view and activeThread didn't get set by ensureAndFetchProjectThreads (e.g. no threads yet)
            // still attempt to fetch messages by project_id, which might return an empty array.
            // Or, ensure ensureAndFetchProjectThreads ALWAYS sets an activeThread if threads are created.
            // For now, let's assume activeThread will be set if threads exist.
            // If no threads exist yet for a project, fetchCurrentMessages might not run until a message is sent and thread created.
            // This is fine, ChatWindow can show "No messages yet".
        }
    }, [activeThread]);


    const handleSendMessage = async (text, fileId = null) => {
        if (!activeThread && !projectId) {
            alert('No active conversation selected and no project context.'); return;
        }
        if (!text && !fileId) {
            alert('Cannot send an empty message without a file.'); return;
        }

        setIsLoading(true); // Indicate sending
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const body = {
                text: text || '', // Send empty string if only file
                file_id: fileId
            };

            if (activeThread) {
                body.thread_id = activeThread.id;
                // If the active thread is project-scoped, its project_id is implicitly handled by the thread_id on backend
            } else if (projectId) {
                // This case implies sending a message to the project's default channel without a specific thread selected yet
                // The backend send_message.php needs to correctly find/create the 'project_communication' thread
                body.project_id = projectId;
            } else {
                alert('Cannot determine target for sending message.'); setIsLoading(false); return;
            }

            const response = await fetch('/api/messages/send_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const responseData = await response.json();
            if (response.ok) {
                // If a new thread was created by sending the message (e.g. first message in project context)
                // and we now have a thread_id, we should set it as active.
                if (responseData.thread_id && (!activeThread || activeThread.id !== responseData.thread_id)) {
                    // A bit complex: might need to re-fetch threads list or update it, then set active.
                    // For now, just re-fetch messages for the current context.
                    if (projectId && !activeThread) { // If it was a project message that created the first thread
                        ensureAndFetchProjectThreads(); // This will re-evaluate activeThread and trigger message fetch
                    } else {
                        fetchCurrentMessages(); // Refresh messages for the current active thread or project
                    }
                } else {
                    fetchCurrentMessages(); // Refresh messages for the current active thread or project
                }
            } else {
                alert(responseData.message || 'Failed to send message.');
            }
        } catch (err) {
            alert('An error occurred while sending the message: ' + err.message);
            console.error('Send message error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModerateMessage = async (messageId, newStatus) => {
        setIsLoading(true);
        try {
            const { AuthService } = await import('../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/messages/moderate_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message_id: messageId, status: newStatus })
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            if (response.ok) {
                fetchCurrentMessages(); // Refresh messages
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to moderate message.');
            }
        } catch (err) {
            alert('An error occurred while moderating the message: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectThread = (thread) => {
        setActiveThread(thread);
        // messages will be fetched by useEffect watching activeThread
    };

    // Render logic
    if (isLoading && messages.length === 0 && !error) { // Show loading only on initial load or when actively fetching
        return <div style={{ padding: '1.5rem', textAlign: 'center' }}>Loading messages...</div>;
    }
    if (error) {
        return <div style={{ color: 'red', padding: '1.5rem' }}>Error: {error}</div>;
    }

    // For project view, we might not want to show the ConversationList if there's only one or two implicit threads.
    // Or, the ConversationList itself could be adapted to show project-specific channels.
    const showConversationList = !projectId || (threads.length > 1 && currentUser.role === 'admin'); // Example condition

    return (
        <div className="messages-page" style={{ display: 'flex', height: '100%', maxHeight: 'calc(100vh - 150px)', background: 'var(--white)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
            {showConversationList && (currentUser.role === 'admin' && !projectId) && (
                <AdminProjectSelector
                    projects={projects} // Pass fetched projects
                    threads={threads} // All threads for admin
                    onSelectThread={handleSelectThread}
                    activeThreadId={activeThread?.id}
                    currentUser={currentUser}
                />
            )}
            {showConversationList && !(currentUser.role === 'admin' && !projectId) && (
                <ConversationList
                    threads={threads} // Filtered for project if projectId, or all user threads
                    onSelectThread={handleSelectThread}
                    activeThreadId={activeThread?.id}
                    currentUser={currentUser}
                />
            )}
            <ChatWindow
                thread={activeThread} // activeThread could be null if no messages/threads yet for a project
                messages={messages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onModerateMessage={currentUser.role === 'admin' ? handleModerateMessage : undefined} // Pass only if admin
                isLoading={isLoading}
                projectId={projectId} // Pass projectId to ChatWindow if it needs to make decisions based on it
            />
        </div>
    );
};

MessagingContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
    projectId: PropTypes.number, // Optional: ID of the project if this container is for a specific project
};
