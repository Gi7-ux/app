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

    // Mock successful API responses based on URL patterns
    fetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('get_files.php')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockFiles) });
      }

      if (typeof url === 'string' && url.includes('upload.php')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Upload successful' }) });
      }

      if (typeof url === 'string' && url.includes('delete.php')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Delete successful' }) });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('fetches and displays a list of files', async () => {
    render(<FilesTab project={mockProject} />);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('get_files.php'), expect.any(Object));

    await waitFor(() => {
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
      expect(screen.getByText('render.jpg')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('120.56 KB')).toBeInTheDocument(); // Check formatted size
    });
  });

  it('displays a message when there are no files', async () => {
    // Override the mock for this specific test
    fetch.mockImplementationOnce((url) => {
      if (typeof url === 'string' && url.includes('get_files.php')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<FilesTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('No files have been uploaded to this project yet.')).toBeInTheDocument();
    });
  });

  it('handles file upload', async () => {
    // Mock sequence of API calls for file upload
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // Initial empty fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'Upload successful' }) }) // Upload call
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockFiles) }); // Refetch after upload

    fetch.mockImplementation(fetchMock);

    render(<FilesTab project={mockProject} />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('upload.php'), expect.any(Object));
      // Check that the files are refetched and displayed
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
    });
  });

  it('handles file deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Mock sequence of API calls for file deletion
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockFiles) }) // Initial fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'Delete successful' }) }) // Delete call
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockFiles[1]]) }); // Refetch after delete

    fetch.mockImplementation(fetchMock);

    render(<FilesTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
    });

    const deleteIcons = screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'span' && element.classList.contains('delete-icon'));
    fireEvent.click(deleteIcons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('delete.php'), expect.any(Object));
      expect(screen.queryByText('floor-plan.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('render.jpg')).toBeInTheDocument();
    });
  });
});
