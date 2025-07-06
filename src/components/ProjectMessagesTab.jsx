import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons';

const ProjectMessagesTab = ({ onClose }) => {
    return (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Project Messages</div>
                        <div className="messages-list tab-section-content">
                            <div>No messages yet for this project.</div>
                        </div>
                    </div>
                    <div className="message-composer">
                        <textarea placeholder="Write a message..."></textarea>
                        <button className="btn-primary">{ICONS.send} Send</button>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Message Settings</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label>Notifications</label>
                                <select>
                                    <option value="all">All Messages</option>
                                    <option value="mentions">Mentions Only</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Message Recipients</label>
                                <select>
                                    <option value="all">All Team Members</option>
                                    <option value="client">Client Only</option>
                                    <option value="freelancer">Freelancer Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="tab-section">
                        <div className="tab-section-header">Quick Templates</div>
                        <div className="tab-section-content">
                            <button className="btn-secondary">Request Update</button>
                            <button className="btn-secondary">Schedule Meeting</button>
                            <button className="btn-secondary">Payment Reminder</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

ProjectMessagesTab.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default ProjectMessagesTab;
