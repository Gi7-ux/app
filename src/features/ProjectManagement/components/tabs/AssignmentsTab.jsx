import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';
import { getApiUrl, API_ENDPOINTS } from '../../../../config/api.js';

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
                {freelancers && Array.isArray(freelancers) && freelancers.map(f => <option key={f.email || f.name} value={f.name}>{f.name}</option>)}
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
            id: Date.now().toString(), // Temporary ID for testing
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

export const AssignmentsTab = ({ project, onUpdateProject }) => {
    const [assignments, setAssignments] = useState(project.assignments || []);
    const [freelancers, setFreelancers] = useState([]);

    useEffect(() => {
        // Initialize with project assignments if available, otherwise fetch from API
        if (project.assignments && project.assignments.length > 0) {
            setAssignments(project.assignments);
        } else {
            const fetchAssignments = async () => {
                try {
                    const { AuthService } = await import('../../../../services/AuthService.js');
                    const token = AuthService.getAccessToken();
                    if (!AuthService.isAuthenticated()) {
                        await AuthService.logout();
                        window.location.href = '/login';
                        return;
                    }
                    const url = getApiUrl(API_ENDPOINTS.ASSIGNMENTS.GET, { project_id: project.id });
                    const response = await fetch(url, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.status === 401) {
                        await AuthService.logout();
                        window.location.href = '/login';
                        return;
                    }
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
        }

        const fetchFreelancers = async () => {
            try {
                const { AuthService } = await import('../../../../services/AuthService.js');
                const token = AuthService.getAccessToken();
                if (!AuthService.isAuthenticated()) {
                    await AuthService.logout();
                    window.location.href = '/login';
                    return;
                }
                const url = getApiUrl(API_ENDPOINTS.USERS.LIST_FREELANCERS);
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) {
                    await AuthService.logout();
                    window.location.href = '/login';
                    return;
                }
                if (response.ok) {
                    const data = await response.json();
                    setFreelancers(Array.isArray(data) ? data : []);
                } else {
                    console.error('Failed to fetch freelancers:', response.status, response.statusText);
                    setFreelancers([]); // Ensure it's always an array
                }
            } catch (error) {
                console.error('Error fetching freelancers:', error);
                setFreelancers([]); // Ensure it's always an array
            }
        };
        fetchFreelancers();
    }, [project.id]);

    const saveAssignment = async (assignment) => {
        try {
            const { AuthService } = await import('../../../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const saveUrl = getApiUrl(API_ENDPOINTS.ASSIGNMENTS.SAVE);
            const saveResponse = await fetch(saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...assignment, project_id: project.id })
            });
            if (saveResponse.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            if (!saveResponse.ok) {
                console.error('Failed to save assignment:', saveResponse.status, saveResponse.statusText);
                return;
            }

            // Re-fetch assignments
            const fetchUrl = getApiUrl(API_ENDPOINTS.ASSIGNMENTS.GET, { project_id: project.id });
            const fetchResponse = await fetch(fetchUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (fetchResponse.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            if (fetchResponse.ok) {
                setAssignments(await fetchResponse.json());
            } else {
                console.error('Failed to re-fetch assignments after save:', fetchResponse.status, fetchResponse.statusText);
            }
        } catch (error) {
            console.error('Error in saveAssignment:', error);
        }
    };

    const handleUpdateAssignment = (updatedAssignment) => {
        const updatedAssignments = assignments.map(a => a.id === updatedAssignment.id ? updatedAssignment : a);
        setAssignments(updatedAssignments);

        // Call onUpdateProject if provided (for testing and parent components)
        if (onUpdateProject) {
            onUpdateProject({ ...project, assignments: updatedAssignments });
        }

        // Also save to API
        saveAssignment(updatedAssignment);
    };

    const handleAddAssignment = () => {
        const title = window.prompt('Enter new assignment title:');
        if (title && title.trim() !== '') {
            const newAssignment = {
                id: Date.now().toString(), // Temporary ID for testing
                title: title.trim(),
                tasks: []
            };
            const updatedAssignments = [...assignments, newAssignment];
            setAssignments(updatedAssignments);

            // Call onUpdateProject if provided (for testing and parent components)
            if (onUpdateProject) {
                onUpdateProject({ ...project, assignments: updatedAssignments });
            }

            // Also save to API
            saveAssignment(newAssignment);
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
    onUpdateProject: PropTypes.func,
};
