import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Assuming React Router for URL params

export const ResetPasswordScreen = () => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Password reset token not found in URL. Please use the link from your email.');
        }
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!token) {
            setError('No reset token available. Please request a new reset link.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Password has been reset successfully! You can now log in.');
                // Optionally redirect to login after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password. The link may be invalid or expired.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error("Reset Password Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Basic styling, similar to LoginScreen
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f5f5' // Assuming var(--light-gray-background)
    };

    const boxStyle = {
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    };

    const inputGroupStyle = { marginBottom: '1rem' };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500' };
    const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' };
    const buttonStyle = { width: '100%', padding: '0.75rem', backgroundColor: '#008080', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' };


    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h2>Reset Your Password</h2>
                {!token && error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                {token && (
                    <form onSubmit={handleSubmit}>
                        <p>Enter your new password below.</p>
                        <div style={inputGroupStyle}>
                            <label htmlFor="new-password" style={labelStyle}>New Password</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Minimum 8 characters"
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="confirm-password" style={labelStyle}>Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        {message && <p style={{ color: 'green', fontSize: '0.9rem' }}>{message}</p>}
                        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                        <button type="submit" style={buttonStyle} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
                 <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};
