import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AuthService } from '../services/AuthService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
    const [userRole, setUserRole] = useState(AuthService.getRole());

    const login = useCallback((role, accessToken, refreshToken) => {
        AuthService.login(accessToken, refreshToken, role);
        setIsAuthenticated(true);
        setUserRole(role);
    }, []);

    const logout = useCallback(() => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUserRole(null);
    }, []);

    // Listen for storage changes (multi-tab logout/login)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'access_token' || event.key === 'user_role') {
                setIsAuthenticated(AuthService.isAuthenticated());
                setUserRole(AuthService.getRole());
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);


    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
