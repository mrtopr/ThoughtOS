import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/workspaceAwareStorage';
import { auth } from '../utils/auth';
import Loader from '../components/Loader';
import FocusTimer from '../components/FocusTimer';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        links: 0,
        projects: 0,
        blogPosts: 0,
        prompts: 0,
        videos: 0
    });

    const [recentItems, setRecentItems] = useState([]);
    const [latestItems, setLatestItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [hoveredTile, setHoveredTile] = useState(null);

    useEffect(() => {
        loadDashboardData();
        loadUserData();

        // Listen for workspace changes
        const handleWorkspaceChange = () => {
            loadDashboardData();
        };

        window.addEventListener('workspaceChanged', handleWorkspaceChange);

        return () => {
            window.removeEventListener('workspaceChanged', handleWorkspaceChange);
        };
    }, []);

    const loadUserData = async () => {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load all data in parallel
            const [links, projects, blogPosts, prompts, videos] = await Promise.all([
                storage.links.getAll(),
                storage.projects.getAll(),
                storage.blog.getAll(),
                storage.prompts.getAll(),
                storage.videos.getAll()
            ]);

            // Helper to get latest item
            const getLatest = (arr) => {
                if (!arr || arr.length === 0) return null;
                return arr.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))[0];
            };

            setLatestItems({
                links: getLatest([...links]),
                projects: getLatest([...projects]),
                blogPosts: getLatest([...blogPosts]),
                prompts: getLatest([...prompts]),
                videos: getLatest([...videos])
            });

            // Update stats
            setStats({
                links: links.length,
                projects: projects.length,
                blogPosts: blogPosts.length,
                prompts: prompts.length,
                videos: videos.length
            });

            // Get recent items from all categories
            const allItems = [
                ...blogPosts.slice(0, 3).map(item => ({ ...item, type: 'blog', icon: '📝' })),
                ...projects.slice(0, 2).map(item => ({ ...item, type: 'project', icon: '💼' })),
                ...links.slice(0, 2).map(item => ({ ...item, type: 'link', icon: '🔗' }))
            ];

            // Sort by creation date
            allItems.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
            setRecentItems(allItems.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const commandTiles = [
        {
            label: 'Links',
            count: stats.links,
            icon: '🔗',
            color: '#6366f1',
            path: '/links',
            action: 'Manage Links',
            secondaryAction: 'Add Link',
            size: 'large',
            latest: latestItems.links ? (latestItems.links.title || latestItems.links.name) : 'No links yet'
        },
        {
            label: 'Projects',
            count: stats.projects,
            icon: '💼',
            color: '#8b5cf6',
            path: '/projects',
            action: 'View Projects',
            secondaryAction: 'New Project',
            size: 'large',
            latest: latestItems.projects ? latestItems.projects.name : 'No active projects'
        },
        {
            label: 'Blog',
            count: stats.blogPosts,
            icon: '📝',
            color: '#ec4899',
            path: '/blog',
            action: 'Posts',
            secondaryAction: 'Write',
            size: 'small',
            latest: latestItems.blogPosts ? latestItems.blogPosts.title : 'Start writing'
        },
        {
            label: 'Prompts',
            count: stats.prompts,
            icon: '✨',
            color: '#f59e0b',
            path: '/prompts',
            action: 'Library',
            secondaryAction: 'Save',
            size: 'small',
            latest: latestItems.prompts ? latestItems.prompts.title : 'No prompts saved'
        },
        {
            label: 'Videos',
            count: stats.videos,
            icon: '🎥',
            color: '#10b981',
            path: '/videos',
            action: 'Collection',
            secondaryAction: 'Add',
            size: 'small',
            latest: latestItems.videos ? latestItems.videos.title : 'No videos added'
        }
    ];

    if (loading) {
        return <Loader message="Loading command center..." />;
    }

    return (
        <div className="container" style={{
            padding: '2rem 3rem 2rem 2rem',
            maxWidth: '100%'
        }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{
                        marginBottom: '0.5rem',
                        fontSize: '2rem',
                        fontWeight: '700',
                        letterSpacing: '-0.02em'
                    }}>
                        Command Center
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1rem',
                        fontWeight: '400'
                    }}>
                        {user?.user_metadata?.display_name
                            ? `Welcome back, ${user.user_metadata.display_name}`
                            : 'Your ThoughtOS control panel'}
                    </p>
                </div>

                {/* Main Content Layout */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2.5rem',
                    alignItems: 'flex-start'
                }}>
                    {/* Left Column: Command Tiles */}
                    <div style={{
                        flex: '2 1 600px', // Grow/Shrink, Basis
                        minWidth: '0' // Prevent flexbox overflow issues
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Wider minimum width
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {commandTiles.map((tile, index) => (
                                <div
                                    key={tile.label}
                                    className="command-tile"
                                    onClick={() => navigate(tile.path)}
                                    onMouseEnter={() => setHoveredTile(tile.label)}
                                    onMouseLeave={() => setHoveredTile(null)}
                                    style={{
                                        gridColumn: 'span 1',
                                        background: 'var(--bg-glass)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '28px',
                                        padding: '2rem',
                                        border: hoveredTile === tile.label
                                            ? `1px solid ${tile.color}80`
                                            : '1px solid var(--glass-border-strong)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        boxShadow: hoveredTile === tile.label
                                            ? `var(--shadow-lg), 0 0 40px ${tile.color}30, inset 0 0 20px ${tile.color}10`
                                            : 'var(--shadow-md)',
                                        transform: hoveredTile === tile.label ? 'translateY(-6px)' : 'translateY(0)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '220px'
                                    }}
                                >
                                    {/* Large Background Watermark Icon */}
                                    <div style={{
                                        position: 'absolute',
                                        right: '-20px',
                                        bottom: '-20px',
                                        fontSize: '12rem',
                                        opacity: 0.05,
                                        transform: 'rotate(-15deg)',
                                        pointerEvents: 'none',
                                        transition: 'all 0.5s ease',
                                        filter: 'blur(2px)',
                                        color: tile.color
                                    }}>
                                        {tile.icon}
                                    </div>

                                    {/* Gradient overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: `linear-gradient(135deg, ${tile.color}08 0%, transparent 100%)`,
                                        opacity: hoveredTile === tile.label ? 1 : 0.5,
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none'
                                    }} />

                                    {/* Content */}
                                    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                            {/* Icon */}
                                            <div style={{
                                                fontSize: '2.5rem',
                                                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                transform: hoveredTile === tile.label
                                                    ? 'rotate(10deg) scale(1.1)'
                                                    : 'rotate(0deg) scale(1)',
                                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                                            }}>
                                                {tile.icon}
                                            </div>
                                            {/* Count */}
                                            <div style={{
                                                fontSize: '2.5rem',
                                                fontWeight: '800',
                                                background: `linear-gradient(135deg, ${tile.color} 0%, ${tile.color}dd 100%)`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                lineHeight: 1,
                                                fontFamily: 'var(--font-heading)'
                                            }}>
                                                {tile.count}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 'auto' }}>
                                            {/* Label */}
                                            <div style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.25rem',
                                                letterSpacing: '-0.01em'
                                            }}>
                                                {tile.label}
                                            </div>

                                            {/* Latest Item Preview */}
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                opacity: 0.8
                                            }}>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Latest:</span>
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '150px',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {tile.latest}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '1.5rem',
                                            borderTop: '1px solid var(--border-color)',
                                            paddingTop: '1rem'
                                        }}>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-tertiary)',
                                                fontWeight: '500'
                                            }}>
                                                {tile.action}
                                            </div>

                                            {/* Pill Button */}
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#fff',
                                                background: tile.color,
                                                fontWeight: '600',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '20px',
                                                boxShadow: `0 4px 12px ${tile.color}40`,
                                                transform: hoveredTile === tile.label ? 'translateX(0)' : 'translateX(5px)',
                                                opacity: hoveredTile === tile.label ? 1 : 0.8,
                                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <span>+</span> {tile.secondaryAction}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Recent Activity Timeline */}
                    <div style={{
                        flex: '1 1 350px', // Grow/Shrink, Basis
                        minWidth: '300px',
                        maxWidth: '100%', // Allow full width on mobile
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem'
                    }}>
                        <FocusTimer />

                        <div style={{
                            background: 'var(--bg-glass)', // Optional: Panel background for sidebar
                            backdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            border: '1px solid var(--glass-border)',
                            padding: '1.5rem',
                            height: 'fit-content' // Adapts to content
                        }}>
                            <h2 style={{
                                marginBottom: '1.5rem',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                letterSpacing: '-0.01em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>⚡</span> Recent Activity
                            </h2>

                            {recentItems.length === 0 ? (
                                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                                    <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📭</div>
                                    <h3 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Activity Yet</h3>
                                    <p className="empty-state-text" style={{ fontSize: '0.9rem' }}>
                                        Start adding content to see your recent activity here
                                    </p>
                                </div>
                            ) : (
                                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                    {/* Timeline line */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '0.5rem',
                                        bottom: '2rem',
                                        width: '2px',
                                        background: 'var(--timeline-line-color)',
                                        opacity: 0.5,
                                        borderRadius: '2px',
                                        zIndex: 0
                                    }} />

                                    {/* Timeline items */}
                                    {recentItems.map((item, index) => (
                                        <div
                                            key={item.id + index}
                                            style={{
                                                position: 'relative',
                                                marginBottom: '1.5rem',
                                                zIndex: 1
                                            }}
                                        >
                                            {/* Timeline node */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '-2rem',
                                                top: '0.25rem',
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                borderRadius: '50%',
                                                background: 'var(--bg-secondary)',
                                                border: '2px solid var(--timeline-line-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem',
                                                boxShadow: '0 0 0 4px var(--bg-primary)' // Pseudo-mask
                                            }}>
                                                {item.icon}
                                            </div>

                                            {/* Content */}
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'default'
                                            }}
                                                className="timeline-item"
                                            >
                                                <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="tag" style={{
                                                        fontSize: '0.65rem',
                                                        padding: '0.15rem 0.5rem',
                                                        borderRadius: '8px'
                                                    }}>
                                                        {item.type}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-tertiary)'
                                                    }}>
                                                        {new Date(item.created_at || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 style={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.25rem',
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {item.title || item.name}
                                                </h3>
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: 1.4,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {item.description || item.content || 'Content update'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .command-tile {
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-glass) !important;
                }

                .command-tile::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.08),
                        transparent
                    );
                    transition: left 0.6s ease;
                    z-index: 2;
                }

                .command-tile:hover::before {
                    left: 100%;
                }

                .timeline-item:hover {
                    transform: translateX(4px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--accent-primary);
                }
            `}</style>
        </div>
    );
}
