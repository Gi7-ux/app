import PropTypes from 'prop-types';
import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    glassmorphism: {
        name: 'Glassmorphism iPhone',
        properties: {
            '--background': 'rgba(255,255,255,0.6)',
            '--sidebar-bg': 'rgba(255,255,255,0.25)',
            '--sidebar-text': '#222',
            '--sidebar-profile-bg': 'rgba(255,255,255,0.35)',
            '--primary-color': '#4f8cff',
            '--primary-dark': '#2c3e50',
            '--primary-light': '#aee1ff',
            '--white': '#fff',
            '--sidebar-hover-bg': 'rgba(255,255,255,0.4)',
            '--sidebar-active-bg': 'rgba(255,255,255,0.6)',
            '--sidebar-active-text': '#4f8cff',
            '--header-border': 'rgba(255,255,255,0.2)',
            '--header-btn-bg': 'rgba(255,255,255,0.7)',
            '--header-btn-text': '#222',
            '--gray-200': '#e0e0e0',
        }
    },
    blackGreen: {
        name: 'Black & Green',
        properties: {
            '--background': '#181c20',
            '--sidebar-bg': '#222a22',
            '--sidebar-text': '#b6ffb6',
            '--sidebar-profile-bg': '#222a22',
            '--primary-color': '#00ff88',
            '--primary-dark': '#005f2f',
            '--primary-light': '#b6ffb6',
            '--white': '#fff',
            '--sidebar-hover-bg': '#005f2f',
            '--sidebar-active-bg': '#00ff88',
            '--sidebar-active-text': '#181c20',
            '--header-border': '#005f2f',
            '--header-btn-bg': '#222a22',
            '--header-btn-text': '#b6ffb6',
            '--gray-200': '#222a22',
        }
    },
    whiteGreen: {
        name: 'White & Green',
        properties: {
            '--background': '#f8fff8',
            '--sidebar-bg': '#eaf6f2',
            '--sidebar-text': '#4b8b7a',
            '--sidebar-profile-bg': '#eaf6f2',
            '--primary-color': '#4b8b7a',
            '--primary-dark': '#35705d',
            '--primary-light': '#b6d8cf',
            '--primary-hover': '#35705d',
            '--white': '#fff',
            '--sidebar-hover-bg': '#b6d8cf',
            '--sidebar-active-bg': '#4b8b7a',
            '--sidebar-active-text': '#fff',
            '--header-border': '#b6d8cf',
            '--header-btn-bg': '#eaf6f2',
            '--header-btn-text': '#4b8b7a',
            '--gray-50': '#f8fff8',
            '--gray-100': '#eaf6f2',
            '--gray-200': '#b6d8cf',
            '--gray-300': '#b6d8cf',
            '--gray-600': '#35705d',
            '--text-primary': '#4b8b7a',
            '--text-secondary': '#35705d',
            '--card-bg': '#fff',
            '--card-green-bg': '#eaf6f2',
            '--card-green-icon': '#4b8b7a',
            '--card-green-border': '#b6d8cf',
            '--card-yellow-bg': '#fffbe6',
            '--card-yellow-icon': '#b59f3b',
            '--card-yellow-border': '#f7e7b6',
            '--card-orange-bg': '#fff3e6',
            '--card-orange-icon': '#b57b3b',
            '--card-orange-border': '#f7dcb6',
            '--card-teal-bg': '#eaf6f2',
            '--card-red-bg': '#ffeaea',
            '--card-red-icon': '#d9534f',
            '--card-red-border': '#f7b6b6',
        }
    },
    androidCrossIphone: {
        name: 'Android Cross-iPhone',
        properties: {
            '--background': 'linear-gradient(135deg, #aee1ff 0%, #00c853 100%)',
            '--sidebar-bg': 'rgba(0,200,83,0.15)',
            '--sidebar-text': '#222',
            '--sidebar-profile-bg': 'rgba(0,200,83,0.25)',
            '--primary-color': '#00c853',
            '--primary-dark': '#005f2f',
            '--primary-light': '#aee1ff',
            '--white': '#fff',
            '--sidebar-hover-bg': 'rgba(0,200,83,0.25)',
            '--sidebar-active-bg': 'rgba(0,200,83,0.35)',
            '--sidebar-active-text': '#fff',
            '--header-border': 'rgba(0,200,83,0.2)',
            '--header-btn-bg': 'rgba(174,225,255,0.7)',
            '--header-btn-text': '#222',
            '--gray-200': '#aee1ff',
        }
    }
};

const ThemeContext = createContext({
    theme: 'glassmorphism',
    setTheme: () => { },
    themes: Object.keys(themes)
});

export const ThemeProvider = ({ children }) => {
    ThemeProvider.propTypes = {
        children: PropTypes.node.isRequired,
    };
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'whiteGreen');

    useEffect(() => {
        const themeObj = themes[theme] || themes.glassmorphism;
        Object.entries(themeObj.properties).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: Object.keys(themes), themeNames: Object.fromEntries(Object.entries(themes).map(([k, v]) => [k, v.name])) }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
