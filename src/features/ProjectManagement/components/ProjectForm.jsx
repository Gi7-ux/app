
import React, { useState } from 'react';
import PropTypes from 'prop-types';

function ProjectForm({ project, onSave, onCancel, clients, freelancers }) {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        clientId: project?.client_id || (clients.length > 0 ? clients[0].id : ''),
        freelancerId: project?.freelancer_id || (freelancers.length > 0 ? freelancers[0].id : ''),
        budget: project?.budget || 0,
        deadline: project?.deadline ? project.deadline.split('T')[0] : '',
        skills: project?.skills || [],
        purchasedHours: project?.purchasedHours || 0,
    });

    const [skillInput, setSkillInput] = useState('');
    const [showAddClient, setShowAddClient] = useState(false);
    const [showAddFreelancer, setShowAddFreelancer] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', company: '', phone: '', rate: '' });
    const [newFreelancer, setNewFreelancer] = useState({ name: '', email: '', company: '', phone: '', rate: '' });
    const [addUserError, setAddUserError] = useState('');
    const [addUserSuccess, setAddUserSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'budget' || name === 'purchasedHours') ? Number(value) : value,
        }));
    };

    const handleAddUser = async (role) => {
        setAddUserError('');
        setAddUserSuccess('');
        const user = role === 'client' ? newClient : newFreelancer;
        if (!user.name || !user.email) {
            setAddUserError('Name and email are required.');
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...user, role, password: 'password' })
            });
            const data = await response.json();
            if (response.ok) {
                setAddUserSuccess(`${role === 'client' ? 'Client' : 'Freelancer'} added! Please refresh the list.`);
                setShowAddClient(false);
                setShowAddFreelancer(false);
            } else {
                setAddUserError(data.message || 'Failed to add user.');
            }
        } catch {
            setAddUserError('An error occurred while adding user.');
        }
    };

    const handleAddSkill = () => {
        if (skillInput && !formData.skills.includes(skillInput)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
        }
        setSkillInput('');
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            client_id: formData.clientId,
            freelancer_id: formData.freelancerId
        };
        if (project && project.skills) { // If editing, pass original skills for diffing
            payload.original_skills = project.skills;
        }
        onSave(payload);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{project ? 'Edit Project' : 'Create New Project'} (Admin)</h2>
                        <button type="button" className="close-btn" onClick={onCancel}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group full-width">
                            <label htmlFor="title">Project Title</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="description">Project Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="budget">Budget (R)</label>
                            <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deadline">Deadline</label>
                            <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="clientId">Assign Client</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} required>
                                    <option value="" disabled>Select a client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setShowAddClient(v => !v)} style={{ fontSize: '1.2em' }}>+ Add</button>
                            </div>
                            {showAddClient && (
                                <div className="add-user-form">
                                    <input type="text" placeholder="Name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                                    <input type="email" placeholder="Email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
                                    <input type="text" placeholder="Company" value={newClient.company} onChange={e => setNewClient({ ...newClient, company: e.target.value })} />
                                    <input type="text" placeholder="Phone" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
                                    <button type="button" onClick={() => handleAddUser('client')}>Save Client</button>
                                    <button type="button" onClick={() => setShowAddClient(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="freelancerId">Assign Freelancer</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <select id="freelancerId" name="freelancerId" value={formData.freelancerId} onChange={handleChange} required>
                                    <option value="" disabled>Select a freelancer</option>
                                    {freelancers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setShowAddFreelancer(v => !v)} style={{ fontSize: '1.2em' }}>+ Add</button>
                            </div>
                            {showAddFreelancer && (
                                <div className="add-user-form">
                                    <input type="text" placeholder="Name" value={newFreelancer.name} onChange={e => setNewFreelancer({ ...newFreelancer, name: e.target.value })} />
                                    <input type="email" placeholder="Email" value={newFreelancer.email} onChange={e => setNewFreelancer({ ...newFreelancer, email: e.target.value })} />
                                    <input type="text" placeholder="Company" value={newFreelancer.company} onChange={e => setNewFreelancer({ ...newFreelancer, company: e.target.value })} />
                                    <input type="text" placeholder="Phone" value={newFreelancer.phone} onChange={e => setNewFreelancer({ ...newFreelancer, phone: e.target.value })} />
                                    <input type="number" placeholder="Rate" value={newFreelancer.rate} onChange={e => setNewFreelancer({ ...newFreelancer, rate: e.target.value })} />
                                    <button type="button" onClick={() => handleAddUser('freelancer')}>Save Freelancer</button>
                                    <button type="button" onClick={() => setShowAddFreelancer(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="purchasedHours">Purchased Hours</label>
                            <input type="number" id="purchasedHours" name="purchasedHours" value={formData.purchasedHours} onChange={handleChange} />
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="skills">Skills Required (optional)</label>
                            <div className="skills-input-group">
                                <input
                                    type="text"
                                    id="skills"
                                    placeholder="e.g., Revit, AutoCAD"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                />
                                <button type="button" onClick={handleAddSkill}>Add Skill</button>
                            </div>
                            <div className="form-skills-container">
                                {formData.skills.map(skill => (
                                    <span key={skill} className="form-skill-tag">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveSkill(skill)}>&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="modal-btn btn-cancel" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="modal-btn btn-save">{project ? 'Save Changes' : 'Create Project'}</button>
                    </div>
                    {addUserError && <p style={{ color: 'red' }}>{addUserError}</p>}
                    {addUserSuccess && <p style={{ color: 'green' }}>{addUserSuccess}</p>}
                </form>
            </div>
        </div>
    );
}

ProjectForm.propTypes = {
    project: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired,
    freelancers: PropTypes.array.isRequired,
};

export { ProjectForm };