import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BirdIcon } from '../assets/BirdIcon.jsx';
import { OptimizedSquaresBackground } from '../components/OptimizedSquaresBackground.jsx';
import LiquidGlass from 'liquid-glass-react';
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
                    displacementScale={80}
                    blurAmount={0.18}
                    saturation={145}
                    aberrationIntensity={2.5}
                    elasticity={0.3}
                    cornerRadius={28}
                    padding="0"
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        margin: '0 auto',
                        position: 'relative',
                        zIndex: 10,
                        background: 'rgba(30, 41, 59, 0.4)',
                        boxShadow: '0 16px 64px 0 rgba(31, 38, 135, 0.3), 0 4px 16px 0 rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(20px) saturate(180%)'
                    }}
                >
                    <div style={{ padding: '48px', width: '100%' }}>
                        <div className="login-header">
                            <BirdIcon className="login-logo" style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            <h1 className="login-title" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '8px' }}>Architex Axis</h1>
                            <h2 className="login-subtitle" style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '8px' }}>Management Suite</h2>
                            <p className="login-description" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Access your architectural project hub.</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '8px', display: 'block' }}>Email address</label>
                                <LiquidGlass
                                    displacementScale={40}
                                    blurAmount={0.15}
                                    saturation={120}
                                    aberrationIntensity={1.5}
                                    elasticity={0.2}
                                    cornerRadius={16}
                                    padding="12px 16px"
                                    style={{
                                        width: '100%',
                                        marginBottom: '16px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(12px) saturate(150%)'
                                    }}
                                >
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="admin@architex.co.za"
                                        autoComplete="email"
                                        autoFocus
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: 'white',
                                            fontSize: '14px',
                                            width: '100%',
                                            padding: '0',
                                            fontFamily: 'inherit',
                                            '::placeholder': {
                                                color: 'rgba(255, 255, 255, 0.6)'
                                            }
                                        }}
                                    />
                                </LiquidGlass>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', marginBottom: '8px', display: 'block' }}>Password</label>
                                <LiquidGlass
                                    displacementScale={40}
                                    blurAmount={0.15}
                                    saturation={120}
                                    aberrationIntensity={1.5}
                                    elasticity={0.2}
                                    cornerRadius={16}
                                    padding="12px 16px"
                                    style={{
                                        width: '100%',
                                        marginBottom: '16px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(12px) saturate(150%)'
                                    }}
                                >
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: 'white',
                                            fontSize: '14px',
                                            width: '100%',
                                            padding: '0',
                                            fontFamily: 'inherit',
                                            '::placeholder': {
                                                color: 'rgba(255, 255, 255, 0.6)'
                                            }
                                        }}
                                    />
                                </LiquidGlass>
                            </div>

                            {error && (
                                <LiquidGlass
                                    displacementScale={30}
                                    blurAmount={0.2}
                                    saturation={110}
                                    aberrationIntensity={1}
                                    elasticity={0.15}
                                    cornerRadius={16}
                                    padding="12px 16px"
                                    style={{
                                        marginBottom: '16px',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        backdropFilter: 'blur(16px) saturate(140%)'
                                    }}
                                >
                                    <div style={{
                                        color: '#ffffff',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        fontSize: '14px',
                                        margin: '0'
                                    }}>
                                        {error}
                                    </div>
                                </LiquidGlass>
                            )}

                            <LiquidGlass
                                displacementScale={60}
                                blurAmount={0.16}
                                saturation={135}
                                aberrationIntensity={2.2}
                                elasticity={0.35}
                                cornerRadius={18}
                                padding="0"
                                style={{
                                    width: '100%',
                                    marginBottom: '16px',
                                    minHeight: '48px',
                                    background: 'linear-gradient(135deg, rgba(91, 154, 139, 0.8) 0%, rgba(91, 154, 139, 0.6) 100%)',
                                    border: '1px solid rgba(91, 154, 139, 0.4)',
                                    backdropFilter: 'blur(16px) saturate(160%)',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.6 : 1,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'inherit',
                                        padding: '14px 24px',
                                        width: '100%',
                                        height: '100%',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                        fontFamily: 'inherit',
                                        borderRadius: '18px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </LiquidGlass>

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
