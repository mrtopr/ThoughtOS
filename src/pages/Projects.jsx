import { useState, useEffect } from 'react';
import { storage } from '../utils/workspaceAwareStorage';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { alert } from '../utils/alert.jsx';
import { customConfirm } from '../utils/confirm';
import { formatDate, getRelativeTime } from '../utils/dateFormat';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [previewProject, setPreviewProject] = useState(null);
    const [viewingProject, setViewingProject] = useState(null);

    const [viewMode, setViewMode] = useState('grid'); // grid, board

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const allProjects = await storage.projects.getAll();
            setProjects(allProjects);
            setFilteredProjects(allProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const handleUpdateStatus = async (projectId, newStatus) => {
        try {
            await storage.projects.update(projectId, { status: newStatus });
            await loadProjects();
            alert.success(`Status updated to ${newStatus}`);
        } catch (error) {
            alert.error('Failed to update status');
        }
    };

    const handleSearch = (query) => {
        const filtered = projects.filter(project =>
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description?.toLowerCase().includes(query.toLowerCase()) ||
            project.technologies?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProjects(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectData = {
            name: formData.get('name'),
            description: formData.get('description'),
            githubUrl: formData.get('githubUrl'),
            liveUrl: formData.get('liveUrl'),
            technologies: formData.get('technologies'),
            status: formData.get('status')
        };

        try {
            if (editingProject) {
                await storage.projects.update(editingProject.id, projectData);
            } else {
                await storage.projects.add(projectData);
            }

            setIsModalOpen(false);
            setEditingProject(null);
            await loadProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            alert.error('Failed to save project. Please try again.');
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await customConfirm('Are you sure you want to delete this project?');
        if (confirmed) {
            try {
                await storage.projects.delete(id);
                await loadProjects();
                alert.success('Project deleted successfully!');
            } catch (error) {
                console.error('Error deleting project:', error);
                alert.error('Failed to delete project. Please try again.');
            }
        }
    };

    const openAddModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Completed': '#10b981',
            'In Progress': '#f59e0b',
            'Planning': '#6366f1',
            'On Hold': '#ef4444'
        };
        return colors[status] || '#718096';
    };

    const columns = ['Planning', 'In Progress', 'Completed'];

    return (
        <div className="container page-container" style={{
            maxWidth: '100%'
        }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>💼 Projects</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Manage your creative production pipeline
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="glass" style={{ display: 'flex', borderRadius: '12px', padding: '4px' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                    background: viewMode === 'grid' ? 'var(--accent-gradient)' : 'transparent',
                                    color: viewMode === 'grid' ? 'white' : 'var(--text-primary)',
                                    cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                                }}
                            >Grid</button>
                            <button
                                onClick={() => setViewMode('board')}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                    background: viewMode === 'board' ? 'var(--accent-gradient)' : 'transparent',
                                    color: viewMode === 'board' ? 'white' : 'var(--text-primary)',
                                    cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                                }}
                            >Board</button>
                        </div>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            + Add Project
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2rem' }}>
                    <SearchBar placeholder="Search projects..." onSearch={handleSearch} />
                </div>

                {/* Projects Content */}
                {filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💼</div>
                        <h3 className="empty-state-title">No Projects Yet</h3>
                        <p className="empty-state-text">
                            Start showcasing your amazing projects!
                        </p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Your First Project
                        </button>
                    </div>
                ) : viewMode === 'board' ? (
                    /* Kanban Board View */
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem',
                        overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start'
                    }}>
                        {columns.map(column => (
                            <div key={column} className="glass-strong" style={{
                                padding: '1.5rem', borderRadius: '24px', minHeight: '500px',
                                border: '1px solid var(--glass-border-strong)',
                                background: 'var(--bg-glass)'
                            }}>
                                <h3 style={{
                                    marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', fontSize: '1.1rem', fontWeight: '700'
                                }}>
                                    <span>{column}</span>
                                    <span style={{
                                        fontSize: '0.8rem', background: getStatusColor(column), color: 'white',
                                        padding: '0.2rem 0.6rem', borderRadius: '20px'
                                    }}>
                                        {filteredProjects.filter(p => p.status === column).length}
                                    </span>
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {filteredProjects.filter(p => p.status === column).map(project => (
                                        <div
                                            key={project.id}
                                            className="card"
                                            style={{ padding: '1.25rem', cursor: 'default' }}
                                        >
                                            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{project.name}</h4>
                                            <p style={{
                                                fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem',
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>{project.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button className="icon-btn" onClick={() => handleEdit(project)}>✏️</button>
                                                    <button className="icon-btn" onClick={() => setViewingProject(project)}>👁️</button>
                                                </div>
                                                <select
                                                    value={project.status}
                                                    onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                                                    style={{
                                                        fontSize: '0.75rem', padding: '0.25rem', borderRadius: '6px',
                                                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none'
                                                    }}
                                                >
                                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                    <option value="On Hold">On Hold</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                        {filteredProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => setViewingProject(project)}
                                style={{
                                    cursor: 'pointer',
                                    background: 'var(--bg-glass)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    boxShadow: 'var(--shadow-md)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '600',
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-primary)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {project.name}
                                            </h3>
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: getStatusColor(project.status) + '20', // 20% opacity
                                                    color: getStatusColor(project.status),
                                                    border: `1px solid ${getStatusColor(project.status)}40`
                                                }}
                                            >
                                                {project.status === 'In Progress' ? '🚧 ' : project.status === 'Completed' ? '✅ ' : project.status === 'Planning' ? '📅 ' : '⏸️ '}
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                            {project.liveUrl && (
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => { e.stopPropagation(); setPreviewProject(project); }}
                                                    title="Preview"
                                                >
                                                    👁️
                                                </button>
                                            )}
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        marginBottom: '1.5rem',
                                        flex: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {project.description}
                                    </p>

                                    {project.technologies && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                            {project.technologies.split(',').slice(0, 3).map((tech, idx) => (
                                                <span key={idx} style={{
                                                    padding: '0.25rem 0.625rem',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: 'var(--text-secondary)'
                                                }}>{tech.trim()}</span>
                                            ))}
                                            {project.technologies.split(',').length > 3 && (
                                                <span style={{
                                                    padding: '0.25rem 0.625rem',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: 'var(--text-tertiary)'
                                                }}>+{project.technologies.split(',').length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--border-color)',
                                        marginTop: 'auto'
                                    }}>
                                        {project.githubUrl && (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary hover-lift"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.5rem' }}
                                            >
                                                <span style={{ marginRight: '0.375rem' }}>🔗</span>
                                                GitHub
                                            </a>
                                        )}
                                        {project.liveUrl && (
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary hover-lift"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.5rem' }}
                                            >
                                                <span style={{ marginRight: '0.375rem' }}>🚀</span>
                                                Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingProject(null);
                    }}
                    title={editingProject ? 'Edit Project' : 'Add New Project'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Project Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                defaultValue={editingProject?.name}
                                required
                                placeholder="e.g., My Awesome App"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                defaultValue={editingProject?.description}
                                required
                                placeholder="What does this project do?"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">GitHub URL</label>
                            <input
                                type="url"
                                name="githubUrl"
                                className="form-input"
                                defaultValue={editingProject?.githubUrl}
                                placeholder="https://github.com/..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Live Preview URL</label>
                            <input
                                type="url"
                                name="liveUrl"
                                className="form-input"
                                defaultValue={editingProject?.liveUrl}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Technologies (comma-separated)</label>
                            <input
                                type="text"
                                name="technologies"
                                className="form-input"
                                defaultValue={editingProject?.technologies}
                                placeholder="React, Node.js, MongoDB"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status *</label>
                            <select
                                name="status"
                                className="form-select"
                                defaultValue={editingProject?.status || 'In Progress'}
                                required
                            >
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingProject(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingProject ? 'Update' : 'Add'} Project
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Preview Modal */}
                <Modal
                    isOpen={!!previewProject}
                    onClose={() => setPreviewProject(null)}
                    title={previewProject?.name || ''}
                >
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            {previewProject?.description}
                        </p>
                        <a
                            href={previewProject?.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            🔗 Open in New Tab
                        </a>
                    </div>

                    {/* iframe Preview */}
                    <div style={{
                        width: '100%',
                        height: '600px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: 'white'
                    }}>
                        <iframe
                            src={previewProject?.liveUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            title={previewProject?.name}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                </Modal>

                {/* Detailed View Modal */}
                <Modal
                    isOpen={!!viewingProject}
                    onClose={() => setViewingProject(null)}
                    title={viewingProject?.name || ''}
                >
                    <div className="animate-scale-in">
                        {/* Status Badge */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span
                                className="tag"
                                style={{
                                    background: getStatusColor(viewingProject?.status),
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem 1rem'
                                }}
                            >
                                {viewingProject?.status}
                            </span>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{
                                color: 'var(--text-primary)',
                                marginBottom: '0.75rem',
                                fontSize: '1.1rem',
                                fontWeight: '600'
                            }}>
                                📝 Description
                            </h4>
                            <p style={{
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                fontSize: '0.95rem'
                            }}>
                                {viewingProject?.description}
                            </p>
                        </div>

                        {/* Technologies */}
                        {viewingProject?.technologies && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.75rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}>
                                    🛠️ Technologies
                                </h4>
                                <div className="tags">
                                    {viewingProject.technologies.split(',').map((tech, idx) => (
                                        <span key={idx} className="tag">{tech.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            {viewingProject?.githubUrl && (
                                <a
                                    href={viewingProject.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary hover-lift"
                                    style={{ flex: 1, textAlign: 'center' }}
                                >
                                    <span style={{ marginRight: '0.5rem' }}>🔗</span>
                                    View on GitHub
                                </a>
                            )}
                            {viewingProject?.liveUrl && (
                                <a
                                    href={viewingProject.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary hover-lift"
                                    style={{ flex: 1, textAlign: 'center' }}
                                >
                                    <span style={{ marginRight: '0.5rem' }}>🚀</span>
                                    Live Demo
                                </a>
                            )}
                        </div>

                        {/* Preview Button */}
                        {viewingProject?.liveUrl && (
                            <button
                                onClick={() => {
                                    setPreviewProject(viewingProject);
                                    setViewingProject(null);
                                }}
                                className="btn btn-glass hover-lift"
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>👁️</span>
                                <span>Preview in App</span>
                            </button>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
}
