import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';

// Create a test theme that matches your app
const testTheme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

// Mock user context for authenticated tests
export const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    token: 'mock-jwt-token'
};

// All providers wrapper for testing
const AllTheProviders = ({ children }) => {
    return (
        <BrowserRouter>
            <ThemeProvider theme={testTheme}>
                {children}
            </ThemeProvider>
        </BrowserRouter>
    );
};

// Custom render function that includes providers
const customRender = (ui, options) =>
    render(ui, { wrapper: AllTheProviders, ...options });

// Mock API responses
export const mockApiResponses = {
    projects: [
        {
            id: 1,
            title: 'Test Project',
            description: 'A test project',
            status: 'active',
            client_id: 1,
            freelancer_id: 2,
            budget: 1000,
            deadline: '2025-12-31'
        }
    ],
    users: [
        {
            id: 1,
            username: 'testclient',
            email: 'client@test.com',
            role: 'client'
        },
        {
            id: 2,
            username: 'testfreelancer',
            email: 'freelancer@test.com',
            role: 'freelancer'
        }
    ],
    notifications: [
        {
            id: 1,
            message: 'Test notification',
            is_read: false,
            created_at: '2025-01-01T10:00:00Z'
        }
    ]
};

// Mock localStorage
export const mockLocalStorage = (() => {
    let store = {};

    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

// Setup fetch mocks
export const setupFetchMock = (responses = {}) => {
    global.fetch = vi.fn().mockImplementation((url) => {
        const response = responses[url] || { ok: true, json: () => Promise.resolve({}) };
        return Promise.resolve(response);
    });
};

// Clean up fetch mocks
export const cleanupFetchMock = () => {
    if (global.fetch && global.fetch.mockRestore) {
        global.fetch.mockRestore();
    }
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
