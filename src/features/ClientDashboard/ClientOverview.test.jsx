import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ClientOverview } from './ClientOverview';

// Mock fetch
global.fetch = vi.fn();

// Mock AuthService
vi.mock('../../services/AuthService', () => ({
  AuthService: {
    getAccessToken: vi.fn(() => 'mock-token'),
    isAuthenticated: vi.fn(() => true),
    getRole: vi.fn(() => 'client'),
    getUserId: vi.fn(() => 'client123'),
  },
}));

const mockStats = {
  total_projects: 10,
  projects_awaiting: 2,
  projects_in_progress: 3,
  projects_completed: 5,
};

describe('ClientOverview', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the overview and fetches stats', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });
    // Mock other API calls made in ClientOverview
    fetch.mockResolvedValueOnce({ // For /api/activity/get.php
      ok: true,
      json: () => Promise.resolve([{ action: "Test activity", created_at: new Date().toISOString(), user_name: "Test User" }]),
    });
    fetch.mockResolvedValueOnce({ // For /api/projects/read.php
      ok: true,
      json: () => Promise.resolve({ records: [{ id: 1, title: "Test Project", due_date: "2025-12-31" }] }),
    });


    render(
      <MemoryRouter>
        <ClientOverview setCurrentPage={() => { }} />
      </MemoryRouter>
    );

    expect(screen.getByText('Client Dashboard')).toBeInTheDocument(); // Updated title
    expect(fetch).toHaveBeenCalledWith('/api/dashboard/stats.php', expect.any(Object));

    // Wait for the stats to be displayed
    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Projects Awaiting/Open')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Projects In Progress')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Projects Completed')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('calls setCurrentPage when quick action buttons are clicked', async () => {
    const setCurrentPageMock = vi.fn();
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockStats) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // for activity
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // for deadlines

    render(
      <MemoryRouter>
        <ClientOverview setCurrentPage={setCurrentPageMock} />
      </MemoryRouter>
    );

    // Ensure the component has rendered and data fetching (even if empty) is complete
    await waitFor(() => expect(screen.getByText('Client Dashboard')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'View My Projects' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('projects');

    fireEvent.click(screen.getByRole('button', { name: 'Start New Project' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('createProject');

    fireEvent.click(screen.getByRole('button', { name: 'Edit My Profile' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('profile');
  });

  it('displays an error message if fetching stats fails', async () => {
    const errorMessage = 'Failed to fetch stats.';
    fetch.mockResolvedValueOnce({ // For dashboard stats
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // for activity, prevent further errors
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // for deadlines

    render(
      <MemoryRouter>
        <ClientOverview setCurrentPage={() => { }} />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check if the error message related to stats is displayed
      // The component might concatenate error messages, so use a flexible matcher.
      expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
    });
  });
});
