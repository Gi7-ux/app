import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProofOfWorkModal } from './ProofOfWorkModal';

describe('ProofOfWorkModal', () => {
  it('renders the modal with all form elements', () => {
    render(<ProofOfWorkModal onCancel={() => {}} onSubmit={() => {}} />);

    expect(screen.getByText('Submit Proof of Work')).toBeInTheDocument();
    expect(screen.getByLabelText('Proof of Work File')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancelMock = vi.fn();
    render(<ProofOfWorkModal onCancel={onCancelMock} onSubmit={() => {}} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('shows an alert if submitted without a file or comment', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProofOfWorkModal onCancel={() => {}} onSubmit={() => {}} />);

    // Submit with nothing filled
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(alertMock).toHaveBeenCalledWith('Please upload a proof of work file and add a comment.');

    // Fill comment but no file
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(alertMock).toHaveBeenCalledWith('Please upload a proof of work file and add a comment.');

    alertMock.mockRestore();
  });

  it('calls onSubmit with the file and comment when submitted correctly', () => {
    const onSubmitMock = vi.fn();
    const testFile = new File(['proof'], 'proof.png', { type: 'image/png' });
    const testComment = 'Here is the proof of work.';

    render(<ProofOfWorkModal onCancel={() => {}} onSubmit={onSubmitMock} />);

    // Simulate file selection
    const fileInput = screen.getByLabelText('Proof of Work File');
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Simulate comment input
    const commentInput = screen.getByLabelText('Comment');
    fireEvent.change(commentInput, { target: { value: testComment } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    // Check that onSubmit was called with the correct data
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith(testFile, testComment);
  });
});
