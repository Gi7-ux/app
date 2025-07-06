import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LoginScreen } from './LoginScreen.jsx';
import Dashboard from './Dashboard.jsx';
import { AuthService } from '../services/AuthService.js';

// Create custom theme to match the design
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#5B9A8B', // Teal color from screenshot
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#2B3445', // Dark blue for sidebar
            contrastText: '#ffffff',
        },
        background: {
            default: '#F8FAFC', // Light gray background
            paper: '#ffffff',
        },
        text: {
            primary: '#1F2937',
            secondary: '#6B7281',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
            color: '#1F2937',
        },
        h5: {
            fontWeight: 600,
            color: '#5B9A8B',
        },
        body1: {
            color: '#374151',
        },
        body2: {
            color: '#6B7281',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    padding: '12px 24px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(91, 154, 139, 0.3)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                            borderColor: '#5B9A8B',
                        },
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!userRole ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <Dashboard userRole={userRole} onLogout={handleLogout} />
            )}
        </ThemeProvider>
    );
};