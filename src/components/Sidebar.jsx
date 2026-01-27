import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Sidebar() {
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const { isSidebarOpen, setIsSidebarOpen } = useWorkspace();

    // Close sidebar on location change for mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname, setIsSidebarOpen]);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '🏠' },
        { path: '/links', label: 'Links', icon: '🔗' },
        { path: '/projects', label: 'Projects', icon: '💼' },
        { path: '/blog', label: 'Blog', icon: '📝' },
        { path: '/prompts', label: 'Prompts', icon: '✨' },
        { path: '/videos', label: 'Videos', icon: '🎥' },
        { path: '/workspaces', label: 'Workspaces', icon: '⚙️' }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 99,
                    display: 'none',
                    opacity: isSidebarOpen ? 1 : 0,
                    pointerEvents: isSidebarOpen ? 'auto' : 'none',
                    transition: 'all 0.3s ease'
                }}
            />

            <aside
                className={`sidebar glass-strong ${isSidebarOpen ? 'mobile-open' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    width: isHovered ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)',
                    padding: '1.5rem 0',
                    borderRight: '1px solid var(--glass-border)',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    zIndex: 100,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {/* Brand */}
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isHovered ? 'flex-start' : 'center',
                    gap: '0.5rem',
                    padding: '0 1rem',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    whiteSpace: 'nowrap'
                }}>
                    <span style={{ fontSize: '1.75rem' }}>⚡</span>
                    {(isHovered || isSidebarOpen) && <span>ThoughtOS</span>}
                </Link>

                {/* Navigation Links */}
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    flex: 1,
                    padding: '0 0.75rem'
                }}>
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="sidebar-link"
                                style={{
                                    padding: '0.875rem',
                                    borderRadius: '14px',
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    background: 'transparent',
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: (isHovered || isSidebarOpen) ? 'flex-start' : 'center',
                                    gap: '0.75rem',
                                    border: 'none',
                                    position: 'relative',
                                    overflow: 'visible',
                                    whiteSpace: 'nowrap'
                                }}
                            >

                                {/* Icon */}
                                <span style={{
                                    fontSize: '1.4rem',
                                    flexShrink: 0,
                                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    display: 'inline-block'
                                }} className="sidebar-icon">
                                    {item.icon}
                                </span>

                                {/* Text (visible on hover) */}
                                {(isHovered || isSidebarOpen) && (
                                    <span style={{
                                        opacity: 1,
                                        transition: 'opacity 0.3s ease'
                                    }}>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Info */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center',
                    opacity: (isHovered || isSidebarOpen) ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}>
                    <p style={{ margin: 0 }}>ThoughtOS</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>v1.0.0</p>
                </div>

                <style>{`
                    @keyframes breathe {
                        0%, 100% {
                            opacity: 0.6;
                            transform: translateY(-50%) scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: translateY(-50%) scale(1.05);
                        }
                    }

                    .sidebar-link:hover .sidebar-icon {
                        transform: rotate(5deg) scale(1.1);
                    }

                    .sidebar-link:hover {
                        background: var(--bg-tertiary) !important;
                    }

                    @media (max-width: 768px) {
                        .sidebar {
                            transform: translateX(-100%);
                            width: 260px !important;
                            visibility: hidden;
                        }

                        .sidebar.mobile-open {
                            transform: translateX(0);
                            visibility: visible;
                        }

                        .sidebar-overlay.active {
                            display: block;
                        }
                    }
                `}</style>
            </aside>
        </>
    );
}
