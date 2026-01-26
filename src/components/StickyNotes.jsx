import { useState, useEffect } from 'react';
import { notesStorage } from '../utils/notesStorage';
import { formatDate } from '../utils/dateFormat';
import AIRewriter from './AIRewriter';

export default function StickyNotes({ onClose }) {
    const [notes, setNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [selectedColor, setSelectedColor] = useState('#ffd93d');
    const [editingId, setEditingId] = useState(null);

    const colors = [
        { name: 'Yellow', value: '#ffd93d' },
        { name: 'Pink', value: '#ff6b9d' },
        { name: 'Blue', value: '#6bcbff' },
        { name: 'Green', value: '#6bffb8' },
        { name: 'Purple', value: '#c96bff' },
        { name: 'Orange', value: '#ffb86b' }
    ];

    useEffect(() => {
        setNotes(notesStorage.get());
    }, []);

    const handleAddNote = () => {
        if (newNoteContent.trim()) {
            const newNote = notesStorage.add({
                content: newNoteContent,
                color: selectedColor
            });
            setNotes([...notes, newNote]);
            setNewNoteContent('');
        }
    };

    const handleUpdateNote = (id, content) => {
        notesStorage.update(id, { content });
        setNotes(notes.map(note => note.id === id ? { ...note, content } : note));
        setEditingId(null);
    };

    const handleDeleteNote = (id) => {
        notesStorage.delete(id);
        setNotes(notes.filter(note => note.id !== id));
    };

    const handleChangeColor = (id, color) => {
        notesStorage.update(id, { color });
        setNotes(notes.map(note => note.id === id ? { ...note, color } : note));
    };

    return (
        <div className="glass-strong animate-scale-in" style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            width: '400px',
            maxHeight: '600px',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span>📌</span>
                    <span>Sticky Notes</span>
                </h3>
                <button
                    onClick={onClose}
                    className="btn-glass hover-lift"
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--bg-glass)',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Add Note Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--bg-glass)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Write a note..."
                    style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                    }}
                />
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {colors.map(color => (
                            <button
                                key={color.value}
                                onClick={() => setSelectedColor(color.value)}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: selectedColor === color.value ? '3px solid var(--accent-primary)' : '2px solid var(--border-color)',
                                    background: color.value,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AIRewriter
                            content={newNoteContent}
                            onRewrite={(rewrittenContent) => setNewNoteContent(rewrittenContent)}
                            compact={true}
                        />
                        <button
                            onClick={handleAddNote}
                            className="btn-primary hover-lift"
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            </div>

            {/* Notes List */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '350px',
                overflowY: 'auto',
                padding: '0.5rem'
            }}>
                {notes.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.9rem'
                    }}>
                        No notes yet. Create your first note!
                    </div>
                ) : (
                    notes.map(note => (
                        <div
                            key={note.id}
                            className="hover-lift"
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: note.color,
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                                color: '#000'
                            }}
                        >
                            {editingId === note.id ? (
                                <textarea
                                    defaultValue={note.content}
                                    onBlur={(e) => handleUpdateNote(note.id, e.target.value)}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        minHeight: '60px',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(0,0,0,0.2)',
                                        background: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            ) : (
                                <>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {note.content}
                                    </p>
                                    {note.createdAt && (
                                        <p style={{
                                            margin: '0.5rem 0 0 0',
                                            fontSize: '0.7rem',
                                            opacity: 0.6,
                                            fontStyle: 'italic'
                                        }}>
                                            {formatDate(note.createdAt)}
                                        </p>
                                    )}
                                </>
                            )}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginTop: '0.75rem',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {colors.map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => handleChangeColor(note.id, color.value)}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: note.color === color.value ? '2px solid #000' : '1px solid rgba(0,0,0,0.2)',
                                                background: color.value,
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setEditingId(note.id)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(0,0,0,0.2)',
                                            background: 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(0,0,0,0.2)',
                                            background: 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
