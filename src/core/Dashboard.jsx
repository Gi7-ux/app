import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons.jsx';
import { BirdIcon } from '../assets/BirdIcon.jsx';
import { NAV_ITEMS as ADMIN_NAV } from '../config/adminNavigation.jsx';
import { CLIENT_NAV_ITEMS } from '../config/clientNavigation.jsx';
import { FREELANCER_NAV_ITEMS } from '../config/freelancerNavigation.jsx';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { ThemedSquaresBackground } from '../components/ThemedSquaresBackground.jsx';

const getNavItems = (role) => {
    switch (role) {
        case 'admin': return ADMIN_NAV;
        case 'client': return CLIENT_NAV_ITEMS;
        case 'freelancer': return FREELANCER_NAV_ITEMS;
        default: return [];
    }
};

const Sidebar = ({ user, navItems, currentPage, setCurrentPage }) => {
    return (
        <nav className="sidebar" style={{ position: 'relative' }}>
            <div className="sidebar-header">
                <BirdIcon style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
                <span>Architex Axis</span>
            </div>
            <div className="sidebar-profile">
                <div className="avatar">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="profile-info">
                    <h3>{user.name}</h3>
                    <p>{user.role}</p>
                </div>
            </div>
            <div className="nav-menu" style={{ marginBottom: 60 }}>
                {navItems.filter(item => item.id !== 'settings').map(item => (
                    <div key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => setCurrentPage(item.id)}>
                        {ICONS[item.icon]}
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
            <div style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 100 }}>
                <div
                    className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
                    style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    onClick={() => setCurrentPage('settings')}
                    title="Settings"
                >
                    {ICONS.settings}
                </div>
            </div>
        </nav>
    );
};

Sidebar.propTypes = {
    user: PropTypes.object.isRequired,
    navItems: PropTypes.array.isRequired,
    currentPage: PropTypes.string.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
};

const Header = ({ onLogout }) => (
    <header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="header-button active">{ICONS.overview}<span>Dashboard</span></button>
            <button className="header-button">{ICONS.profile}<span>My Profile</span></button>
            <button className="header-button">{ICONS.messages}<span>Messages</span></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <button className="header-button logout-button" onClick={onLogout}>{ICONS.logout}<span>Logout</span></button>
        </div>
    </header>
);

Header.propTypes = {
    onLogout: PropTypes.func.isRequired,
};

const Dashboard = ({ userRole, onLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [userError, setUserError] = useState('');
    const navItems = getNavItems(userRole);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            onLogout();
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/users/read_one.php', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUser(data);
                    setUserError('');
                } else {
                    setUserError(data.message || 'Failed to fetch user data.');
                    console.error('Failed to fetch user data:', data);
                    if (response.status === 401) {
                        onLogout();
                    }
                }
            } catch (error) {
                setUserError('Error fetching user data: ' + error.message);
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userRole, onLogout]);

    const activeItem = navItems.find(item => item.id === currentPage) || navItems[0];

    if (!user) {
        if (userError) {
            return <div style={{ color: 'red', padding: '2rem' }}>{userError}</div>;
        }
        return <div>Loading...</div>;
    }

    let pageComponent = null;
    if (activeItem && activeItem.component) {
        pageComponent = React.cloneElement(activeItem.component, { setCurrentPage });
    } else {
        pageComponent = <div style={{ color: 'red', padding: '2rem' }}>This page is not available.</div>;
    }

    return (
        <div className="app-shell">
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}>
                <ThemedSquaresBackground userRole={userRole} className="dashboard-background" />
            </div>
            <Sidebar user={user} navItems={navItems} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="page-container">
                <Header onLogout={onLogout} />
                <main className="main-content">
                    {pageComponent}
                </main>
            </div>
        </div>
    );
};

Dashboard.propTypes = {
    userRole: PropTypes.string.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default Dashboard;