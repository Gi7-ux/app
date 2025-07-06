import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardOverview } from './DashboardOverview';
import { MemoryRouter } from 'react-router-dom'; // BrowserRouter removed
// import { AuthService } from '../../services/AuthService'; // AuthService import removed as it's mocked

vi.mock('../../services/AuthService', () => ({
  AuthService: {
    getAccessToken: vi.fn(() => 'mock-token'),
    isAuthenticated: vi.fn(() => true),
    getRole: vi.fn(() => 'admin'),
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockStats = {
  total_users: 50,
  total_projects: 20,
  projects_in_progress: 5,
  messages_pending_approval: 3,
  projects_pending_approval: 2,
};

const mockActivity = [
  { user_name: 'John Doe', action: 'created a new project', created_at: '2025-07-02T10:00:00Z' },
  { user_name: 'Jane Smith', action: 'uploaded a file', created_at: '2025-07-02T09:30:00Z' },
];

describe('DashboardOverview', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock successful API calls
    fetch.mockImplementation((url) => {
      if (url.includes('/api/dashboard/stats.php')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });
      }
      if (url.includes('/api/activity/get.php')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActivity),
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('fetches and displays dashboard stats and activity', async () => {
    render(
      <MemoryRouter>
        <DashboardOverview />
      </MemoryRouter>
    );

    // Check for the updated heading
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    // Wait for stats to appear
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('Projects in Progress')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Messages Pending Approval')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Projects Pending Approval')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Wait for activity to appear
    await waitFor(() => {
      // The heading for this section is "Recent Platform Activity"
      expect(screen.getByText('Recent Platform Activity')).toBeInTheDocument();
      expect(screen.getByText('John Doe created a new project')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith uploaded a file')).toBeInTheDocument();
    });
  });

  it('displays an error message if fetching data fails', async () => {
    const errorMessage = 'Failed to fetch data.';
    fetch.mockImplementation(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    }));

    render(
      <MemoryRouter>
        <DashboardOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      // The error message might be concatenated, so we check if it includes the specific part.
      const errorElements = screen.getAllByText(new RegExp(errorMessage, 'i'));
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });
});
