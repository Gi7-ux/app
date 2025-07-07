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
    expect(screen.getByText('Management Suite')).toBeInTheDocument();

    // Check for email and password inputs
    expect(screen.getByLabelText('Email address')).toBeInTheDocument(); // Corrected Label
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for the sign-in button
    // The button text is just "Sign In" in the component
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    // Check for the sign up link
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    // Ensure "Sign up" link is present
    expect(screen.getByRole('link', { name: /Sign up/i})).toBeInTheDocument();
  });

  it('handles form submission with valid credentials', async () => {
    const handleLogin = vi.fn();
    render(<LoginScreen onLogin={handleLogin} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email address'), { // Corrected Label
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });

    // Submit the form
    // The button text is just "Sign In"
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      // The test was checking a mockApi.auth.login, but the component uses fetch directly.
      // We should check that fetch was called with the correct parameters.
      // For now, let's assume the direct fetch call is what we want to ensure happens.
      // If mockApi.auth.login is a wrapper around fetch, the mock for it needs to be correctly set up.
      // Given the component code, we expect a direct fetch.
      expect(fetch).toHaveBeenCalledWith('/api/auth/login.php', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      }));
    });
  });

  it('displays error message on login failure', async () => {
    mockApi.auth.login.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    const handleLogin = vi.fn();
    render(<LoginScreen onLogin={handleLogin} />);

    fireEvent.change(screen.getByLabelText('Email address'), { // Corrected Label
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i })); // Corrected button name

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
