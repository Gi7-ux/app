import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons';

const ProjectTimeLogsTab = ({ project, onClose }) => {
    return (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="total-time">
                        <strong>Total Time Logged:</strong> {project.totalTime || '00:00'}
                    </div>
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Time Entries</span>
                            <button className="btn-primary timelog-add-btn">
                                {ICONS.clock} Log Time
                            </button>
                        </div>
                        <div className="timelogs-list tab-section-content">
                            <div>No time logs recorded yet.</div>
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Record New Time</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" />
                            </div>
                            <div className="form-group">
                                <label>Hours</label>
                                <input type="number" min="0.25" step="0.25" />
                            </div>
                            <div className="form-group">
                                <label>Task</label>
                                <select>
                                    <option value="">Select a task</option>
                                    {project.assignments?.map(task => (
                                        <option key={task.id} value={task.id}>{task.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Briefly describe the work done"></textarea>
                            </div>
                            <button className="btn-primary">{ICONS.clock} Save Time Entry</button>
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

ProjectTimeLogsTab.propTypes = {
    project: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ProjectTimeLogsTab;
