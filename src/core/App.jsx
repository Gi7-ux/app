import React, { useState, useEffect } from 'react';
import { LoginScreen } from './LoginScreen.jsx';
import Dashboard from './Dashboard.jsx';
import { AuthService } from '../services/AuthService.js';

export const App = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (AuthService.isAuthenticated()) {
            setUserRole(AuthService.getRole());
        }
    }, []);

    const handleLogin = (role, token) => {
        AuthService.login(token, role);
        setUserRole(role);
    };

    const handleLogout = () => {
        AuthService.logout();
        setUserRole(null);
    };

    if (!userRole) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};