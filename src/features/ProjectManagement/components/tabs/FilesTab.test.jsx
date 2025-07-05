import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilesTab } from './FilesTab';

const mockProject = { id: 'proj1' };

global.fetch = vi.fn();

const mockFiles = [
  { id: 'file1', name: 'floor-plan.pdf', type: 'application/pdf', uploader: 'Alice', size: 123456, uploadedAt: '2025-07-01T10:00:00Z' },
  { id: 'file2', name: 'render.jpg', type: 'image/jpeg', uploader: 'Bob', size: 78910, uploadedAt: '2025-07-02T11:00:00Z' },
];

describe('FilesTab', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches and displays a list of files', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockFiles) });
    render(<FilesTab project={mockProject} />);

    expect(fetch).toHaveBeenCalledWith(`/api/files/get_files.php?project_id=${mockProject.id}`, expect.any(Object));

    await waitFor(() => {
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
      expect(screen.getByText('render.jpg')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('120.56 KB')).toBeInTheDocument(); // Check formatted size
    });
  });

  it('displays a message when there are no files', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    render(<FilesTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('No files have been uploaded to this project yet.')).toBeInTheDocument();
    });
  });

  it('handles file upload', async () => {
    // Initial fetch is empty
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    // Upload call
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'Upload successful' }) });
    // Refetch after upload
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockFiles) });

    render(<FilesTab project={mockProject} />);
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input'); // Assuming you add data-testid="file-input" to the input

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/files/upload.php', expect.any(Object));
      // Check that the files are refetched and displayed
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
    });
  });

  it('handles file deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // Initial fetch
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockFiles) });
    // Delete call
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'Delete successful' }) });
    // Refetch after delete
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockFiles[1]]) }); // Only the second file remains

    render(<FilesTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
    });

    const deleteIcons = screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'span' && element.classList.contains('delete-icon'));
    fireEvent.click(deleteIcons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/files/delete.php', expect.any(Object));
      expect(screen.queryByText('floor-plan.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('render.jpg')).toBeInTheDocument();
    });
  });
});
