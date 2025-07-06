import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons';

const ProjectTasksTab = ({ project, quickTaskData, setQuickTaskData, handleCreateTask, loading, onClose }) => {
    return (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Assigned Tasks</span>
                            <button className="btn-primary task-add-btn" onClick={handleCreateTask} disabled={loading || !quickTaskData.title.trim()}>
                                {ICONS.add} Add Task
                            </button>
                        </div>
                        <div className="tasks-list tab-section-content">
                            {project.assignments && project.assignments.length > 0 ? (
                                project.assignments.map(task => (
                                    <div key={task.id} className="task-item">
                                        <div className="task-header">
                                            <strong>{task.title}</strong>
                                            <span className="task-status">{task.status || 'Todo'}</span>
                                        </div>
                                        <p>{task.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div>No tasks assigned yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Task Summary</div>
                        <div className="tab-section-content">
                            {(() => {
                                const totalTasks = project.assignments?.length || 0;
                                const completedTasks = project.assignments?.filter(a => a.status === 'Completed').length || 0;
                                const inProgressTasks = project.assignments?.filter(a => a.status === 'In Progress').length || 0;
                                const todoTasks = totalTasks - completedTasks - inProgressTasks; // Calculate Todo based on total and other statuses

                                return (
                                    <>
                                        <div><strong>Total Tasks:</strong> {totalTasks}</div>
                                        <div><strong>Completed:</strong> {completedTasks}</div>
                                        <div><strong>In Progress:</strong> {inProgressTasks}</div>
                                        <div><strong>Todo:</strong> {todoTasks}</div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="tab-section">
                        <div className="tab-section-header">Create Quick Task</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label htmlFor="task-title">Task Title</label>
                                <input
                                    type="text"
                                    id="task-title"
                                    placeholder="Enter task title"
                                    value={quickTaskData.title}
                                    onChange={(e) => setQuickTaskData({ ...quickTaskData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="task-description">Description</label>
                                <textarea
                                    id="task-description"
                                    placeholder="Enter task description"
                                    value={quickTaskData.description}
                                    onChange={(e) => setQuickTaskData({ ...quickTaskData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={handleCreateTask}
                                disabled={loading || !quickTaskData.title.trim()}
                            >
                                {loading ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
                <button type="button" className="btn-primary">Save Tasks</button>
            </div>
        </div>
    );
};

ProjectTasksTab.propTypes = {
    project: PropTypes.object.isRequired,
    quickTaskData: PropTypes.object.isRequired,
    setQuickTaskData: PropTypes.func.isRequired,
    handleCreateTask: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ProjectTasksTab;
