import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentList } from './PaymentList';
import { apiClient } from '../../../../api/apiClient'; // Ensure this path is correct

// Mock apiClient
vi.mock('../../../../api/apiClient');

const mockPayments = [
    { id: 1, payment_date: '2024-07-01', amount: '100.00', project_title: 'Project Alpha', paid_by_user_name: 'Client A', paid_to_user_name: 'Freelancer X', payment_method: 'card', status: 'completed', transaction_id: 'txn_1' },
    { id: 2, payment_date: '2024-07-05', amount: '250.50', project_title: 'Project Beta', paid_by_user_name: 'Client B', paid_to_user_name: 'Freelancer Y', payment_method: 'paypal', status: 'pending', transaction_id: 'txn_2' },
];

const mockPagination = {
    page: 1,
    limit: 10,
    totalRecords: 2,
    totalPages: 1,
};

describe('PaymentList Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        apiClient.get.mockResolvedValue({
            data: {
                data: mockPayments,
                pagination: mockPagination
            }
        });
        apiClient.delete.mockResolvedValue({ data: { message: "Payment deleted successfully." } });
    });

    it('renders loading state initially', async () => {
        apiClient.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
        render(<PaymentList />);
        expect(screen.getByText('Loading payments...')).toBeInTheDocument();
    });

    it('renders error state if API call fails', async () => {
        apiClient.get.mockRejectedValueOnce(new Error('Failed to fetch'));
        render(<PaymentList />);
        await waitFor(() => {
            expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
        });
    });

    it('renders "No payments found" when data is empty', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { ...mockPagination, totalRecords: 0, totalPages: 0 } } });
        render(<PaymentList />);
        await waitFor(() => {
            expect(screen.getByText('No payments found.')).toBeInTheDocument();
        });
    });

    it('renders payment data in a table', async () => {
        render(<PaymentList />);
        await waitFor(() => {
            expect(screen.getByText('Project Alpha')).toBeInTheDocument();
            expect(screen.getByText('$100.00')).toBeInTheDocument(); // Check formatting for first payment
            expect(screen.getByText('$250.50')).toBeInTheDocument(); // Check formatting for second payment
            expect(screen.getByText('Client B')).toBeInTheDocument();
            expect(screen.getByText('Freelancer X')).toBeInTheDocument();
        });
    });

    it('renders filter inputs', async () => {
        render(<PaymentList />);
        await waitFor(() => { // Wait for initial load
            expect(screen.getByPlaceholderText('Start Date')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('End Date')).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: '' })).toBeInTheDocument(); // Status dropdown
        });
    });

    it('calls fetchPayments when filter values change', async () => {
        render(<PaymentList />);
        await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1)); // Initial load

        const statusFilter = screen.getByRole('combobox');
        fireEvent.change(statusFilter, { target: { name: 'status', value: 'completed' } });

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledTimes(2); // Called again after filter change
            expect(apiClient.get).toHaveBeenCalledWith('/payments/get_payments.php', {
                params: expect.objectContaining({ status: 'completed', page: 1, limit: 10 })
            });
        });
    });

    it('shows admin controls (delete button) if showAdminControls is true', async () => {
        render(<PaymentList showAdminControls={true} />);
        await waitFor(() => {
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            expect(deleteButtons.length).toBe(mockPayments.length);
        });
    });

    it('does not show admin controls if showAdminControls is false or not provided', async () => {
        render(<PaymentList />);
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
        });
    });

    it('calls delete API when delete button is clicked and confirmed', async () => {
        window.confirm = vi.fn(() => true); // Mock confirm dialog
        render(<PaymentList showAdminControls={true} />);

        await waitFor(() => expect(screen.getAllByRole('button', { name: /delete/i })[0]).toBeInTheDocument());
        const firstDeleteButton = screen.getAllByRole('button', { name: /delete/i })[0];

        fireEvent.click(firstDeleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this payment? This action cannot be undone.');
        await waitFor(() => {
            expect(apiClient.delete).toHaveBeenCalledWith(`/payments/delete_payment.php?id=${mockPayments[0].id}`);
            expect(apiClient.get).toHaveBeenCalledTimes(2); // Initial load + refresh after delete
        });
    });

    it('pagination buttons work correctly', async () => {
        apiClient.get.mockResolvedValue({
            data: {
                data: mockPayments,
                pagination: { ...mockPagination, totalPages: 3, page: 2, totalRecords: 25 }
            }
        });
        render(<PaymentList />);

        await waitFor(() => {
            expect(screen.getByText('Page 2 of 3 (Total: 25)')).toBeInTheDocument();
        });

        const prevButton = screen.getByRole('button', { name: /previous/i });
        const nextButton = screen.getByRole('button', { name: /next/i });

        expect(prevButton).not.toBeDisabled();
        expect(nextButton).not.toBeDisabled();

        fireEvent.click(prevButton);
        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/payments/get_payments.php',
                expect.objectContaining({ params: expect.objectContaining({ page: 1 }) })
            );
        });

        // Assume page updates and re-renders, then click next
        // For this test, we'll directly test the call for next from current state
        fireEvent.click(nextButton);
        await waitFor(() => {
             expect(apiClient.get).toHaveBeenCalledWith('/payments/get_payments.php',
                expect.objectContaining({ params: expect.objectContaining({ page: 3 }) }) // from page 2 to page 3
            );
        });
    });
     it('pagination buttons are disabled appropriately', async () => {
        // Test case: Page 1 of 1
        apiClient.get.mockResolvedValue({
            data: {
                data: mockPayments.slice(0,1), // Only one item
                pagination: { ...mockPagination, totalPages: 1, page: 1, totalRecords: 1 }
            }
        });
        render(<PaymentList />);

        await waitFor(() => {
            expect(screen.getByText('Page 1 of 1 (Total: 1)')).toBeInTheDocument();
        });

        const prevButton = screen.getByRole('button', { name: /previous/i });
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
    });


});
