import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import workspaceStorage from '../utils/workspaceStorage';
import '../styles/components.css';

export default function WorkspaceSwitcher() {
    const { currentWorkspace, workspaces, switchWorkspace, createWorkspace } = useWorkspace();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkspace, setNewWorkspace] = useState({
        name: '',
        type: 'custom',
        icon: '📁',
        color: '#6366f1'
    });

    const handleSwitchWorkspace = async (workspace) => {
        try {
            await switchWorkspace(workspace);
            setShowDropdown(false);
        } catch (error) {
            console.error('Error switching workspace:', error);
            alert('Failed to switch workspace. Please try again.');
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();

        // Validate name is not empty
        if (!newWorkspace.name || newWorkspace.name.trim() === '') {
            alert('Please enter a workspace name');
            return;
        }

        try {
            console.log('Creating workspace with data:', newWorkspace);
            await createWorkspace(newWorkspace);
            console.log('Workspace created successfully');

            // Close modal and reset form
            setShowCreateModal(false);
            setNewWorkspace({ name: '', type: 'custom', icon: '📁', color: '#6366f1' });
        } catch (error) {
            console.error('Error creating workspace:', error);
            alert(`Failed to create workspace: ${error.message || 'Please try again.'}`);
        }
    };

    const presetTypes = workspaceStorage.getPresetTypes();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Current Workspace Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="btn-glass hover-lift"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-glass)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>
                    {currentWorkspace?.icon || '📁'}
                </span>
                <span>{currentWorkspace?.name || 'Select Workspace'}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div
                    className="glass-strong animate-scale-in"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        left: 0,
                        minWidth: '250px',
                        borderRadius: '16px',
                        padding: '0.75rem',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}
                >
                    <div style={{ marginBottom: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        WORKSPACES
                    </div>

                    {workspaces.map(workspace => (
                        <button
                            key={workspace.id}
                            onClick={() => handleSwitchWorkspace(workspace)}
                            className="btn-glass hover-lift"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: currentWorkspace?.id === workspace.id ? `2px solid ${workspace.color}` : 'none',
                                background: currentWorkspace?.id === workspace.id ? `${workspace.color}15` : 'transparent',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.5rem',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: '1.3rem' }}>{workspace.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div>{workspace.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                                    {workspace.type}
                                </div>
                            </div>
                            {workspace.is_default && (
                                <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--accent-primary)', color: 'white' }}>
                                    DEFAULT
                                </span>
                            )}
                        </button>
                    ))}

                    <button
                        onClick={() => {
                            setShowDropdown(false);
                            setShowCreateModal(true);
                        }}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        + Create Workspace
                    </button>
                </div>
            )}

            {/* Create Workspace Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Create New Workspace</h2>
                            <button onClick={() => setShowCreateModal(false)} className="modal-close">×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreateWorkspace}>
                                <div className="form-group">
                                    <label>Workspace Name</label>
                                    <input
                                        type="text"
                                        value={newWorkspace.name}
                                        onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
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
                                                onClick={() => setNewWorkspace({
                                                    ...newWorkspace,
                                                    type: type.value,
                                                    icon: type.icon,
                                                    color: type.color
                                                })}
                                                className="btn-glass"
                                                style={{
                                                    padding: '0.75rem',
                                                    border: newWorkspace.type === type.value ? `2px solid ${type.color}` : '1px solid var(--glass-border)',
                                                    background: newWorkspace.type === type.value ? `${type.color}15` : 'transparent'
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
                                        value={newWorkspace.icon}
                                        onChange={(e) => setNewWorkspace({ ...newWorkspace, icon: e.target.value })}
                                        placeholder="📁"
                                        maxLength="2"
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Color</label>
                                    <input
                                        type="color"
                                        value={newWorkspace.color}
                                        onChange={(e) => setNewWorkspace({ ...newWorkspace, color: e.target.value })}
                                        className="input"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Create Workspace
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
            )}
        </div>
    );
}
