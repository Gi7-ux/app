import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

    // Effect to listen to storage changes for logout from other tabs (optional but good UX)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'access_token' && !event.newValue) {
                setIsAuthenticated(false);
            }
             if (event.key === 'user_role' && !event.newValue) {
                setIsAuthenticated(false);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    return (
        <BrowserRouter>
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
                            />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};