import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminProjectSelector } from './AdminProjectSelector';

const mockProjects = [
  { id: 'proj1', title: 'Project Alpha' },
  { id: 'proj2', title: 'Project Beta' },
];

const mockThreads = [
  { id: 't1', projectId: 'proj1', type: 'project_client_admin_freelancer' },
  { id: 't2', projectId: 'proj1', type: 'project_admin_client' },
  { id: 't3', projectId: 'proj2', type: 'project_admin_freelancer' },
];

describe('AdminProjectSelector', () => {
  it('renders projects and their associated threads', () => {
    render(
      <AdminProjectSelector
        projects={mockProjects}
        threads={mockThreads}
        onSelectThread={() => {}}
        activeThreadId={null}
      />
    );

    expect(screen.getByText('Project Threads')).toBeInTheDocument();
    
    // Check project titles are rendered
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();

    // Check thread type names are rendered correctly
    expect(screen.getByText('All-Hands (Client, Admin, Freelancer)')).toBeInTheDocument();
    expect(screen.getByText('Private (Admin, Client)')).toBeInTheDocument();
    expect(screen.getByText('Private (Admin, Freelancer)')).toBeInTheDocument();
  });

  it('calls onSelectThread with the correct thread when a thread is clicked', () => {
    const onSelectThreadMock = vi.fn();
    render(
      <AdminProjectSelector
        projects={mockProjects}
        threads={mockThreads}
        onSelectThread={onSelectThreadMock}
        activeThreadId={null}
      />
    );

    // Click on the first thread
    fireEvent.click(screen.getByText('All-Hands (Client, Admin, Freelancer)'));
    expect(onSelectThreadMock).toHaveBeenCalledWith(mockThreads[0]);

    // Click on the third thread
    fireEvent.click(screen.getByText('Private (Admin, Freelancer)'));
    expect(onSelectThreadMock).toHaveBeenCalledWith(mockThreads[2]);
  });

  it('highlights the active thread', () => {
    const { container } = render(
      <AdminProjectSelector
        projects={mockProjects}
        threads={mockThreads}
        onSelectThread={() => {}}
        activeThreadId="t2" // Set the second thread as active
      />
    );

    const activeThreadElement = screen.getByText('Private (Admin, Client)').parentElement;
    expect(activeThreadElement).toHaveStyle('background: var(--gray-200)');
    
    const inactiveThreadElement = screen.getByText('All-Hands (Client, Admin, Freelancer)').parentElement;
    expect(inactiveThreadElement).toHaveStyle('background: transparent');
  });
});
