import React from 'react';
import { useTheme } from '../../core/ThemeProvider.jsx';
import './Settings.css';

const Settings = () => {
    const { theme, setTheme, themes, themeNames } = useTheme();
    return (
        <div className="settings-page">
            <h2>Settings</h2>
            <div className="settings-row">
                <label htmlFor="theme-select" className="settings-label">Theme:</label>
                <select
                    id="theme-select"
                    className="settings-select"
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                >
                    {themes.map(key => (
                        <option key={key} value={key}>{themeNames[key]}</option>
                    ))}
                </select>
            </div>
            {/* Add more settings options here */}
        </div>
    );
};

export default Settings;
