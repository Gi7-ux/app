import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientOverview } from './ClientOverview';

// Mock fetch
global.fetch = vi.fn();

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

    render(<ClientOverview setCurrentPage={() => {}} />);

    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
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
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockStats) });
    
    render(<ClientOverview setCurrentPage={setCurrentPageMock} />);

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'View My Projects' }));
      expect(setCurrentPageMock).toHaveBeenCalledWith('projects');
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Edit My Profile' }));
      expect(setCurrentPageMock).toHaveBeenCalledWith('profile');
    });
  });

  it('displays an error message if fetching stats fails', async () => {
    const errorMessage = 'Failed to fetch stats.';
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    });

    render(<ClientOverview setCurrentPage={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
