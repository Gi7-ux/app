import React, { useState, useEffect, useCallback } from 'react';
import { ticketApi } from './ticketApi'; // Use the dedicated API wrapper
import CreateTicketForm from './components/CreateTicketForm';
import TicketList from './components/TicketList';
import { AuthService } from '../../services/AuthService'; // To get user role
import './TicketsPage.css';

const TicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null); // For viewing/editing details

    const userRole = AuthService.getRole();

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Parameters for pagination or filtering can be added here if needed
            const response = await ticketApi.getTickets({});
            setTickets(response.records || []);
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setError(err.message || 'Failed to fetch tickets.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleTicketCreated = () => {
        setShowCreateForm(false);
        fetchTickets(); // Refresh the list
    };

    const handleTicketSelect = (ticket) => {
        setSelectedTicket(ticket);
        // Here you would typically show a modal or navigate to a details view
        console.log("Selected ticket:", ticket);
        // For now, just logging. A TicketDetailsModal component would be used here.
    };

    const closeCreateForm = () => {
        setShowCreateForm(false);
        setSelectedTicket(null); // Also clear selected ticket if any form was for editing
    }

    return (
        <div className="tickets-page">
            <header className="tickets-page-header">
                <h2>Support Tickets</h2>
                {!showCreateForm && !selectedTicket && (
                    <button
                        onClick={() => {
                            setShowCreateForm(true);
                            setSelectedTicket(null); // Ensure no ticket is selected for "editing"
                        }}
                        className="btn btn-primary"
                    >
                        Create New Ticket
                    </button>
                )}
            </header>

            {isLoading && <p>Loading tickets...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {showCreateForm && !selectedTicket && (
                <CreateTicketForm
                    onSuccess={handleTicketCreated}
                    onCancel={closeCreateForm}
                />
            )}

            {/* Placeholder for displaying selected ticket details or an edit form */}
            {selectedTicket && !showCreateForm && (
                <div className="ticket-details-placeholder modal-placeholder">
                    <h3>Ticket Details (Placeholder)</h3>
                    <p><strong>ID:</strong> {selectedTicket.id}</p>
                    <p><strong>Title:</strong> {selectedTicket.title}</p>
                    <p><strong>User:</strong> {selectedTicket.user_name} ({selectedTicket.user_email})</p>
                    <p><strong>Status:</strong> {selectedTicket.status}</p>
                    <p><strong>Description:</strong> {selectedTicket.description}</p>
                    {/* Add more details and admin edit options here */}
                    <button onClick={() => setSelectedTicket(null)} className="btn btn-secondary">Close Details</button>
                </div>
            )}

            {!isLoading && !error && !showCreateForm && !selectedTicket && (
                <TicketList
                    tickets={tickets}
                    onTicketSelect={handleTicketSelect}
                    userRole={userRole}
                />
            )}
             {!isLoading && !error && tickets.length === 0 && !showCreateForm && !selectedTicket && (
                <p>No tickets found.</p> // This might be redundant if TicketList handles empty state
            )}
        </div>
    );
};

export default TicketsPage;
