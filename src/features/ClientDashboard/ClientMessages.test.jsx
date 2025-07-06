import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientMessages } from './ClientMessages';

import PropTypes from 'prop-types'; // Import PropTypes

// Mock the MessagingContainer to prevent its complex logic from running
vi.mock('../Messages/components/MessagingContainer.jsx', () => {
  const MockedMessagingContainer = ({ currentUser }) => (
    <div data-testid="messaging-container">
      <h1>Messaging</h1>
      <p>User: {currentUser.name}</p>
      <p>Role: {currentUser.role}</p>
    </div>
  );

  MockedMessagingContainer.propTypes = {
    currentUser: PropTypes.shape({
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }).isRequired,
  };

  return { MessagingContainer: MockedMessagingContainer };
});

// Mock the data file that the component uses to find the current user
vi.mock('../../data/data.js', () => ({
  mockData: {
    userManagement: {
      users: [
        { id: 1, name: 'Client User', email: 'client1@example.com', role: 'client' },
        { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      ],
    },
  },
}));

describe('ClientMessages', () => {
  it('renders the MessagingContainer with the correct client user', () => {
    render(<ClientMessages />);

    // Check that the mocked MessagingContainer is rendered
    expect(screen.getByTestId('messaging-container')).toBeInTheDocument();

    // Check that the correct user was found and passed as a prop
    expect(screen.getByText('User: Client User')).toBeInTheDocument();
    expect(screen.getByText('Role: client')).toBeInTheDocument();
  });
});
