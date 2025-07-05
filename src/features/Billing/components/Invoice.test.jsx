import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Invoice } from './Invoice';

const mockInvoiceData = {
  freelancer: {
    name: 'John Doe',
    company: 'Doe Designs',
    email: 'john.doe@example.com',
    rate: 75,
  },
  logs: [
    { id: 1, date: '2025-07-10', projectName: 'Project Alpha', taskDescription: 'Initial Schematics', hours: 8 },
    { id: 2, date: '2025-07-11', projectName: 'Project Alpha', taskDescription: 'Revisions', hours: 4.5 },
  ],
  generatedDate: '2025-07-15',
};

describe('Invoice', () => {
  it('renders all invoice details correctly', () => {
    render(<Invoice data={mockInvoiceData} onBack={() => {}} />);

    // Header
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
    expect(screen.getByText(`Date: ${mockInvoiceData.generatedDate}`)).toBeInTheDocument();

    // Bill To
    expect(screen.getByText('BILL TO')).toBeInTheDocument();
    expect(screen.getByText(mockInvoiceData.freelancer.name)).toBeInTheDocument();
    expect(screen.getByText(mockInvoiceData.freelancer.company)).toBeInTheDocument();
    expect(screen.getByText(mockInvoiceData.freelancer.email)).toBeInTheDocument();

    // Totals
    const totalHours = 12.5;
    const totalAmount = totalHours * 75;
    expect(screen.getByText('Total Due')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('R 937,50') && element.tagName.toLowerCase() === 'p')).toBeInTheDocument();

    // Line Items
    expect(screen.getAllByText('Project Alpha')[0]).toBeInTheDocument();
    expect(screen.getByText('Initial Schematics')).toBeInTheDocument();
    expect(screen.getByText('8.00')).toBeInTheDocument();
    expect(screen.getByText('Revisions')).toBeInTheDocument();
    expect(screen.getByText('4.50')).toBeInTheDocument();

    // Footer Totals
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
    expect(screen.getByText('12.50')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText(`R ${mockInvoiceData.freelancer.rate}/hr`)).toBeInTheDocument();
  });

  it('calls the onBack function when the back button is clicked', () => {
    const onBackMock = vi.fn();
    render(<Invoice data={mockInvoiceData} onBack={onBackMock} />);
    
    fireEvent.click(screen.getByText(/Back to Billing/i));
    
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it('calls window.print when the print button is clicked', () => {
    const printMock = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<Invoice data={mockInvoiceData} onBack={() => {}} />);
    
    fireEvent.click(screen.getByText(/Print Invoice/i));
    
    expect(printMock).toHaveBeenCalledTimes(1);
    printMock.mockRestore();
  });
});
