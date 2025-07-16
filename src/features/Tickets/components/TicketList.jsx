import React from 'react';
import PropTypes from 'prop-types';
import TicketListItem from './TicketListItem'; // We'll create this next
import './TicketList.css'; // We'll create this stylesheet

const TicketList = ({ tickets, onTicketSelect, userRole }) => {
    if (!tickets || tickets.length === 0) {
        return <p className="no-tickets-message">You currently have no support tickets.</p>;
    }

    return (
        <div className="ticket-list-container">
            <div className="ticket-list-header">
                <div className="header-item id">ID</div>
                <div className="header-item title">Title</div>
                <div className="header-item category">Category</div>
                <div className="header-item status">Status</div>
                <div className="header-item priority">Priority</div>
                {userRole === 'admin' && <div className="header-item user">User</div>}
                <div className="header-item last-updated">Last Updated</div>
                <div className="header-item actions">Actions</div>
            </div>
            <ul className="ticket-list">
                {tickets.map(ticket => (
                    <TicketListItem
                        key={ticket.id}
                        ticket={ticket}
                        onSelect={onTicketSelect}
                        userRole={userRole}
                    />
                ))}
            </ul>
        </div>
    );
};


TicketList.propTypes = {
    tickets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            category: PropTypes.string,
            status: PropTypes.string,
            priority: PropTypes.string,
            updated_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            user_name: PropTypes.string,
            user_email: PropTypes.string,
        })
    ).isRequired,
    onTicketSelect: PropTypes.func.isRequired,
    userRole: PropTypes.string.isRequired,
};

export default TicketList;
