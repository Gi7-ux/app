import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Billing } from './Billing';

// Mock the Invoice component to isolate the Billing component's logic
vi.mock('./components/Invoice.jsx', () => ({
  Invoice: ({ data, onBack }) => (
    <div data-testid="invoice-component">
      <h1>Invoice Generated</h1>
      <p>Freelancer: {data.freelancer.name}</p>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Mock fetch
global.fetch = vi.fn();

const mockFreelancers = [
  { id: '1', name: 'Test Freelancer 1', role: 'freelancer' },
  { id: '2', name: 'Test Freelancer 2', role: 'freelancer' },
];

const mockInvoiceData = {
  freelancer: { id: '1', name: 'Test Freelancer 1', rate: 100 },
  logs: [{ id: 1, hours: 8, date: '2025-07-01', projectName: 'Test Project', taskDescription: 'Test Task' }],
};

describe('Billing', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
  });

  it('renders the billing and invoicing page and fetches freelancers', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ records: mockFreelancers }),
    });

    render(<Billing />);

    expect(screen.getByText('Billing & Invoicing')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/users/read.php', expect.any(Object));

    // Wait for freelancers to be populated in the select dropdown
    await waitFor(() => {
      expect(screen.getByText('Test Freelancer 1')).toBeInTheDocument();
      expect(screen.getByText('Test Freelancer 2')).toBeInTheDocument();
    });
  });

  it('shows an alert if generate is clicked without required filters', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Billing />);
    
    fireEvent.click(screen.getByText('Generate Invoice'));
    
    expect(alertMock).toHaveBeenCalledWith('Please select a freelancer and a date range to generate an invoice.');
    alertMock.mockRestore();
  });

  it('generates an invoice and displays the Invoice component', async () => {
    // Mock freelancers fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ records: mockFreelancers }),
    });
    
    // Mock invoice data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockInvoiceData),
    });

    render(<Billing />);

    // Wait for freelancers to load
    await screen.findByText('Test Freelancer 1');

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Freelancer'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-07-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-07-31' } });

    // Click generate
    fireEvent.click(screen.getByText('Generate Invoice'));

    // Check that the API was called correctly
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/billing/generate_invoice_data.php?freelancer_id=1&start_date=2025-07-01&end_date=2025-07-31', expect.any(Object));
    });

    // Check that the Invoice component is now displayed
    await waitFor(() => {
        expect(screen.getByTestId('invoice-component')).toBeInTheDocument();
        expect(screen.getByText('Invoice Generated')).toBeInTheDocument();
        expect(screen.getByText('Freelancer: Test Freelancer 1')).toBeInTheDocument();
    });
  });
  
  it('handles returning from the invoice view to the billing form', async () => {
    // Mocks to get to the invoice view
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ records: mockFreelancers }) });
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockInvoiceData) });
    render(<Billing />);
    await screen.findByText('Test Freelancer 1');
    fireEvent.change(screen.getByLabelText('Freelancer'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-07-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-07-31' } });
    fireEvent.click(screen.getByText('Generate Invoice'));

    // Wait for invoice component
    await screen.findByTestId('invoice-component');
    
    // Click the back button in the mocked Invoice component
    fireEvent.click(screen.getByText('Back'));

    // Check that the main billing page is visible again
    await waitFor(() => {
        expect(screen.getByText('Billing & Invoicing')).toBeInTheDocument();
        expect(screen.queryByTestId('invoice-component')).not.toBeInTheDocument();
    });
  });
});
