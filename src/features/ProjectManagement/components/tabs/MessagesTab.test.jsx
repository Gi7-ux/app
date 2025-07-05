import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessagesTab } from './MessagesTab';

const mockProject = {
  id: 'proj1',
  messages: [
    { id: 'msg1', sender: 'Client', text: 'Here is an update.', timestamp: '2025-07-02T10:00:00Z' },
    { id: 'msg2', sender: 'Admin Architex', text: 'Thanks for the update!', timestamp: '2025-07-02T10:05:00Z' },
  ],
};

describe('MessagesTab', () => {
  it('renders the chat interface with existing messages', () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<MessagesTab project={mockProject} onUpdateProject={() => {}} />);

    expect(screen.getByText('Here is an update.')).toBeInTheDocument();
    expect(screen.getByText('Thanks for the update!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('calls onUpdateProject with a new message when the form is submitted', () => {
    const onUpdateProjectMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<MessagesTab project={mockProject} onUpdateProject={onUpdateProjectMock} />);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTestId('send-button');
    const newMessageText = 'This is a new test message.';

    fireEvent.change(input, { target: { value: newMessageText } });
    fireEvent.click(sendButton);

    expect(onUpdateProjectMock).toHaveBeenCalledTimes(1);
    const updatedProject = onUpdateProjectMock.mock.calls[0][0];
    
    // Check that the new message is in the messages array of the updated project
    const lastMessage = updatedProject.messages[updatedProject.messages.length - 1];
    expect(lastMessage.text).toBe(newMessageText);
    expect(lastMessage.sender).toBe('Admin Architex');
  });

  it('does not send an empty message', () => {
    const onUpdateProjectMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<MessagesTab project={mockProject} onUpdateProject={onUpdateProjectMock} />);

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    expect(onUpdateProjectMock).not.toHaveBeenCalled();
  });
});
