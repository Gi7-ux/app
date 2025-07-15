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
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [clientFilter, setClientFilter] = useState('All Clients');
    const [freelancerFilter, setFreelancerFilter] = useState('All Freelancers');
    const [showArchived, setShowArchived] = useState(false);

    const fetchProjects = async () => {
        setError('');
        try {
            const { AuthService } = await import('../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/projects/read.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 401) {
                await AuthService.logout();
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
            const { AuthService } = await import('../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/users/list_clients_freelancers.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
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
            const { AuthService } = await import('../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/projects/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id })
            });
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
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
            const { AuthService } = await import('../../services/AuthService.js');
            const token = AuthService.getAccessToken();
            if (!AuthService.isAuthenticated()) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
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
            if (response.status === 401) {
                await AuthService.logout();
                window.location.href = '/login';
                return;
            }
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
            const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const statusMatch = statusFilter === 'All Statuses' || p.status === statusFilter;
            const clientMatch = clientFilter === 'All Clients' || p.clientName === clientFilter;
            const freelancerMatch = freelancerFilter === 'All Freelancers' || p.freelancerName === freelancerFilter;
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
                    <h2 style={{ fontWeight: 700, fontSize: '2rem', margin: 0, color: 'var(--text-primary)' }}>Project Management</h2>
                    <button className="primary-btn" style={{ minWidth: 160, display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleOpenCreateModal}>
                        <span className="icon">{ICONS.createProject}</span>
                        <span>Create Project</span>
                    </button>
                </div>
                <div className="filters-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center', margin: '2rem 0 1.5rem 0', background: 'var(--card-bg)', borderRadius: 12, padding: '1.5rem' }}>
                    <div className="filter-group search-filter">
                        <input
                            type="text"
                            placeholder="Title, description..."
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
                            <option value="All Statuses">All Statuses</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="filter-select">
                            <option value="All Clients">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <select value={freelancerFilter} onChange={e => setFreelancerFilter(e.target.value)} className="filter-select">
                            <option value="All Freelancers">All Freelancers</option>
                            {freelancers.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group archived-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="show-archived"
                            checked={showArchived}
                            onChange={e => setShowArchived(e.target.checked)}
                        />
                        <label htmlFor="show-archived" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Show Archived Projects</label>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>TITLE</th>
                                <th>CLIENT</th>
                                <th>FREELANCER</th>
                                <th>STATUS</th>
                                <th>BUDGET (R)</th>
                                <th>SPEND (R)</th>
                                <th>DEADLINE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map(p => {
                                const isPastDue = new Date(p.deadline) < new Date() && p.status !== 'Completed';
                                return (
                                    <tr key={p.id} className="project-row">
                                        <td className="project-title">{p.title}</td>
                                        <td>{p.clientName}</td>
                                        <td>{p.freelancerName || 'Not Assigned'}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(p.status)}`}>{p.status}</span>
                                        </td>
                                        <td>R {parseFloat(p.budget).toLocaleString()}</td>
                                        <td>R {parseFloat(p.spend).toLocaleString()}</td>
                                        <td className={isPastDue ? 'deadline-passed' : ''} style={isPastDue ? { fontWeight: 700 } : {}}>
                                            {new Date(p.deadline).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-icons">
                                                <button className="action-btn view-btn" onClick={() => handleViewDetails(p)} title="View Details"><span className="icon">{ICONS.view}</span></button>
                                                <button className="action-btn edit-btn" onClick={() => handleOpenEditModal(p)} title="Edit Project"><span className="icon">{ICONS.edit}</span></button>
                                                <button className="action-btn download-btn" onClick={() => handleDownloadProject(p)} title="Download Project Data"><span className="icon">{ICONS.download}</span></button>
                                                <button className="action-btn delete-btn" onClick={() => handleDeleteProject(p.id)} title="Delete Project"><span className="icon">{ICONS.delete}</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
            </div>
        </>
    );
};