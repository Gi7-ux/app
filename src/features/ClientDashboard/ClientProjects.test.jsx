import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientProjects } from './ClientProjects';

// Mock the data file
vi.mock('../../data/data.js', () => ({
  mockData: {
    projectManagement: {
      projects: [
        {
          id: 1,
          title: 'Project Alpha',
          clientName: 'Client Architex',
          freelancerName: 'Alice Architect',
          status: 'In Progress',
          budget: 50000,
          spend: 25000,
          deadline: '2025-12-31',
        },
        {
          id: 2,
          title: 'Project Beta',
          clientName: 'Another Client',
          freelancerName: 'Bob Builder',
          status: 'Open',
          budget: 75000,
          spend: 0,
          deadline: '2026-01-31',
        },
        {
          id: 3,
          title: 'Project Gamma',
          clientName: 'Client Architex',
          freelancerName: 'Charlie Designer',
          status: 'Completed',
          budget: 20000,
          spend: 20000,
          deadline: '2025-06-30',
        },
      ],
    },
  },
}));

describe('ClientProjects', () => {
  it('renders the projects for the specific client "Client Architex"', () => {
    render(<ClientProjects />);

    expect(screen.getByText('My Projects')).toBeInTheDocument();

    // Should see projects for "Client Architex"
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Gamma')).toBeInTheDocument();

    // Should NOT see projects for other clients
    expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();

    // Check for other details to ensure the table is populated
    expect(screen.getByText('Alice Architect')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('R 50'))).toBeInTheDocument();
  });
});
