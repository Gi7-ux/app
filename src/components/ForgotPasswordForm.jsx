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
        <div className="forgot-password-form-container" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>Forgot Your Password?</h4>
            <p>Enter your email address below, and we&apos;ll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                {message && <p style={{ color: 'green', fontSize: '0.9rem' }}>{message}</p>}
                {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    {onCancel && (
                        <button type="button" className="btn-secondary" onClick={onCancel} style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--primary-color)'}}>
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
