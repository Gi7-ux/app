import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatInterface } from './ChatInterface';

const currentUser = { name: 'Test User' };

vi.mock('../data/messages.js', () => ({
  messageData: {
    conversations: [
      {
        projectId: 'proj1',
        participants: ['Test User', 'Admin'],
        messages: [
          { id: 'msg1', sender: 'Admin', text: 'Hello!', timestamp: '2025-07-02T10:00:00Z' },
          { id: 'msg2', sender: 'Test User', text: 'Hi there!', timestamp: '2025-07-02T10:01:00Z' },
        ],
      },
    ],
  },
}));

vi.mock('../../../data/data.js', () => ({
  mockData: {
    projectManagement: {
      projects: [{ id: 'proj1', title: 'Test Project' }],
    },
  },
}));

describe('ChatInterface', () => {
  it('renders the chat interface with conversations', () => {
    render(<ChatInterface currentUser={currentUser} />);

    expect(screen.getByText('Messages')).toBeInTheDocument();
    // Check for the project title in the conversation list and the chat header
    expect(screen.getAllByText('Test Project')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Hi there!')[0]).toBeInTheDocument();
  });

  it('sends a new message', () => {
    render(<ChatInterface currentUser={currentUser} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'A new message' } });
    fireEvent.click(sendButton);

    // Check for the new message in the message list and the conversation preview
    expect(screen.getAllByText('A new message').length).toBe(2);
    expect(input.value).toBe('');
  });
});
