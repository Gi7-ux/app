import { vi } from 'vitest';

/**
 * Mock API module for testing
 */
export const mockApi = {
    // Authentication endpoints
    auth: {
        login: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                access_token: 'mock-token',
                user: { id: 1, username: 'testuser', role: 'admin' }
            })
        }),
        checkToken: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ valid: true })
        })
    },

    // Project endpoints
    projects: {
        get: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                {
                    id: 1,
                    title: 'Test Project',
                    description: 'Test Description',
                    status: 'active',
                    budget: 5000
                }
            ])
        }),
        getOne: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                id: 1,
                title: 'Test Project',
                description: 'Test Description',
                status: 'active',
                budget: 5000
            })
        }),
        create: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 1, message: 'Project created' })
        }),
        update: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Project updated' })
        }),
        delete: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Project deleted' })
        })
    },

    // User endpoints
    users: {
        get: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                { id: 1, username: 'user1', role: 'client' },
                { id: 2, username: 'user2', role: 'freelancer' }
            ])
        }),
        create: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 1, message: 'User created' })
        }),
        changePassword: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Password changed' })
        })
    },

    // Notification endpoints
    notifications: {
        get: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                {
                    id: 1,
                    message: 'Test notification',
                    is_read: false,
                    created_at: '2025-01-01T10:00:00Z'
                }
            ])
        }),
        markRead: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Marked as read' })
        })
    },

    // Messages endpoints
    messages: {
        get: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                {
                    id: 1,
                    content: 'Test message',
                    sender_id: 1,
                    created_at: '2025-01-01T10:00:00Z'
                }
            ])
        }),
        send: vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 1, message: 'Message sent' })
        })
    }
};

/**
 * Setup global fetch mock with predefined responses
 */
export const setupApiMocks = () => {
    global.fetch = vi.fn().mockImplementation((url, options) => {
        const method = options?.method || 'GET';

        // Authentication endpoints
        if (url.includes('/api/auth/login.php')) {
            return mockApi.auth.login();
        }
        if (url.includes('/api/auth/check_token.php')) {
            return mockApi.auth.checkToken();
        }

        // Project endpoints
        if (url.includes('/api/projects/read.php')) {
            return mockApi.projects.get();
        }
        if (url.includes('/api/projects/read_one.php')) {
            return mockApi.projects.getOne();
        }
        if (url.includes('/api/projects/create.php')) {
            return mockApi.projects.create();
        }
        if (url.includes('/api/projects/update.php')) {
            return mockApi.projects.update();
        }
        if (url.includes('/api/projects/delete.php')) {
            return mockApi.projects.delete();
        }

        // User endpoints
        if (url.includes('/api/users/') && method === 'GET') {
            return mockApi.users.get();
        }
        if (url.includes('/api/users/create.php')) {
            return mockApi.users.create();
        }
        if (url.includes('/api/users/change_password.php')) {
            return mockApi.users.changePassword();
        }

        // Notification endpoints
        if (url.includes('/api/notifications/get.php')) {
            return mockApi.notifications.get();
        }
        if (url.includes('/api/notifications/mark_read.php')) {
            return mockApi.notifications.markRead();
        }

        // Message endpoints
        if (url.includes('/api/messages/')) {
            if (method === 'POST') {
                return mockApi.messages.send();
            }
            return mockApi.messages.get();
        }

        // Default response
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({})
        });
    });
};

/**
 * Test data factory functions
 */
export const createMockProject = (overrides = {}) => ({
    id: 1,
    title: 'Test Project',
    description: 'Test project description',
    status: 'active',
    budget: 5000,
    spend: 1000,
    deadline: '2025-12-31',
    clientName: 'Test Client',
    skills: ['JavaScript', 'React'],
    assignments: [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' }
    ],
    ...overrides
});

export const createMockUser = (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    ...overrides
});

export const createMockNotification = (overrides = {}) => ({
    id: 1,
    message: 'Test notification',
    is_read: false,
    link: '/test',
    created_at: '2025-01-01T10:00:00Z',
    ...overrides
});

/**
 * Common test scenarios
 */
export const testScenarios = {
    unauthorizedResponse: {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
    },

    serverError: {
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' })
    },

    networkError: () => Promise.reject(new Error('Network error')),

    validationError: {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Validation failed' })
    }
};
