import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';

const TaskItem = ({ task, onUpdate, onDelete, freelancers }) => {
    return (
        <div className="task-item">
            <input
                type="text"
                value={task.description}
                onChange={e => onUpdate({ ...task, description: e.target.value })}
                className="task-description-input"
            />
            <select value={task.assignedTo} onChange={e => onUpdate({ ...task, assignedTo: e.target.value })}>
                <option value="Not Assigned">Not Assigned</option>
                {freelancers.map(f => <option key={f.email} value={f.name}>{f.name}</option>)}
            </select>
            <select value={task.status} onChange={e => onUpdate({ ...task, status: e.target.value })}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
            </select>
            <div className="action-icons">
                <span className="delete-icon" onClick={onDelete}>{ICONS.delete}</span>
            </div>
        </div>
    );
};

TaskItem.propTypes = {
    task: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    freelancers: PropTypes.array.isRequired,
};


const AssignmentCard = ({ assignment, onUpdate, freelancers }) => {
    const handleAddTask = () => {
        const description = window.prompt("Enter new task description:");
        if (!description || description.trim() === '') return;
        const newTask = {
            description: description,
            assignedTo: 'Not Assigned',
            status: 'To Do'
        };
        onUpdate({ ...assignment, tasks: [...assignment.tasks, newTask] });
    };
    const handleUpdateTask = (updatedTask) => {
        const updatedTasks = assignment.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        onUpdate({ ...assignment, tasks: updatedTasks });
    };
    const handleDeleteTask = (taskId) => {
        const updatedTasks = assignment.tasks.filter(t => t.id !== taskId);
        onUpdate({ ...assignment, tasks: updatedTasks });
    };
    return (
        <div className="assignment-card">
            <div className="assignment-header">
                <h2 className="assignment-title">{assignment.title}</h2>
                <button className="action-btn-sm" onClick={handleAddTask}>Add Task</button>
            </div>
            <div className="task-list">
                {assignment.tasks.map(task =>
                    <TaskItem
                        key={task.id || task.description}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onDelete={() => handleDeleteTask(task.id)}
                        freelancers={freelancers}
                    />
                )}
                {assignment.tasks.length === 0 && <p className="no-tasks-message">No tasks have been added to this assignment yet.</p>}
            </div>
        </div>
    );
};

AssignmentCard.propTypes = {
    assignment: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    freelancers: PropTypes.array.isRequired,
};

export const AssignmentsTab = ({ project }) => {
    const [assignments, setAssignments] = useState([]);
    const [freelancers, setFreelancers] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`/api/assignments/get.php?project_id=${project.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setAssignments(await response.json());
                } else {
                    console.error('Failed to fetch assignments:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching assignments:', error);
            }
        };
        fetchAssignments();
        // TODO: Fetch freelancers from API if needed
    }, [project.id]);

    const saveAssignment = async (assignment) => {
        try {
            const token = localStorage.getItem('access_token');
            const saveResponse = await fetch('/api/assignments/save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...assignment, project_id: project.id })
            });

            if (!saveResponse.ok) {
                console.error('Failed to save assignment:', saveResponse.status, saveResponse.statusText);
                return;
            }

            // Re-fetch assignments
            const fetchResponse = await fetch(`/api/assignments/get.php?project_id=${project.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (fetchResponse.ok) {
                setAssignments(await fetchResponse.json());
            } else {
                console.error('Failed to re-fetch assignments after save:', fetchResponse.status, fetchResponse.statusText);
            }
        } catch (error) {
            console.error('Error in saveAssignment:', error);
        }
    };

    const handleUpdateAssignment = (updatedAssignment) => saveAssignment(updatedAssignment);

    const handleAddAssignment = () => {
        const title = window.prompt('Enter new assignment title:');
        if (title && title.trim() !== '') {
            saveAssignment({ title: title.trim(), tasks: [] });
        }
    };

    return (
        <div>
            {assignments.map(assignment =>
                <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onUpdate={handleUpdateAssignment}
                    freelancers={freelancers}
                />
            )}
            {assignments.length === 0 && <div className="card"><p>No assignments created for this project yet.</p></div>}
            <button onClick={handleAddAssignment} className="add-assignment-btn">Add Assignment</button>
        </div>
    );
};

AssignmentsTab.propTypes = {
    project: PropTypes.object.isRequired,
};
