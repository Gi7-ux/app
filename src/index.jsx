
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './core/App.jsx';
import { ThemeProvider } from './core/ThemeProvider.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </BrowserRouter>
    );
}