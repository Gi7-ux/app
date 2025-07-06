import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentForm } from './PaymentForm';
import { apiClient } from '../../../../api/apiClient'; // Ensure this path is correct

// Mock apiClient
vi.mock('../../../../api/apiClient');

const mockPaymentToEdit = {
    id: 1,
    invoice_id: '101',
    project_id: '202',
    paid_by_user_id: '303',
    paid_to_user_id: '404',
    amount: '150.75',
    payment_date: '2024-06-15',
    payment_method: 'paypal',
    transaction_id: 'txn_edit_abc',
    status: 'pending',
    notes: 'Editing this payment'
};

describe('PaymentForm Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        apiClient.post.mockResolvedValue({ data: { message: "Payment recorded successfully!", id: 99 } });
        // apiClient.put for editing mode - not fully tested here as per plan
        apiClient.put.mockResolvedValue({ data: { message: "Payment updated successfully!" } });
    });

    it('renders with default values for new payment', () => {
        render(<PaymentForm />);
        expect(screen.getByRole('heading', { name: /Record New Payment/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount/i)).toHaveValue(null); // type="number" empty value is null
        expect(screen.getByLabelText(/Payment Date/i)).toHaveValue(new Date().toISOString().split('T')[0]);
        expect(screen.getByLabelText(/Status/i)).toHaveValue('completed');
    });

    it('renders with paymentToEdit values when provided', () => {
        render(<PaymentForm paymentToEdit={mockPaymentToEdit} />);
        expect(screen.getByRole('heading', { name: /Edit Payment/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount/i)).toHaveValue(150.75);
        expect(screen.getByLabelText(/Payment Date/i)).toHaveValue('2024-06-15');
        expect(screen.getByLabelText(/Invoice ID/i)).toHaveValue(101);
        expect(screen.getByLabelText(/Project ID/i)).toHaveValue(202);
        expect(screen.getByLabelText(/Paid By \(User ID\)/i)).toHaveValue(303);
        expect(screen.getByLabelText(/Paid To \(User ID\)/i)).toHaveValue(404);
        expect(screen.getByLabelText(/Payment Method/i)).toHaveValue('paypal');
        expect(screen.getByLabelText(/Transaction ID/i)).toHaveValue('txn_edit_abc');
        expect(screen.getByLabelText(/Status/i)).toHaveValue('pending');
        expect(screen.getByLabelText(/Notes/i)).toHaveValue('Editing this payment');
    });

    it('updates form data on input change', () => {
        render(<PaymentForm />);
        const amountInput = screen.getByLabelText(/Amount/i);
        fireEvent.change(amountInput, { target: { name: 'amount', value: '200.50' } });
        expect(amountInput).toHaveValue(200.50);

        const notesInput = screen.getByLabelText(/Notes/i);
        fireEvent.change(notesInput, { target: { name: 'notes', value: 'Test notes here' } });
        expect(notesInput).toHaveValue('Test notes here');
    });

    it('handles successful form submission for new payment', async () => {
        const mockOnFormSubmit = vi.fn();
        render(<PaymentForm onFormSubmit={mockOnFormSubmit} />);

        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { name: 'amount', value: '300' } });
        fireEvent.change(screen.getByLabelText(/Paid By \(User ID\)/i), { target: { name: 'paid_by_user_id', value: '12' } });
        fireEvent.change(screen.getByLabelText(/Project ID/i), { target: { name: 'project_id', value: '34' } });

        fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/payments/create_payment.php', expect.objectContaining({
                amount: 300,
                paid_by_user_id: 12,
                project_id: 34,
                payment_date: new Date().toISOString().split('T')[0], // Default date
                status: 'completed' // Default status
            }));
            expect(screen.getByText(/Payment recorded successfully!/i)).toBeInTheDocument();
            expect(mockOnFormSubmit).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
            // Check if form resets (amount field would be empty for type number)
            expect(screen.getByLabelText(/Amount/i)).toHaveValue(null);
        });
    });

    it('shows validation error if required fields are missing', async () => {
        render(<PaymentForm />);
        fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

        await waitFor(() => {
            expect(screen.getByText(/Amount, Payment Date, and Paid By User ID are required./i)).toBeInTheDocument();
            expect(apiClient.post).not.toHaveBeenCalled();
        });

        // Fill some, but not all required fields
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { name: 'amount', value: '100' } });
        fireEvent.change(screen.getByLabelText(/Paid By \(User ID\)/i), { target: { name: 'paid_by_user_id', value: '1' } });
        // Missing project_id or invoice_id
        fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

        await waitFor(() => {
            expect(screen.getByText(/Either Project ID or Invoice ID must be provided./i)).toBeInTheDocument();
            expect(apiClient.post).not.toHaveBeenCalled();
        });
    });

    it('shows API error message on submission failure', async () => {
        apiClient.post.mockRejectedValueOnce({ response: { data: { message: 'API Error: Duplicate transaction ID' } } });
        render(<PaymentForm />);

        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { name: 'amount', value: '100' } });
        fireEvent.change(screen.getByLabelText(/Paid By \(User ID\)/i), { target: { name: 'paid_by_user_id', value: '1' } });
        fireEvent.change(screen.getByLabelText(/Project ID/i), { target: { name: 'project_id', value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

        await waitFor(() => {
            expect(screen.getByText(/Error: API Error: Duplicate transaction ID/i)).toBeInTheDocument();
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        const mockOnCancel = vi.fn();
        render(<PaymentForm onCancel={mockOnCancel} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    // Note: Edit mode (PUT request) is not fully implemented in PaymentForm based on initial plan,
    // so a comprehensive test for edit submission is skipped. The structure is there, though.
    it('displays "Update Payment" button and heading in edit mode', () => {
        render(<PaymentForm paymentToEdit={mockPaymentToEdit} />);
        expect(screen.getByRole('heading', { name: /Edit Payment/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Update Payment/i })).toBeInTheDocument();
    });

    it('submit button is disabled while loading', async () => {
        apiClient.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ data: { message: "Success" }}), 100)));
        render(<PaymentForm />);

        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { name: 'amount', value: '100' } });
        fireEvent.change(screen.getByLabelText(/Paid By \(User ID\)/i), { target: { name: 'paid_by_user_id', value: '1' } });
        fireEvent.change(screen.getByLabelText(/Project ID/i), { target: { name: 'project_id', value: '1' } });

        const submitButton = screen.getByRole('button', { name: /Record Payment/i });
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/Recording.../i)

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent(/Record Payment/i)
        });
    });
});
