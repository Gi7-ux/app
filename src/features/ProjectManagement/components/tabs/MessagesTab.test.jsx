import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessagesTab } from './MessagesTab';

const mockProject = { id: 'proj1' };
const mockCurrentUser = { id: 'user123', name: 'Test User', role: 'client' };

// Mock MessagingContainer to verify it's rendered with correct props
vi.mock('../../../Messages/components/MessagingContainer.jsx', () => ({
  MessagingContainer: vi.fn(({ currentUser, projectId }) => (
    <div data-testid="messaging-container">
      <p>Mocked MessagingContainer</p>
      <p>User: {currentUser?.name}</p>
      <p>Project ID: {projectId}</p>
    </div>
  )),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('MessagesTab', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('access_token', 'test-token');
  });

  afterEach(() => {
    localStorage.removeItem('access_token');
    vi.clearAllMocks();
  });

  it('shows loading state initially then renders MessagingContainer on successful user fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCurrentUser,
    });

    render(<MessagesTab project={mockProject} />);

    expect(screen.getByText('Loading user data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('messaging-container')).toBeInTheDocument();
      expect(screen.getByText('Mocked MessagingContainer')).toBeInTheDocument();
      expect(screen.getByText(`User: ${mockCurrentUser.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Project ID: ${mockProject.id}`)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/users/read_one.php', {
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('shows error message if fetching user fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server Error' }),
    });

    render(<MessagesTab project={mockProject} />);
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Error loading user: Server Error')).toBeInTheDocument();
    });
  });

  it('shows error message if no access token is found', async () => {
    localStorage.removeItem('access_token');
    render(<MessagesTab project={mockProject} />);
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Error loading user: No access token found. Please login.')).toBeInTheDocument();
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('renders message if project is not available', () => {
    fetch.mockResolvedValueOnce({ // Still need to mock user fetch
      ok: true,
      json: async () => mockCurrentUser,
    });
    render(<MessagesTab project={null} />); // Pass null project
    // Wait for user loading to complete
    waitFor(() => {
        expect(screen.getByText('Project data not available.')).toBeInTheDocument();
    });
  });
});
