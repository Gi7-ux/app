import React, { useState, useEffect } from 'react';
import { ICONS } from '../assets/icons.jsx';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/notifications/get.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('access_token');
            await fetch('/api/notifications/mark_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ notification_id: notificationId })
            });
            fetchNotifications(); // Refresh list
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    return (
        <div className="notification-bell" style={{ position: 'relative' }}>
            <button className="header-button" onClick={() => setIsOpen(!isOpen)}>
                {ICONS.notifications}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <button onClick={() => handleMarkAsRead(null)}>Mark all as read</button>
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p>No new notifications.</p>
                        ) : (
                            notifications.map(n => (
                                <div role="button" tabIndex="0" key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`} onClick={() => handleMarkAsRead(n.id)}>
                                    <p>{n.message}</p>
                                    <small>{new Date(n.created_at).toLocaleString()}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
