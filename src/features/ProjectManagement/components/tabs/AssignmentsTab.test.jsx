import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('AssignmentsTab', () => {
  beforeEach(() => {
    fetch.mockClear();

    // Mock successful API responses
    fetch.mockImplementation((url) => {
      if (url.includes('list_clients_freelancers.php')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Alice', role: 'freelancer' },
            { name: 'Bob', role: 'freelancer' }
          ])
        });
      }

      if (url.includes('assignments/save.php')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Assignment saved successfully' })
        });
      }

      if (url.includes('assignments/get.php')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });
  it('renders existing assignments and tasks', () => {
    render(<AssignmentsTab project={mockProject} onUpdateProject={() => { }} />);

    expect(screen.getByText('Schematics')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Draw floor plan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3D Model')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
  });

  it('calls onUpdateProject when a task is updated', () => {
    const onUpdateProjectMock = vi.fn();
    render(<AssignmentsTab project={mockProject} onUpdateProject={onUpdateProjectMock} />);

    const descriptionInput = screen.getByDisplayValue('Draw floor plan');
    fireEvent.change(descriptionInput, { target: { value: 'Draw updated floor plan' } });

    expect(onUpdateProjectMock).toHaveBeenCalledWith(expect.objectContaining({
      assignments: expect.arrayContaining([
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({ description: 'Draw updated floor plan' }),
          ]),
        }),
      ]),
    }));
  });

  it('adds a new task when prompted', () => {
    const onUpdateProjectMock = vi.fn();
    vi.spyOn(window, 'prompt').mockReturnValue('New Task From Prompt');

    render(<AssignmentsTab project={mockProject} onUpdateProject={onUpdateProjectMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(onUpdateProjectMock).toHaveBeenCalledWith(expect.objectContaining({
      assignments: expect.arrayContaining([
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({ description: 'New Task From Prompt' }),
          ]),
        }),
      ]),
    }));
  });

  it('deletes a task when the delete icon is clicked', () => {
    const onUpdateProjectMock = vi.fn();
    render(<AssignmentsTab project={mockProject} onUpdateProject={onUpdateProjectMock} />);

    const deleteIcons = screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'span' && element.classList.contains('delete-icon'));
    fireEvent.click(deleteIcons[0]);

    expect(onUpdateProjectMock).toHaveBeenCalledWith(expect.objectContaining({
      assignments: expect.arrayContaining([
        expect.objectContaining({
          tasks: expect.not.arrayContaining([
            expect.objectContaining({ id: 'task1' })
          ]),
        }),
      ]),
    }));
  });

  it('adds a new assignment when prompted', () => {
    const onUpdateProjectMock = vi.fn();
    vi.spyOn(window, 'prompt').mockReturnValue('New Assignment');

    render(<AssignmentsTab project={mockProject} onUpdateProject={onUpdateProjectMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Assignment' }));

    expect(onUpdateProjectMock).toHaveBeenCalledWith(expect.objectContaining({
      assignments: expect.arrayContaining([
        expect.objectContaining({ title: 'New Assignment' }),
      ]),
    }));
  });
});
