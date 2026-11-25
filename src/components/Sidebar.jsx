import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
    LayoutDashboard,
    Link2,
    FolderKanban,
    FileText,
    Sparkles,
    PlayCircle,
    BarChart3,
    Layers
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Sidebar() {
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const { isSidebarOpen, setIsSidebarOpen } = useWorkspace();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname, setIsSidebarOpen]);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/links', label: 'Links', icon: Link2 },
        { path: '/projects', label: 'Projects', icon: FolderKanban },
        { path: '/blog', label: 'Blog', icon: FileText },
        { path: '/prompts', label: 'Prompts', icon: Sparkles },
        { path: '/videos', label: 'Videos', icon: PlayCircle },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/workspaces', label: 'Workspaces', icon: Layers }
    ];

    const isExpanded = isHovered || isSidebarOpen;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 99,
                    display: 'none',
                    opacity: isSidebarOpen ? 1 : 0,
                    pointerEvents: isSidebarOpen ? 'auto' : 'none',
                    transition: 'all 0.25s ease'
                }}
            />

            <aside
                className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    width: isHovered ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)',
                    padding: '1.25rem 0',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    boxShadow: isHovered ? 'var(--shadow-lg)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.75rem',
                    zIndex: 100,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    transition: 'width 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease'
                }}
            >
                {/* Brand */}
                <Link to="/" style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    gap: '0.75rem',
                    padding: isExpanded ? '0 1.25rem' : '0',
                    whiteSpace: 'nowrap'
                }}>
                    <BrandLogo size={34} />
                    {isExpanded && (
                        <span style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.15rem',
                            fontWeight: '700',
                            letterSpacing: '-0.03em',
                            color: 'var(--text-primary)'
                        }}>
                            Thought<span style={{ color: 'var(--accent-primary)' }}>OS</span>
                        </span>
                    )}
                </Link>

                {/* Navigation Links */}
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    flex: 1,
                    padding: '0 0.75rem'
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                title={!isExpanded ? item.label : undefined}
                                style={{
                                    padding: '0.7rem 0.85rem',
                                    borderRadius: '10px',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? '600' : '500',
                                    fontSize: '0.9rem',
                                    background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                                    transition: 'all 0.18s ease',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isExpanded ? 'flex-start' : 'center',
                                    gap: '0.85rem',
                                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                    position: 'relative',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon
                                    size={19}
                                    strokeWidth={isActive ? 2.2 : 1.75}
                                    className="sidebar-icon"
                                    style={{
                                        flexShrink: 0,
                                        color: isActive ? 'var(--accent-primary)' : 'currentColor'
                                    }}
                                />

                                {isExpanded && (
                                    <span style={{ letterSpacing: '-0.01em' }}>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Info */}
                <div style={{
                    padding: '0.85rem 1rem',
                    borderTop: '1px solid var(--border-color)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em'
                }}>
                    THOUGHTOS · LOCAL
                </div>

                <style>{`
                    .sidebar-link:hover {
                        background: var(--bg-tertiary) !important;
                        color: var(--text-primary) !important;
                    }

                    @media (max-width: 768px) {
                        .sidebar {
                            transform: translateX(-100%);
                            width: 256px !important;
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
