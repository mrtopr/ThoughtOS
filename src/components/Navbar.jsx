import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CheckSquare, ChevronDown, UserCog, Layers, Menu, X, Settings } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import LiveClock from './LiveClock';
import ProfileModal from './ProfileModal';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import DailyToDoList from './DailyToDoList';
import { auth } from '../utils/auth';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Navbar() {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showToDoList, setShowToDoList] = useState(false);
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

    // Load user data on mount & listen for profile updates
    useEffect(() => {
        loadUserData();
        const handleProfileUpdate = (e) => {
            if (e.detail) {
                setCurrentUser(e.detail);
            } else {
                loadUserData();
            }
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, []);

    const loadUserData = async () => {
        const user = await auth.getCurrentUser();
        setCurrentUser(user);
    };

    const refreshUserData = async () => {
        await loadUserData();
    };

    const displayName = currentUser?.user_metadata?.display_name || 'Creator';
    const bio = currentUser?.user_metadata?.bio || 'Local Workspace';

    return (
        <nav className="navbar animate-slide-down" style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            padding: '0.65rem 0',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            boxShadow: 'none',
            marginLeft: 'var(--sidebar-width-collapsed)',
            transition: 'margin 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                paddingRight: '1.5rem'
            }}>
                {/* Left Side: Mobile Menu + Brand / Desktop Local Pill */}
                <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label="Toggle menu"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'none',
                            padding: '0.45rem',
                            borderRadius: '10px',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <Link
                        to="/"
                        className="mobile-brand"
                        onClick={() => {
                            if (window.innerWidth <= 768) {
                                setIsSidebarOpen(true);
                            }
                        }}
                        style={{
                            display: 'none',
                            alignItems: 'center',
                            gap: '0.45rem',
                            textDecoration: 'none',
                            fontSize: '1.15rem',
                            fontWeight: '800',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <BrandLogo size={24} />
                        <span style={{ fontFamily: 'var(--font-heading)' }}>ThoughtOS</span>
                    </Link>

                    <div className="nav-desktop-only" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.32rem 0.75rem',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '500',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--success)'
                        }} />
                        <span>Local Storage</span>
                    </div>
                </div>

                {/* Right Side: Controls */}
                <div className="navbar-right" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                }}>
                    {/* Workspace Switcher */}
                    <div className="nav-desktop-only">
                        <WorkspaceSwitcher />
                    </div>

                    <div className="nav-desktop-only" style={{
                        width: '1px',
                        height: '20px',
                        background: 'var(--border-color-strong)'
                    }} />

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Live Clock */}
                    <div className="nav-desktop-only">
                        <LiveClock />
                    </div>

                    <div style={{
                        width: '1px',
                        height: '20px',
                        background: 'var(--border-color-strong)'
                    }} />

                    {/* Settings Quick Button */}
                    <button
                        className="nav-icon-btn"
                        onClick={() => setShowProfileModal(true)}
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color-strong)',
                            borderRadius: '10px',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: 'var(--text-secondary)'
                        }}
                        title="Profile & Settings"
                    >
                        <Settings size={17} strokeWidth={2} />
                    </button>

                    {/* Daily To-Do List */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="todo-toggle-btn nav-icon-btn"
                            onClick={() => setShowToDoList(!showToDoList)}
                            style={{
                                background: showToDoList ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                border: showToDoList ? '1px solid var(--accent-primary)' : '1px solid var(--border-color-strong)',
                                borderRadius: '10px',
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: showToDoList ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            }}
                            title="Daily To-Do List"
                        >
                            <CheckSquare size={18} strokeWidth={2} />
                        </button>
                        <DailyToDoList
                            isOpen={showToDoList}
                            onClose={() => setShowToDoList(false)}
                        />
                    </div>

                    <div style={{
                        width: '1px',
                        height: '20px',
                        background: 'var(--border-color-strong)'
                    }} />

                    {/* User Menu */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="nav-user-btn"
                            style={{
                                background: showUserMenu ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-color-strong)',
                                borderRadius: '999px',
                                padding: '0.32rem 0.75rem 0.32rem 0.35rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.55rem',
                                transition: 'all 0.2s ease',
                                boxShadow: showUserMenu ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            <span style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                color: 'var(--bg-secondary)',
                                flexShrink: 0
                            }}>
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                            <span className="nav-username" style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                maxWidth: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {displayName}
                            </span>
                            <ChevronDown
                                className="nav-chevron"
                                size={14}
                                style={{
                                    color: 'var(--text-secondary)',
                                    transition: 'transform 0.2s ease',
                                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                                    flexShrink: 0
                                }}
                            />
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <div className="animate-scale-in" style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.65rem)',
                                right: 0,
                                background: 'var(--bg-glass-strong)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid var(--glass-border-strong)',
                                borderRadius: '16px',
                                padding: '0.45rem',
                                minWidth: '230px',
                                boxShadow: 'var(--shadow-xl)',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    padding: '0.75rem 0.9rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    marginBottom: '0.35rem'
                                }}>
                                    <div style={{
                                        fontWeight: '600',
                                        marginBottom: '0.15rem',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.92rem'
                                    }}>
                                        {displayName}
                                    </div>
                                    <div style={{
                                        fontSize: '0.76rem',
                                        color: 'var(--text-tertiary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {bio}
                                    </div>
                                </div>

                                <button
                                    className="nav-dropdown-item"
                                    onClick={() => {
                                        setShowProfileModal(true);
                                        setShowUserMenu(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.15s ease',
                                        marginBottom: '0.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.65rem'
                                    }}
                                >
                                    <UserCog size={16} style={{ color: 'var(--accent-primary)' }} />
                                    <span>Profile & Backup</span>
                                </button>

                                <button
                                    className="nav-dropdown-item"
                                    onClick={() => {
                                        navigate('/workspaces');
                                        setShowUserMenu(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.65rem'
                                    }}
                                >
                                    <Layers size={16} style={{ color: 'var(--accent-secondary)' }} />
                                    <span>Manage Workspaces</span>
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
                .nav-dropdown-item:hover {
                    background: var(--bg-tertiary) !important;
                }
                .nav-icon-btn:hover, .nav-user-btn:hover {
                    border-color: var(--accent-primary) !important;
                }
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
                        gap: 0.45rem !important;
                    }
                }
            `}</style>
        </nav>
    );
}
