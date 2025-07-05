import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FreelancerPerformanceReport } from './FreelancerPerformanceReport';

global.fetch = vi.fn();

const mockReportData = [
  {
    id: 'freelancer1',
    name: 'Alice Architect',
    assigned_projects: 3,
    total_hours_logged: '120.50',
    rate: '150',
  },
  {
    id: 'freelancer2',
    name: 'Bob Builder',
    assigned_projects: 5,
    total_hours_logged: '250.75',
    rate: '100',
  },
];

describe('FreelancerPerformanceReport', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches and displays the freelancer performance data', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockReportData) });
    render(<FreelancerPerformanceReport />);

    await waitFor(() => {
      // Check headers
      expect(screen.getByText('Freelancer')).toBeInTheDocument();
      expect(screen.getByText('Assigned Projects')).toBeInTheDocument();
      expect(screen.getByText('Total Hours Logged')).toBeInTheDocument();
      expect(screen.getByText('Total Billed (R)')).toBeInTheDocument();

      // Check data from the first row
      expect(screen.getByText('Alice Architect')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('120.50')).toBeInTheDocument();
      const totalBilledAlice = (120.50 * 150).toLocaleString(undefined, { minimumFractionDigits: 2 });
      expect(screen.getByText((content, element) => content.startsWith('R 18'))).toBeInTheDocument();

      // Check data from the second row
      expect(screen.getByText('Bob Builder')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('250.75')).toBeInTheDocument();
      const totalBilledBob = (250.75 * 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
      expect(screen.getByText((content, element) => content.startsWith('R 25'))).toBeInTheDocument();
    });
  });

  it('displays an error message if fetching data fails', async () => {
    const errorMessage = 'Failed to fetch report data.';
    fetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: errorMessage }) });
    render(<FreelancerPerformanceReport />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
