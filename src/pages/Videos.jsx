import { useState, useEffect } from 'react';
import { storage } from '../utils/workspaceAwareStorage';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { alert } from '../utils/alert.jsx';
import { customConfirm } from '../utils/confirm';
import { formatDate, getRelativeTime } from '../utils/dateFormat';

export default function Videos() {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const allVideos = await storage.videos.getAll();
            setVideos(allVideos);
            setFilteredVideos(allVideos);
        } catch (error) {
            console.error('Error loading videos:', error);
        }
    };

    const handleSearch = (query) => {
        const filtered = videos.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.description?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredVideos(filtered);
    };

    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const videoUrl = formData.get('url');
        const videoId = extractYouTubeId(videoUrl);

        if (!videoId) {
            alert.error('Please enter a valid YouTube URL');
            return;
        }

        const videoData = {
            title: formData.get('title'),
            url: videoUrl,
            videoId: videoId,
            description: formData.get('description'),
            notes: formData.get('notes')
        };

        try {
            if (editingVideo) {
                await storage.videos.update(editingVideo.id, videoData);
            } else {
                await storage.videos.add(videoData);
            }

            setIsModalOpen(false);
            setEditingVideo(null);
            await loadVideos();
        } catch (error) {
            console.error('Error saving video:', error);
            alert.error('Failed to save video. Please try again.');
        }
    };

    const handleEdit = (video) => {
        setEditingVideo(video);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await customConfirm('Are you sure you want to delete this video?');
        if (confirmed) {
            try {
                await storage.videos.delete(id);
                await loadVideos();
                alert.success('Video deleted successfully!');
            } catch (error) {
                console.error('Error deleting video:', error);
                alert.error('Failed to delete video. Please try again.');
            }
        }
    };

    const openAddModal = () => {
        setEditingVideo(null);
        setIsModalOpen(true);
    };

    return (
        <div className="container" style={{
            padding: '2rem 3rem 2rem 2rem',
            maxWidth: '100%'
        }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>🎥 Videos</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Save and watch your favorite YouTube videos with notes
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        + Add Video
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2rem' }}>
                    <SearchBar placeholder="Search videos..." onSearch={handleSearch} />
                </div>

                {/* Videos Grid */}
                {filteredVideos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎥</div>
                        <h3 className="empty-state-title">No Videos Yet</h3>
                        <p className="empty-state-text">
                            Start adding your favorite YouTube videos!
                        </p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add Your First Video
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {filteredVideos.map(video => (
                            <div key={video.id} className="content-card">
                                <div className="card-header">
                                    <h3 className="card-title" style={{ flex: 1 }}>{video.title}</h3>
                                    <div className="card-actions">
                                        <button className="icon-btn" onClick={() => handleEdit(video)} title="Edit">
                                            ✏️
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(video.id)} title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* YouTube Embed */}
                                <div style={{
                                    position: 'relative',
                                    paddingBottom: '56.25%',
                                    height: 0,
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    marginTop: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <iframe
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            borderRadius: '12px'
                                        }}
                                        src={`https://www.youtube.com/embed/${video.videoId}`}
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                {video.description && (
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        {video.description}
                                    </p>
                                )}

                                {video.notes && (
                                    <div style={{
                                        background: 'var(--bg-primary)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginTop: '1rem'
                                    }}>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📝 Notes:
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {video.notes}
                                        </div>
                                    </div>
                                )}

                                <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}
                                >
                                    🔗 Open in YouTube
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
                        setEditingVideo(null);
                    }}
                    title={editingVideo ? 'Edit Video' : 'Add New Video'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                defaultValue={editingVideo?.title}
                                required
                                placeholder="Video title..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">YouTube URL *</label>
                            <input
                                type="url"
                                name="url"
                                className="form-input"
                                defaultValue={editingVideo?.url}
                                required
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                Paste any YouTube video URL (watch, share, or embed format)
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                defaultValue={editingVideo?.description}
                                placeholder="Brief description..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                name="notes"
                                className="form-textarea"
                                defaultValue={editingVideo?.notes}
                                placeholder="Your notes about this video..."
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingVideo(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingVideo ? 'Update' : 'Add'} Video
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
