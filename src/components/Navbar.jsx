import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import LiveClock from './LiveClock';
import ProfileModal from './ProfileModal';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { auth } from '../utils/auth';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Navbar() {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const userMenuRef = useRef(null);
    const { isSidebarOpen, setIsSidebarOpen } = useWorkspace();

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Load user data on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const user = await auth.getCurrentUser();
        setCurrentUser(user);
    };

    // Refresh user data after profile update
    const refreshUserData = async () => {
        await loadUserData();
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    return (
        <nav className="navbar animate-slide-down" style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            padding: '0.875rem 0',
            borderBottom: '1px solid var(--glass-border)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-sm)',
            marginLeft: 'var(--sidebar-width-collapsed)',
            transition: 'margin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                paddingRight: '1.5rem'
            }}>
                {/* Left Side: Hamburger and Brand (Mobile only) */}
                <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'none',
                            padding: '0.5rem',
                            borderRadius: '10px'
                        }}
                    >
                        {isSidebarOpen ? '✕' : '☰'}
                    </button>

                    <Link
                        to="/"
                        className="mobile-brand"
                        onClick={(e) => {
                            // On mobile, if sidebar is closed, open it instead of just navigating (or do both)
                            if (window.innerWidth <= 768) {
                                setIsSidebarOpen(true);
                            }
                        }}
                        style={{
                            display: 'none',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            background: 'var(--accent-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        <span>⚡</span>
                        <span>ThoughtOS</span>
                    </Link>
                </div>

                {/* Right Side: Existing Controls */}
                <div className="navbar-right" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    {/* Workspace Switcher */}
                    <div className="nav-desktop-only">
                        <WorkspaceSwitcher />
                    </div>

                    {/* Divider */}
                    <div className="nav-desktop-only" style={{
                        width: '1px',
                        height: '24px',
                        background: 'var(--border-color)',
                        opacity: 0.5
                    }} />

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Live Clock */}
                    <div className="nav-desktop-only">
                        <LiveClock />
                    </div>

                    {/* Divider */}
                    <div style={{
                        width: '1px',
                        height: '24px',
                        background: 'var(--border-color)',
                        opacity: 0.5
                    }} />

                    {/* User Menu */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                background: showUserMenu ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '50px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: showUserMenu ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            <span style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'white',
                                flexShrink: 0
                            }}>
                                {(currentUser?.user_metadata?.display_name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                            <span className="nav-username" style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                maxWidth: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'User'}
                            </span>
                            <svg
                                className="nav-chevron"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                style={{
                                    transition: 'transform 0.3s ease',
                                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                                    flexShrink: 0
                                }}
                            >
                                <path
                                    d="M4 6L8 10L12 6"
                                    stroke="var(--text-secondary)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <div className="animate-scale-in" style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.75rem)',
                                right: 0,
                                background: 'var(--bg-glass)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                padding: '0.5rem',
                                minWidth: '220px',
                                boxShadow: 'var(--shadow-xl)',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{
                                        fontWeight: '600',
                                        marginBottom: '0.375rem',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem'
                                    }}>
                                        {currentUser?.user_metadata?.display_name || 'User'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-tertiary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {currentUser?.email}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowProfileModal(true);
                                        setShowUserMenu(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s ease',
                                        marginBottom: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.125rem' }}>✏️</span>
                                    <span>Edit Profile</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--error)',
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.125rem' }}>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                currentUser={currentUser}
                onUpdate={refreshUserData}
            />

            <style>{`
                @media (max-width: 768px) {
                    .navbar {
                        margin-left: 0 !important;
                    }
                    .mobile-menu-toggle, .mobile-brand {
                        display: flex !important;
                    }
                    .nav-desktop-only, .nav-username, .nav-chevron {
                        display: none !important;
                    }
                    .navbar-right {
                        gap: 0.5rem !important;
                    }
                }
            `}</style>
        </nav>
    );
}
