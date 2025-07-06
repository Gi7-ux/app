import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectDetailsOverview } from './ProjectDetailsOverview';

const mockProject = {
  budget: 100000,
  spend: 25000,
  purchasedHours: 200,
  hoursSpent: 80,
  description: 'This is a detailed project description.',
  skills: ['Revit', 'AutoCAD'],
  freelancerName: 'Alice Architect',
};

describe('ProjectDetailsOverview', () => {
  it('renders all overview cards with correct data', () => {
    render(<ProjectDetailsOverview project={mockProject} />);

    // Budget Card
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText((content, _element) => content.startsWith('R 25'))).toBeInTheDocument(); // Renamed element
    expect(screen.getByText((content, _element) => content.startsWith('/ R 100'))).toBeInTheDocument(); // Renamed element

    // Hours Card
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('/ 200 hrs')).toBeInTheDocument();

    // Description Card
    expect(screen.getByText('Project Description')).toBeInTheDocument();
    expect(screen.getByText(mockProject.description)).toBeInTheDocument();

    // Skills Card
    expect(screen.getByText('Required Skills')).toBeInTheDocument();
    expect(screen.getByText('Revit')).toBeInTheDocument();
    expect(screen.getByText('AutoCAD')).toBeInTheDocument();

    // Freelancers Card
    expect(screen.getByText('Assigned Freelancers')).toBeInTheDocument();
    expect(screen.getByText(mockProject.freelancerName)).toBeInTheDocument();
  });

  it('calculates and displays progress bars correctly', () => {
    const { container } = render(<ProjectDetailsOverview project={mockProject} />);

    const progressBars = container.querySelectorAll('.progress-bar-fill');
    
    // Budget progress: 25000 / 100000 = 25%
    expect(progressBars[0]).toHaveStyle('width: 25%');
    
    // Hours progress: 80 / 200 = 40%
    expect(progressBars[1]).toHaveStyle('width: 40%');
  });
});
