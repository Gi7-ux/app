import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../../assets/icons.jsx';
import { mockData } from '../../../../data/data.js';

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