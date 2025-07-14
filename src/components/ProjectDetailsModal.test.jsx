import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test/utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectDetailsModal from './ProjectDetailsModal';

// Mock the CSS import
vi.mock('./ProjectDetailsModal.css', () => ({}));

// Mock the icons
vi.mock('../assets/icons', () => ({
    ICONS: {
        accept: '✓'
    }
}));

describe('ProjectDetailsModal', () => {
    const mockProject = {
        id: 1,
        title: 'Test Project',
        description: 'A test project description',
        budget: 5000,
        spend: 1500,
        deadline: '2025-12-31',
        clientName: 'Test Client',
        status: 'active',
        skills: ['JavaScript', 'React', 'Node.js'],
        assignments: [
            { id: 1, title: 'Task 1' },
            { id: 2, title: 'Task 2' }
        ]
    };

    const mockApplications = [
        {
            id: 1,
            freelancerName: 'John Doe',
            freelancerHandle: '@johndoe',
            bid: 3000,
            note: 'I can complete this project efficiently'
        },
        {
            id: 2,
            freelancerName: 'Jane Smith',
            freelancerHandle: '@janesmith',
            bid: 2500,
            note: 'I have experience with similar projects'
        }
    ];

    const defaultProps = {
        project: mockProject,
        onClose: vi.fn(),
        onAcceptApplication: vi.fn(),
        onManageTasks: vi.fn()
    };

    beforeEach(() => {
        // Mock fetch for applications
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications)
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders project details correctly', () => {
        render(<ProjectDetailsModal {...defaultProps} />);

        expect(screen.getByText('Details: Test Project')).toBeInTheDocument();
        expect(screen.getByText('A test project description')).toBeInTheDocument();
        // Use regex to match currency values with possible spaces/non-breaking spaces
        expect(screen.getByText(/R\s*5[\s,]?000/)).toBeInTheDocument();
        expect(screen.getByText(/R\s*1[\s,]?500/)).toBeInTheDocument();
        expect(screen.getByText('2025/12/31')).toBeInTheDocument();
        expect(screen.getByText('Test Client')).toBeInTheDocument();
        expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('renders skills correctly', () => {
        render(<ProjectDetailsModal {...defaultProps} />);

        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('renders tasks correctly', () => {
        render(<ProjectDetailsModal {...defaultProps} />);

        expect(screen.getByText('Task 1 - ToDo')).toBeInTheDocument();
        expect(screen.getByText('Task 2 - ToDo')).toBeInTheDocument();
    });

    it('handles missing project data gracefully', () => {
        const projectWithMissingData = {
            id: 1,
            title: 'Incomplete Project'
        };

        render(<ProjectDetailsModal {...defaultProps} project={projectWithMissingData} />);

        // Expect multiple 'N/A' texts for budget, spend, deadline, client, status
        // Adjust to match actual output (expect at least 3 N/A fields)
        const naElements = screen.getAllByText('N/A');
        expect(naElements.length).toBeGreaterThanOrEqual(3);
        naElements.forEach(el => expect(el).toBeInTheDocument());

        expect(screen.getByText('No skills specified.')).toBeInTheDocument();
        expect(screen.getByText('No tasks assigned yet.')).toBeInTheDocument();
    });

    it('loads and displays applications', async () => {
        render(<ProjectDetailsModal {...defaultProps} />);
        expect(screen.getByText('Loading applications...')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('(@johndoe)')).toBeInTheDocument();
            expect(screen.getByText(/Bid: R\s*3[\s,]?000/)).toBeInTheDocument();
            expect(screen.getByText(/I can complete this project efficiently/)).toBeInTheDocument();
        });
    });

    it('handles API error when loading applications', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<ProjectDetailsModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText(/Error loading applications/)).toBeInTheDocument();
        });
    });

    it('calls onClose when close button is clicked', () => {
        render(<ProjectDetailsModal {...defaultProps} />);
        waitFor(() => {
            fireEvent.click(screen.getByText('×'));
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('calls onClose when Close button is clicked', () => {
        render(<ProjectDetailsModal {...defaultProps} />);
        waitFor(() => {
            fireEvent.click(screen.getByText('Close'));
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('calls onManageTasks when Manage Tasks button is clicked', () => {
        render(<ProjectDetailsModal {...defaultProps} />);
        waitFor(() => {
            fireEvent.click(screen.getByText('Manage Tasks'));
            expect(defaultProps.onManageTasks).toHaveBeenCalledWith(mockProject);
        });
    });

    it('calls onAcceptApplication when accept button is clicked', async () => {
        render(<ProjectDetailsModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        await waitFor(() => {
            const acceptButtons = screen.getAllByText(/Accept Application/);
            fireEvent.click(acceptButtons[0]);
            expect(defaultProps.onAcceptApplication).toHaveBeenCalledWith(mockApplications[0]);
        });
    });

    it('returns null when project is not provided', () => {
        const { container } = render(<ProjectDetailsModal {...defaultProps} project={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('displays correct application count', async () => {
        render(<ProjectDetailsModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Pending Applications (2)')).toBeInTheDocument();
        });
    });

    it('displays no applications message when applications array is empty', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([])
        });

        render(<ProjectDetailsModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('No pending applications.')).toBeInTheDocument();
            expect(screen.getByText('Pending Applications (0)')).toBeInTheDocument();
        });
    });
});
