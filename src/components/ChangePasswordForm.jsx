import React, { useState } from 'react';

export const ChangePasswordForm = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match.");
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/change_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ current_password: passwords.current, new_password: passwords.new })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setError(data.message || 'Failed to change password.');
            }
        } catch {
            setError('An error occurred.');
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3 className="card-header">Change Password</h3>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                <div className="input-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input id="currentPassword" type="password" name="current" value={passwords.current} onChange={handleChange} required autoComplete="current-password" />
                </div>
                <div className="input-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input id="newPassword" type="password" name="new" value={passwords.new} onChange={handleChange} required autoComplete="new-password" />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input id="confirmPassword" type="password" name="confirm" value={passwords.confirm} onChange={handleChange} required autoComplete="new-password" />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit" className="action-btn">Update Password</button>
            </form>
        </div>
    );
};
