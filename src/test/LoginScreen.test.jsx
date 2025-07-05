import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoginScreen } from '/src/core/LoginScreen.jsx';
import { describe, it, expect, vi } from 'vitest';

describe('LoginScreen', () => {
  it('renders all form elements', () => {
    const handleLogin = vi.fn(); // Mock function
    render(<LoginScreen onLogin={handleLogin} />);

    // Check for the main title
    expect(screen.getByText('Architex Axis')).toBeInTheDocument();

    // Check for the role selector
    expect(screen.getByLabelText('Role')).toBeInTheDocument();

    // Check for email and password inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for the sign-in button
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
