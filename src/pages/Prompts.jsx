import { useState, useEffect } from 'react';
import { storage } from '../utils/workspaceAwareStorage';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { alert } from '../utils/alert.jsx';
import { customConfirm } from '../utils/confirm';
import { formatDate, getRelativeTime } from '../utils/dateFormat';

export default function Prompts() {
    const [prompts, setPrompts] = useState([]);
    const [filteredPrompts, setFilteredPrompts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['Coding', 'Design', 'Writing', 'AI/ML', 'Debugging', 'Documentation', 'Other'];

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        try {
            const allPrompts = await storage.prompts.getAll();
            setPrompts(allPrompts);
            setFilteredPrompts(allPrompts);
        } catch (error) {
            console.error('Error loading prompts:', error);
        }
    };

    const handleSearch = (query) => {
        const filtered = prompts.filter(prompt =>
            prompt.title.toLowerCase().includes(query.toLowerCase()) ||
            prompt.content?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPrompts(filtered);
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            setFilteredPrompts(prompts);
        } else {
            setFilteredPrompts(prompts.filter(prompt => prompt.category === category));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const promptData = {
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category')
        };

        try {
            if (editingPrompt) {
                await storage.prompts.update(editingPrompt.id, promptData);
            } else {
                await storage.prompts.add(promptData);
            }

            setIsModalOpen(false);
            setEditingPrompt(null);
            await loadPrompts();
        } catch (error) {
            console.error('Error saving prompt:', error);
            alert.error('Failed to save prompt. Please try again.');
        }
    };

    const handleEdit = (prompt) => {
        setEditingPrompt(prompt);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await customConfirm('Are you sure you want to delete this prompt?');
        if (confirmed) {
            try {
                await storage.prompts.delete(id);
                await loadPrompts();
                alert.success('Prompt deleted successfully!');
            } catch (error) {
                console.error('Error deleting prompt:', error);
                alert.error('Failed to delete prompt. Please try again.');
            }
        }
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
        alert('Prompt copied to clipboard! 📋');
    };

    const openAddModal = () => {
        setEditingPrompt(null);
        setIsModalOpen(true);
    };

    const displayPrompts = selectedCategory === 'all' ? filteredPrompts : filteredPrompts.filter(p => p.category === selectedCategory);

    return (
        <div className="container" style={{
            padding: '2rem 3rem 2rem 2rem',
            maxWidth: '100%'
        }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                        <h1 style={{ marginBottom: '0.5rem' }}>✨ Prompts</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Save and manage your useful prompts for coding, AI, and more
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal} style={{ flexShrink: 0 }}>
                        + Add Prompt
                    </button>
                </div>

                {/* Search and Filter */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <SearchBar placeholder="Search prompts..." onSearch={handleSearch} />

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            className={`tag ${selectedCategory === 'all' ? 'active' : ''}`}
                            style={{
                                cursor: 'pointer',
                                background: selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: selectedCategory === 'all' ? 'white' : 'var(--text-secondary)'
                            }}
                            onClick={() => handleCategoryFilter('all')}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`tag ${selectedCategory === cat ? 'active' : ''}`}
                                style={{
                                    cursor: 'pointer',
                                    background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                    color: selectedCategory === cat ? 'white' : 'var(--text-secondary)'
                                }}
                                onClick={() => handleCategoryFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prompts Grid */}
                {displayPrompts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✨</div>
                        <h3 className="empty-state-title">No Prompts Yet</h3>
                        <p className="empty-state-text">
                            Start saving your useful prompts for quick access!
                        </p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Your First Prompt
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {displayPrompts.map(prompt => (
                            <div key={prompt.id} className="content-card">
                                <div className="card-header">
                                    <div style={{ flex: 1 }}>
                                        <h3 className="card-title">{prompt.title}</h3>
                                        <span className="tag">{prompt.category}</span>
                                    </div>
                                    <div className="card-actions">
                                        <button className="icon-btn" onClick={() => handleCopy(prompt.content)} title="Copy">
                                            📋
                                        </button>
                                        <button className="icon-btn" onClick={() => handleEdit(prompt)} title="Edit">
                                            ✏️
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(prompt.id)} title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--bg-primary)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '1rem',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {prompt.content}
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
                        setEditingPrompt(null);
                    }}
                    title={editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                defaultValue={editingPrompt?.title}
                                required
                                placeholder="e.g., Code Review Prompt"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                name="category"
                                className="form-select"
                                defaultValue={editingPrompt?.category || 'Other'}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Prompt Content *</label>
                            <textarea
                                name="content"
                                className="form-textarea"
                                defaultValue={editingPrompt?.content}
                                required
                                placeholder="Enter your prompt here..."
                                style={{ minHeight: '200px', fontFamily: 'JetBrains Mono, monospace' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingPrompt(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingPrompt ? 'Update' : 'Add'} Prompt
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
