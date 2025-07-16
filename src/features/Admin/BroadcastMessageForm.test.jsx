import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BroadcastMessageForm from './BroadcastMessageForm.jsx'; // Assuming correct path

// Mock global fetch
global.fetch = vi.fn();
// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });


// Mock currentUser prop
const mockCurrentUser = {
    id: 1,
    name: 'Admin User',
    role: 'admin',
    // other properties if needed by the component indirectly
};

// Mock data for projects and users API calls
const mockProjects = [
    { id: 1, title: 'Project Alpha' },
    { id: 2, title: 'Project Beta' },
];
const mockUsers = [
    { id: 2, name: 'Client Test', email: 'client@test.com' }, // Exclude current admin
    { id: 3, name: 'Freelancer Test', email: 'freelancer@test.com' },
];


describe('BroadcastMessageForm', () => {
    beforeEach(() => {
        fetch.mockClear();
        localStorage.setItem('access_token', 'fake_admin_token'); // Ensure token is set for API calls
    });

    test('renders the form with default scope "all users"', () => {
        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        expect(screen.getByRole('heading', { name: /send broadcast message/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/message:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/all users/i)).toBeChecked();
    });

    test('allows typing a message', () => {
        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        const textarea = screen.getByLabelText(/message:/i);
        fireEvent.change(textarea, { target: { value: 'Test broadcast message' } });
        expect(textarea.value).toBe('Test broadcast message');
    });

    test('shows project selector when "Specific Project" scope is selected', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ records: mockProjects }) // or just mockProjects if API returns array directly
        });
        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByLabelText(/specific project/i));

        await waitFor(() => {
            expect(screen.getByLabelText(/select project:/i)).toBeInTheDocument();
        });
        expect(fetch).toHaveBeenCalledWith('/api/projects/read.php', expect.any(Object));
        // Check if project options are rendered (example)
        await screen.findByText('Project Alpha'); // Wait for option to appear
    });

    test('shows user selector when "Specific Users" scope is selected', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ records: mockUsers })
        });
        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByLabelText(/specific users/i));

        await waitFor(() => {
            expect(screen.getByLabelText(/select users/i)).toBeInTheDocument();
        });
        expect(fetch).toHaveBeenCalledWith('/api/users/read.php', expect.any(Object));
        await screen.findByText('Client Test (client@test.com)'); // Wait for option
    });

    test('submits the form with correct data for "all users" scope', async () => {
        fetch.mockResolvedValueOnce({ // For the broadcast API call
            ok: true,
            status: 201,
            json: async () => ({ message: 'Broadcast sent successfully!', recipient_count: 10, thread_id: 123 })
        });

        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        const textarea = screen.getByLabelText(/message:/i);
        fireEvent.change(textarea, { target: { value: 'Hello everyone!' } });
        fireEvent.click(screen.getByLabelText(/all users/i)); // Ensure it's selected

        fireEvent.click(screen.getByRole('button', { name: /send broadcast/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/broadcasts/send_broadcast.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer fake_admin_token'
                },
                body: JSON.stringify({
                    message_text: 'Hello everyone!',
                    recipient_scope: 'all'
                })
            });
        });
        expect(await screen.findByText(/broadcast sent successfully to 10 recipients!/i)).toBeInTheDocument();
    });

    test('submits with project_id when "Specific Project" scope is selected', async () => {
        // Mock fetch for projects list
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ records: mockProjects })
        });
        // Mock fetch for the broadcast call itself
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => ({ message: 'Broadcast sent!', recipient_count: 2, thread_id: 124 })
        });

        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByLabelText(/specific project/i));

        // Wait for project dropdown to populate and select one
        const projectSelect = await screen.findByLabelText(/select project:/i);
        fireEvent.change(projectSelect, { target: { value: mockProjects[0].id.toString() } }); // Select first project

        const textarea = screen.getByLabelText(/message:/i);
        fireEvent.change(textarea, { target: { value: 'Project Alpha Update' } });

        fireEvent.click(screen.getByRole('button', { name: /send broadcast/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenLastCalledWith('/api/broadcasts/send_broadcast.php', expect.objectContaining({
                body: JSON.stringify({
                    message_text: 'Project Alpha Update',
                    recipient_scope: 'project',
                    project_id: mockProjects[0].id.toString()
                })
            }));
        });
    });


    test('handles API error during submission gracefully', async () => {
        fetch.mockResolvedValueOnce({ // For the broadcast API call
            ok: false,
            status: 500,
            json: async () => ({ message: 'Server error during broadcast' })
        });

        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        const textarea = screen.getByLabelText(/message:/i);
        fireEvent.change(textarea, { target: { value: 'Test error case' } });

        fireEvent.click(screen.getByRole('button', { name: /send broadcast/i }));

        expect(await screen.findByText(/error sending broadcast: server error during broadcast/i)).toBeInTheDocument();
    });

    test('validates empty message text before submission', async () => {
        render(<BroadcastMessageForm currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByRole('button', { name: /send broadcast/i }));
        expect(await screen.findByText(/message text cannot be empty/i)).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled(); // fetch should not be called
    });

});
