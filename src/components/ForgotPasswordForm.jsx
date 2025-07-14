import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const ForgotPasswordForm = ({ onCancel, onSubmitted }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/request_password_reset.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "If your email is registered, you'll receive a reset link.");
                if (onSubmitted) onSubmitted(data.message);
            } else {
                setError(data.message || 'Failed to request password reset.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error("Forgot Password Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-form-container" style={{ 
            marginTop: '1rem', 
            padding: '1.5rem', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
        }}>
            <h4 style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '0.5rem' }}>Forgot Your Password?</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem' }}>Enter your email address below, and we&apos;ll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="reset-email" style={{ 
                        color: 'white', 
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)', 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>Email Address</label>
                    <input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            border: '1px solid rgba(255, 255, 255, 0.2)', 
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            fontSize: '0.875rem'
                        }}
                        placeholder="Enter your email address"
                    />
                </div>
                {message && <p style={{ color: '#10B981', fontSize: '0.9rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{message}</p>}
                {error && <p style={{ color: '#EF4444', fontSize: '0.9rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: loading ? 0.6 : 1,
                            flex: 1
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            style={{ 
                                padding: '0.75rem 1rem', 
                                background: 'transparent', 
                                border: '1px solid rgba(255, 255, 255, 0.3)', 
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

ForgotPasswordForm.propTypes = {
    onCancel: PropTypes.func,
    onSubmitted: PropTypes.func,
};
