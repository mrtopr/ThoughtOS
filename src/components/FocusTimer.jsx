import { useState, useEffect, useRef } from 'react';

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

    // Track total seconds for progress calculation
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
        // Play alarm sound
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play();
        }
    };

    const stopAlarm = () => {
        setShowAlarm(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        // Switch modes
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
        const newMinutes = minutes + amt;
        setMinutes(newMinutes);
        setInitialTime(prev => prev + (amt * 60));
    };

    const progress = initialTime > 0 ? ((initialTime - totalSecondsRemaining) / initialTime) * 100 : 0;

    return (
        <div className="glass-strong animate-scale-in" style={{
            padding: '2rem',
            borderRadius: '32px',
            textAlign: 'center',
            width: '100%',
            maxWidth: '350px',
            margin: '0 auto',
            border: '1px solid var(--glass-border-strong)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: mode === 'study' ? 'var(--accent-gradient)' : 'var(--accent-gradient-3)',
                opacity: 0.05,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: mode === 'study' ? 'var(--accent-primary)' : 'var(--success)',
                    marginBottom: '1.5rem',
                    fontWeight: '800'
                }}>
                    {mode === 'study' ? '🎯 Deep Focus' : '☕ Quick Break'}
                </h3>

                {/* Progress Ring Container */}
                <div style={{
                    position: 'relative',
                    width: '180px',
                    height: '180px',
                    margin: '0 auto 1.5rem'
                }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="var(--border-color)"
                            strokeWidth="3"
                            style={{ opacity: 0.3 }}
                        />
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke={mode === 'study' ? 'var(--accent-primary)' : 'var(--success)'}
                            strokeWidth="4"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * progress) / 100}
                            strokeLinecap="round"
                            style={{
                                transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease',
                                filter: `drop-shadow(0 0 8px ${mode === 'study' ? 'var(--accent-primary)' : 'var(--success)'}40)`
                            }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '3.25rem',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-2px'
                    }}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                </div>

                {/* Custom Time Controls */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    opacity: isActive ? 0.5 : 1,
                    pointerEvents: isActive ? 'none' : 'auto',
                    transition: 'all 0.3s ease'
                }}>
                    <button
                        onClick={() => addTime(-1)}
                        className="btn-glass"
                        style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            borderRadius: '10px',
                            fontWeight: '700',
                            color: 'var(--error)',
                            opacity: minutes <= 1 ? 0.3 : 1
                        }}
                        disabled={minutes <= 1}
                    >
                        -1m
                    </button>
                    {[1, 5, 10].map(amt => (
                        <button
                            key={amt}
                            onClick={() => addTime(amt)}
                            className="btn-glass"
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}
                        >
                            +{amt}m
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={toggleTimer}
                        className="btn-primary"
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '18px',
                            background: isActive ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)',
                            color: isActive ? 'var(--text-primary)' : 'white',
                            border: isActive ? '1px solid var(--glass-border)' : 'none',
                            minWidth: '140px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            boxShadow: isActive ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>{isActive ? '⏸️' : '▶️'}</span>
                        <span>{isActive ? 'Pause' : 'Start Focus'}</span>
                    </button>
                    <button
                        onClick={resetTimer}
                        className="modern-reset-btn"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        title="Reset Timer"
                    >
                        <span className="reset-icon" style={{ fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>🔄</span>
                        <div className="reset-bg-glow" />
                    </button>
                </div>

                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-tertiary)',
                    fontWeight: '600',
                    letterSpacing: '0.02em'
                }}>
                    Completed Sessions: <span style={{ color: 'var(--text-primary)' }}>{sessions}</span>
                </div>
            </div>

            {/* ALARM OVERLAY */}
            {showAlarm && (
                <div className="alarm-overlay animate-fade-in" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--bg-glass-strong)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 1s infinite' }}>🔔</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Time's Up!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {mode === 'study' ? 'Great session! Take a break.' : 'Break over! Ready to focus?'}
                    </p>
                    <button
                        onClick={stopAlarm}
                        className="btn-primary"
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '18px',
                            width: '100%',
                            fontWeight: '700'
                        }}
                    >
                        Got it, Stop
                    </button>
                </div>
            )}

            <style>{`
                .modern-reset-btn:hover {
                    border-color: var(--accent-primary);
                    color: var(--text-primary);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2);
                }

                .modern-reset-btn:hover .reset-icon {
                    transform: rotate(180deg);
                }

                .modern-reset-btn:active {
                    transform: translateY(0) scale(0.95);
                }

                .reset-bg-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: var(--accent-primary);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    filter: blur(20px);
                    transition: all 0.6s ease;
                }

                .modern-reset-btn:hover .reset-bg-glow {
                    width: 100%;
                    height: 100%;
                    opacity: 0.1;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .alarm-overlay {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>

            {/* Notification Sound (Hidden) */}
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
        </div>
    );
}
