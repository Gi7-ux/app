import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';
// import { mockData } from '../../../../data/data.js'; // No longer using mockData for freelancers

const TaskItem = ({ task, onUpdate, onDelete, freelancers, onSaveTask, assignmentId }) => {
    const [isEditing, setIsEditing] = useState(!task.id); // Edit immediately if it's a new task (no id yet)
    const [editedTask, setEditedTask] = useState(task);

    useEffect(() => {
        setEditedTask(task); // Sync with prop changes
        if (!task.id) setIsEditing(true); // If it's a new task from props, enter edit mode
    }, [task]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // If assigned_to_name is "Not Assigned" or empty, set assigned_to_id to null
        let finalTaskData = { ...editedTask };
        if (finalTaskData.assigned_to_id === "Not Assigned" || finalTaskData.assigned_to_id === "") {
            finalTaskData.assigned_to_id = null;
        }

        onSaveTask(finalTaskData, assignmentId); // Pass assignmentId for new tasks
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id);
        }
    };

    if (isEditing) {
        return (
            <div className="task-item editing">
                <input
                    type="text"
                    name="description"
                    value={editedTask.description || ''}
                    onChange={handleInputChange}
                    className="task-description-input"
                    placeholder="Task description"
                />
                <select name="assigned_to_id" value={editedTask.assigned_to_id || "Not Assigned"} onChange={handleInputChange}>
                    <option value="Not Assigned">Not Assigned</option>
                    {freelancers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <select name="status" value={editedTask.status || 'To Do'} onChange={handleInputChange}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
                <div className="action-icons">
                    <button onClick={handleSave} className="save-btn">{ICONS.save}</button>
                    {task.id && <button onClick={() => setIsEditing(false)} className="cancel-btn">{ICONS.cancel}</button>}
                    {/* Do not show delete for a new unsaved task, parent handles it if canceled */}
                </div>
            </div>
        );
    }

    return (
        <div className="task-item">
            <span className="task-description-text">{task.description}</span>
            <span className="task-assigned-to">{task.assigned_to_name || 'Not Assigned'}</span>
            <span className={`task-status status-${task.status?.replace(' ', '-')}`}>{task.status}</span>
            <div className="action-icons">
                <span onClick={() => setIsEditing(true)} title="Edit Task">{ICONS.edit}</span>
                <span className="delete-icon" onClick={handleDelete} title="Delete Task">{ICONS.delete}</span>
            </div>
        </div>
    );
};

TaskItem.propTypes = {
    task: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired, // Kept for potential direct update from parent if needed
    onDelete: PropTypes.func.isRequired,
    freelancers: PropTypes.array.isRequired,
    onSaveTask: PropTypes.func.isRequired,
    assignmentId: PropTypes.string.isRequired,
};


const AssignmentCard = ({ assignment, onUpdateAssignmentAPI, onDeleteAssignmentAPI, onSaveTaskAPI, onDeleteTaskAPI, freelancers, project }) => {
    const [editingTitle, setEditingTitle] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(assignment.title);

    const handleTitleChange = (e) => {
        setCurrentTitle(e.target.value);
    };

    const handleSaveTitle = async () => {
        if (currentTitle.trim() === '') {
            alert('Assignment title cannot be empty.');
            setCurrentTitle(assignment.title); // Reset to original
            setEditingTitle(false);
            return;
        }
        if (currentTitle !== assignment.title) {
            onUpdateAssignmentAPI(assignment.id, currentTitle);
        }
        setEditingTitle(false);
    };

    const handleAddTask = () => {
        // Add a placeholder for a new task, TaskItem will handle its editing state
        const tempId = `new-task-${Date.now()}`;
        const newTask = {
            id: tempId, // Temporary ID for local state management before saving
            description: '',
            assigned_to_id: "Not Assigned",
            status: 'To Do',
            isNew: true // Flag to indicate it's a new, unsaved task
        };
        // This approach requires parent to handle adding this temporary task to its state
        // For now, let's directly call onSaveTaskAPI with an empty shell, which will then call the actual API
        // This is simpler if TaskItem handles its own new state and save
        // The current onSaveTaskAPI expects a full task object.
        // Let's try a different approach: add a new task directly via API, then refresh.
        // Or, the ProjectDetailsView's onUpdateProject should handle local state updates then trigger API calls.

        // The current structure of `onSaveTaskAPI` is to be called from TaskItem.
        // So, we need to add a temporary task to the UI that then uses onSaveTaskAPI.
        // This implies `project.assignments` in `AssignmentsTab` needs to be stateful or `onUpdateProject` needs to handle temp tasks.
        // For now, let's assume `onUpdateProject` can handle adding a temporary task structure.
         const newClientTask = {
            id: null, // Will be set by backend
            description: 'New Task - Click to Edit',
            assigned_to_id: null,
            status: 'To Do',
        };
        // This is not ideal. Let's have TaskItem handle its creation form.
        // The "Add Task" button will now just add a new TaskItem in editing mode.
        // We need a way to trigger adding a "new task object" to the assignment.tasks array locally
        // and then TaskItem will call onSaveTaskAPI.
        // This still requires `AssignmentsTab` or `ProjectDetailsView` to manage this local state.

        // Simpler: prompt for description then save immediately
        const description = window.prompt("Enter new task description:");
        if (description && description.trim() !== '') {
            onSaveTaskAPI({ description: description.trim(), status: 'To Do', assigned_to_id: null }, assignment.id);
        }
    };

    const handleDeleteAssignment = () => {
        if (window.confirm('Are you sure you want to delete this assignment and all its tasks?')) {
            onDeleteAssignmentAPI(assignment.id);
        }
    };


    return (
        <div className="assignment-card">
            <div className="assignment-header">
                {editingTitle ? (
                    <input type="text" value={currentTitle} onChange={handleTitleChange} onBlur={handleSaveTitle} autoFocus />
                ) : (
                    <h2 className="assignment-title" onClick={() => setEditingTitle(true)}>{assignment.title}</h2>
                )}
                <div>
                    <button className="action-btn-sm" onClick={handleAddTask} title="Add Task">{ICONS.add}</button>
                    <button className="action-btn-sm delete-icon" onClick={handleDeleteAssignment} title="Delete Assignment">{ICONS.delete}</button>
                </div>
            </div>
            <div className="task-list">
                {assignment.tasks && assignment.tasks.map(task =>
                    <TaskItem
                        key={task.id}
                        task={task}
                        onSaveTask={onSaveTaskAPI} // Pass assignment.id along with task data
                        onDelete={onDeleteTaskAPI}
                        freelancers={freelancers}
                        assignmentId={assignment.id} // Pass assignmentId
                        onUpdate={() => {}} // Kept for prop type, but onSaveTask handles updates
                    />
                )}
                 {(!assignment.tasks || assignment.tasks.length === 0) && <p className="no-tasks-message">No tasks have been added to this assignment yet.</p>}
            </div>
        </div>
    );
};

AssignmentCard.propTypes = {
    assignment: PropTypes.object.isRequired,
    onUpdateAssignmentAPI: PropTypes.func.isRequired,
    onDeleteAssignmentAPI: PropTypes.func.isRequired,
    onSaveTaskAPI: PropTypes.func.isRequired,
    onDeleteTaskAPI: PropTypes.func.isRequired,
    freelancers: PropTypes.array.isRequired,
    project: PropTypes.object.isRequired, // Added project for context if needed
};

export const AssignmentsTab = ({ project, onUpdateProject }) => { // onUpdateProject refreshes the main project data
    const [freelancers, setFreelancers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('/api/users/list_clients_freelancers.php', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch freelancers');
                const data = await response.json();
                setFreelancers(data.freelancers || []);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFreelancers();
    }, []);

    const handleApiCall = async (apiCall, successMessage, errorMessage) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(apiCall.url, {
                method: apiCall.method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(apiCall.body)
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || errorMessage);
            }
            // alert(successMessage); // Optional: use a more subtle notification system
            onUpdateProject(); // Trigger refresh of project data from parent
        } catch (err) {
            setError(err.message);
            // alert(err.message); // Optional
        } finally {
            setLoading(false);
        }
    };

    const handleAddAssignment = async () => {
        const title = window.prompt('Enter new assignment title:');
        if (title && title.trim() !== '') {
            await handleApiCall(
                { url: '/api/assignments/create.php', method: 'POST', body: { project_id: project.id, title: title.trim() } },
                'Assignment created successfully.',
                'Failed to create assignment.'
            );
        }
    };

    const handleUpdateAssignmentAPI = async (assignmentId, newTitle) => {
        await handleApiCall(
            { url: '/api/assignments/update.php', method: 'POST', body: { id: assignmentId, title: newTitle } },
            'Assignment updated.',
            'Failed to update assignment.'
        );
    };

    const handleDeleteAssignmentAPI = async (assignmentId) => {
        await handleApiCall(
            { url: '/api/assignments/delete.php', method: 'POST', body: { id: assignmentId } },
            'Assignment deleted.',
            'Failed to delete assignment.'
        );
    };

    const handleSaveTaskAPI = async (taskData, assignmentId) => {
        const url = taskData.id && !taskData.isNew ? '/api/tasks/update.php' : '/api/tasks/create.php';
        const body = taskData.id && !taskData.isNew ?
            { id: taskData.id, description: taskData.description, status: taskData.status, assigned_to_id: taskData.assigned_to_id } :
            { assignment_id: assignmentId, description: taskData.description, status: taskData.status, assigned_to_id: taskData.assigned_to_id };

        await handleApiCall(
            { url, method: 'POST', body },
            taskData.id && !taskData.isNew ? 'Task updated.' : 'Task created.',
            taskData.id && !taskData.isNew ? 'Failed to update task.' : 'Failed to create task.'
        );
    };

    const handleDeleteTaskAPI = async (taskId) => {
        await handleApiCall(
            { url: '/api/tasks/delete.php', method: 'POST', body: { id: taskId } },
            'Task deleted.',
            'Failed to delete task.'
        );
    };

    // Ensure project.assignments is always an array
    const assignments = Array.isArray(project.assignments) ? project.assignments : [];

    return (
         <div>
            {error && <p className="error-message">{error}</p>}
            {loading && <p>Loading...</p>}
            {assignments.map(assignment =>
                <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onUpdateAssignmentAPI={handleUpdateAssignmentAPI}
                    onDeleteAssignmentAPI={handleDeleteAssignmentAPI}
                    onSaveTaskAPI={handleSaveTaskAPI}
                    onDeleteTaskAPI={handleDeleteTaskAPI}
                    freelancers={freelancers}
                    project={project}
                />
            )}
            {assignments.length === 0 && <div className="card"><p>No assignments created for this project yet.</p></div>}
            <button onClick={handleAddAssignment} className="add-assignment-btn" disabled={loading}>Add Assignment</button>
        </div>
    );
};

AssignmentsTab.propTypes = {
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
            id: `task-${Date.now()}`,
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
       onUpdate({...assignment, tasks: updatedTasks });
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
                      key={task.id} 
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
    const freelancers = useMemo(() => mockData.userManagement.users.filter(u => u.role === 'freelancer'), []);
    
    const handleUpdateAssignment = (updatedAssignment) => {
        const updatedAssignments = project.assignments.map(a => a.id === updatedAssignment.id ? updatedAssignment : a);
        onUpdateProject({ ...project, assignments: updatedAssignments });
    };

    const handleAddAssignment = () => {
        const title = window.prompt('Enter new assignment title:');
        if (title && title.trim() !== '') {
            const newAssignment = {
                id: `asg-${Date.now()}`,
                title: title.trim(),
                tasks: [],
            };
            onUpdateProject({ ...project, assignments: [...project.assignments, newAssignment] });
        }
    };

    return (
         <div>
            {project.assignments.map(assignment => 
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  onUpdate={handleUpdateAssignment}
                  freelancers={freelancers}
                />
            )}
            {project.assignments.length === 0 && <div className="card"><p>No assignments created for this project yet.</p></div>}
            <button onClick={handleAddAssignment} className="add-assignment-btn">Add Assignment</button>
        </div>
    );
};

AssignmentsTab.propTypes = {
    project: PropTypes.object.isRequired,
    onUpdateProject: PropTypes.func.isRequired,
};