import { useState, useEffect } from 'react';

export default function LiveClock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.1rem',
            padding: '0.35rem 0.75rem',
            background: 'var(--bg-glass)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)'
        }}>
            <div style={{
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.3px'
            }}>
                {formatTime()}
            </div>
            <div style={{
                fontSize: '0.68rem',
                color: 'var(--text-tertiary)',
                fontWeight: '500'
            }}>
                {formatDate()}
            </div>
        </div>
    );
}
