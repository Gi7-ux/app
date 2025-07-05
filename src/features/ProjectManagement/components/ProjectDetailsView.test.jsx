import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectDetailsView } from './ProjectDetailsView';

const mockProject = {
  id: 'proj1',
  title: 'Test Project',
  clientName: 'Test Client',
};

// Mock child tab components
vi.mock('./tabs/ProjectDetailsOverview.jsx', () => ({
  ProjectDetailsOverview: () => <div data-testid="overview-tab">Overview</div>,
}));
vi.mock('./tabs/AssignmentsTab.jsx', () => ({
  AssignmentsTab: () => <div data-testid="assignments-tab">Assignments</div>,
}));
vi.mock('./tabs/MessagesTab.jsx', () => ({
  MessagesTab: () => <div data-testid="messages-tab">Messages</div>,
}));
vi.mock('./tabs/FilesTab.jsx', () => ({
  FilesTab: () => <div data-testid="files-tab">Files</div>,
}));
vi.mock('./tabs/FreelancersTab.jsx', () => ({
  FreelancersTab: () => <div data-testid="freelancers-tab">Freelancers</div>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProjectDetailsView', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProject),
    });
  });

  it('renders the project details and defaults to the overview tab', async () => {
    render(<ProjectDetailsView project={mockProject} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(mockProject.title)).toBeInTheDocument();
      expect(screen.getByText(`Client: ${mockProject.clientName}`)).toBeInTheDocument();
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    });
  });

  it('switches between tabs when clicked', async () => {
    render(<ProjectDetailsView project={mockProject} onBack={() => {}} />);
    await screen.findByTestId('overview-tab');

    fireEvent.click(screen.getByRole('button', { name: 'Assignments & Tasks' }));
    expect(screen.getByTestId('assignments-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('overview-tab')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Files' }));
    expect(screen.getByTestId('files-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('assignments-tab')).not.toBeInTheDocument();
  });

  it('calls the onBack function when the back button is clicked', async () => {
    const onBackMock = vi.fn();
    render(<ProjectDetailsView project={mockProject} onBack={onBackMock} />);
    await screen.findByText(mockProject.title);

    fireEvent.click(screen.getByText('Back to All Projects'));
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it('displays an error message if fetching details fails', async () => {
    const errorMessage = 'Failed to fetch details.';
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    });

    render(<ProjectDetailsView project={mockProject} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
