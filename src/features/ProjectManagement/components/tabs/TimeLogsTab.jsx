import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';

export const TimeLogsTab = ({ project, onUpdateProject }) => {
    const [timeLogs, setTimeLogs] = useState([]);
    const [isAddingTimeLog, setIsAddingTimeLog] = useState(false);
    const [newTimeLog, setNewTimeLog] = useState({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
    });

    const fetchTimeLogs = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/timelogs/read.php?project_id=${project.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTimeLogs(data.records || []);
            }
        } catch (error) {
            console.error('Error fetching time logs:', error);
        }
    };

    useEffect(() => {
        fetchTimeLogs();
    }, [project.id]);

    const handleAddTimeLog = async () => {
        if (!newTimeLog.hours || !newTimeLog.description) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/timelogs/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: project.id,
                    date: newTimeLog.date,
                    hours: parseFloat(newTimeLog.hours),
                    description: newTimeLog.description
                })
            });

            if (response.ok) {
                fetchTimeLogs();
                setNewTimeLog({
                    date: new Date().toISOString().split('T')[0],
                    hours: '',
                    description: ''
                });
                setIsAddingTimeLog(false);
            }
        } catch (error) {
            console.error('Error adding time log:', error);
        }
    };

    const totalHours = timeLogs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0);

    return (
        <div className="time-logs-tab">
            <div className="time-logs-header">
                <div className="header-info">
                    <h3>Time Logs</h3>
                    <div className="time-summary">
                        <span className="total-hours">Total: {totalHours.toFixed(1)} hours</span>
                    </div>
                </div>
                <button
                    className="add-time-log-btn primary-btn"
                    onClick={() => setIsAddingTimeLog(true)}
                >
                    {ICONS.plus}
                    <span>Add Time Entry</span>
                </button>
            </div>

            {isAddingTimeLog && (
                <div className="add-time-log-form">
                    <h4>Add Time Entry</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={newTimeLog.date}
                                onChange={(e) => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Hours</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={newTimeLog.hours}
                                onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                                placeholder="0.0"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={newTimeLog.description}
                            onChange={(e) => setNewTimeLog({ ...newTimeLog, description: e.target.value })}
                            placeholder="What did you work on?"
                            rows="3"
                        />
                    </div>
                    <div className="form-actions">
                        <button
                            className="cancel-btn secondary-btn"
                            onClick={() => setIsAddingTimeLog(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="save-btn primary-btn"
                            onClick={handleAddTimeLog}
                        >
                            Save Time Entry
                        </button>
                    </div>
                </div>
            )}

            <div className="time-logs-list">
                {timeLogs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">{ICONS.clock}</div>
                        <h4>No time entries yet</h4>
                        <p>Start tracking time by adding your first entry.</p>
                    </div>
                ) : (
                    timeLogs.map(log => (
                        <div key={log.id} className="time-log-item">
                            <div className="time-log-header">
                                <div className="time-log-date">
                                    {new Date(log.date).toLocaleDateString()}
                                </div>
                                <div className="time-log-hours">
                                    {parseFloat(log.hours).toFixed(1)} hours
                                </div>
                            </div>
                            <div className="time-log-description">
                                {log.description}
                            </div>
                            <div className="time-log-meta">
                                <span className="logged-by">
                                    Logged by: {log.user_name || 'Unknown'}
                                </span>
                                <span className="logged-at">
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

TimeLogsTab.propTypes = {
    project: PropTypes.object.isRequired,
    onUpdateProject: PropTypes.func
};
