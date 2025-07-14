import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test/utils/test-utils';
import { act } from 'react';
import { NotificationBell } from './NotificationBell';

// Mock usePolling to prevent real intervals in tests
jest.mock('./usePolling.js', () => ({
    usePolling: () => { }
}));

// Mock the icons
jest.mock('../assets/icons.jsx', () => ({
    ICONS: {
        notifications: '🔔'
    }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
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
        global.fetch = jest.fn().mockImplementation((url) => {
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
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();
        localStorage.clear();
    });

    it('renders notification bell with correct unread count', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Notifications (2 unread)' })).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
        });
    });

    it('fetches notifications on mount', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
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
        // Advance time by 30 seconds and check polling
        await act(async () => {
            jest.advanceTimersByTime(30000);
        });
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
        // Advance time by another 30 seconds and check polling again
        await act(async () => {
            jest.advanceTimersByTime(30000);
        });
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    });

    it('shows notification dropdown when bell is clicked', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        await waitFor(() => {
            expect(screen.getByText('Notifications')).toBeInTheDocument();
            expect(screen.getByText('New project assigned')).toBeInTheDocument();
            expect(screen.getByText('Task completed')).toBeInTheDocument();
            expect(screen.getByText('Payment received')).toBeInTheDocument();
        });
    });

    it('marks notification as read when clicked', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        await waitFor(() => {
            const notification = screen.getByText('New project assigned');
            act(() => {
                fireEvent.click(notification);
            });
        });
        await act(async () => {
            jest.runAllTimers();
        });
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/notifications/mark_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ notification_id: 1 })
            });
            expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
        });
    });

    it('handles notifications without links', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        const notification = screen.getByText('Payment received');
        await act(async () => {
            fireEvent.click(notification);
        });
        await act(async () => {
            jest.runAllTimers();
        });
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
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('marks all notifications as read', async () => {
        render(<NotificationBell />);
        await act(async () => {
            vi.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        const markAllButton = screen.getByText('Mark all as read');
        await act(async () => {
            fireEvent.click(markAllButton);
        });
        await act(async () => {
            vi.runAllTimers();
        });
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
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve([])
        });
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        await act(async () => {
            vi.runAllTimers();
        });
        expect(screen.getByText('No new notifications.')).toBeInTheDocument();
    });

    it('handles unauthorized response gracefully', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 401
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Unauthorized fetching notifications. User might be logged out.'
            );
        });
        consoleSpy.mockRestore();
    });

    it('handles missing token gracefully', async () => {
        localStorage.removeItem('access_token');
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'No token found, skipping notification fetch.'
            );
        });
        consoleSpy.mockRestore();
    });

    it('closes dropdown when clicking outside', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        await act(async () => {
            fireEvent.mouseDown(document.body);
        });
        await act(async () => {
            jest.runAllTimers();
        });
        await waitFor(() => {
            expect(screen.queryByText('New project assigned')).not.toBeInTheDocument();
        });
    });

    it('handles keyboard navigation for notifications', async () => {
        render(<NotificationBell />);
        await act(async () => {
            jest.runAllTimers();
        });
        const bellButton = await screen.findByLabelText(/Notifications/);
        await act(async () => {
            fireEvent.click(bellButton);
        });
        const notification = screen.getByText('New project assigned');
        await act(async () => {
            fireEvent.keyPress(notification, { key: 'Enter' });
        });
        await act(async () => {
            vi.runAllTimers();
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
        });
    });
});