import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../../utils/dateFormatter'; // Assuming a date formatter utility

const TicketListItem = ({ ticket, onSelect, userRole }) => {
    const { id, title, category, status, priority, updated_at, user_name, user_email } = ticket;

    const handleSelect = () => {
        if (onSelect) {
            onSelect(ticket); // Pass the whole ticket object
        }
    };

    // A simple mapping for display names of categories
    const categoryDisplayNames = {
        GENERAL_INQUIRY: 'General Inquiry',
        TECHNICAL_ISSUE: 'Tech Issue',
        FEEDBACK_SUGGESTION: 'Feedback',
        PROJECT_INQUIRY: 'Project Inquiry',
        BILLING_ISSUE: 'Billing',
        FREELANCER_CONCERN: 'Freelancer Concern',
        APPLICATION_INQUIRY: 'Application Inquiry',
        PAYMENT_ISSUE: 'Payment',
        CLIENT_CONCERN: 'Client Concern',
        USER_MANAGEMENT: 'User Mgt.',
        PLATFORM_MODERATION: 'Moderation'
    };

    const getCategoryDisplayName = (catKey) => {
        return categoryDisplayNames[catKey] || catKey;
    }

    return (
        <li className={`ticket-list-item status-${status?.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="item-detail id">#{id}</div>
            <div className="item-detail title">{title}</div>
            <div className="item-detail category">{getCategoryDisplayName(category)}</div>
            <div className="item-detail status">{status}</div>
            <div className="item-detail priority">{priority}</div>
            {userRole === 'admin' && (
                <div className="item-detail user" title={user_email}>
                    {user_name || 'N/A'}
                </div>
            )}
            <div className="item-detail last-updated">{formatDate(updated_at)}</div>
            <div className="item-detail actions">
                <button onClick={handleSelect} className="btn-view-details">
                    View
                </button>
                {/* Admin-specific actions like quick edit/delete could go here */}
            </div>
        </li>
    );
};


TicketListItem.propTypes = {
    ticket: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        category: PropTypes.string,
        status: PropTypes.string,
        priority: PropTypes.string,
        updated_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        user_name: PropTypes.string,
        user_email: PropTypes.string,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    userRole: PropTypes.string.isRequired,
};

export default TicketListItem;
