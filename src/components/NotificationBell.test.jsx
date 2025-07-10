import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test/utils/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationBell } from './NotificationBell';

// Mock the icons
vi.mock('../assets/icons.jsx', () => ({
    ICONS: {
        notifications: '🔔'
    }
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('NotificationBell', () => {
    const mockNotifications = [
        {
            id: 1,
            message: 'New project assigned',
            is_read: false,
            link: '/projects/1',
            created_at: '2025-01-01T10:00:00Z'
        },
        {
            id: 2,
            message: 'Task completed',
            is_read: true,
            link: '/tasks/2',
            created_at: '2025-01-01T09:00:00Z'
        },
        {
            id: 3,
            message: 'Payment received',
            is_read: false,
            link: null,
            created_at: '2025-01-01T08:00:00Z'
        }
    ];

    beforeEach(() => {
        // Mock localStorage with a token
        localStorage.setItem('access_token', 'mock-token');

        // Mock fetch for notifications
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('/api/notifications/get.php')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockNotifications)
                });
            }
            if (url.includes('/api/notifications/mark_read.php')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ success: true })
                });
            }
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });
        });

        // Mock setInterval/clearInterval
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useRealTimers();
        localStorage.clear();
    });

    it('renders notification bell with correct unread count', async () => {
        render(<NotificationBell />);
        // Check initial render before async data; unreadCount is 0 initially.
        // The button's aria-label depends on unreadCount.
        expect(screen.getByRole('button', { name: 'Notifications (0 unread)'})).toBeInTheDocument();


        await waitFor(() => {
            // After fetch and state update, the label should change.
            expect(screen.getByRole('button', { name: 'Notifications (2 unread)'})).toBeInTheDocument();
        });

        // The badge text '2' should also be present.
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('fetches notifications on mount', async () => {
        render(<NotificationBell />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/notifications/get.php', {
                headers: { 'Authorization': 'Bearer mock-token' }
            });
        });
    });

    it('polls for notifications every 30 seconds', async () => {
        render(<NotificationBell />);

        // Initial fetch
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        // Advance timer by 30 seconds
        vi.advanceTimersByTime(30000);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    it('shows notification dropdown when bell is clicked', async () => {
        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('New project assigned')).toBeInTheDocument();
        expect(screen.getByText('Task completed')).toBeInTheDocument();
        expect(screen.getByText('Payment received')).toBeInTheDocument();
    });

    it('marks notification as read when clicked', async () => {
        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        const notification = screen.getByText('New project assigned');
        fireEvent.click(notification);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/notifications/mark_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ notification_id: 1 })
            });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
    });

    it('handles notifications without links', async () => {
        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        const notification = screen.getByText('Payment received');
        fireEvent.click(notification);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/notifications/mark_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ notification_id: 3 })
            });
        });

        // Should not navigate if no link
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('marks all notifications as read', async () => {
        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        const markAllButton = screen.getByText('Mark all as read');
        fireEvent.click(markAllButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/notifications/mark_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ notification_id: null })
            });
        });
    });

    it('shows no notifications message when list is empty', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve([])
        });

        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        expect(screen.getByText('No new notifications.')).toBeInTheDocument();
    });

    it('handles unauthorized response gracefully', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 401
        });

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        render(<NotificationBell />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Unauthorized fetching notifications. User might be logged out.'
            );
        });

        consoleSpy.mockRestore();
    });

    it('handles missing token gracefully', async () => {
        localStorage.removeItem('access_token');

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        render(<NotificationBell />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'No token found, skipping notification fetch.'
            );
        });

        consoleSpy.mockRestore();
    });

    it('closes dropdown when clicking outside', async () => {
        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(document.body);

        await waitFor(() => {
            expect(screen.queryByText('New project assigned')).not.toBeInTheDocument();
        });
    });

    it('handles keyboard navigation for notifications', async () => {
        render(<NotificationBell />);

        const bellButton = await screen.findByLabelText(/Notifications/);
        fireEvent.click(bellButton);

        const notification = screen.getByText('New project assigned');
        fireEvent.keyPress(notification, { key: 'Enter' });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
        });
    });
});