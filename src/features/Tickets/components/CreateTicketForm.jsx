import React, { useState } from 'react';
import { ticketApi } from '../ticketApi'; // Assuming ticketApi.js is in the parent directory
import './CreateTicketForm.css'; // We'll create this stylesheet

const CreateTicketForm = ({ onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('GENERAL_INQUIRY'); // Default category
    const [priority, setPriority] = useState('Medium'); // Default priority
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Categories available for users to select when creating a ticket
    const userCreatableCategories = [
        { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
        { value: 'TECHNICAL_ISSUE', label: 'Technical Issue' },
        { value: 'FEEDBACK_SUGGESTION', label: 'Feedback/Suggestion' },
        // Role-specific categories could be conditionally added here based on user role
        // For simplicity, keeping it common for now. The backend validates allowed categories.
        // Example: if userRole === 'client', add client-specific ones.
        { value: 'PROJECT_INQUIRY', label: 'Project Inquiry' },
        { value: 'BILLING_ISSUE', label: 'Billing Issue' },
        { value: 'APPLICATION_INQUIRY', label: 'Application Inquiry' },
        { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            setIsSubmitting(false);
            return;
        }

        try {
            await ticketApi.createTicket({ title, description, category, priority });
            setTitle('');
            setDescription('');
            setCategory('GENERAL_INQUIRY');
            setPriority('Medium');
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.message || 'Failed to create ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-ticket-form-container">
            <h3>Create New Support Ticket</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="create-ticket-form">
                <div className="form-group">
                    <label htmlFor="ticket-title">Title</label>
                    <input
                        type="text"
                        id="ticket-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="ticket-description">Description</label>
                    <textarea
                        id="ticket-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="5"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="ticket-category">Category</label>
                    <select
                        id="ticket-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
                    >
                        {userCreatableCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="ticket-priority">Priority</label>
                    <select
                        id="ticket-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        disabled={isSubmitting}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                    {onCancel && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateTicketForm;
