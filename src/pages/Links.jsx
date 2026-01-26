import { useState, useEffect } from 'react';
import { storage } from '../utils/workspaceAwareStorage';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { alert } from '../utils/alert.jsx';
import { customConfirm } from '../utils/confirm';
import { formatDate, getRelativeTime } from '../utils/dateFormat';

export default function Links() {
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['Software', 'Website', 'Tool', 'Resource', 'Documentation', 'Other'];

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            const allLinks = await storage.links.getAll();
            setLinks(allLinks);
            setFilteredLinks(allLinks);
        } catch (error) {
            console.error('Error loading links:', error);
        }
    };

    const handleSearch = (query) => {
        const filtered = links.filter(link =>
            link.name.toLowerCase().includes(query.toLowerCase()) ||
            link.url.toLowerCase().includes(query.toLowerCase()) ||
            link.description?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredLinks(filtered);
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            setFilteredLinks(links);
        } else {
            setFilteredLinks(links.filter(link => link.category === category));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const linkData = {
            name: formData.get('name'),
            url: formData.get('url'),
            description: formData.get('description'),
            category: formData.get('category')
        };

        try {
            if (editingLink) {
                await storage.links.update(editingLink.id, linkData);
            } else {
                await storage.links.add(linkData);
            }

            setIsModalOpen(false);
            setEditingLink(null);
            await loadLinks();
        } catch (error) {
            console.error('Error saving link:', error);
            alert.error('Failed to save link. Please try again.');
        }
    };

    const handleEdit = (link) => {
        setEditingLink(link);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await customConfirm('Are you sure you want to delete this link?');
        if (confirmed) {
            try {
                await storage.links.delete(id);
                await loadLinks();
                alert.success('Link deleted successfully!');
            } catch (error) {
                console.error('Error deleting link:', error);
                alert.error('Failed to delete link. Please try again.');
            }
        }
    };

    const openAddModal = () => {
        setEditingLink(null);
        setIsModalOpen(true);
    };

    const displayLinks = selectedCategory === 'all' ? filteredLinks : filteredLinks.filter(l => l.category === selectedCategory);

    return (
        <div className="container" style={{
            padding: '2rem 3rem 2rem 2rem',
            maxWidth: '100%'
        }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>🔗 Links</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Manage your useful links, software, and resources
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        + Add Link
                    </button>
                </div>

                {/* Search and Filter */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <SearchBar placeholder="Search links..." onSearch={handleSearch} />

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleCategoryFilter('all')}
                            style={{
                                cursor: 'pointer',
                                background: selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: selectedCategory === 'all' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedCategory === 'all' ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryFilter(cat)}
                                style={{
                                    cursor: 'pointer',
                                    background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                    color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    boxShadow: selectedCategory === cat ? 'var(--shadow-md)' : 'none'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Links Grid */}
                {displayLinks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔗</div>
                        <h3 className="empty-state-title">No Links Yet</h3>
                        <p className="empty-state-text">
                            Start adding your useful links, software, and resources!
                        </p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Your First Link
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-3" style={{ gap: '1.25rem' }}>
                        {displayLinks.map(link => (
                            <div key={link.id} style={{
                                background: 'var(--bg-glass)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                border: '1px solid var(--glass-border)',
                                boxShadow: 'var(--shadow-sm)',
                                padding: '1.25rem',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                position: 'relative'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: 'var(--text-tertiary)',
                                        background: 'var(--bg-tertiary)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px'
                                    }}>
                                        {link.category}
                                    </span>
                                    <div className="card-actions" style={{ position: 'static' }}>
                                        <button className="icon-btn" onClick={() => handleEdit(link)} title="Edit" style={{ width: '24px', height: '24px', fontSize: '1rem' }}>
                                            ✏️
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(link.id)} title="Delete" style={{ width: '24px', height: '24px', fontSize: '1rem' }}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    {link.name}
                                </h3>

                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    flex: 1
                                }}>
                                    {link.description}
                                </p>

                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.85rem',
                                        wordBreak: 'break-all',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: 'auto',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid var(--border-color)',
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                    className="hover-underline"
                                >
                                    <span>🌐</span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {link.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                                    </span>
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingLink(null);
                    }}
                    title={editingLink ? 'Edit Link' : 'Add New Link'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                defaultValue={editingLink?.name}
                                required
                                placeholder="e.g., GitHub"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL *</label>
                            <input
                                type="url"
                                name="url"
                                className="form-input"
                                defaultValue={editingLink?.url}
                                required
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                name="category"
                                className="form-select"
                                defaultValue={editingLink?.category || 'Other'}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                defaultValue={editingLink?.description}
                                placeholder="Brief description of this link..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingLink(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingLink ? 'Update' : 'Add'} Link
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
