import React, { useState, useEffect } from 'react';
import { ICONS } from '../../assets/icons.jsx';
import { UserForm } from './components/UserForm.jsx';
import { AuthService } from '../../services/AuthService.js';
import { LiquidGlassCard, LiquidGlassButton, LiquidGlassInput } from '../../components/LiquidGlassComponents.jsx';

const isOnline = (lastSeen) => {
    if (!lastSeen) {
        return false;
    }
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now - lastSeenDate) / (1000 * 60);
    return diffMinutes < 5;
};

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setError('');
        try {
            const token = AuthService.getAccessToken();
            const response = await fetch('/api/users/read.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.records || []);
            } else {
                setError(data.message || 'Failed to fetch users.');
            }
        } catch {
            setError('An error occurred while fetching users.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeactivateUser = async (userId) => {
        if (window.confirm('Are you sure you want to deactivate this user? They will no longer be able to log in.')) {
            try {
                const token = AuthService.getAccessToken();
                const response = await fetch('/api/users/deactivate.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: userId })
                });
                const data = await response.json();
                if (response.ok) {
                    fetchUsers(); // Refresh users list
                } else {
                    alert(data.message || 'Failed to deactivate user.');
                }
            } catch {
                alert('An error occurred while deactivating the user.');
            }
        }
    };

    const handleSaveUser = async (userData) => {
        const url = editingUser ? '/api/users/update.php' : '/api/users/create.php';
        const method = 'POST';
        const body = JSON.stringify(editingUser ? { ...userData, id: editingUser.id } : userData);

        try {
            const token = AuthService.getAccessToken();
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body
            });
            const data = await response.json();
            if (response.ok) {
                fetchUsers(); // Refresh users list
                setIsModalOpen(false);
                setEditingUser(null);
            } else {
                alert(data.message || 'Failed to save user.');
            }
        } catch {
            alert('An error occurred while saving the user.');
        }
    };

    const filteredUsers = users.filter(user => {
        const skillsString = Array.isArray(user.skills) ? user.skills.join(' ') : '';
        const userString = `${user.name} ${user.email} ${user.role} ${user.company} ${skillsString}`.toLowerCase();
        return userString.includes(searchTerm.toLowerCase());
    });

    return (
        <>
            <div className="management-page">
                <LiquidGlassCard style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0'
                    }}>
                        <h1 style={{
                            margin: '0',
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: '700',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>User Management</h1>
                        <LiquidGlassButton
                            variant="primary"
                            size="medium"
                            onClick={handleOpenAddModal}
                        >
                            {ICONS.addUser}
                            <span>Add User</span>
                        </LiquidGlassButton>
                    </div>
                </LiquidGlassCard>

                <LiquidGlassCard style={{ marginBottom: '24px' }}>
                    <LiquidGlassInput
                        type="text"
                        placeholder="Search users by name, email, role, skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </LiquidGlassCard>

                {error && <p style={{ color: 'red', padding: '1.5rem' }}>{error}</p>}
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Email & Phone</th>
                                <th>Role & Company</th>
                                <th>Rate (R/hr)</th>
                                <th>Skills</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.email} style={{ opacity: user.status === 'inactive' ? 0.5 : 1 }}>
                                    <td>
                                        <div style={{ position: 'relative', width: '36px' }}>
                                            <div className="user-avatar">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            {user.role === 'freelancer' && isOnline(user.last_seen) && <div className="online-indicator"></div>}
                                        </div>
                                    </td>
                                    <td className="user-details">{user.name}</td>
                                    <td>
                                        <div className="user-details">
                                            {user.email}
                                            <div className="subtext">{user.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-details">
                                            <span className={`role-pill role-${user.role}`}>{user.role}</span>
                                            <div className="subtext">{user.company}</div>
                                        </div>
                                    </td>
                                    <td>{user.rate ? `R ${user.rate}` : 'N/A'}</td>
                                    <td>
                                        <div className="skills-container">
                                            {user.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-icons">
                                            <span onClick={() => handleOpenEditModal(user)}>{ICONS.edit}</span>
                                            {user.status === 'active' && (
                                                <span className="delete-icon" onClick={() => handleDeactivateUser(user.id)} title="Deactivate User">{ICONS.delete}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};
