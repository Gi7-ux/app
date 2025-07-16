
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './core/App';
import { ThemeProvider } from './core/ThemeProvider';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './core/AuthContext';
import './index.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}