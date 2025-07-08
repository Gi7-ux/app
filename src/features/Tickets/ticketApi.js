import apiClient from '../../api/apiClient'; // Adjust path as necessary

const TICKET_API_URL = '/tickets'; // Base URL for ticket endpoints

export const ticketApi = {
    /**
     * Creates a new ticket.
     * @param {object} ticketData - Data for the new ticket (title, description, category, priority).
     * @returns {Promise<object>} The created ticket data.
     */
    createTicket: async (ticketData) => {
        try {
            const response = await apiClient.post(`${TICKET_API_URL}/create.php`, ticketData);
            return response.data;
        } catch (error) {
            console.error('Error creating ticket:', error.response || error.message);
            throw error.response?.data || { message: 'An unexpected error occurred while creating the ticket.' };
        }
    },

    /**
     * Fetches tickets.
     * @param {object} params - Optional query parameters for filtering (status, priority, category, page, limit).
     * @returns {Promise<object>} The list of tickets and pagination info.
     */
    getTickets: async (params = {}) => {
        try {
            const response = await apiClient.get(`${TICKET_API_URL}/read.php`, { params });
            return response.data; // Expects { records: [], ... }
        } catch (error) {
            console.error('Error fetching tickets:', error.response || error.message);
            throw error.response?.data || { message: 'An unexpected error occurred while fetching tickets.' };
        }
    },

    /**
     * Fetches a single ticket by its ID.
     * @param {number|string} ticketId - The ID of the ticket to fetch.
     * @returns {Promise<object>} The ticket data.
     */
    getTicketById: async (ticketId) => {
        try {
            // read.php can fetch by id if 'ticket_id' GET param is provided
            const response = await apiClient.get(`${TICKET_API_URL}/read.php`, { params: { ticket_id: ticketId } });
            // The response will be an array of records, even for a single ID.
            // Assuming if a ticket is found, it will be the first and only item.
            if (response.data && response.data.records && response.data.records.length > 0) {
                return response.data.records[0];
            } else {
                throw { message: 'Ticket not found.' }; // Or handle as needed
            }
        } catch (error) {
            console.error(`Error fetching ticket ${ticketId}:`, error.response || error.message);
            throw error.response?.data || { message: `An unexpected error occurred while fetching ticket ${ticketId}.` };
        }
    },

    /**
     * Updates a ticket (Admin only).
     * @param {number|string} ticketId - The ID of the ticket to update.
     * @param {object} updateData - Data to update (e.g., status, priority, category).
     * @returns {Promise<object>} The success message or updated ticket data.
     */
    updateTicket: async (ticketId, updateData) => {
        try {
            const response = await apiClient.put(`${TICKET_API_URL}/update.php`, { ticket_id: ticketId, ...updateData });
            return response.data;
        } catch (error) {
            console.error(`Error updating ticket ${ticketId}:`, error.response || error.message);
            throw error.response?.data || { message: `An unexpected error occurred while updating ticket ${ticketId}.` };
        }
    },

    /**
     * Deletes a ticket (Admin only).
     * @param {number|string} ticketId - The ID of the ticket to delete.
     * @returns {Promise<object>} The success message.
     */
    deleteTicket: async (ticketId) => {
        try {
            // DELETE request might send ID in URL or body. Our PHP script checks both.
            // Sending as query param for consistency with GET by ID.
            const response = await apiClient.delete(`${TICKET_API_URL}/delete.php`, { params: { id: ticketId } });
            return response.data;
        } catch (error) {
            console.error(`Error deleting ticket ${ticketId}:`, error.response || error.message);
            throw error.response?.data || { message: `An unexpected error occurred while deleting ticket ${ticketId}.` };
        }
    }
};

// Example usage:
// ticketApi.getTickets({ status: 'Open', page: 1, limit: 10 })
//   .then(data => console.log(data.records))
//   .catch(error => console.error(error.message));

// ticketApi.createTicket({ title: 'New Bug', description: '...', category: 'TECHNICAL_ISSUE', priority: 'High' })
//   .then(response => console.log(response.message, response.ticket_id))
//   .catch(error => console.error(error.message));
