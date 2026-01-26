import { useState } from 'react';
import geminiAI from '../utils/geminiAI';
import { alert } from '../utils/alert';

export default function AIRewriter({ content, onRewrite, compact = false }) {
    const [isRewriting, setIsRewriting] = useState(false);
    const [selectedMode, setSelectedMode] = useState('professional');
    const [showModeSelector, setShowModeSelector] = useState(false);

    const modes = geminiAI.getAvailableModes();

    const handleRewrite = async () => {
        // Check if API key is configured
        if (!geminiAI.hasApiKey()) {
            alert.warning('Please configure your Gemini API key first. You can set it in the settings or by clicking the AI button.');
            // Prompt for API key
            const apiKey = prompt('Enter your Gemini API key:\n\n(You can get one from https://makersuite.google.com/app/apikey)');
            if (apiKey && apiKey.trim()) {
                try {
                    geminiAI.setApiKey(apiKey.trim());
                    alert.success('API key saved successfully!');
                } catch (error) {
                    alert.error('Failed to save API key: ' + error.message);
                    return;
                }
            } else {
                return;
            }
        }

        // Validate content
        if (!content || content.trim().length === 0) {
            alert.warning('Please enter some content to rewrite');
            return;
        }

        setIsRewriting(true);
        try {
            const rewrittenContent = await geminiAI.rewriteContent(content, selectedMode);
            onRewrite(rewrittenContent);
            alert.success('Content rewritten successfully! ✨');
            setShowModeSelector(false);
        } catch (error) {
            console.error('AI rewriting error:', error);
            alert.error(error.message || 'Failed to rewrite content. Please try again.');
        } finally {
            setIsRewriting(false);
        }
    };

    if (compact) {
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    type="button"
                    onClick={() => setShowModeSelector(!showModeSelector)}
                    disabled={isRewriting}
                    className="btn-glass hover-lift"
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-glass)',
                        color: 'var(--text-primary)',
                        cursor: isRewriting ? 'wait' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isRewriting ? 0.6 : 1
                    }}
                    title="Rewrite with AI"
                >
                    {isRewriting ? (
                        <>
                            <span className="spinner" style={{
                                width: '14px',
                                height: '14px',
                                border: '2px solid var(--border-color)',
                                borderTopColor: 'var(--accent-primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }} />
                            <span>Rewriting...</span>
                        </>
                    ) : (
                        <>
                            <span>✨</span>
                            <span>AI</span>
                        </>
                    )}
                </button>

                {showModeSelector && !isRewriting && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '0.5rem',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        minWidth: '220px'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Select Mode
                        </div>
                        {modes.map(mode => (
                            <button
                                key={mode.value}
                                onClick={() => {
                                    setSelectedMode(mode.value);
                                    handleRewrite();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    marginBottom: '0.25rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: selectedMode === mode.value ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                                    color: selectedMode === mode.value ? 'white' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedMode !== mode.value) {
                                        e.target.style.background = 'var(--bg-glass)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedMode !== mode.value) {
                                        e.target.style.background = 'var(--bg-secondary)';
                                    }
                                }}
                            >
                                <div style={{ fontWeight: '600' }}>{mode.label}</div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    opacity: 0.8,
                                    marginTop: '0.15rem'
                                }}>
                                    {mode.description}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Full mode
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
            background: 'var(--bg-glass)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
            }}>
                <span>✨</span>
                <span>AI Rewriter</span>
            </div>

            <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                disabled={isRewriting}
                style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                }}
            >
                {modes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                        {mode.label} - {mode.description}
                    </option>
                ))}
            </select>

            <button
                onClick={handleRewrite}
                disabled={isRewriting}
                className="btn-primary hover-lift"
                style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isRewriting ? 'var(--bg-secondary)' : 'var(--accent-gradient)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: isRewriting ? 'wait' : 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: isRewriting ? 0.6 : 1
                }}
            >
                {isRewriting ? (
                    <>
                        <span className="spinner" style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        <span>Rewriting with AI...</span>
                    </>
                ) : (
                    <>
                        <span>✨</span>
                        <span>Rewrite with AI</span>
                    </>
                )}
            </button>
        </div>
    );
}
