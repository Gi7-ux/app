import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BirdIcon } from '../assets/BirdIcon.jsx';
import { OptimizedSquaresBackground } from '../components/OptimizedSquaresBackground.jsx';
import LiquidGlass from 'liquid-glass-react';
import { LiquidGlassButton, LiquidGlassInput } from '../components/LiquidGlassComponents.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';

export const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@architex.co.za');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

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
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
            }}>
                <OptimizedSquaresBackground
                    direction="diagonal"
                    speed={0.3}
                    borderColor="rgba(91, 154, 139, 0.15)"
                    squareSize={50}
                    hoverFillColor="rgba(91, 154, 139, 0.1)"
                />
            </div>
            <div className="login-card">
                <LiquidGlass
                    displacementScale={64}
                    blurAmount={0.12}
                    saturation={130}
                    aberrationIntensity={2}
                    elasticity={0.25}
                    cornerRadius={24}
                    padding="0"
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                        margin: '0 auto',
                        position: 'relative',
                        zIndex: 10,
                        background: 'rgba(30, 41, 59, 0.45)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        border: '1px solid rgba(255,255,255,0.18)'
                    }}
                >
                    <div style={{ padding: '40px', width: '100%' }}>
                        <div className="login-header">
                            <BirdIcon className="login-logo" style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            <h1 className="login-title" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '8px' }}>Architex Axis</h1>
                            <h2 className="login-subtitle" style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '8px' }}>Management Suite</h2>
                            <p className="login-description" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Access your architectural project hub.</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '8px', display: 'block' }}>Email address</label>
                                <LiquidGlassInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="admin@architex.co.za"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ marginBottom: '16px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '8px', display: 'block' }}>Password</label>
                                <LiquidGlassInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ marginBottom: '16px' }}
                                />
                            </div>

                            {error && (
                                <LiquidGlass
                                    blurAmount={0.18}
                                    cornerRadius={12}
                                    style={{
                                        marginBottom: '16px',
                                        background: 'rgba(239, 68, 68, 0.25)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                    }}
                                >
                                    <div style={{
                                        color: '#ffffff',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        padding: '8px',
                                        fontSize: '14px'
                                    }}>
                                        {error}
                                    </div>
                                </LiquidGlass>
                            )}

                            <LiquidGlassButton
                                type="submit"
                                variant="primary"
                                size="large"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    marginBottom: '16px',
                                    minHeight: '48px'
                                }}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </LiquidGlassButton>

                            <p className="signup-link" style={{
                                color: 'rgba(255,255,255,0.8)',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                textAlign: 'center',
                                margin: '0',
                                marginBottom: '16px'
                            }}>
                                Don&apos;t have an account? <a href="/register" style={{ color: 'white', textDecoration: 'underline' }}>Sign up</a>
                            </p>

                            {showForgotPassword ? (
                                <ForgotPasswordForm
                                    onCancel={() => setShowForgotPassword(false)}
                                    onSubmitted={() => setShowForgotPassword(false)}
                                />
                            ) : (
                                <p style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    margin: '0',
                                    fontSize: '0.875rem'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            padding: 0
                                        }}
                                    >
                                        Forgot your password?
                                    </button>
                                </p>
                            )}
                        </form>
                    </div>
                </LiquidGlass>
            </div>
        </div>
    );
};

LoginScreen.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default LoginScreen;
