import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BirdIcon } from '../assets/BirdIcon.jsx';
import { SquaresBackground } from '../components/SquaresBackground.jsx';

export const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@architex.co.za');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.role, data.access_token, data.refresh_token);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
            }}>
                <SquaresBackground
                    direction="diagonal"
                    speed={0.3}
                    borderColor="rgba(91, 154, 139, 0.15)"
                    squareSize={50}
                    hoverFillColor="rgba(91, 154, 139, 0.1)"
                />
            </div>
            <div className="login-card">
                <div className="login-header">
                    <BirdIcon className="login-logo" />
                    <h1 className="login-title">Architex Axis</h1>
                    <h2 className="login-subtitle">Management Suite</h2>
                    <p className="login-description">Access your architectural project hub.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="admin@architex.co.za"
                            autoComplete="email"
                            autoFocus
                            required
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <p className="signup-link">
                        Don&apos;t have an account? <a href="/signup">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

LoginScreen.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default LoginScreen;
