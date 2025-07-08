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