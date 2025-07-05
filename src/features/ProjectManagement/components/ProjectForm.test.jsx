import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectForm } from './ProjectForm';

const mockClients = [{ id: '1', name: 'Client A' }, { id: '2', name: 'Client B' }];
const mockFreelancers = [{ id: '101', name: 'Freelancer X' }, { id: '102', name: 'Freelancer Y' }];

describe('ProjectForm', () => {
  it('renders in "create" mode with empty fields', () => {
    render(<ProjectForm onSave={() => {}} onCancel={() => {}} clients={mockClients} freelancers={mockFreelancers} />);

    expect(screen.getByText('Create New Project (Admin)')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Title')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument();
  });

  it('renders in "edit" mode with pre-filled fields', () => {
    const mockProject = {
      title: 'Existing Project',
      description: 'A description',
      client_id: '2',
      freelancer_id: '101',
      budget: 5000,
      deadline: '2025-12-01T00:00:00Z',
      skills: ['Revit'],
      purchasedHours: 100,
    };
    render(<ProjectForm project={mockProject} onSave={() => {}} onCancel={() => {}} clients={mockClients} freelancers={mockFreelancers} />);

    expect(screen.getByText(/Edit Project/)).toBeInTheDocument();
    expect(screen.getByLabelText('Project Title')).toHaveValue(mockProject.title);
    expect(screen.getByLabelText('Assign Client')).toHaveValue(mockProject.client_id);
    expect(screen.getByLabelText('Budget (R)')).toHaveValue(mockProject.budget);
    expect(screen.getByText('Revit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('updates form data on input change', () => {
    render(<ProjectForm onSave={() => {}} onCancel={() => {}} clients={mockClients} freelancers={mockFreelancers} />);
    
    const titleInput = screen.getByLabelText('Project Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    
    expect(titleInput.value).toBe('New Title');
  });

  it('adds and removes skills', () => {
    render(<ProjectForm onSave={() => {}} onCancel={() => {}} clients={mockClients} freelancers={mockFreelancers} />);
    
    const skillInput = screen.getByPlaceholderText('e.g., Revit, AutoCAD');
    const addButton = screen.getByText('Add Skill');

    // Add a skill
    fireEvent.change(skillInput, { target: { value: 'AutoCAD' } });
    fireEvent.click(addButton);
    expect(screen.getByText('AutoCAD')).toBeInTheDocument();
    expect(skillInput.value).toBe('');

    // Remove the skill
    const removeButton = within(screen.getByText('AutoCAD').closest('.form-skill-tag')).getByRole('button');
    fireEvent.click(removeButton);
    expect(screen.queryByText('AutoCAD')).not.toBeInTheDocument();
  });

  it('calls onSave with the form data when submitted', () => {
    const onSaveMock = vi.fn();
    render(<ProjectForm onSave={onSaveMock} onCancel={() => {}} clients={mockClients} freelancers={mockFreelancers} />);

    fireEvent.change(screen.getByLabelText('Project Title'), { target: { value: 'Final Project' } });
    fireEvent.change(screen.getByLabelText('Budget (R)'), { target: { value: '12000' } });
    fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2025-10-10' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Create Project' }));

    expect(onSaveMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Final Project',
      budget: 12000,
      deadline: '2025-10-10',
    }));
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancelMock = vi.fn();
    render(<ProjectForm onSave={() => {}} onCancel={onCancelMock} clients={mockClients} freelancers={mockFreelancers} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
