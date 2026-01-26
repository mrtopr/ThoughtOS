import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';

export default function LiveClock() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const currentUser = auth.getCurrentUser();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning';
        if (hour >= 12 && hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

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
            gap: '0.15rem',
            padding: '0.4rem 0.75rem',
            background: 'var(--bg-glass)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)'
        }}>
            <div style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.3px'
            }}>
                {formatTime()}
            </div>
            <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-tertiary)',
                fontWeight: '500'
            }}>
                {formatDate()}
            </div>
        </div>
    );
}
