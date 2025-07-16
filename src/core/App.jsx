import React from 'react';
import PropTypes from 'prop-types';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './LoginScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { RegisterScreen } from './RegisterScreen';
import Dashboard from './Dashboard';
import Settings from '../features/Settings/Settings';
import { useAuth } from './AuthContext';

// A wrapper for protected routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export const App = () => {
    const { isAuthenticated, userRole, login, logout } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen onLogin={login} />
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
                            userRole={userRole}
                            onLogout={logout}
                        />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
