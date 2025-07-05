import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientSummaryReport } from './ClientSummaryReport';

global.fetch = vi.fn();

const mockReportData = [
  {
    id: 'client1',
    name: 'Client Corp',
    company: 'Client Corp Inc.',
    total_projects: 5,
    total_budget: '50000.00',
    total_spend: '45000.00',
    avg_project_duration_days: '30.5',
  },
  {
    id: 'client2',
    name: 'Innovate LLC',
    company: 'Innovate LLC',
    total_projects: 2,
    total_budget: '120000.00',
    total_spend: '110000.00',
    avg_project_duration_days: '90',
  },
];

describe('ClientSummaryReport', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches and displays the client summary report data', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockReportData) });
    render(<ClientSummaryReport />);

    await waitFor(() => {
      // Check headers
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Total Budget (R)')).toBeInTheDocument();

      // Check data from the first row
      expect(screen.getByText('Client Corp')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.startsWith('R 50'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.startsWith('R 45'))).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument(); // Check for rounded days

      // Check data from the second row
      expect(screen.getAllByText('Innovate LLC')[0]).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.startsWith('R 120'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.startsWith('R 110'))).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });

  it('displays an error message if fetching data fails', async () => {
    const errorMessage = 'Failed to fetch report data.';
    fetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: errorMessage }) });
    render(<ClientSummaryReport />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
