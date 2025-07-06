import React from 'react';
import { render, screen, fireEvent, waitFor } from './utils/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoginScreen } from '/src/core/LoginScreen.jsx';
import { setupApiMocks, mockApi } from './utils/api-mocks.js';

describe('LoginScreen', () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form elements', () => {
    const handleLogin = vi.fn();
    render(<LoginScreen onLogin={handleLogin} />);

    // Check for the main title
    expect(screen.getByText('Architex Axis')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();

    // Check for the role selector
    expect(screen.getByLabelText('Role')).toBeInTheDocument();

    // Check for email and password inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for the remember me checkbox
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();

    // Check for the sign-in button
    expect(screen.getByRole('button', { name: /Sign In as Admin/i })).toBeInTheDocument();

    // Check for the sign up link
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
  });

  it('handles form submission with valid credentials', async () => {
    const handleLogin = vi.fn();
    render(<LoginScreen onLogin={handleLogin} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));

    await waitFor(() => {
      expect(mockApi.auth.login).toHaveBeenCalled();
    });
  });

  it('displays error message on login failure', async () => {
    mockApi.auth.login.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    const handleLogin = vi.fn();
    render(<LoginScreen onLogin={handleLogin} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
