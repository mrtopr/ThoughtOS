import { useState, useEffect, useRef } from 'react';
import { Target, Coffee, Play, Pause, RotateCcw, Bell } from 'lucide-react';

export default function FocusTimer() {
    const defaultStudyTime = 25;
    const defaultBreakTime = 5;

    const [minutes, setMinutes] = useState(defaultStudyTime);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('study'); // study, break
    const [sessions, setSessions] = useState(0);
    const [initialTime, setInitialTime] = useState(defaultStudyTime * 60);
    const [showAlarm, setShowAlarm] = useState(false);
    const audioRef = useRef(null);

    const totalSecondsRemaining = minutes * 60 + seconds;

    useEffect(() => {
        let interval = null;
        if (isActive && totalSecondsRemaining > 0) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(prev => prev - 1);
                } else if (minutes > 0) {
                    setMinutes(prev => prev - 1);
                    setSeconds(59);
                }
            }, 1000);
        } else if (isActive && totalSecondsRemaining === 0) {
            handleTimerComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, minutes, seconds, totalSecondsRemaining]);

    const handleTimerComplete = () => {
        setIsActive(false);
        setShowAlarm(true);
        if (mode === 'study') {
            setSessions(s => s + 1);
        }
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(() => {});
        }
    };

    const stopAlarm = () => {
        setShowAlarm(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (mode === 'study') {
            setMode('break');
            setMinutes(defaultBreakTime);
            setInitialTime(defaultBreakTime * 60);
        } else {
            setMode('study');
            setMinutes(defaultStudyTime);
            setInitialTime(defaultStudyTime * 60);
        }
        setSeconds(0);
    };

    const toggleTimer = () => {
        if (showAlarm) return;
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setShowAlarm(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const newMinutes = mode === 'study' ? defaultStudyTime : defaultBreakTime;
        setMinutes(newMinutes);
        setSeconds(0);
        setInitialTime(newMinutes * 60);
    };

    const addTime = (amt) => {
        const newMinutes = Math.max(1, minutes + amt);
        setMinutes(newMinutes);
        setInitialTime(Math.max(60, initialTime + (amt * 60)));
    };

    const progress = initialTime > 0 ? ((initialTime - totalSecondsRemaining) / initialTime) * 100 : 0;
    const accentColor = mode === 'study' ? 'var(--accent-primary)' : 'var(--success)';

    return (
        <div className="animate-scale-in" style={{
            padding: '1.75rem',
            borderRadius: '16px',
            textAlign: 'center',
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Mode Header */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: accentColor,
                    marginBottom: '1.25rem',
                    fontWeight: '600'
                }}>
                    {mode === 'study' ? <Target size={13} /> : <Coffee size={13} />}
                    <span>{mode === 'study' ? 'Deep Focus' : 'Quick Break'}</span>
                </div>

                {/* Progress Ring Container */}
                <div style={{
                    position: 'relative',
                    width: '168px',
                    height: '168px',
                    margin: '0 auto 1.25rem'
                }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle
                            cx="50" cy="50" r="44"
                            fill="none"
                            stroke="var(--border-color-strong)"
                            strokeWidth="2.5"
                        />
                        <circle
                            cx="50" cy="50" r="44"
                            fill="none"
                            stroke={accentColor}
                            strokeWidth="3.5"
                            strokeDasharray="276.46"
                            strokeDashoffset={276.46 - (276.46 * progress) / 100}
                            strokeLinecap="round"
                            style={{
                                transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.35s ease'
                            }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '2.35rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.03em',
                        lineHeight: 1
                    }}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                </div>

                {/* Custom Time Controls */}
                <div style={{
                    display: 'inline-flex',
                    gap: '0.2rem',
                    padding: '0.25rem',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    opacity: isActive ? 0.45 : 1,
                    pointerEvents: isActive ? 'none' : 'auto',
                    transition: 'opacity 0.2s ease'
                }}>
                    <button
                        onClick={() => addTime(-1)}
                        className="focus-time-chip"
                        style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            borderRadius: '6px',
                            fontWeight: '600',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            opacity: minutes <= 1 ? 0.35 : 1
                        }}
                        disabled={minutes <= 1}
                    >
                        -1m
                    </button>
                    {[1, 5, 10].map(amt => (
                        <button
                            key={amt}
                            onClick={() => addTime(amt)}
                            className="focus-time-chip"
                            style={{
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                                borderRadius: '6px',
                                fontWeight: '600',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            +{amt}m
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.55rem', justifyContent: 'center', marginBottom: '1.15rem' }}>
                    <button
                        onClick={toggleTimer}
                        className="btn-primary"
                        style={{
                            padding: '0.72rem 1.35rem',
                            borderRadius: '10px',
                            background: isActive ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                            color: isActive ? 'var(--text-primary)' : '#ffffff',
                            border: isActive ? '1px solid var(--border-color-strong)' : 'none',
                            flex: 1,
                            fontWeight: '600',
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        {isActive ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                        <span>{isActive ? 'Pause' : 'Start Focus'}</span>
                    </button>
                    <button
                        onClick={resetTimer}
                        className="modern-reset-btn"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-color-strong)',
                            background: 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                        }}
                        title="Reset Timer"
                    >
                        <RotateCcw size={16} className="reset-icon" style={{ transition: 'transform 0.3s ease' }} />
                    </button>
                </div>

                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.02em'
                }}>
                    SESSIONS COMPLETED: <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{sessions}</span>
                </div>
            </div>

            {/* ALARM OVERLAY */}
            {showAlarm && (
                <div className="alarm-overlay animate-fade-in" style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--bg-glass-strong)',
                    backdropFilter: 'blur(14px)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Bell size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.35rem' }}>Time's Up</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                        {mode === 'study' ? 'Session complete. Take a short break.' : 'Break finished. Ready to focus?'}
                    </p>
                    <button
                        onClick={stopAlarm}
                        className="btn btn-primary"
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '10px',
                            width: '100%',
                            fontWeight: '600'
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <style>{`
                .focus-time-chip:hover {
                    background: var(--bg-secondary) !important;
                    color: var(--text-primary) !important;
                }
                .modern-reset-btn:hover {
                    border-color: var(--accent-primary) !important;
                    color: var(--text-primary) !important;
                }
                .modern-reset-btn:hover .reset-icon {
                    transform: rotate(-90deg);
                }
            `}</style>

            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
        </div>
    );
}
