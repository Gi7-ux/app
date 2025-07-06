import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PropTypes from 'prop-types'; // Import PropTypes
import { MessagingContainer } from './MessagingContainer';

// Mock child components
vi.mock('./ConversationList.jsx', () => {
  const MockConversationList = ({ onSelectThread, _activeThreadId, _currentUser, _threads }) => ( // Prefixed unused props
    <div data-testid="conversation-list">
      <button onClick={() => onSelectThread({ id: 'thread1', name: 'Test Thread' })}>Select Thread</button>
      {/* Simplified mock, actual component is more complex */}
    </div>
  );
  MockConversationList.propTypes = {
    onSelectThread: PropTypes.func.isRequired,
    _activeThreadId: PropTypes.string, // Updated to match prefixed unused prop
    _currentUser: PropTypes.object,    // Updated to match prefixed unused prop
    _threads: PropTypes.array,         // Updated to match prefixed unused prop
  };
  return { ConversationList: MockConversationList };
});

vi.mock('./ChatWindow.jsx', () => {
  const MockChatWindow = ({ thread, messages, onSendMessage, _currentUser, _onModerateMessage, _isLoading, _projectId }) => ( // Prefixed unused props
    <div data-testid="chat-window">
      {thread && <p>Active Thread: {thread.id}</p>}
      {messages.map(msg => <p key={msg.id}>{msg.text}</p>)}
      <button onClick={() => onSendMessage('Test Message')}>Send</button>
      {/* Simplified mock */}
    </div>
  );
  MockChatWindow.propTypes = {
    thread: PropTypes.shape({
      id: PropTypes.string.isRequired,
      // Add other thread properties if used by the actual ChatWindow or needed for testing
    }), // thread can be null initially
    messages: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
    onSendMessage: PropTypes.func.isRequired,
    _currentUser: PropTypes.object, // Updated to match prefixed unused prop
    _onModerateMessage: PropTypes.func, // Updated to match prefixed unused prop
    _isLoading: PropTypes.bool,         // Updated to match prefixed unused prop
    _projectId: PropTypes.number,       // Updated to match prefixed unused prop
  };
  return { ChatWindow: MockChatWindow };
});

vi.mock('./AdminProjectSelector.jsx', () => {
    const MockAdminProjectSelector = ({ _threads, _onSelectThread, _activeThreadId, _currentUser }) => ( // Prefixed unused props
        <div data-testid="admin-selector"></div>
    );
    MockAdminProjectSelector.propTypes = {
        _threads: PropTypes.array,         // Updated to match prefixed unused prop
        _onSelectThread: PropTypes.func,   // Updated to match prefixed unused prop
        _activeThreadId: PropTypes.string, // Updated to match prefixed unused prop
        _currentUser: PropTypes.object,    // Updated to match prefixed unused prop
    };
    return { AdminProjectSelector: MockAdminProjectSelector };
});


// Mock fetch
global.fetch = vi.fn();

const mockThreads = [{ id: 'thread1', name: 'Test Thread' }];
const mockMessages = [{ id: 'msg1', text: 'Hello World' }];
const clientUser = { role: 'client', email: 'client@test.com' };
const adminUser = { role: 'admin', email: 'admin@test.com' };

describe('MessagingContainer', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders ConversationList for non-admin users and fetches threads', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockThreads) });
    render(<MessagingContainer currentUser={clientUser} />);

    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-selector')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/messages/get_threads.php', expect.any(Object));
    });
  });

  it('renders AdminProjectSelector for admin users', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    render(<MessagingContainer currentUser={adminUser} />);
    await waitFor(() => {
      expect(screen.getByTestId('admin-selector')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-list')).not.toBeInTheDocument();
    });
  });

  it('fetches messages when a thread is selected', async () => {
    // Initial threads fetch
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockThreads) });
    // Messages fetch after selection
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockMessages) });

    render(<MessagingContainer currentUser={clientUser} />);
    
    // Wait for initial render
    await screen.findByTestId('conversation-list');

    // Simulate selecting a thread
    fireEvent.click(screen.getByText('Select Thread'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/messages/get_messages.php?thread_id=thread1', expect.any(Object));
      expect(screen.getByText('Active Thread: thread1')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('sends a message and refreshes the message list', async () => {
    // Mocks for getting to the point of sending a message
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockThreads) }); // threads
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // messages
    
    // Mock for the send message call
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'Message sent' }) });
    
    // Mock for the refresh messages call
    const refreshedMessages = [{ id: 'msg2', text: 'New Message' }];
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(refreshedMessages) });

    render(<MessagingContainer currentUser={clientUser} />);
    await screen.findByTestId('conversation-list');
    fireEvent.click(screen.getByText('Select Thread'));
    await screen.findByTestId('chat-window');

    // Send the message
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      // Check that send_message.php was called
      expect(fetch).toHaveBeenCalledWith('/api/messages/send_message.php', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ thread_id: 'thread1', text: 'Test Message' }),
      }));
      // Check that get_messages.php was called again to refresh
      expect(fetch).toHaveBeenCalledWith('/api/messages/get_messages.php?thread_id=thread1', expect.any(Object));
      // Check that the new message is displayed
      expect(screen.getByText('New Message')).toBeInTheDocument();
    });
  });
});
