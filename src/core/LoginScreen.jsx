import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // Import Link
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';

export const LoginScreen = ({ onLogin }) => {
    const [role, setRole] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

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
                // The login API now returns access_token and refresh_token
                onLogin(data.role, data.access_token, data.refresh_token);
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
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(prev => !prev)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {showForgotPassword ? 'Back to Login' : 'Forgot Password?'}
                    </button>
                </div>
                <p className="signup-link" style={{ marginTop: '0.5rem' }}>Don&apos;t have an account? <Link to="/register">Sign up</Link></p>
            </form>
            {showForgotPassword && (
                <div className="login-box" style={{ marginTop: '1rem' }}> {/* Use login-box style for consistency */}
                    <ForgotPasswordForm
                        onCancel={() => setShowForgotPassword(false)}
                        onSubmitted={() => {
                            // Optionally keep the form open and show success message, or hide it
                            // For now, let's keep it simple and let the form handle its own messages
                        }}
                    />
                </div>
            )}
        </div>
    );
};

LoginScreen.propTypes = {
    onLogin: PropTypes.func.isRequired,
};