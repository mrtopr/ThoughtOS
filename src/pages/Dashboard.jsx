import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Link2,
    FolderKanban,
    FileText,
    Sparkles,
    PlayCircle,
    BarChart3,
    Database,
    Activity,
    Inbox,
    Plus,
    ArrowUpRight
} from 'lucide-react';
import { storage } from '../utils/workspaceAwareStorage';
import taskStorage from '../utils/taskStorage';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { auth } from '../utils/auth';
import Loader from '../components/Loader';
import FocusTimer from '../components/FocusTimer';

export default function Dashboard() {
    const navigate = useNavigate();
    const { currentWorkspace } = useWorkspace();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        links: 0,
        projects: 0,
        blogPosts: 0,
        prompts: 0,
        videos: 0,
        tasks: 0,
        completedTasks: 0
    });

    const [recentItems, setRecentItems] = useState([]);
    const [latestItems, setLatestItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [hoveredTile, setHoveredTile] = useState(null);

    useEffect(() => {
        loadDashboardData();
        loadUserData();

        const handleWorkspaceChange = () => loadDashboardData();
        const handleTasksUpdate = () => loadDashboardData();
        const handleProfileUpdate = (e) => {
            if (e.detail) {
                setUser(e.detail);
            } else {
                loadUserData();
            }
        };

        window.addEventListener('workspaceChanged', handleWorkspaceChange);
        window.addEventListener('workspaceDataUpdated', handleWorkspaceChange);
        window.addEventListener('tasksUpdated', handleTasksUpdate);
        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('workspaceChanged', handleWorkspaceChange);
            window.removeEventListener('workspaceDataUpdated', handleWorkspaceChange);
            window.removeEventListener('tasksUpdated', handleTasksUpdate);
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [currentWorkspace?.id]);

    const loadUserData = async () => {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [links, projects, blogPosts, prompts, videos] = await Promise.all([
                storage.links.getAll(),
                storage.projects.getAll(),
                storage.blog.getAll(),
                storage.prompts.getAll(),
                storage.videos.getAll()
            ]);

            const allTasks = taskStorage.getAllTasks(currentWorkspace?.id);
            const completedTasks = allTasks.filter(t => t.completed).length;

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

            setStats({
                links: links.length,
                projects: projects.length,
                blogPosts: blogPosts.length,
                prompts: prompts.length,
                videos: videos.length,
                tasks: allTasks.length,
                completedTasks
            });

            const allItems = [
                ...blogPosts.map(item => ({ ...item, type: 'blog' })),
                ...projects.map(item => ({ ...item, type: 'project' })),
                ...links.map(item => ({ ...item, type: 'link' })),
                ...prompts.map(item => ({ ...item, type: 'prompt' })),
                ...videos.map(item => ({ ...item, type: 'video' }))
            ];

            allItems.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
            setRecentItems(allItems.slice(0, 6));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'blog': return FileText;
            case 'project': return FolderKanban;
            case 'link': return Link2;
            case 'prompt': return Sparkles;
            case 'video': return PlayCircle;
            default: return Activity;
        }
    };

    const commandTiles = [
        {
            index: '01',
            label: 'Links',
            count: stats.links,
            icon: Link2,
            path: '/links',
            action: 'Manage Links',
            secondaryAction: 'Add Link',
            latest: latestItems.links ? (latestItems.links.title || latestItems.links.name) : 'No links yet'
        },
        {
            index: '02',
            label: 'Projects',
            count: stats.projects,
            icon: FolderKanban,
            path: '/projects',
            action: 'View Projects',
            secondaryAction: 'New Project',
            latest: latestItems.projects ? latestItems.projects.name : 'No active projects'
        },
        {
            index: '03',
            label: 'Blog',
            count: stats.blogPosts,
            icon: FileText,
            path: '/blog',
            action: 'Read Posts',
            secondaryAction: 'Write',
            latest: latestItems.blogPosts ? latestItems.blogPosts.title : 'Start writing'
        },
        {
            index: '04',
            label: 'Prompts',
            count: stats.prompts,
            icon: Sparkles,
            path: '/prompts',
            action: 'Prompt Library',
            secondaryAction: 'Save',
            latest: latestItems.prompts ? latestItems.prompts.title : 'No prompts saved'
        },
        {
            index: '05',
            label: 'Videos',
            count: stats.videos,
            icon: PlayCircle,
            path: '/videos',
            action: 'Watch Collection',
            secondaryAction: 'Add',
            latest: latestItems.videos ? latestItems.videos.title : 'No videos added'
        },
        {
            index: '06',
            label: 'Analytics',
            count: `${stats.completedTasks}/${stats.tasks}`,
            icon: BarChart3,
            path: '/analytics',
            action: 'Task Insights',
            secondaryAction: 'Open',
            isAnalytics: true,
            latest: stats.tasks > 0
                ? `${Math.round((stats.completedTasks / stats.tasks) * 100)}% tasks completed`
                : 'No tasks tracked yet'
        }
    ];

    if (loading) {
        return <Loader message="Loading command center..." />;
    }

    const totalItems = stats.links + stats.projects + stats.blogPosts + stats.prompts + stats.videos;

    return (
        <div className="container dashboard-container page-container" style={{ maxWidth: '100%' }}>
            <div className="fade-in">
                {/* Editorial Header */}
                <div className="dashboard-header" style={{
                    marginBottom: '2.25rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: '1rem'
                }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: 'var(--accent-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '0.35rem',
                            fontWeight: '600'
                        }}>
                            {currentWorkspace?.name || 'Personal'} · Workspace
                        </div>
                        <h1 style={{
                            marginBottom: '0.25rem',
                            fontSize: '2.25rem',
                            fontWeight: '700',
                            letterSpacing: '-0.035em',
                            lineHeight: 1.1
                        }}>
                            Command Center
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.94rem',
                            margin: 0
                        }}>
                            {user?.user_metadata?.display_name
                                ? `Welcome back, ${user.user_metadata.display_name}`
                                : 'Your local-first knowledge & productivity studio'}
                        </p>
                    </div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <Database size={13} style={{ color: 'var(--accent-primary)' }} />
                        <span>
                            <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> ITEMS SAVED
                        </span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="dashboard-layout" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.75rem',
                    alignItems: 'flex-start'
                }}>
                    {/* Left Column: Swiss Architectural Bento Grid */}
                    <div style={{
                        flex: '2 1 600px',
                        minWidth: '0'
                    }}>
                        <div className="command-tiles-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            {commandTiles.map((tile) => {
                                const Icon = tile.icon;
                                const isHovered = hoveredTile === tile.label;

                                return (
                                    <div
                                        key={tile.label}
                                        className="command-tile"
                                        onClick={() => navigate(tile.path)}
                                        onMouseEnter={() => setHoveredTile(tile.label)}
                                        onMouseLeave={() => setHoveredTile(null)}
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '16px',
                                            padding: '1.4rem',
                                            border: isHovered
                                                ? '1px solid var(--accent-primary)'
                                                : '1px solid var(--border-color)',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.22s ease',
                                            boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                            transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            minHeight: '188px'
                                        }}
                                    >
                                        {/* Top Hairline Accent on Hover */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'var(--accent-primary)',
                                            opacity: isHovered ? 1 : 0,
                                            transition: 'opacity 0.2s ease'
                                        }} />

                                        {/* Content */}
                                        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.15rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                    <div style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '10px',
                                                        background: isHovered ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                        border: '1px solid var(--border-color)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: isHovered ? '#ffffff' : 'var(--text-primary)',
                                                        transition: 'all 0.2s ease'
                                                    }}>
                                                        <Icon size={18} strokeWidth={1.9} />
                                                    </div>
                                                    <span style={{
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-tertiary)',
                                                        letterSpacing: '0.06em'
                                                    }}>
                                                        /{tile.index}
                                                    </span>
                                                </div>

                                                <div style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: tile.isAnalytics ? '1.65rem' : '2rem',
                                                    fontWeight: '700',
                                                    color: 'var(--text-primary)',
                                                    lineHeight: 1,
                                                    fontVariantNumeric: 'tabular-nums',
                                                    letterSpacing: '-0.03em'
                                                }}>
                                                    {tile.count}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 'auto' }}>
                                                <div style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '1.12rem',
                                                    fontWeight: '700',
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '0.2rem',
                                                    letterSpacing: '-0.02em'
                                                }}>
                                                    {tile.label}
                                                </div>

                                                <div style={{
                                                    fontSize: '0.82rem',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem'
                                                }}>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>Latest:</span>
                                                    <span style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '170px'
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
                                                marginTop: '1.15rem',
                                                borderTop: '1px solid var(--border-color)',
                                                paddingTop: '0.75rem'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.78rem',
                                                    color: 'var(--text-tertiary)',
                                                    fontWeight: '500'
                                                }}>
                                                    {tile.action}
                                                </span>

                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: isHovered ? '#ffffff' : 'var(--text-primary)',
                                                    background: isHovered ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                    border: isHovered ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                                    fontWeight: '600',
                                                    padding: '0.3rem 0.72rem',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    {tile.isAnalytics ? <ArrowUpRight size={12} /> : <Plus size={12} strokeWidth={2.4} />}
                                                    <span>{tile.secondaryAction}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Focus Timer & Recent Activity */}
                    <div style={{
                        flex: '1 1 330px',
                        minWidth: '290px',
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <FocusTimer />

                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            padding: '1.4rem',
                            height: 'fit-content'
                        }}>
                            <h2 style={{
                                marginBottom: '1.15rem',
                                fontSize: '0.98rem',
                                fontWeight: '700',
                                letterSpacing: '-0.01em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
                                <span>Recent Activity</span>
                            </h2>

                            {recentItems.length === 0 ? (
                                <div className="empty-state" style={{ padding: '1.5rem 0.75rem', textAlign: 'center' }}>
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '10px',
                                        background: 'var(--bg-tertiary)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-tertiary)',
                                        marginBottom: '0.65rem'
                                    }}>
                                        <Inbox size={20} />
                                    </div>
                                    <h3 className="empty-state-title" style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>No Activity Yet</h3>
                                    <p className="empty-state-text" style={{ fontSize: '0.82rem', margin: 0 }}>
                                        Add links, projects, or notes to see updates here.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '0.62rem',
                                        top: '0.5rem',
                                        bottom: '1.5rem',
                                        width: '1px',
                                        background: 'var(--timeline-line-color)',
                                        zIndex: 0
                                    }} />

                                    {recentItems.map((item, index) => {
                                        const TypeIcon = getTypeIcon(item.type);
                                        return (
                                            <div
                                                key={(item.id || index) + '-' + index}
                                                style={{
                                                    position: 'relative',
                                                    marginBottom: index === recentItems.length - 1 ? 0 : '0.85rem',
                                                    zIndex: 1
                                                }}
                                            >
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-1.75rem',
                                                    top: '0.35rem',
                                                    width: '1.3rem',
                                                    height: '1.3rem',
                                                    borderRadius: '50%',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-color-strong)',
                                                    color: 'var(--accent-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <TypeIcon size={10} strokeWidth={2.2} />
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        const routes = {
                                                            blog: '/blog',
                                                            project: '/projects',
                                                            link: '/links',
                                                            prompt: '/prompts',
                                                            video: '/videos'
                                                        };
                                                        if (routes[item.type]) navigate(routes[item.type]);
                                                    }}
                                                    style={{
                                                        padding: '0.65rem 0.85rem',
                                                        background: 'var(--bg-primary)',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--border-color)',
                                                        transition: 'all 0.18s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="timeline-item"
                                                >
                                                    <div style={{ marginBottom: '0.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{
                                                            fontFamily: 'var(--font-mono)',
                                                            fontSize: '0.66rem',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            color: 'var(--accent-primary)'
                                                        }}>
                                                            {item.type}
                                                        </span>
                                                        <span style={{
                                                            fontFamily: 'var(--font-mono)',
                                                            fontSize: '0.68rem',
                                                            color: 'var(--text-tertiary)'
                                                        }}>
                                                            {new Date(item.created_at || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <h3 style={{
                                                        fontSize: '0.88rem',
                                                        fontWeight: '600',
                                                        marginBottom: '0.1rem',
                                                        color: 'var(--text-primary)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {item.title || item.name}
                                                    </h3>
                                                    <p style={{
                                                        fontSize: '0.78rem',
                                                        color: 'var(--text-secondary)',
                                                        lineHeight: 1.35,
                                                        margin: 0,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {item.description || item.content || 'Updated item'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .timeline-item:hover {
                    transform: translateX(3px);
                    border-color: var(--accent-primary) !important;
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 1rem !important;
                    }
                    .dashboard-header {
                        margin-bottom: 1.5rem !important;
                    }
                    .dashboard-layout {
                        gap: 1.25rem !important;
                    }
                    .command-tiles-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .command-tile {
                        padding: 1.2rem !important;
                        min-height: 164px !important;
                    }
                }
            `}</style>
        </div>
    );
}
