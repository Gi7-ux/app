import React, { useState, useMemo, useEffect } from 'react';
import { ICONS } from '../../assets/icons.jsx';
import { ProjectForm } from './components/ProjectForm.jsx';
import { ProjectDetailsView } from './components/ProjectDetailsView.jsx';

const downloadJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [freelancers, setFreelancers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [error, setError] = useState('');

    const [view, setView] = useState('list');
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState('All');
    const [freelancerFilter, setFreelancerFilter] = useState('All');
    const [showArchived, setShowArchived] = useState(false);

    const fetchProjects = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/projects/read.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setProjects(data.records);
            } else {
                setError(data.message || 'Failed to fetch projects.');
            }
        } catch {
            setError('An error occurred while fetching projects.');
        }
    };

    const fetchClientsFreelancers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/list_clients_freelancers.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setClients(data.clients);
                setFreelancers(data.freelancers);
            }
        } catch { }
    };

    useEffect(() => {
        fetchProjects();
        fetchClientsFreelancers();
    }, []);

    // For dropdowns, use fetched clients/freelancers

    const handleOpenCreateModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (id) => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/projects/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            if (response.ok) {
                setProjects(projects.filter(p => p.id !== id));
            } else {
                setError(data.message || 'Failed to delete project.');
            }
        } catch {
            setError('An error occurred while deleting project.');
        }
    };

    const handleSaveProject = async (formData) => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            let url, method, payload;
            if (editingProject) {
                url = '/api/projects/update.php';
                method = 'POST';
                payload = { ...formData, id: editingProject.id };
            } else {
                url = '/api/projects/create.php';
                method = 'POST';
                payload = {
                    title: formData.title,
                    description: formData.description,
                    client_id: formData.client_id || formData.clientId, // Ensure client_id is used
                    budget: formData.budget,
                    deadline: formData.deadline,
                    freelancer_id: formData.freelancer_id || formData.freelancerId, // Ensure freelancer_id is used
                    status: formData.status || 'Open', // Default to 'Open' if not set
                    purchased_hours: formData.purchased_hours || formData.purchasedHours || 0
                };
                 // Remove null/undefined freelancer_id if it wasn't set
                if (!payload.freelancer_id) {
                    delete payload.freelancer_id;
                }
            }
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            if (response.ok) {
                const savedProjectId = editingProject ? editingProject.id : data.id; // If creating, API should return new ID

                // --- Handle Skills ---
                if (savedProjectId && formData.skills !== undefined) {
                    const currentSkills = formData.skills || [];
                    const originalSkills = formData.original_skills || []; // Passed from ProjectForm

                    const skillsToAdd = currentSkills.filter(s => !originalSkills.includes(s));
                    const skillsToRemove = originalSkills.filter(s => !currentSkills.includes(s));

                    const skillPromises = [];

                    skillsToAdd.forEach(skillName => {
                        skillPromises.push(
                            fetch('/api/projects/skills/add.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ project_id: savedProjectId, skill_name: skillName })
                            }).then(res => res.json().then(d => ({ok: res.ok, ...d}))) // Combine ok status with json data
                        );
                    });

                    skillsToRemove.forEach(skillName => {
                        skillPromises.push(
                            fetch('/api/projects/skills/remove.php', {
                                method: 'POST', // Or DELETE, ensure API supports it
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ project_id: savedProjectId, skill_name: skillName })
                            }).then(res => res.json().then(d => ({ok: res.ok, ...d})))
                        );
                    });

                    try {
                        const skillResults = await Promise.all(skillPromises);
                        const skillErrors = skillResults.filter(res => !res.ok);
                        if (skillErrors.length > 0) {
                            const errorMessages = skillErrors.map(e => e.message || `Failed to update skill.`).join('; ');
                            // Append to main error or show separate skill error
                            setError(prevError => prevError ? `${prevError} Some skill updates failed: ${errorMessages}` : `Some skill updates failed: ${errorMessages}`);
                        }
                    } catch (skillError) {
                         setError(prevError => prevError ? `${prevError} Error processing skills: ${skillError.message}` : `Error processing skills: ${skillError.message}`);
                    }
                }
                // --- End Handle Skills ---

                fetchProjects(); // Refresh project list (which now includes skills if read_one.php is called by details view)
                setIsModalOpen(false);
                if (view === 'details' && selectedProjectId === savedProjectId) {
                    // If currently viewing details of the saved project, refresh that specific view too
                    // This might require ProjectDetailsView to have its own fetch on prop change or a dedicated refresh function
                    // For now, fetchProjects() will update the list, and if user re-enters details view, it will be fresh.
                    // Or, if onUpdateProject is passed to ProjectDetailsView, it can be called here.
                }

            } else {
                setError(data.message || 'Failed to save project.');
            }
        } catch (err) {
            setError(`An error occurred while saving project: ${err.message}`);
        }
    };

    const handleViewDetails = (project) => {
        setSelectedProjectId(project.id);
        setView('details');
    };

    const handleUpdateProjectDetails = (updatedProject) => {
        const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
        setProjects(updatedProjects);
    };

    const handleDownloadProject = (project) => {
        downloadJSON(project, `project_${project.id}_data.json`);
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            const clientMatch = clientFilter === 'All' || p.clientName === clientFilter;
            const freelancerMatch = freelancerFilter === 'All' || p.freelancerName === freelancerFilter;
            const archivedMatch = showArchived ? true : p.status !== 'Archived';
            return searchMatch && statusMatch && clientMatch && freelancerMatch && archivedMatch;
        });
    }, [projects, searchTerm, statusFilter, clientFilter, freelancerFilter, showArchived]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (view === 'details' && selectedProject) {
        return <ProjectDetailsView project={selectedProject} onBack={() => setView('list')} onUpdateProject={handleUpdateProjectDetails} />;
    }

    return (
        <>
            <div className="management-page">
                <div className="management-header">
                    <h1>Project Management</h1>
                    <button className="create-btn" onClick={handleOpenCreateModal}>
                        {ICONS.createProject}
                        <span>Create Project</span>
                    </button>
                </div>
                <div className="management-controls">
                    <div className="filters-grid">
                        <div className="filter-group search-filter">
                            <label>Search</label>
                            <input type="text" placeholder="Title, description..." onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Client</label>
                            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
                                <option value="All">All Clients</option>
                                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Freelancer</label>
                            <select value={freelancerFilter} onChange={e => setFreelancerFilter(e.target.value)}>
                                <option value="All">All Freelancers</option>
                                {freelancers.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="filter-group archived-filter">
                        <input type="checkbox" id="show-archived" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
                        <label htmlFor="show-archived">Show Archived Projects</label>
                    </div>
                </div>
                {error && <p style={{ color: 'red', padding: '1.5rem' }}>{error}</p>}
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Client</th>
                                <th>Freelancer</th>
                                <th>Status</th>
                                <th>Budget (R)</th>
                                <th>Spend (R)</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map(p => {
                                const isPastDue = new Date(p.deadline) < new Date() && p.status !== 'Completed';
                                return (
                                    <tr key={p.id}>
                                        <td>{p.title}</td>
                                        <td>{p.clientName}</td>
                                        <td>{p.freelancerName}</td>
                                        <td><span className={`status-pill status-${p.status.replace(' ', '.')}`}>{p.status}</span></td>
                                        <td>R {parseFloat(p.budget).toLocaleString()}</td>
                                        <td>R {parseFloat(p.spend).toLocaleString()}</td>
                                        <td className={isPastDue ? 'deadline-passed' : ''}>{new Date(p.deadline).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-icons">
                                                <span onClick={() => handleViewDetails(p)} title="View Details">{ICONS.view}</span>
                                                <span onClick={() => handleOpenEditModal(p)} title="Edit Project">{ICONS.edit}</span>
                                                <span onClick={() => handleDownloadProject(p)} title="Download Project Data">{ICONS.download}</span>
                                                <span className="delete-icon" onClick={() => handleDeleteProject(p.id)} title="Delete Project">{ICONS.delete}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ProjectForm
                    project={editingProject}
                    onSave={handleSaveProject}
                    onCancel={() => setIsModalOpen(false)}
                    clients={clients}
                    freelancers={freelancers}
                />
            )}
        </>
    );
};