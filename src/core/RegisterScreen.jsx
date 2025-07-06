import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('client'); // Default role
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        try {
            const payload = { name, email, password, role };
            if (role === 'client' && company) {
                payload.company = company;
            }
            // For freelancers, company might not be relevant or could be their own trade name.
            // If freelancer needs a company field, adjust logic here. For now, only for clients.

            const response = await fetch('/api/auth/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Registration successful! Please log in.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error("Registration Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Basic styling, similar to LoginScreen and ResetPasswordScreen
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f5f5'
    };

    const boxStyle = {
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px' // Slightly wider for more fields
    };

    const inputGroupStyle = { marginBottom: '1rem' };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500' };
    const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' };
    const buttonStyle = { width: '100%', padding: '0.75rem', backgroundColor: '#008080', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' };


    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h2>Create Your Account</h2>
                <form onSubmit={handleSubmit}>
                    <div style={inputGroupStyle}>
                        <label htmlFor="name" style={labelStyle}>Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label htmlFor="email" style={labelStyle}>Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label htmlFor="password" style={labelStyle}>Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 8 characters" style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label htmlFor="confirm-password" style={labelStyle}>Confirm Password</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label htmlFor="role" style={labelStyle}>I am a:</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                            <option value="client">Client (Looking to hire for a project)</option>
                            <option value="freelancer">Freelancer (Looking for projects)</option>
                        </select>
                    </div>
                    {role === 'client' && (
                        <div style={inputGroupStyle}>
                            <label htmlFor="company" style={labelStyle}>Company Name (Optional)</label>
                            <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
                        </div>
                    )}
                    {message && <p style={{ color: 'green', fontSize: '0.9rem', textAlign: 'center' }}>{message}</p>}
                    {error && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
                    <button type="submit" style={buttonStyle} disabled={loading}>
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};
