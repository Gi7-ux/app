import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupApiMocks, mockApi, createMockProject } from '../utils/api-mocks.js';
import ProjectDetailsModal from '../../components/ProjectDetailsModal';
import { NotificationBell } from '../../components/NotificationBell';

// Mock CSS imports
vi.mock('../../components/ProjectDetailsModal.css', () => ({}));
vi.mock('../../assets/icons', () => ({
    ICONS: {
        accept: '✓',
        notifications: '🔔'
    }
}));

describe('Integration Tests', () => {
    beforeEach(() => {
        setupApiMocks();
        localStorage.setItem('access_token', 'mock-token');
    });

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Project Details Modal Integration', () => {
        it('handles project details and application management flow', async () => {
            const mockProject = createMockProject({
                title: 'Full Stack Development Project',
                budget: 10000
            });

            const mockApplications = [
                {
                    id: 1,
                    freelancerName: 'Alice Developer',
                    freelancerHandle: '@alice_dev',
                    bid: 8000,
                    note: 'I have 5 years of experience in full stack development'
                }
            ];

            // Mock the applications API call
            mockApi.projects.get.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApplications)
            });

            const onAcceptApplication = vi.fn();
            const onManageTasks = vi.fn();
            const onClose = vi.fn();

            render(
                <ProjectDetailsModal
                    project={mockProject}
                    onAcceptApplication={onAcceptApplication}
                    onManageTasks={onManageTasks}
                    onClose={onClose}
                />
            );

            // Verify project details are displayed
            expect(screen.getByText('Full Stack Development Project')).toBeInTheDocument();
            expect(screen.getByText('R 10,000')).toBeInTheDocument();

            // Wait for applications to load
            await waitFor(() => {
                expect(screen.getByText('Alice Developer')).toBeInTheDocument();
            });

            // Test accepting an application
            const acceptButton = screen.getByText(/Accept Application/);
            fireEvent.click(acceptButton);

            expect(onAcceptApplication).toHaveBeenCalledWith(mockApplications[0]);

            // Test task management
            const manageTasksButton = screen.getByText('Manage Tasks');
            fireEvent.click(manageTasksButton);

            expect(onManageTasks).toHaveBeenCalledWith(mockProject);
        });

        it('handles error states gracefully in integration scenario', async () => {
            const mockProject = createMockProject();

            // Mock API failure
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            render(
                <ProjectDetailsModal
                    project={mockProject}
                    onAcceptApplication={vi.fn()}
                    onManageTasks={vi.fn()}
                    onClose={vi.fn()}
                />
            );

            await waitFor(() => {
                expect(screen.getByText(/Error loading applications/)).toBeInTheDocument();
            });
        });
    });

    describe('Notification System Integration', () => {
        it('handles notification lifecycle from fetch to mark as read', async () => {
            const mockNotifications = [
                {
                    id: 1,
                    message: 'New project application received',
                    is_read: false,
                    link: '/projects/1',
                    created_at: '2025-01-01T10:00:00Z'
                },
                {
                    id: 2,
                    message: 'Task deadline approaching',
                    is_read: false,
                    link: '/tasks/2',
                    created_at: '2025-01-01T09:00:00Z'
                }
            ];

            // Mock initial notifications fetch
            mockApi.notifications.get.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockNotifications)
            });

            render(<NotificationBell />);

            // Wait for notifications to load and verify count
            await waitFor(() => {
                expect(screen.getByLabelText('Notifications (2 unread)')).toBeInTheDocument();
            });

            // Open dropdown
            const bellButton = screen.getByLabelText(/Notifications/);
            fireEvent.click(bellButton);

            // Verify notifications are displayed
            expect(screen.getByText('New project application received')).toBeInTheDocument();
            expect(screen.getByText('Task deadline approaching')).toBeInTheDocument();

            // Click on a notification
            const notification = screen.getByText('New project application received');
            fireEvent.click(notification);

            // Verify mark as read API was called
            await waitFor(() => {
                expect(mockApi.notifications.markRead).toHaveBeenCalledWith();
            });
        });

        it('handles real-time notification updates', async () => {
            // Start with no notifications
            mockApi.notifications.get.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            });

            render(<NotificationBell />);

            await waitFor(() => {
                expect(screen.getByLabelText('Notifications (0 unread)')).toBeInTheDocument();
            });

            // Simulate new notification arriving (would happen via polling)
            const newNotifications = [{
                id: 1,
                message: 'Payment received',
                is_read: false,
                created_at: '2025-01-01T10:00:00Z'
            }];

            mockApi.notifications.get.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(newNotifications)
            });

            // Advance timer to trigger polling
            vi.advanceTimersByTime(30000);

            await waitFor(() => {
                expect(screen.getByLabelText('Notifications (1 unread)')).toBeInTheDocument();
            });
        });
    });

    describe('Cross-component Data Flow', () => {
        it('handles authentication state across components', async () => {
            // Test scenario where token expires during component interaction
            mockApi.notifications.get.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Unauthorized' })
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

        it('handles missing token scenario', async () => {
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
    });
});
