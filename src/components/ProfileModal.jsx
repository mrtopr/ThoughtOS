import { useState, useEffect, useRef } from 'react';
import { User, Cpu, HardDrive, Download, Upload, Key, CheckCircle2, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { auth } from '../utils/auth';
import geminiAI from '../utils/geminiAI';
import { exportAllLocalData, importAllLocalData } from '../utils/storage';
import { alert } from '../utils/alert.jsx';

export default function ProfileModal({ isOpen, onClose, currentUser, onUpdate }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);
    const [storageKB, setStorageKB] = useState('0');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setDisplayName(currentUser?.user_metadata?.display_name || '');
            setBio(currentUser?.user_metadata?.bio || '');
            setHasApiKey(geminiAI.hasApiKey());
            setApiKeyInput('');
            calculateStorageSize();
        }
    }, [isOpen, currentUser]);

    const calculateStorageSize = () => {
        try {
            let totalBytes = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const val = localStorage.getItem(key) || '';
                totalBytes += (key.length + val.length) * 2;
            }
            setStorageKB((totalBytes / 1024).toFixed(1));
        } catch {
            setStorageKB('0');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) {
            alert.warning('Please enter a display name');
            return;
        }
        setLoading(true);
        try {
            const result = await auth.updateUserProfile({
                display_name: displayName.trim(),
                bio: bio.trim()
            });
            if (!result.success) throw new Error(result.error);
            alert.success('Profile updated!');
            if (onUpdate) await onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveApiKey = (e) => {
        e.preventDefault();
        if (!apiKeyInput.trim()) {
            alert.warning('Please enter a Gemini API key');
            return;
        }
        try {
            geminiAI.setApiKey(apiKeyInput.trim());
            setHasApiKey(true);
            setApiKeyInput('');
            alert.success('Gemini API key saved locally');
        } catch (error) {
            alert.error(error.message);
        }
    };

    const handleClearApiKey = () => {
        geminiAI.clearApiKey();
        setHasApiKey(false);
        alert.success('API key removed. Using offline Local AI.');
    };

    const handleExportBackup = () => {
        try {
            const backup = exportAllLocalData();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `thoughtos-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert.success('Backup exported!');
        } catch (error) {
            console.error('Export failed:', error);
            alert.error('Failed to export backup');
        }
    };

    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            importAllLocalData(parsed);
            alert.success('Backup restored! Reloading...');
            setTimeout(() => window.location.reload(), 700);
        } catch (error) {
            console.error('Import failed:', error);
            alert.error('Invalid backup file');
        } finally {
            e.target.value = '';
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'ai', label: 'AI & Config', icon: Cpu },
        { id: 'data', label: 'Data & Backup', icon: HardDrive }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile & Settings">
            {/* Editorial Segmented Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.35rem',
                padding: '0.3rem',
                borderRadius: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '0.55rem 0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: active ? 'var(--bg-secondary)' : 'transparent',
                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: active ? '600' : '500',
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.45rem',
                                boxShadow: active ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            <Icon size={15} style={{ color: active ? 'var(--accent-primary)' : 'currentColor' }} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '1.25rem'
                    }}>
                        <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            background: 'var(--text-primary)',
                            color: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            flexShrink: 0
                        }}>
                            {displayName?.trim()?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                {displayName || 'Creator'}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                color: 'var(--success)',
                                marginTop: '0.2rem'
                            }}>
                                ● LOCAL MODE · NO LOGIN REQUIRED
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            maxLength={50}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role / Tagline</label>
                        <input
                            type="text"
                            className="form-input"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="e.g. Builder, Student, Designer"
                            maxLength={80}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 2: AI & CONFIG */}
            {activeTab === 'ai' && (
                <div>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '1.25rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Assistant Engine</span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--accent-primary)'
                            }}>
                                {hasApiKey ? 'GEMINI + LOCAL' : 'OFFLINE LOCAL AI'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                            ThoughtOS AI works offline out of the box to search and manage your saved data. Optionally add a Gemini API key below for Blog AI Rewriter.
                        </p>
                    </div>

                    <form onSubmit={handleSaveApiKey}>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Key size={14} />
                                <span>Optional Gemini API Key</span>
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder={hasApiKey ? '•••••••••••••••• (configured)' : 'Paste AIza... key (optional)'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                <CheckCircle2 size={15} />
                                <span>{hasApiKey ? 'Update Key' : 'Save Key'}</span>
                            </button>
                            {hasApiKey && (
                                <button type="button" onClick={handleClearApiKey} className="btn btn-secondary">
                                    <Trash2 size={15} />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 3: DATA & BACKUP */}
            {activeTab === 'data' && (
                <div>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Browser LocalStorage</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                All workspaces and items are stored on this device.
                            </div>
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: 'var(--accent-primary)'
                        }}>
                            {storageKB} KB
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" onClick={handleExportBackup} className="btn btn-primary" style={{ flex: 1 }}>
                            <Download size={15} />
                            <span>Export JSON</span>
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ flex: 1 }}>
                            <Upload size={15} />
                            <span>Import JSON</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            onChange={handleImportBackup}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
}
