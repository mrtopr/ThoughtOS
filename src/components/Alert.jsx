import { useEffect } from 'react';

export default function Alert({ type = 'info', message, onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '#10b981'
                };
            case 'error':
                return {
                    bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: '#ef4444'
                };
            case 'warning':
                return {
                    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: '#f59e0b'
                };
            default:
                return {
                    bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: '#6366f1'
                };
        }
    };

    const colors = getColors();

    return (
        <div
            className="animate-slide-in-right"
            style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 9999,
                minWidth: '320px',
                maxWidth: '500px',
                background: colors.bg,
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'white'
            }}
        >
            {/* Icon */}
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    flexShrink: 0
                }}
            >
                {getIcon()}
            </div>

            {/* Message */}
            <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500' }}>
                {message}
            </div>

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
}
