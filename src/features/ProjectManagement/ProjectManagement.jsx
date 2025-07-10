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

const getStatusColor = (status) => {
    switch (status) {
        case 'Open':
            return 'status-open';
        case 'In Progress':
            return 'status-in-progress';
        case 'Pending Approval':
            return 'status-pending-approval';
        case 'Completed':
            return 'status-completed';
        case 'Archived':
            return 'status-archived';
        default:
            return 'status-default';
    }
};

export const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [freelancers, setFreelancers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [error, setError] = useState('');

    const [view, setView] = useState('cards'); // Start with cards view
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState('All');
    const [freelancerFilter, setFreelancerFilter] = useState('All');

    const fetchProjects = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/projects/read.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
                // Find client_id by name
                const client = clients.find(c => c.name === formData.clientName);
                payload = { ...formData, client_id: client ? client.id : null };
            }
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                fetchProjects();
                setIsModalOpen(false);
            } else {
                setError(data.message || 'Failed to save project.');
            }
        } catch {
            setError('An error occurred while saving project.');
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
            const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            const clientMatch = clientFilter === 'All' || p.clientName === clientFilter;
            const freelancerMatch = freelancerFilter === 'All' || p.freelancerName === freelancerFilter;
            return searchMatch && statusMatch && clientMatch && freelancerMatch;
        });
    }, [projects, searchTerm, statusFilter, clientFilter, freelancerFilter]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (view === 'details' && selectedProject) {
        return <ProjectDetailsView project={selectedProject} onBack={() => setView('list')} onUpdateProject={handleUpdateProjectDetails} />;
    }

    return (
        <>
            <div className="management-page">
                <div className="management-header">
                    <div className="header-title-group">
                        <h1>Projects</h1>
                        <div className="project-stats">
                            <div className="stat-item">
                                <span className="stat-number">{projects.length}</span>
                                <span className="stat-label">Total Projects</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{projects.filter(p => p.status === 'Open' || p.status === 'In Progress').length}</span>
                                <span className="stat-label">Active</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{projects.filter(p => p.status === 'Completed').length}</span>
                                <span className="stat-label">Completed</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="search-input"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {ICONS.search}
                        </div>
                        <button className="filter-btn">
                            {ICONS.filter}
                            <span>Filter</span>
                        </button>
                        <button className="create-btn primary-btn" onClick={handleOpenCreateModal}>
                            {ICONS.createProject}
                            <span>New Project</span>
                        </button>
                    </div>
                </div>

                <div className="management-controls">
                    <div className="view-tabs">
                        <button className={`tab-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                            {ICONS.list}
                            <span>List View</span>
                        </button>
                        <button className={`tab-btn ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>
                            {ICONS.grid}
                            <span>Card View</span>
                        </button>
                    </div>

                    <div className="filters-quick">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
                            <option value="All">All Statuses</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="filter-select">
                            <option value="All">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {view === 'list' && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Budget</th>
                                    <th>Deadline</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map(p => {
                                    const isPastDue = new Date(p.deadline) < new Date() && p.status !== 'Completed';
                                    const progress = Math.min(100, ((parseFloat(p.spend) / parseFloat(p.budget)) * 100));

                                    return (
                                        <tr key={p.id} className="project-row">
                                            <td className="project-info">
                                                <div className="project-title">{p.title}</div>
                                                <div className="project-freelancer">
                                                    Assigned to: {p.freelancerName}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="client-name">{p.clientName}</div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="progress-container">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{Math.round(progress)}%</span>
                                                </div>
                                            </td>
                                            <td className="budget-info">
                                                <div className="budget-amount">R {parseFloat(p.budget).toLocaleString()}</div>
                                                <div className="spent-amount">R {parseFloat(p.spend).toLocaleString()} spent</div>
                                            </td>
                                            <td className={isPastDue ? 'deadline-passed' : ''}>
                                                {new Date(p.deadline).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="action-icons">
                                                    <button
                                                        className="action-btn view-btn"
                                                        onClick={() => handleViewDetails(p)}
                                                        title="View Details"
                                                    >
                                                        {ICONS.view}
                                                    </button>
                                                    <button
                                                        className="action-btn edit-btn"
                                                        onClick={() => handleOpenEditModal(p)}
                                                        title="Edit Project"
                                                    >
                                                        {ICONS.edit}
                                                    </button>
                                                    <button
                                                        className="action-btn download-btn"
                                                        onClick={() => handleDownloadProject(p)}
                                                        title="Download Project Data"
                                                    >
                                                        {ICONS.download}
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleDeleteProject(p.id)}
                                                        title="Delete Project"
                                                    >
                                                        {ICONS.delete}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'cards' && (
                    <div className="projects-grid">
                        {filteredProjects.map(p => {
                            const isPastDue = new Date(p.deadline) < new Date() && p.status !== 'Completed';
                            const progress = Math.min(100, ((parseFloat(p.spend) / parseFloat(p.budget)) * 100));

                            return (
                                <div key={p.id} className="project-card" onClick={() => handleViewDetails(p)}>
                                    <div className="card-header">
                                        <div className="card-title-row">
                                            <h3 className="card-title">{p.title}</h3>
                                            <span className={`status-badge ${getStatusColor(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <div className="card-meta">
                                            <div className="client-info">
                                                <span className="label">Client:</span>
                                                <span className="value">{p.clientName}</span>
                                            </div>
                                            <div className="freelancer-info">
                                                <span className="label">Assigned to:</span>
                                                <span className="value">{p.freelancerName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        <div className="card-stats">
                                            <div className="stat-row">
                                                <div className="stat-item">
                                                    <span className="stat-label">Budget</span>
                                                    <span className="stat-value">R {parseFloat(p.budget).toLocaleString()}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-label">Deadline</span>
                                                    <span className={`stat-value ${isPastDue ? 'overdue' : ''}`}>
                                                        {new Date(p.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="progress-section">
                                            <div className="progress-header">
                                                <span className="progress-label">Progress</span>
                                                <span className="progress-percentage">{Math.round(progress)}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="action-btn secondary-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(p);
                                            }}
                                        >
                                            {ICONS.edit}
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="action-btn primary-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(p);
                                            }}
                                        >
                                            {ICONS.view}
                                            <span>View Details</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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