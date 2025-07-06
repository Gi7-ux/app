import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test/utils/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

describe('ChangePasswordForm', () => {
    beforeEach(() => {
        // Mock localStorage with a token
        localStorage.setItem('access_token', 'mock-token');

        // Mock successful API response by default
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Password changed successfully' })
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders all form fields', () => {
        render(<ChangePasswordForm />);

        expect(screen.getByText('Change Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
    });

    it('updates input values when typing', () => {
        render(<ChangePasswordForm />);

        const currentPasswordInput = screen.getByLabelText('Current Password');
        const newPasswordInput = screen.getByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

        fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
        fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

        expect(currentPasswordInput.value).toBe('currentpass');
        expect(newPasswordInput.value).toBe('newpass123');
        expect(confirmPasswordInput.value).toBe('newpass123');
    });

    it('shows error when new passwords do not match', async () => {
        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'differentpass' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
        });

        // Should not make API call
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('submits form successfully with matching passwords', async () => {
        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'newpass123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/users/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({
                    current_password: 'currentpass',
                    new_password: 'newpass123'
                })
            });
        });

        expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });

    it('clears form fields after successful submission', async () => {
        render(<ChangePasswordForm />);

        const currentPasswordInput = screen.getByLabelText('Current Password');
        const newPasswordInput = screen.getByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

        fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
        fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
        });

        expect(currentPasswordInput.value).toBe('');
        expect(newPasswordInput.value).toBe('');
        expect(confirmPasswordInput.value).toBe('');
    });

    it('handles API error response', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: 'Current password is incorrect' })
        });

        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), {
            target: { value: 'wrongpass' }
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'newpass123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
        });
    });

    it('handles network error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'newpass123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.getByText('An error occurred.')).toBeInTheDocument();
        });
    });

    it('handles API error without message', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({})
        });

        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'newpass123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.getByText('Failed to change password.')).toBeInTheDocument();
        });
    });

    it('clears previous error/success messages on new submission', async () => {
        render(<ChangePasswordForm />);

        // First, trigger an error
        fireEvent.change(screen.getByLabelText('Current Password'), {
            target: { value: 'currentpass' }
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'differentpass' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
        });

        // Now fix the passwords and submit again
        fireEvent.change(screen.getByLabelText('Confirm New Password'), {
            target: { value: 'newpass123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

        await waitFor(() => {
            expect(screen.queryByText('New passwords do not match.')).not.toBeInTheDocument();
            expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
        });
    });

    it('has proper form accessibility', () => {
        render(<ChangePasswordForm />);

        const currentPasswordInput = screen.getByLabelText('Current Password');
        const newPasswordInput = screen.getByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

        expect(currentPasswordInput).toHaveAttribute('type', 'password');
        expect(currentPasswordInput).toHaveAttribute('autoComplete', 'current-password');
        expect(currentPasswordInput).toHaveAttribute('required');

        expect(newPasswordInput).toHaveAttribute('type', 'password');
        expect(newPasswordInput).toHaveAttribute('autoComplete', 'new-password');
        expect(newPasswordInput).toHaveAttribute('required');

        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
        expect(confirmPasswordInput).toHaveAttribute('required');
    });
});