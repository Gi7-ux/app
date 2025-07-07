import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FilesTab } from './FilesTab';

const mockProject = { id: 'proj1' };

global.fetch = vi.fn();

const mockFiles = [
  { id: 'file1', name: 'floor-plan.pdf', type: 'pdf', uploader_name: 'Alice', size: 123456, uploaded_at: '2025-07-01T10:00:00Z' },
  { id: 'file2', name: 'render.jpg', type: 'jpeg', uploader_name: 'Bob', size: 78910, uploaded_at: '2025-07-02T11:00:00Z' },
];

describe('FilesTab', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('access_token', 'test-token'); // Mock token for API calls
  });

  afterEach(() => {
    vi.restoreAllMocks(); // For window.confirm
    localStorage.removeItem('access_token');
  });

  it('fetches and displays a list of files', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockFiles });
    render(<FilesTab project={mockProject} />);

    expect(fetch).toHaveBeenCalledWith(`/api/files/get_files.php?project_id=${mockProject.id}`, expect.objectContaining({
      headers: expect.objectContaining({ 'Authorization': 'Bearer test-token' })
    }));

    await waitFor(() => {
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
      expect(screen.getByText('render.jpg')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument(); // uploader_name
      expect(screen.getByText('120.56 KB')).toBeInTheDocument(); // Check formatted size
    });
  });

  it('displays a message when there are no files', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<FilesTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('No files have been uploaded to this project yet.')).toBeInTheDocument();
    });
  });

  it('handles file upload', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // Initial empty
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Upload successful' }) }); // Upload
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [mockFiles[0]] }); // Refetch with one file

    render(<FilesTab project={mockProject} />);
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/files/upload.php', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Authorization': 'Bearer test-token' })
        // Body is FormData, hard to match exactly without more complex logic
      }));
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument(); // After refetch
    });
  });

  it('handles file deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockFiles }); // Initial fetch
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Delete successful' }) }); // Delete
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [mockFiles[1]] }); // Refetch

    render(<FilesTab project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText('floor-plan.pdf')).toBeInTheDocument();
    });

    const deleteIcons = screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'span' && element.classList.contains('delete-icon'));
    fireEvent.click(deleteIcons[0]); // Delete the first file (floor-plan.pdf)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/files/delete.php', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }),
        body: JSON.stringify({ file_id: mockFiles[0].id })
      }));
      expect(screen.queryByText('floor-plan.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('render.jpg')).toBeInTheDocument();
    });
  });
});
