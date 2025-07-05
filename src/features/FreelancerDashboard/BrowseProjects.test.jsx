import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowseProjects } from './BrowseProjects';

// Mock the data file
vi.mock('../../data/data.js', () => ({
  mockData: {
    projectManagement: {
      projects: [
        { id: 1, title: 'Open Concept Kitchen', clientName: 'Client A', budget: 5000, skills: ['AutoCAD', 'Revit'], status: 'Open' },
        { id: 2, title: 'Downtown Office Space', clientName: 'Client B', budget: 10000, skills: ['SketchUp', '3ds Max'], status: 'Open' },
        { id: 3, title: 'Residential Remodel', clientName: 'Client C', budget: 7000, skills: ['Revit', 'V-Ray'], status: 'In Progress' },
        { id: 4, title: 'Cafe Design', clientName: 'Client D', budget: 3000, skills: ['AutoCAD'], status: 'Open' },
      ],
    },
  },
}));

describe('BrowseProjects', () => {
  it('renders only open projects', () => {
    render(<BrowseProjects />);
    
    expect(screen.getByText('Browse Projects')).toBeInTheDocument();
    
    // Open projects should be visible
    expect(screen.getByText('Open Concept Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Downtown Office Space')).toBeInTheDocument();
    expect(screen.getByText('Cafe Design')).toBeInTheDocument();

    // "In Progress" project should not be visible
    expect(screen.queryByText('Residential Remodel')).not.toBeInTheDocument();
  });

  it('filters projects based on search term', () => {
    render(<BrowseProjects />);
    
    const searchInput = screen.getByPlaceholderText('Search by title, skills...');
    
    // Search by title
    fireEvent.change(searchInput, { target: { value: 'kitchen' } });
    expect(screen.getByText('Open Concept Kitchen')).toBeInTheDocument();
    expect(screen.queryByText('Downtown Office Space')).not.toBeInTheDocument();

    // Search by skill
    fireEvent.change(searchInput, { target: { value: 'revit' } });
    expect(screen.getByText('Open Concept Kitchen')).toBeInTheDocument();
    expect(screen.queryByText('Downtown Office Space')).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Open Concept Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Downtown Office Space')).toBeInTheDocument();
  });

  it('handles the application process', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<BrowseProjects />);

    const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
    const firstApplyButton = applyButtons[0];

    // Apply for the first project
    fireEvent.click(firstApplyButton);

    // Check for success alert
    expect(alertMock).toHaveBeenCalledWith('Successfully applied for "Open Concept Kitchen"!');
    
    // The button should now be disabled and show "Applied"
    expect(firstApplyButton).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Applied' })[0]).toBeInTheDocument();

    alertMock.mockRestore();
  });
});
