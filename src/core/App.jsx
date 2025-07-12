import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './LoginScreen.jsx';
import { ResetPasswordScreen } from './ResetPasswordScreen.jsx';
import { RegisterScreen } from './RegisterScreen.jsx'; // Import RegisterScreen
import Dashboard from './Dashboard.jsx';
import { AuthService } from '../services/AuthService.js';

// A wrapper for protected routes
const ProtectedRoute = ({ children }) => {
    if (!AuthService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export const App = () => {
    // This state is to trigger re-render on login/logout
    const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
    const [theme, setTheme] = useState('default');

    const handleLogin = (role, accessToken, refreshToken) => {
        AuthService.login(accessToken, refreshToken, role);
        setIsAuthenticated(true);
        // Navigation to dashboard will be handled by ProtectedRoute or direct navigation
    };

    const handleLogout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        // Navigation to login will be handled by ProtectedRoute
    };

    const toggleTheme = () => {
        const newTheme = theme === 'default' ? 'glass' : 'default';
        setTheme(newTheme);
        if (newTheme === 'glass') {
            const link = document.createElement('link');
            link.href = '/src/styles/theme-glass.css';
            link.rel = 'stylesheet';
            link.id = 'glass-theme';
            document.head.appendChild(link);
        } else {
            const link = document.getElementById('glass-theme');
            if (link) {
                document.head.removeChild(link);
            }
        }
    };

    // Effect to listen to storage changes for logout from other tabs (optional but good UX)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if ((event.key === 'access_token' || event.key === 'user_role') && !event.newValue) {
                setIsAuthenticated(false);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    return (
        <Routes>
            <Route
                path="/login"
                element={
                    AuthService.isAuthenticated() ? <Navigate to="/" replace /> : <LoginScreen onLogin={handleLogin} />
                }
            />
            <Route path="/register" element={<RegisterScreen />} /> {/* Add RegisterScreen route */}
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route
                path="/*" // All other routes are protected
                element={
                    <ProtectedRoute>
                        <Dashboard
                            userRole={AuthService.getRole()} // Get role directly inside dashboard if needed per page
                            onLogout={handleLogout}
                            theme={theme}
                            toggleTheme={toggleTheme}
                        />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
