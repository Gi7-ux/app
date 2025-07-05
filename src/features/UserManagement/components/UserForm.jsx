import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const UserForm = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'freelancer',
        company: user?.company || '',
        rate: user?.rate || null,
        skills: user?.skills || [],
        password: '', // Only used for new user
    });

    // Use a separate state for the skills input string
    const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');

    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'name':
            case 'email':
            case 'phone':
            case 'company':
            case 'password':
                setFormData(prev => ({ ...prev, [name]: value }));
                break;
            case 'role':
                setFormData(prev => ({ ...prev, role: value }));
                break;
            case 'rate':
                setFormData(prev => ({ ...prev, rate: value ? Number(value) : null }));
                break;
        }
    };

    const handleSkillsChange = (e) => {
        setSkillsInput(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
        // Only include password if creating a new user
        const submitData = user
            ? { ...formData, skills: skillsArray }
            : { ...formData, skills: skillsArray, password: formData.password };
        if (!user && !formData.password) {
            alert('Password is required for new users.');
            return;
        }
        onSave(submitData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{user ? 'Edit User' : 'Add New User'}</h2>
                    </div>
                    <div className="modal-body">
                        <div className="form-group full-width">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!user} />
                        </div>
                        {!user && (
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange}>
                                <option value="admin">Admin</option>
                                <option value="freelancer">Freelancer</option>
                                <option value="client">Client</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="company">Company</label>
                            <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="rate">Rate (R/hr)</label>
                            <input type="number" id="rate" name="rate" value={formData.rate ?? ''} onChange={handleChange} placeholder="e.g., 700" />
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="skills">Skills</label>
                            <input type="text" id="skills" name="skills" value={skillsInput} onChange={handleSkillsChange} />
                            <p className="skills-info">Separate skills with a comma.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="modal-btn btn-cancel" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="modal-btn btn-save">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

UserForm.propTypes = {
    user: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};