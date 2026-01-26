import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import LiveClock from './LiveClock';
import ProfileModal from './ProfileModal';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { auth } from '../utils/auth';

export default function Navbar() {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const userMenuRef = useRef(null);

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
            marginLeft: 'var(--sidebar-width-collapsed)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.75rem',
                paddingRight: '1.5rem'
            }}>
                {/* Workspace Switcher */}
                <WorkspaceSwitcher />

                {/* Divider */}
                <div style={{
                    width: '1px',
                    height: '24px',
                    background: 'var(--border-color)',
                    opacity: 0.5
                }} />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Live Clock */}
                <LiveClock />

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
                        onMouseEnter={(e) => {
                            if (!showUserMenu) {
                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showUserMenu) {
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
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
                        <span style={{
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
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'var(--bg-tertiary)';
                                    e.target.style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.transform = 'translateX(0)';
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
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.target.style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.transform = 'translateX(0)';
                                }}
                            >
                                <span style={{ fontSize: '1.125rem' }}>🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                currentUser={currentUser}
                onUpdate={refreshUserData}
            />
        </nav>
    );
}
