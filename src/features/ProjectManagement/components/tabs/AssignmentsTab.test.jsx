import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssignmentsTab } from './AssignmentsTab';

// Mock fetch globally
global.fetch = vi.fn();

const mockProject = {
  id: 'proj1',
  assignments: [
    {
      id: 'asg1',
      title: 'Schematics',
      tasks: [
        { id: 'task1', description: 'Draw floor plan', assignedTo: 'Alice', status: 'In Progress' },
        { id: 'task2', description: '3D Model', assignedTo: 'Not Assigned', status: 'To Do' },
      ],
    },
  ],
};

vi.mock('../../../data/data.js', () => ({
  mockData: {
    userManagement: {
      users: [{ name: 'Alice', role: 'freelancer' }, { name: 'Bob', role: 'freelancer' }],
    },
  // This mock is no longer directly used by the component as it fetches.
  // It can be used as a base for fetch mock responses if desired.
  },
}));

// Mock global fetch
global.fetch = vi.fn();

const mockFreelancersList = [{ name: 'Alice', role: 'freelancer', email: 'alice@example.com' }, { name: 'Bob', role: 'freelancer', email: 'bob@example.com' }];

describe('AssignmentsTab', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Default mocks for initial load
    fetch.mockResolvedValueOnce({ // For fetchAssignments
      ok: true,
      json: async () => (mockProject.assignments),
    }).mockResolvedValueOnce({ // For fetchFreelancers
      ok: true,
      json: async () => (mockFreelancersList),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restores window.prompt if spied on
  });

  it('renders existing assignments and tasks after fetching', async () => {
    render(<AssignmentsTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('Schematics')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Draw floor plan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3D Model')).toBeInTheDocument();
      // The button is now "Add Task" within an assignment card
      expect(screen.getAllByRole('button', { name: 'Add Task' })[0]).toBeInTheDocument();
    });
  });

  it('calls saveAssignment (which calls fetch) when a task is updated', async () => {
    render(<AssignmentsTab project={mockProject} />);

    await waitFor(() => { // Wait for initial data to load
      expect(screen.getByDisplayValue('Draw floor plan')).toBeInTheDocument();
    });

    // Mock for the saveAssignment call (POST) and subsequent refetch (GET)
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Save successful' }) }) // POST
         .mockResolvedValueOnce({ ok: true, json: async () => (mockProject.assignments) }); // GET for refetch

    const descriptionInput = screen.getByDisplayValue('Draw floor plan');
    fireEvent.change(descriptionInput, { target: { value: 'Draw updated floor plan' } });
    // Blur to trigger save implicitly, or add a save button if explicit save is needed
    fireEvent.blur(descriptionInput); // Assuming blur triggers update, or find a save mechanism

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments/save.php', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"description":"Draw updated floor plan"')
      }));
    });
  });

  it('adds a new task when prompted and saves', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('New Task From Prompt');
    render(<AssignmentsTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Add Task' })[0]).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Save successful' }) }) // POST
         .mockResolvedValueOnce({ ok: true, json: async () => ([...mockProject.assignments, {title: "Schematics", tasks: [{description: 'New Task From Prompt'}]}]) }); // GET for refetch

    fireEvent.click(screen.getAllByRole('button', { name: 'Add Task' })[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments/save.php', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"description":"New Task From Prompt"')
      }));
    });
  });

  it('deletes a task when the delete icon is clicked and saves', async () => {
    render(<AssignmentsTab project={mockProject} />);
    await waitFor(() => {
      expect(screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'span' && element.classList.contains('delete-icon'))[0]).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Save successful' }) }) // POST
         .mockResolvedValueOnce({ ok: true, json: async () => ([{...mockProject.assignments[0], tasks: [mockProject.assignments[0].tasks[1]] }]) }); // GET for refetch (task1 removed)


    const deleteIcons = screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'span' && element.classList.contains('delete-icon'));
    fireEvent.click(deleteIcons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments/save.php', expect.objectContaining({
        method: 'POST',
        body: expect.not.stringContaining('"id":"task1"')
      }));
    });
  });

  it('adds a new assignment when prompted and saves', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('New Assignment Title');
    render(<AssignmentsTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Assignment' })).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Save successful', id: 'newAsgId' }) }) // POST
         .mockResolvedValueOnce({ ok: true, json: async () => ([...mockProject.assignments, {id: 'newAsgId', title: 'New Assignment Title', tasks: []}]) }); // GET for refetch

    fireEvent.click(screen.getByRole('button', { name: 'Add Assignment' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments/save.php', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New Assignment Title', tasks: [], project_id: mockProject.id })
      }));
    });
  });
});
