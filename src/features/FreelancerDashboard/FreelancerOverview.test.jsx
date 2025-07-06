import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { FreelancerOverview } from './FreelancerOverview';
import { AuthService } from '../../services/AuthService';

// Mock fetch
global.fetch = vi.fn();

// Mock AuthService
vi.mock('../../services/AuthService', () => ({
  AuthService: {
    getAccessToken: vi.fn(() => 'mock-token'),
    isAuthenticated: vi.fn(() => true),
    getRole: vi.fn(() => 'freelancer'),
    getUserId: vi.fn(() => 'freelancer123'),
  },
}));

const mockStatsData = {
  open_projects: 15,
  my_applications: 3,
  assigned_projects: 5,
  tasks_in_progress: 2,
  earnings_summary: {
    current_month: "USD 1,800.00",
    pending_payments: "USD 450.00",
    lifetime_earnings: "USD 22,500.00"
  }
};

const mockCommsData = [{ action: "New message from Client Y", created_at: new Date().toISOString(), user_name: "Client Y" }];
const mockDeadlinesData = { records: [{ id: 1, title: "Develop API", due_date: "2025-09-01", next_task: "Schema Design" }] };

describe('FreelancerOverview', () => {
  beforeEach(() => {
    fetch.mockClear();
    AuthService.getAccessToken.mockClear();
    AuthService.isAuthenticated.mockClear();
    AuthService.getRole.mockClear();
    AuthService.getUserId.mockClear();
  });

  const mockFetchImplementations = (
    statsResult = { ok: true, data: mockStatsData },
    commsResult = { ok: true, data: mockCommsData },
    deadlinesResult = { ok: true, data: mockDeadlinesData }
  ) => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/dashboard/stats.php')) {
        return Promise.resolve({
          ok: statsResult.ok,
          json: () => Promise.resolve(statsResult.data),
        });
      }
      if (url.includes('/api/activity/get.php')) {
        return Promise.resolve({
          ok: commsResult.ok,
          json: () => Promise.resolve(commsResult.data),
        });
      }
      if (url.includes('/api/projects/read.php')) {
         return Promise.resolve({
          ok: deadlinesResult.ok,
          json: () => Promise.resolve(deadlinesResult.data),
        });
      }
      return Promise.reject(new Error(`Unhandled API call to ${url}`));
    });
  };


  it('renders the overview and fetches all data successfully', async () => {
    mockFetchImplementations();
    render(
      <MemoryRouter>
        <FreelancerOverview setCurrentPage={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Freelancer Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/dashboard/stats.php', expect.any(Object));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/activity/get.php'), expect.any(Object));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/projects/read.php'), expect.any(Object));

      expect(screen.getByText('Open Projects (Platform)')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('My Active Applications')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/Current Month Earnings: USD 1,800.00/i)).toBeInTheDocument();
      expect(screen.getByText(/New message from Client Y/i)).toBeInTheDocument();
      expect(screen.getByText(/Develop API/i)).toBeInTheDocument();
      expect(screen.getByText(/Due: 2025-09-01/i)).toBeInTheDocument();
    });
  });

  it('calls setCurrentPage when quick action buttons are clicked', async () => {
    mockFetchImplementations(); // Ensure all data loads to prevent state issues
    const setCurrentPageMock = vi.fn();
    render(
      <MemoryRouter>
        <FreelancerOverview setCurrentPage={setCurrentPageMock} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Freelancer Dashboard')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Browse Projects' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('browse');

    fireEvent.click(screen.getByRole('button', { name: 'View My Projects' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('myProjects');

    fireEvent.click(screen.getByRole('button', { name: 'Submit Time Logs' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('timeTracker');

    fireEvent.click(screen.getByRole('button', { name: 'Edit My Profile' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('profile');
  });

  it('displays an error message if fetching stats fails', async () => {
    const statsErrorMessage = 'Failed to retrieve freelancer stats.';
    mockFetchImplementations(
      { ok: false, data: { message: statsErrorMessage } }, // Stats fetch fails
      { ok: true, data: mockCommsData }, // Comms fetch succeeds
      { ok: true, data: mockDeadlinesData } // Deadlines fetch succeeds
    );

    render(
      <MemoryRouter>
        <FreelancerOverview setCurrentPage={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(statsErrorMessage, 'i'))).toBeInTheDocument();
      // Ensure other parts still try to load or show defaults
      expect(screen.getByText(/New message from Client Y/i)).toBeInTheDocument(); // Check if comms loaded
    });
  });

  it('handles error for communications fetch', async () => {
    const commsErrorMessage = "Could not load communications.";
     mockFetchImplementations(
      { ok: true, data: mockStatsData },
      { ok: false, data: { message: "Comms network error" } }, // Comms fetch fails
      { ok: true, data: mockDeadlinesData }
    );

    render(<MemoryRouter><FreelancerOverview setCurrentPage={() => {}} /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(commsErrorMessage)).toBeInTheDocument();
    });
  });

  it('handles error for deadlines fetch', async () => {
    const deadlinesErrorMessage = "Could not load deadlines.";
    mockFetchImplementations(
      { ok: true, data: mockStatsData },
      { ok: true, data: mockCommsData },
      { ok: false, data: { message: "Deadlines network error" } } // Deadlines fetch fails
    );
    render(<MemoryRouter><FreelancerOverview setCurrentPage={() => {}} /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(deadlinesErrorMessage)).toBeInTheDocument();
    });
  });

});
