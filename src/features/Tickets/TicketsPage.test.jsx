import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicketsPage from './TicketsPage';
import { ticketApi } from './ticketApi';
import { AuthService } from '../../services/AuthService';

// Mock ticketApi
vi.mock('./ticketApi', () => ({
    ticketApi: {
        getTickets: vi.fn(),
        createTicket: vi.fn(),
        // Add other methods if they are called directly by TicketsPage initially
    }
}));

// Mock AuthService
vi.mock('../../services/AuthService', () => ({
    AuthService: {
        getRole: vi.fn(),
        // Add other methods if used by TicketsPage or its direct children during render
    }
}));

describe('TicketsPage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        // Default mock implementations
        AuthService.getRole.mockReturnValue('client'); // Default role for tests
        ticketApi.getTickets.mockResolvedValue({ records: [] }); // Default to empty list
    });

    it('renders the tickets page header', () => {
        render(<TicketsPage />);
        expect(screen.getByText('Support Tickets')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create New Ticket/i })).toBeInTheDocument();
    });

    it('displays "Loading tickets..." initially', () => {
        // Prevent immediate resolution of getTickets
        ticketApi.getTickets.mockImplementation(()_ => new Promise(() => {}));
        render(<TicketsPage />);
        expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
    });

    it('fetches and displays tickets on mount', async () => {
        const mockTickets = [
            { id: 1, user_id: 1, user_name: 'Test User', user_email: 'test@example.com', title: 'Ticket 1', description: 'Desc 1', category: 'GENERAL_INQUIRY', priority: 'Medium', status: 'Open', created_at: '2023-01-01T10:00:00Z', updated_at: '2023-01-01T10:00:00Z' },
            { id: 2, user_id: 1, user_name: 'Test User', user_email: 'test@example.com', title: 'Ticket 2', description: 'Desc 2', category: 'TECHNICAL_ISSUE', priority: 'High', status: 'In Progress', created_at: '2023-01-02T11:00:00Z', updated_at: '2023-01-02T11:00:00Z' },
        ];
        ticketApi.getTickets.mockResolvedValue({ records: mockTickets });

        render(<TicketsPage />);

        await waitFor(() => {
            expect(screen.getByText('Ticket 1')).toBeInTheDocument();
            expect(screen.getByText('Ticket 2')).toBeInTheDocument();
        });
        // Check if TicketList component is rendering items (indirectly)
        // More specific checks would be in TicketList.test.jsx
        expect(screen.queryByText('Loading tickets...')).not.toBeInTheDocument();
    });

    it('displays "No tickets found." when no tickets are fetched', async () => {
        ticketApi.getTickets.mockResolvedValue({ records: [] });
        render(<TicketsPage />);
        await waitFor(() => {
            // This message is in TicketList, but TicketsPage might show its own if TicketList is not rendered.
            // The current TicketsPage also has a "No tickets found" paragraph.
            expect(screen.getAllByText('No tickets found.')[0]).toBeInTheDocument();
        });
    });

    it('displays an error message if fetching tickets fails', async () => {
        ticketApi.getTickets.mockRejectedValue({ message: 'Failed to fetch' });
        render(<TicketsPage />);
        await waitFor(() => {
            expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
        });
    });

    it('shows CreateTicketForm when "Create New Ticket" button is clicked', async () => {
        render(<TicketsPage />);
        const createButton = screen.getByRole('button', { name: /Create New Ticket/i });

        // User interaction needs to be wrapped in act if it causes state updates
        // For React Testing Library, fireEvent or userEvent handles this.
        await userEvent.click(createButton);

        // Check if the form (or a placeholder for it) is visible.
        // CreateTicketForm itself would have a more specific element, e.g., a heading.
        // Our CreateTicketForm has "Create New Support Ticket" h3
        expect(screen.getByRole('heading', { name: /Create New Support Ticket/i})).toBeInTheDocument();
    });

    // Need to import userEvent for the test above
    // import userEvent from '@testing-library/user-event'; at the top
    // For now, I will comment out the userEvent line until setup.js is confirmed.
});

// Note: For the userEvent.click to work, ensure @testing-library/user-event is installed
// and potentially set up in src/test/setup.js if not already.
// For now, I'll add a placeholder for the userEvent import.
// import userEvent from '@testing-library/user-event'; // Placeholder
// The test 'shows CreateTicketForm...' might need adjustment based on actual setup.

// A simple way to ensure userEvent is available for the test above:
// Add this at the top of the file for this test run, if not globally configured.
import userEvent from '@testing-library/user-event';
vi.mock('@testing-library/user-event', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // setup: vi.fn().mockImplementation(actual.setup), // if you use setup
  };
});
