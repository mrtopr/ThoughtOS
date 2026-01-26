import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import workspaceStorage from '../utils/workspaceStorage';
import '../styles/components.css';

export default function WorkspaceManager() {
    const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, deleteWorkspace, refreshWorkspaces } = useWorkspace();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
    const [hoveredCapsule, setHoveredCapsule] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [archivedWorkspaces, setArchivedWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'custom',
        icon: '📁',
        color: '#6366f1'
    });

    useEffect(() => {
        if (currentWorkspace && !selectedWorkspace) {
            setSelectedWorkspace(currentWorkspace);
        }
    }, [currentWorkspace]);

    useEffect(() => {
        if (showArchived) {
            loadArchivedWorkspaces();
        }
    }, [showArchived]);

    const loadArchivedWorkspaces = async () => {
        const archived = await workspaceStorage.getArchived();
        setArchivedWorkspaces(archived);
    };

    const presetTypes = workspaceStorage.getPresetTypes();

    // Get gradient colors for workspace types
    const getWorkspaceGradient = (type) => {
        const gradients = {
            youtube: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
            college: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            personal: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            custom: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
        };
        return gradients[type] || gradients.custom;
    };

    const getWorkspaceIcon = (type) => {
        const icons = {
            youtube: '/youtube_icon.png',
            college: '/college_icon.png',
            personal: '/personal_icon.png',
            custom: '/work_icon.png'
        };
        return icons[type] || icons.custom;
    };

    const getModeTitle = (workspace) => {
        const titles = {
            youtube: 'Creator Mode Enabled',
            college: 'Student Mode Enabled',
            personal: 'Personal Mode Enabled',
            custom: 'Custom Mode Enabled'
        };
        return titles[workspace.type] || 'Mode Enabled';
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Please enter a workspace name');
            return;
        }

        try {
            await createWorkspace(formData);
            setShowCreateModal(false);
            setFormData({ name: '', type: 'custom', icon: '📁', color: '#6366f1' });
        } catch (error) {
            console.error('Error creating workspace:', error);
            alert('Failed to create workspace. Please try again.');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Please enter a workspace name');
            return;
        }

        try {
            await workspaceStorage.update(editingWorkspace.id, {
                name: formData.name,
                icon: formData.icon,
                color: formData.color,
                type: formData.type
            });
            await refreshWorkspaces();
            setShowEditModal(false);
            setEditingWorkspace(null);
            setFormData({ name: '', type: 'custom', icon: '📁', color: '#6366f1' });
        } catch (error) {
            console.error('Error updating workspace:', error);
            alert('Failed to update workspace. Please try again.');
        }
    };

    const handleDeleteClick = (workspace) => {
        if (workspaces.length === 1 && !workspace.is_archived) {
            alert('Cannot delete the last active workspace. You must have at least one workspace.');
            return;
        }
        setWorkspaceToDelete(workspace);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!workspaceToDelete) return;

        try {
            await deleteWorkspace(workspaceToDelete.id);
            if (workspaceToDelete.is_archived) {
                await loadArchivedWorkspaces();
            }
            if (selectedWorkspace?.id === workspaceToDelete.id) {
                setSelectedWorkspace(null);
            }
            setShowDeleteConfirmModal(false);
            setWorkspaceToDelete(null);
        } catch (error) {
            console.error('Error deleting workspace:', error);
            alert('Failed to delete workspace. Please try again.');
        }
    };

    const handleArchive = async (workspace) => {
        if (workspaces.length === 1) {
            alert('Cannot archive the last workspace. You must have at least one workspace.');
            return;
        }

        if (confirm(`Are you sure you want to archive "${workspace.name}"? You can unarchive it later.`)) {
            try {
                await workspaceStorage.update(workspace.id, { is_archived: true });
                await refreshWorkspaces();
                // If the archived workspace was selected, switch to another one
                if (selectedWorkspace?.id === workspace.id) {
                    const next = workspaces.find(w => w.id !== workspace.id);
                    if (next) setSelectedWorkspace(next);
                }
            } catch (error) {
                console.error('Error archiving workspace:', error);
                alert('Failed to archive workspace. Please try again.');
            }
        }
    };

    const handleUnarchive = async (workspace) => {
        try {
            await workspaceStorage.update(workspace.id, { is_archived: false });
            await refreshWorkspaces();
            await loadArchivedWorkspaces();
            setSelectedWorkspace(workspace);
            setShowArchived(false); // Switch back to active view to see it
        } catch (error) {
            console.error('Error unarchiving workspace:', error);
            alert('Failed to unarchive workspace. Please try again.');
        }
    };

    const handleSetDefault = async (workspace) => {
        try {
            await workspaceStorage.setDefault(workspace.id);
            await refreshWorkspaces();
        } catch (error) {
            console.error('Error setting default workspace:', error);
            alert('Failed to set default workspace. Please try again.');
        }
    };

    const openEditModal = (workspace) => {
        setEditingWorkspace(workspace);
        setFormData({
            name: workspace.name,
            type: workspace.type,
            icon: workspace.icon,
            color: workspace.color
        });
        setShowEditModal(true);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Noise Texture Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                opacity: 0.02,
                pointerEvents: 'none'
            }} />

            {/* Main Layout */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '3rem',
                padding: '0 3rem 3rem 3rem',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Left: Vertical Mode Capsules */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    paddingTop: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        padding: '0 0.5rem'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {showArchived ? 'Archived' : 'Active'} Contexts
                        </h3>
                    </div>

                    {(showArchived ? archivedWorkspaces : workspaces).map(workspace => {
                        const isSelected = selectedWorkspace?.id === workspace.id;
                        const isHovered = hoveredCapsule === workspace.id;

                        return (
                            <div
                                key={workspace.id}
                                onClick={() => {
                                    setSelectedWorkspace(workspace);
                                    if (!workspace.is_archived) switchWorkspace(workspace);
                                }}
                                onMouseEnter={() => setHoveredCapsule(workspace.id)}
                                onMouseLeave={() => setHoveredCapsule(null)}
                                style={{
                                    position: 'relative',
                                    cursor: isSelected ? 'default' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                {/* Breathing Glow Ring for Active */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: '-8px',
                                        background: getWorkspaceGradient(workspace.type),
                                        borderRadius: '50px',
                                        opacity: 0.4,
                                        filter: 'blur(12px)',
                                        animation: 'breathe 3s ease-in-out infinite',
                                        zIndex: 0
                                    }} />
                                )}

                                {/* Capsule */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem',
                                    paddingRight: isHovered || isSelected ? '1.5rem' : '0.75rem',
                                    background: isSelected
                                        ? 'var(--bg-glass)'
                                        : 'var(--bg-secondary)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '50px',
                                    border: isSelected
                                        ? '2px solid var(--glass-border)'
                                        : '1px solid var(--glass-border)',
                                    boxShadow: isSelected
                                        ? 'var(--shadow-lg)'
                                        : 'var(--shadow-md)',
                                    width: isHovered || isSelected ? '240px' : '80px',
                                    position: 'relative',
                                    zIndex: 1,
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}>
                                    {/* Icon Circle */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: getWorkspaceGradient(workspace.type),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        transform: isHovered ? 'rotate(3deg) scale(1.05)' : 'rotate(0deg) scale(1)',
                                        transition: 'transform 0.3s ease'
                                    }}>
                                        <span style={{
                                            fontSize: '1.5rem',
                                            filter: 'brightness(1.2)'
                                        }}>
                                            {workspace.icon}
                                        </span>
                                    </div>

                                    {/* Text Container with overflow control */}
                                    <div style={{
                                        flex: 1,
                                        overflow: 'hidden',
                                        opacity: isHovered || isSelected ? 1 : 0,
                                        transition: 'opacity 0.3s ease'
                                    }}>
                                        <span style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: 'block'
                                        }}>
                                            {workspace.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Context Button - Only show in Active mode */}
                    {!showArchived && (
                        <div
                            onClick={() => setShowCreateModal(true)}
                            onMouseEnter={() => setHoveredCapsule('new')}
                            onMouseLeave={() => setHoveredCapsule(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem',
                                paddingRight: hoveredCapsule === 'new' ? '1.5rem' : '0.75rem',
                                background: 'var(--bg-secondary)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '50px',
                                border: '1px dashed var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                width: hoveredCapsule === 'new' ? '240px' : '80px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                +
                            </div>
                            <span style={{
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap',
                                opacity: hoveredCapsule === 'new' ? 1 : 0,
                                transition: 'opacity 0.3s ease'
                            }}>
                                New Context
                            </span>
                        </div>
                    )}

                    {/* Toggle Archive View Button */}
                    <div
                        onClick={() => {
                            setShowArchived(!showArchived);
                            setSelectedWorkspace(null); // Clear selection when switching modes
                        }}
                        onMouseEnter={() => setHoveredCapsule('archive')}
                        onMouseLeave={() => setHoveredCapsule(null)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem',
                            paddingRight: hoveredCapsule === 'archive' ? '1.5rem' : '0.75rem',
                            background: showArchived ? 'var(--bg-glass)' : 'transparent',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '50px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            width: hoveredCapsule === 'archive' ? '240px' : '80px',
                            cursor: 'pointer',
                            marginTop: 'auto', // Push to bottom if container has height
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '1.2rem',
                            color: 'var(--text-secondary)'
                        }}>
                            {showArchived ? '📂' : '📦'}
                        </div>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            opacity: hoveredCapsule === 'archive' ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                        }}>
                            {showArchived ? 'View Active' : 'View Archived'}
                        </span>
                    </div>
                </div>

                {/* Right: Selected Workspace Panel */}
                {selectedWorkspace && (
                    <div style={{
                        flex: 1,
                        width: '100%'
                    }}>
                        <div style={{
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(40px)',
                            borderRadius: '32px',
                            padding: '3rem',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'var(--shadow-xl)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Subtle gradient overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '200px',
                                background: getWorkspaceGradient(selectedWorkspace.type),
                                opacity: 0.05,
                                borderRadius: '32px 32px 0 0',
                                pointerEvents: 'none'
                            }} />

                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* 3D Icon */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    <img
                                        src={getWorkspaceIcon(selectedWorkspace.type)}
                                        alt={selectedWorkspace.name}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))',
                                            animation: 'float 6s ease-in-out infinite'
                                        }}
                                    />
                                </div>

                                {/* Title */}
                                <h2 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    textAlign: 'center',
                                    marginBottom: '0.5rem',
                                    letterSpacing: '-0.01em'
                                }}>
                                    {getModeTitle(selectedWorkspace)}
                                </h2>

                                {/* Subtitle */}
                                <p style={{
                                    fontSize: '1.1rem',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                    marginBottom: '1.5rem',
                                    fontWeight: '300'
                                }}>
                                    {selectedWorkspace.name}
                                </p>

                                {/* Status Badges */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    justifyContent: 'center',
                                    marginBottom: '2.5rem'
                                }}>
                                    {selectedWorkspace.is_archived ? (
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '12px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            letterSpacing: '0.05em'
                                        }}>
                                            ARCHIVED
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '12px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            color: '#059669',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            letterSpacing: '0.05em'
                                        }}>
                                            ACTIVE
                                        </div>
                                    )}
                                    {selectedWorkspace.is_default && (
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '12px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            color: '#6366f1',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            letterSpacing: '0.05em'
                                        }}>
                                            DEFAULT
                                        </div>
                                    )}
                                </div>

                                {/* Action Tiles */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '1rem'
                                }}>
                                    {/* Edit Configuration */}
                                    <div
                                        onClick={() => openEditModal(selectedWorkspace)}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'var(--card-bg)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '20px',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: 'var(--shadow-md)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textAlign: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '1.75rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            ⚙️
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)'
                                        }}>
                                            Edit Configuration
                                        </div>
                                    </div>

                                    {/* Set as Default */}
                                    {!selectedWorkspace.is_default && !selectedWorkspace.is_archived && (
                                        <div
                                            onClick={() => handleSetDefault(selectedWorkspace)}
                                            style={{
                                                padding: '1.5rem',
                                                background: 'var(--card-bg)',
                                                backdropFilter: 'blur(20px)',
                                                borderRadius: '20px',
                                                border: '1px solid var(--border-color)',
                                                boxShadow: 'var(--shadow-md)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                textAlign: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '1.75rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                ⭐
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                color: 'var(--text-primary)'
                                            }}>
                                                Set as Default
                                            </div>
                                        </div>
                                    )}

                                    {/* Archive/Unarchive Mode */}
                                    <div
                                        onClick={() => selectedWorkspace.is_archived ? handleUnarchive(selectedWorkspace) : handleArchive(selectedWorkspace)}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'var(--card-bg)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '20px',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: 'var(--shadow-md)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textAlign: 'center',
                                            gridColumn: 'span 1'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '1.75rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {selectedWorkspace.is_archived ? '📂' : '📦'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {selectedWorkspace.is_archived ? 'Unarchive' : 'Archive'}
                                        </div>
                                    </div>

                                    {/* Delete Workspace */}
                                    <div
                                        onClick={() => handleDeleteClick(selectedWorkspace)}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            boxShadow: 'var(--shadow-md)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textAlign: 'center',
                                            gridColumn: 'span 1'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '1.75rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            🗑️
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#ef4444'
                                        }}>
                                            Delete Context
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Workspace Modal */}
            {
                showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2>Create New Context</h2>
                                <button onClick={() => setShowCreateModal(false)} className="modal-close">×</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreate}>
                                    <div className="form-group">
                                        <label>Context Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., YouTube, College, Work"
                                            required
                                            className="input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Type</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                            {presetTypes.map(type => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        type: type.value,
                                                        icon: type.icon,
                                                        color: type.color
                                                    })}
                                                    className="btn-glass"
                                                    style={{
                                                        padding: '0.75rem',
                                                        border: formData.type === type.value ? `2px solid ${type.color}` : '1px solid var(--glass-border)',
                                                        background: formData.type === type.value ? `${type.color}15` : 'transparent'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>
                                                        {type.icon}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem' }}>{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Icon</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="📁"
                                            maxLength="2"
                                            className="input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Color</label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="input"
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                            Create Context
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="btn btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Workspace Modal */}
            {
                showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2>Edit Context</h2>
                                <button onClick={() => setShowEditModal(false)} className="modal-close">×</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEdit}>
                                    <div className="form-group">
                                        <label>Context Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., YouTube, College, Work"
                                            required
                                            className="input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Type</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                            {presetTypes.map(type => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        type: type.value,
                                                        icon: type.icon,
                                                        color: type.color
                                                    })}
                                                    className="btn-glass"
                                                    style={{
                                                        padding: '0.75rem',
                                                        border: formData.type === type.value ? `2px solid ${type.color}` : '1px solid var(--glass-border)',
                                                        background: formData.type === type.value ? `${type.color}15` : 'transparent'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>
                                                        {type.icon}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem' }}>{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Icon</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="📁"
                                            maxLength="2"
                                            className="input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Color</label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="input"
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="btn btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                @keyframes breathe {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.05);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && workspaceToDelete && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}>
                    <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '2.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1rem',
                                animation: 'pulse 2s infinite'
                            }}>
                                ⚠️
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Delete Context?</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>"{workspaceToDelete.name}"</strong>?
                                <br /><br />
                                All data and progress within this context will be <span style={{ color: '#ef4444', fontWeight: '700' }}>lost forever</span>.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button
                                onClick={confirmDelete}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                    fontWeight: '700'
                                }}
                            >
                                Delete Permanently
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirmModal(false)}
                                className="btn-glass"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    fontWeight: '700'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
