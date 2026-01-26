import { useState, useEffect } from 'react';
import { storage } from '../utils/workspaceAwareStorage';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { alert } from '../utils/alert.jsx';
import { customConfirm } from '../utils/confirm';
import { formatDate, getRelativeTime } from '../utils/dateFormat';
import AIRewriter from '../components/AIRewriter';
import '../styles/blog-visuals.css';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [viewingPost, setViewingPost] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formTags, setFormTags] = useState('');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const allPosts = await storage.blog.getAll();
            setPosts(allPosts);
            setFilteredPosts(allPosts);
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    };

    const handleSearch = (query) => {
        const filtered = posts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content?.toLowerCase().includes(query.toLowerCase()) ||
            post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredPosts(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const postData = {
            title: formTitle,
            content: formContent,
            tags: formTags?.split(',').map(t => t.trim()).filter(Boolean) || []
        };

        try {
            if (editingPost) {
                await storage.blog.update(editingPost.id, postData);
            } else {
                await storage.blog.add(postData);
            }

            setIsModalOpen(false);
            setEditingPost(null);
            await loadPosts();
        } catch (error) {
            console.error('Error saving blog post:', error);
            alert.error('Failed to save blog post. Please try again.');
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setFormTitle(post.title || '');
        setFormContent(post.content || '');
        setFormTags(post.tags?.join(', ') || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening view modal
        const confirmed = await customConfirm('Are you sure you want to delete this blog post?');
        if (confirmed) {
            try {
                await storage.blog.delete(id);
                await loadPosts();
                alert.success('Blog post deleted successfully!');
            } catch (error) {
                console.error('Error deleting blog post:', error);
                alert.error('Failed to delete blog post. Please try again.');
            }
        }
    };

    const openAddModal = () => {
        setEditingPost(null);
        setFormTitle('');
        setFormContent('');
        setFormTags('');
        setIsModalOpen(true);
    };

    return (
        <div className="container" style={{
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Visual Notes & Blog
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Capture your ideas in style.
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        + Write Story
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '3rem' }}>
                    <SearchBar placeholder="Search stories..." onSearch={handleSearch} />
                </div>

                {/* Visual Grid Layout */}
                {filteredPosts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎨</div>
                        <h3 className="empty-state-title">Canvas Empty</h3>
                        <p className="empty-state-text">
                            Start painting your thoughts with words.
                        </p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className="blog-grid">
                        {filteredPosts.map(post => (
                            <div key={post.id} className="visual-card" onClick={() => setViewingPost(post)}>
                                <div className="visual-card-content">
                                    <div className="visual-card-date">{getRelativeTime(post.createdAt)}</div>
                                    <h3 className="visual-card-title">{post.title}</h3>
                                    <p className="visual-card-excerpt">{post.content}</p>

                                    <div className="visual-card-footer">
                                        <div className="visual-tags">
                                            {post.tags?.slice(0, 2).map((tag, idx) => (
                                                <span key={idx} className="visual-tag">#{tag}</span>
                                            ))}
                                            {post.tags?.length > 2 && <span className="visual-tag">+{post.tags.length - 2}</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(post);
                                                }}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={(e) => handleDelete(post.id, e)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
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
                        setEditingPost(null);
                    }}
                    title={editingPost ? 'Edit Story' : 'New Story'}
                >
                    <form onSubmit={handleSubmit} className="grid-form">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                className="input"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                required
                                placeholder="Enter a captivating title..."
                            />
                            <div style={{ marginTop: '0.5rem' }}>
                                <AIRewriter
                                    content={formTitle}
                                    onRewrite={(rewritten) => setFormTitle(rewritten)}
                                    compact={true}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Content</label>
                            <textarea
                                className="input"
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                required
                                placeholder="Tell your story..."
                                style={{ minHeight: '300px', resize: 'vertical' }}
                            />
                            <div style={{ marginTop: '0.5rem' }}>
                                <AIRewriter
                                    content={formContent}
                                    onRewrite={(rewritten) => setFormContent(rewritten)}
                                    compact={true}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tags</label>
                            <input
                                type="text"
                                className="input"
                                value={formTags}
                                onChange={(e) => setFormTags(e.target.value)}
                                placeholder="design, code, life (comma separated)"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingPost(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingPost ? 'Update Story' : 'Publish Story'}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* View Post Modal - Immersive Layout */}
                <Modal
                    isOpen={!!viewingPost}
                    onClose={() => setViewingPost(null)}
                    title=""
                >
                    {viewingPost && (
                        <div className="immersive-modal">
                            <div className="immersive-content" style={{ marginTop: '2rem' }}>
                                <div className="immersive-meta">
                                    <span>📅 {formatDate(viewingPost.createdAt)}</span>
                                    {viewingPost.tags?.map(tag => <span key={tag}>#{tag}</span>)}
                                </div>
                                <h1 className="immersive-title">{viewingPost.title}</h1>

                                <div className="immersive-body">
                                    {viewingPost.content}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}

