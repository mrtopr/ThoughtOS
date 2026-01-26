import { useState } from 'react';
import Modal from './Modal';
import { supabase } from '../utils/supabaseClient';
import { alert } from '../utils/alert.jsx';

export default function ProfileModal({ isOpen, onClose, currentUser, onUpdate }) {
    const [displayName, setDisplayName] = useState(
        currentUser?.user_metadata?.display_name || ''
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!displayName.trim()) {
            alert.warning('Please enter a display name');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: displayName.trim() }
            });

            if (error) throw error;

            alert.success('Profile updated successfully!');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert.error('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="✏️ Edit Profile">
            <form onSubmit={handleSubmit}>
                {/* User Avatar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        color: 'white',
                        fontWeight: '700',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        {displayName?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        📧 Email Address
                    </label>
                    <input
                        type="email"
                        className="form-input"
                        value={currentUser?.email || ''}
                        disabled
                        style={{
                            opacity: 0.6,
                            cursor: 'not-allowed',
                            background: 'var(--bg-tertiary)'
                        }}
                    />
                    <small style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-tertiary)',
                        marginTop: '0.5rem',
                        display: 'block'
                    }}>
                        ⚠️ Email cannot be changed
                    </small>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        👤 Display Name
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        maxLength={50}
                        autoFocus
                    />
                    <small style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-tertiary)',
                        marginTop: '0.5rem',
                        display: 'block'
                    }}>
                        This name will be displayed throughout the app
                    </small>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '2rem'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={loading}
                    >
                        {loading ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
