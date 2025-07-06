import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../assets/icons.jsx';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) { console.warn("No token found, skipping notification fetch."); return; }

            const response = await fetch('/api/notifications/get.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                // Don't redirect here as this is a background component.
                // Let other parts of the app handle auth failure.
                console.warn("Unauthorized fetching notifications. User might be logged out.");
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('.notification-bell button')) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationClick = async (notification) => {
        try {
            const token = localStorage.getItem('access_token');
            // Mark as read even if no link, or if link navigation fails
            if (!notification.is_read) {
                await fetch('/api/notifications/mark_read.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ notification_id: notification.id })
                });
                // Optimistically update UI or refresh
                 setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, is_read: true} : n));
            }

            if (notification.link) {
                navigate(notification.link);
            }
            setIsOpen(false); // Close dropdown after click
        } catch (err) {
            console.error("Failed to handle notification click:", err);
             // Still try to navigate if link exists
            if (notification.link) navigate(notification.link);
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('access_token');
            await fetch('/api/notifications/mark_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ notification_id: null }) // API handles null as "all for user"
            });
            fetchNotifications(); // Refresh list fully
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    };


    return (
        <div className="notification-bell" style={{ position: 'relative' }}>
            <button className="header-button" onClick={() => setIsOpen(prev => !prev)} aria-expanded={isOpen} aria-haspopup="true" aria-label={`Notifications (${unreadCount} unread)`}>
                {ICONS.notifications}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown" ref={dropdownRef} style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    <div className="notification-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee'}}>
                        <h3 style={{margin: 0, fontSize: '1rem'}}>Notifications</h3>
                        {notifications.some(n => !n.is_read) && (
                            <button onClick={handleMarkAllAsRead} style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem'}}>Mark all as read</button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p style={{padding: '10px', textAlign: 'center', color: '#777'}}>No new notifications.</p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    role="button"
                                    tabIndex="0"
                                    key={n.id}
                                    className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleNotificationClick(n)}
                                    style={{padding: '10px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: !n.is_read ? '#f0f8ff' : 'transparent'}}
                                >
                                    <p style={{margin: 0, fontSize: '0.9rem'}}>{n.message}</p>
                                    <small style={{fontSize: '0.75rem', color: '#888'}}>{new Date(n.created_at).toLocaleString()}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
