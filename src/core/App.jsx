import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './LoginScreen.jsx';
import { ResetPasswordScreen } from './ResetPasswordScreen.jsx';
import { RegisterScreen } from './RegisterScreen.jsx'; // Import RegisterScreen
import Dashboard from './Dashboard.jsx';
import Settings from '../features/Settings/Settings.jsx';
import { AuthService } from '../services/AuthService.js';

// A wrapper for protected routes
const ProtectedRoute = ({ children }) => {
    if (!AuthService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export const App = () => {
    const handleLogin = (role, accessToken, refreshToken) => {
        AuthService.login(accessToken, refreshToken, role);
        // Navigation to dashboard will be handled by ProtectedRoute or direct navigation
    };

    const handleLogout = () => {
        AuthService.logout();
        // Navigation to login will be handled by ProtectedRoute
    };

    // Effect to listen to storage changes for logout from other tabs (optional but good UX)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if ((event.key === 'access_token' || event.key === 'user_role') && !event.newValue) {
                // Optionally force a rerender or redirect if needed
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
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <Dashboard
                            userRole={AuthService.getRole()}
                            onLogout={handleLogout}
                        />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
