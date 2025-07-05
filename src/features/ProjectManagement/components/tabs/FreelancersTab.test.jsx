import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FreelancersTab } from './FreelancersTab';

const mockProject = {
  freelancerName: 'Alice Architect',
};

describe('FreelancersTab', () => {
  it('renders the assigned freelancer\'s name', () => {
    render(<FreelancersTab project={mockProject} />);

    expect(screen.getByText('Assigned Freelancer')).toBeInTheDocument();
    expect(screen.getByText(mockProject.freelancerName)).toBeInTheDocument();
  });
});
