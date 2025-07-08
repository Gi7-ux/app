import React from 'react';
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

export default TicketList;
