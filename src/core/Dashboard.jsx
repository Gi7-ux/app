import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons.jsx';
import { BirdIcon } from '../assets/BirdIcon.jsx';
import { NAV_ITEMS as ADMIN_NAV } from '../config/adminNavigation.jsx';
import { CLIENT_NAV_ITEMS } from '../config/clientNavigation.jsx';
import { FREELANCER_NAV_ITEMS } from '../config/freelancerNavigation.jsx';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { ThemedSquaresBackground } from '../components/ThemedSquaresBackground.jsx';
import { LiquidGlassWrapper } from '../components/LiquidGlassWrapper.jsx';
import { LiquidGlassNavItem, LiquidGlassButton } from '../components/LiquidGlassComponents.jsx';

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
        <LiquidGlassWrapper
            variant="navigation"
            size="medium"
            style={{
                margin: '16px',
                marginBottom: '24px'
            }}
        >
            <div className="sidebar-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
                <BirdIcon style={{ fontSize: '1.5rem', color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Architex Axis</span>
            </div>
        </LiquidGlassWrapper>

        <LiquidGlassWrapper
            variant="card"
            size="custom"
            style={{
                margin: '16px',
                marginBottom: '24px'
            }}
        >
            <div className="sidebar-profile" style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center'
            }}>
                <div className="avatar" style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="profile-info">
                    <h3 style={{
                        margin: '0 0 4px 0',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>{user.name}</h3>
                    <p style={{
                        margin: '0',
                        color: 'rgba(255,255,255,0.8)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        fontSize: '14px',
                        textTransform: 'capitalize'
                    }}>{user.role}</p>
                </div>
            </div>
        </LiquidGlassWrapper>

        <div className="nav-menu" style={{ padding: '0 8px' }}>
            {navItems.map(item => (
                <LiquidGlassNavItem
                    key={item.id}
                    active={currentPage === item.id}
                    onClick={() => setCurrentPage(item.id)}
                    style={{ marginBottom: '8px' }}
                >
                    {ICONS[item.icon]}
                    <span>{item.label}</span>
                </LiquidGlassNavItem>
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

const Header = ({ onLogout }) => (
    <header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LiquidGlassButton variant="primary" size="medium">
                {ICONS.overview}<span>Dashboard</span>
            </LiquidGlassButton>
            <LiquidGlassButton variant="secondary" size="medium">
                {ICONS.profile}<span>My Profile</span>
            </LiquidGlassButton>
            <LiquidGlassButton variant="secondary" size="medium">
                {ICONS.messages}<span>Messages</span>
            </LiquidGlassButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <LiquidGlassButton
                variant="danger"
                size="medium"
                onClick={onLogout}
            >
                {ICONS.logout}<span>Logout</span>
            </LiquidGlassButton>
        </div>
    </header>
);

Header.propTypes = {
    onLogout: PropTypes.func.isRequired,
};

const Dashboard = ({ userRole, onLogout }) => {
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