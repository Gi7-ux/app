import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../assets/icons.jsx';
import './JobCard.css';

const JobCard = ({
    id,
    title,
    description,
    dueDate,
    assignedTo = [],
    tasks = [],
    onTaskAdd,
    onTaskToggle,
    onDelete
}) => {
    const [newTask, setNewTask] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const completedTasks = tasks.filter(task => task.completed).length;
    const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    const handleAddTask = () => {
        if (newTask.trim() && onTaskAdd) {
            onTaskAdd(id, newTask);
            setNewTask('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = new Date(dueDate) < new Date() && completionPercentage < 100;

    return (
        <div className={`job-card ${isOverdue ? 'overdue' : ''}`}>
            <div className="job-card-header">
                <div className="job-title-row">
                    <h3 className="job-title">{title}</h3>
                    <div className="job-actions">
                        <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                            {ICONS.calendar}
                            {formatDate(dueDate)}
                        </span>
                        <button
                            className="expand-btn"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? ICONS.chevronUp : ICONS.chevronDown}
                        </button>
                        {onDelete && (
                            <button
                                className="delete-btn"
                                onClick={() => onDelete(id)}
                                title="Delete job card"
                            >
                                {ICONS.delete}
                            </button>
                        )}
                    </div>
                </div>
                <p className="job-description">{description}</p>
            </div>

            <div className="job-card-content">
                {assignedTo.length > 0 && (
                    <div className="assigned-section">
                        <h4 className="section-title">Assigned To:</h4>
                        <div className="assigned-users">
                            {assignedTo.map((user, index) => (
                                <div key={index} className="user-avatar">
                                    <div className="avatar-circle">
                                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span className="user-name">{user.name || 'Unknown'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-stats">
                            {completedTasks}/{tasks.length} tasks
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                {isExpanded && (
                    <div className="tasks-section">
                        <h4 className="section-title">Tasks:</h4>
                        <div className="tasks-list">
                            {tasks.map((task) => (
                                <div key={task.id} className="task-item">
                                    <label className="task-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => onTaskToggle && onTaskToggle(id, task.id)}
                                        />
                                        <span className="checkmark"></span>
                                        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                                            {task.title}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="add-task-section">
                            <div className="add-task-input">
                                <input
                                    type="text"
                                    placeholder="Add a new task..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    className="add-task-btn"
                                    onClick={handleAddTask}
                                    disabled={!newTask.trim()}
                                >
                                    {ICONS.plus}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

JobCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    assignedTo: PropTypes.array,
    tasks: PropTypes.array,
    onTaskAdd: PropTypes.func,
    onTaskToggle: PropTypes.func,
    onDelete: PropTypes.func
};

export default JobCard;
