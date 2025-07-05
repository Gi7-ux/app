import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatWindow } from './ChatWindow';

const currentUser = { email: 'user@test.com', role: 'client' };
const adminUser = { email: 'admin@test.com', role: 'admin' };

const mockThread = { id: 'thread1', type: 'project_client_admin_freelancer' };

const mockMessages = [
  { id: 'msg1', sender: 'other@test.com', text: 'Hello from them', timestamp: '2025-07-02T10:00:00Z', status: 'approved' },
  { id: 'msg2', sender: 'user@test.com', text: 'Hello from me', timestamp: '2025-07-02T10:01:00Z', status: 'approved' },
  { id: 'msg3', sender: 'user@test.com', text: 'This is pending', timestamp: '2025-07-02T10:02:00Z', status: 'pending' },
];

vi.mock('../../../data/data.js', () => ({
  mockData: {
    userManagement: {
      users: [
        { email: 'user@test.com', name: 'Current User' },
        { email: 'other@test.com', name: 'Other User' },
        { email: 'admin@test.com', name: 'Admin User' },
      ],
    },
  },
}));

describe('ChatWindow', () => {
  it('renders a message to select a conversation if no thread is provided', () => {
    render(<ChatWindow thread={null} messages={[]} currentUser={currentUser} onSendMessage={() => {}} onModerateMessage={() => {}} />);
    expect(screen.getByText('Select a conversation to start messaging.')).toBeInTheDocument();
  });

  it('renders messages for the active thread', () => {
    render(<ChatWindow thread={mockThread} messages={mockMessages} currentUser={currentUser} onSendMessage={() => {}} onModerateMessage={() => {}} />);
    
    expect(screen.getByText('Hello from them')).toBeInTheDocument();
    expect(screen.getByText('Hello from me')).toBeInTheDocument();
  });

  it('calls onSendMessage when the send button is clicked', () => {
    const onSendMessageMock = vi.fn();
    render(<ChatWindow thread={mockThread} messages={[]} currentUser={currentUser} onSendMessage={onSendMessageMock} onModerateMessage={() => {}} />);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(onSendMessageMock).toHaveBeenCalledWith('Test message');
    expect(input.value).toBe('');
  });

  it('shows moderation buttons for admin on pending messages', () => {
    render(<ChatWindow thread={mockThread} messages={mockMessages} currentUser={adminUser} onSendMessage={() => {}} onModerateMessage={() => {}} />);
    
    // Admin sees all messages, including pending
    expect(screen.getByText('This is pending')).toBeInTheDocument();
    
    // Admin sees moderation buttons for the pending message
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('calls onModerateMessage when an admin approves or rejects a message', () => {
    const onModerateMessageMock = vi.fn();
    render(<ChatWindow thread={mockThread} messages={mockMessages} currentUser={adminUser} onSendMessage={() => {}} onModerateMessage={onModerateMessageMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onModerateMessageMock).toHaveBeenCalledWith(mockThread.id, 'msg3', 'approved');

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onModerateMessageMock).toHaveBeenCalledWith(mockThread.id, 'msg3', 'rejected');
  });

  it('does not show unapproved messages to non-admin users (except their own)', () => {
    render(<ChatWindow thread={mockThread} messages={mockMessages} currentUser={currentUser} onSendMessage={() => {}} onModerateMessage={() => {}} />);
    
    // The user should see their own pending message
    expect(screen.getByText('This is pending')).toBeInTheDocument();
    // And they should see its status
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
