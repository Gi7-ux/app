import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientProfile } from './ClientProfile';

// Mock the ChangePasswordForm component
vi.mock('../../components/ChangePasswordForm.jsx', () => ({
  ChangePasswordForm: () => <div data-testid="change-password-form"></div>,
}));

// Mock fetch
global.fetch = vi.fn();

const mockClientUser = {
  id: 'client1',
  name: 'Test Client',
  email: 'client@test.com',
  role: 'client',
  avatar: 'https://via.placeholder.com/128',
  phone: '555-1234',
  company: 'Client Corp',
};

describe('ClientProfile', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock the successful fetch for user data
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ records: [mockClientUser] }),
    });
  });

  it('fetches and displays the client profile information', async () => {
    render(<ClientProfile />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: mockClientUser.name })).toBeInTheDocument();
      expect(screen.getByText(mockClientUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockClientUser.phone)).toBeInTheDocument();
      expect(screen.getByText(mockClientUser.company)).toBeInTheDocument();
      expect(screen.getByTestId('change-password-form')).toBeInTheDocument();
    });
  });

  it('switches to edit mode when "Edit Profile" is clicked', async () => {
    render(<ClientProfile />);
    await screen.findByText('My Profile');

    fireEvent.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toHaveValue(mockClientUser.name);
      expect(screen.getByLabelText('Email')).toHaveValue(mockClientUser.email);
      expect(screen.getByLabelText('Phone Number')).toHaveValue(mockClientUser.phone);
      expect(screen.getByLabelText('Company')).toHaveValue(mockClientUser.company);
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('calls the update API when saving changes', async () => {
    render(<ClientProfile />);
    await screen.findByText('My Profile');

    fireEvent.click(screen.getByText('Edit Profile'));
    await screen.findByText('Save Changes');

    const newName = 'Updated Test Client';
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: newName } });

    // Mock the update fetch call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Profile updated successfully!' }),
    });
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users/update.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.any(String),
        },
        body: JSON.stringify({ ...mockClientUser, name: newName }),
      });
      expect(alertMock).toHaveBeenCalledWith('Profile updated successfully!');
    });
    
    alertMock.mockRestore();
  });
});
