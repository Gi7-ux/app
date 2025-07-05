import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../../assets/icons.jsx';
import { ChangePasswordForm } from '../../components/ChangePasswordForm.jsx';

export const ClientProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const avatarInputRef = useRef(null);

    const fetchUserData = async () => {
        // In a real app, you'd get the current user's ID from the JWT token on the backend
        // For now, we'll just fetch the first client user.
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/read.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                const clientUser = data.records.find(u => u.role === 'client');
                setUser(clientUser);
            } else {
                setError(data.message || 'Failed to fetch user data.');
            }
        } catch {
            setError('An error occurred while fetching user data.');
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/update.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            if (response.ok) {
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert(data.message || 'Failed to update profile.');
            }
        } catch {
            alert('An error occurred while saving the profile.');
        }
    };

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/update_avatar.php', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setUser(prev => ({ ...prev, avatar: data.avatar }));
                alert('Avatar updated successfully!');
            } else {
                alert(data.message || 'Failed to upload avatar.');
            }
        } catch {
            alert('An error occurred during avatar upload.');
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', padding: '1.5rem' }}>{error}</div>;
    }

    return (
        <>
            <div className="management-page">
                <div className="management-header">
                    <h1>My Profile</h1>
                    {!isEditing && <button className="create-btn" onClick={() => setIsEditing(true)}>{ICONS.edit}<span>Edit Profile</span></button>}
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        <div className="profile-avatar-section" style={{ textAlign: 'center', position: 'relative' }}>
                            <img src={user.avatar} alt={user.name} style={{ width: '128px', height: '128px', borderRadius: '50%', marginBottom: '1rem', cursor: 'pointer' }} onClick={handleAvatarClick} />
                            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                Edit
                            </div>
                            <h2>{user.name}</h2>
                            <p className={`role-pill role-${user.role}`}>{user.role}</p>
                        </div>
                        <div className="profile-details-section">
                            {isEditing ? (
                                <div className="profile-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input id="fullName" type="text" name="name" value={user.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="email">Email</label>
                                        <input id="email" type="email" name="email" value={user.email} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="phoneNumber">Phone Number</label>
                                        <input id="phoneNumber" type="text" name="phone" value={user.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="company">Company</label>
                                        <input id="company" type="text" name="company" value={user.company} onChange={handleInputChange} />
                                    </div>
                                    <div style={{ gridColumn: '1 / 3', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                        <button className="action-link" onClick={() => setIsEditing(false)}>Cancel</button>
                                        <button className="action-btn" onClick={handleSave}>Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><strong>Full Name:</strong><p>{user.name}</p></div>
                                    <div><strong>Email:</strong><p>{user.email}</p></div>
                                    <div><strong>Phone:</strong><p>{user.phone}</p></div>
                                    <div><strong>Company:</strong><p>{user.company}</p></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ChangePasswordForm />
        </>
    );
};