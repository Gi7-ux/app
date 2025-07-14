import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../assets/icons.jsx';
import { LiquidGlassWrapper } from './LiquidGlassWrapper.jsx';
import { LiquidGlassButton } from './LiquidGlassComponents.jsx';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) { 
                console.warn("No token found, skipping notification fetch."); 
                return; 
            }

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
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
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
            <LiquidGlassButton
                variant="secondary"
                size="medium"
                onClick={() => setIsOpen(prev => !prev)}
                style={{ position: 'relative' }}
            >
                {ICONS.notifications}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </LiquidGlassButton>
            {isOpen && (
                <LiquidGlassWrapper
                    variant="modal"
                    size="custom"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: '320px',
                        maxHeight: '400px',
                        marginTop: '8px',
                        zIndex: 1000
                    }}
                    ref={dropdownRef}
                >
                    <div style={{ padding: '0', width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>Notifications</h3>
                            {notifications.some(n => !n.is_read) && (
                                <LiquidGlassButton
                                    variant="secondary"
                                    size="small"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Mark all read
                                </LiquidGlassButton>
                            )}
                        </div>
                        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${n.is_read ? '' : 'unread'}`}
                                        onClick={() => handleNotificationClick(n)}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            cursor: 'pointer',
                                            background: n.is_read ? 'transparent' : 'rgba(91, 154, 139, 0.2)',
                                            transition: 'background 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '14px',
                                            color: 'white',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                            lineHeight: '1.4'
                                        }}>{n.message}</p>
                                        <small style={{
                                            fontSize: '12px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                        }}>{new Date(n.created_at).toLocaleString()}</small>
                                    </div>
                                ))
                            ) : (
                                <p style={{
                                    padding: '24px',
                                    textAlign: 'center',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    margin: 0,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}>No new notifications.</p>
                            )}
                        </div>
                    </div>
                </LiquidGlassWrapper>
            )}
        </div>
    );
};
