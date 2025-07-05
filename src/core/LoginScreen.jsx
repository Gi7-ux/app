import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const LoginScreen = ({ onLogin }) => {
    const [role, setRole] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.role, data.token);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch {
            setError('An error occurred. Please try again.');
        }
    };

    const getEmailPlaceholder = () => {
        switch (role) {
            case 'admin': return 'admin@architex.co.za';
            case 'client': return 'client@architex.co.za';
            case 'freelancer': return 'freelancer@architex.co.za';
            default: return 'email@example.com';
        }
    };

    // Update email field when role changes
    React.useEffect(() => {
        setEmail(getEmailPlaceholder());
    }, [role]);


    return (
        <div className="login-container">
            <form className="login-box" onSubmit={handleLogin}>
                <h2>Architex Axis</h2>
                <p>Please sign in to continue</p>

                <div className="input-group">
                    <label htmlFor="role">Role</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem', fontSize: '1rem' }}>
                        <option value="admin">Admin</option>
                        <option value="client">Client</option>
                        <option value="freelancer">Freelancer</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
                <button type="submit" className="login-btn">Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</button>
                <p className="signup-link">Don&apos;t have an account? <a href="/signup">Sign up</a></p>
            </form>
        </div>
    );
};

LoginScreen.propTypes = {
    onLogin: PropTypes.func.isRequired,
};