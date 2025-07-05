import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConversationList } from './ConversationList';

const currentUser = { email: 'user@test.com' };

const mockThreads = [
  {
    id: 'thread1',
    type: 'direct',
    participants: ['user@test.com', 'other@test.com'],
    messages: [{ text: 'Hello there!' }],
  },
  {
    id: 'thread2',
    type: 'project_client_admin_freelancer',
    projectId: 'proj1',
    messages: [{ text: 'Project update' }],
  },
];

vi.mock('../../../data/data.js', () => ({
  mockData: {
    userManagement: {
      users: [
        { email: 'user@test.com', name: 'Current User' },
        { email: 'other@test.com', name: 'Other User' },
      ],
    },
    projectManagement: {
      projects: [{ id: 'proj1', title: 'Test Project' }],
    },
  },
}));

describe('ConversationList', () => {
  it('renders a list of conversations', () => {
    render(<ConversationList threads={mockThreads} onSelectThread={() => {}} activeThreadId={null} currentUser={currentUser} />);

    expect(screen.getByText('Messages')).toBeInTheDocument();
    
    // Check for direct message thread display name
    expect(screen.getByText('Other User (DM)')).toBeInTheDocument();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();

    // Check for project thread display name
    expect(screen.getByText('Test Project - All Chat')).toBeInTheDocument();
    expect(screen.getByText('Project update')).toBeInTheDocument();
  });

  it('calls onSelectThread with the correct thread when clicked', () => {
    const onSelectThreadMock = vi.fn();
    render(<ConversationList threads={mockThreads} onSelectThread={onSelectThreadMock} activeThreadId={null} currentUser={currentUser} />);

    fireEvent.click(screen.getByText('Other User (DM)'));
    expect(onSelectThreadMock).toHaveBeenCalledWith(mockThreads[0]);

    fireEvent.click(screen.getByText('Test Project - All Chat'));
    expect(onSelectThreadMock).toHaveBeenCalledWith(mockThreads[1]);
  });

  it('highlights the active conversation', () => {
    render(<ConversationList threads={mockThreads} onSelectThread={() => {}} activeThreadId="thread2" currentUser={currentUser} />);

    const activeElement = screen.getByText('Test Project - All Chat').closest('div');
    expect(activeElement).toHaveStyle('background: var(--gray-100)');
    
    const inactiveElement = screen.getByText('Other User (DM)').closest('div');
    expect(inactiveElement).toHaveStyle('background: transparent');
  });
});
