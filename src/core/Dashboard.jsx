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

const Sidebar = ({ user, navItems, currentPage, setCurrentPage }) => (
    <nav className="sidebar">
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
        <div className="nav-menu">
            {navItems.map(item => (
                <div key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => setCurrentPage(item.id)}>
                    {ICONS[item.icon]}
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    </nav>
);

Sidebar.propTypes = {
    user: PropTypes.object.isRequired,
    navItems: PropTypes.array.isRequired,
    currentPage: PropTypes.string.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
};

const Header = ({ onLogout, toggleTheme, theme }) => (
    <header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="header-button active">{ICONS.overview}<span>Dashboard</span></button>
            <button className="header-button">{ICONS.profile}<span>My Profile</span></button>
            <button className="header-button">{ICONS.messages}<span>Messages</span></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <button className="header-button" onClick={toggleTheme}>
                {theme === 'default' ? ICONS.moon : ICONS.sun}
                <span>{theme === 'default' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button className="header-button logout-button" onClick={onLogout}>{ICONS.logout}<span>Logout</span></button>
        </div>
    </header>
);

Header.propTypes = {
    onLogout: PropTypes.func.isRequired,
    toggleTheme: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
};

const Dashboard = ({ userRole, onLogout, theme, toggleTheme }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [user, setUser] = useState(null);
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
                } else {
                    console.error('Failed to fetch user data:', data);
                    if (response.status === 401) {
                        onLogout();
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userRole, onLogout]);

    const activeItem = navItems.find(item => item.id === currentPage) || navItems[0];

    if (!user) {
        return <div>Loading...</div>;
    }

    // Clone the component and pass props
    const pageComponent = React.cloneElement(activeItem.component, { setCurrentPage });

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