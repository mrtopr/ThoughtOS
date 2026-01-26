import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: '🗂️',
            title: 'Centralized Knowledge Base',
            description: 'All your important links, tools, and software in one searchable place'
        },
        {
            icon: '💼',
            title: 'Project Showcase',
            description: 'Track every build with GitHub repos, live previews, and progress status'
        },
        {
            icon: '📝',
            title: 'Personal Notes System',
            description: 'Write, organize, and revisit ideas like a developer\'s journal'
        },
        {
            icon: '✨',
            title: 'Prompt Library',
            description: 'Save and reuse your best AI prompts for coding, design, and debugging'
        },
        {
            icon: '🎥',
            title: 'Embedded Learning',
            description: 'YouTube videos you actually watch, stored with your own notes'
        },
        {
            icon: '⚡',
            title: 'Full Frontend Control',
            description: 'Add, edit, delete anything. No backend. No friction.'
        }
    ];

    const audience = [
        'Engineering students who code at 2 AM',
        'Creators who juggle projects, ideas, and deadlines',
        'Problem solvers who need their tools within reach',
        'Anyone tired of scattering work across a dozen apps'
    ];

    return (
        <div className="landing-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section className="hero-section animate-fade-in" style={{
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2520 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    maxWidth: '900px',
                    textAlign: 'center',
                    color: 'white',
                    zIndex: 1
                }}>
                    <h1 className="hero-headline" style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2',
                        textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        Your second brain.<br />Built by you, for you.
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                        marginBottom: '3rem',
                        opacity: 0.95,
                        fontWeight: '400',
                        lineHeight: '1.6'
                    }}>
                        A private digital workspace where everything you build, learn, and create lives in one place.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="cta-button hover-lift"
                        style={{
                            padding: '1.25rem 3rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'var(--accent-primary)',
                            color: '#1A1A1A',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Get Started
                    </button>
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '2rem',
                    opacity: 0.7,
                    animation: 'bounce 2s infinite'
                }}>
                    ↓
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="philosophy-section" style={{
                padding: '6rem 2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '700',
                        marginBottom: '2rem',
                        color: 'var(--text-primary)'
                    }}>
                        Most productivity apps tell you how to work.<br />
                        ThoughtOS doesn't.
                    </h2>
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.8',
                        color: 'var(--text-secondary)',
                        marginBottom: '1.5rem'
                    }}>
                        It's a personal control center designed for engineering students who code, create, and solve problems daily. No templates. No workflows. Just a clean space to store what matters—links, projects, notes, prompts, videos—and access it instantly.
                    </p>
                    <p style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginTop: '2rem'
                    }}>
                        Your work. Your rules. Your space.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" style={{
                padding: '6rem 2rem',
                background: 'var(--bg-secondary)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        fontWeight: '700',
                        marginBottom: '4rem',
                        textAlign: 'center',
                        color: 'var(--text-primary)'
                    }}>
                        What You Get
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card glass-strong hover-lift"
                                style={{
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-glass)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '700',
                                    marginBottom: '0.75rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why This Exists Section */}
            <section className="why-section" style={{
                padding: '6rem 2rem',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        fontWeight: '700',
                        marginBottom: '3rem',
                        textAlign: 'center',
                        color: 'var(--text-primary)'
                    }}>
                        Why This Exists
                    </h2>
                    <div style={{
                        fontSize: '1.3rem',
                        lineHeight: '2',
                        color: 'var(--text-secondary)',
                        textAlign: 'center'
                    }}>
                        <p style={{ marginBottom: '1rem' }}>Because your browser has 47 tabs open.</p>
                        <p style={{ marginBottom: '1rem' }}>Because bookmarks are a graveyard.</p>
                        <p style={{ marginBottom: '2rem' }}>Because you've lost that one GitHub link three times this week.</p>
                    </div>
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.8',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        marginTop: '2rem'
                    }}>
                        ThoughtOS is what happens when an engineering student builds the tool they actually need. Not a productivity system. Not a note-taking app. A personal command center that adapts to how you think and work.
                    </p>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-tertiary)',
                        textAlign: 'center',
                        marginTop: '2rem',
                        fontStyle: 'italic'
                    }}>
                        Clean UI. Dark mode. Light mode. No clutter. No distractions. Just you and your work.
                    </p>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="audience-section" style={{
                padding: '6rem 2rem',
                background: 'var(--bg-secondary)'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        fontWeight: '700',
                        marginBottom: '3rem',
                        textAlign: 'center',
                        color: 'var(--text-primary)'
                    }}>
                        Built For
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '3rem'
                    }}>
                        {audience.map((item, index) => (
                            <div
                                key={index}
                                className="audience-card glass-strong"
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-glass)',
                                    textAlign: 'center',
                                    fontSize: '1.1rem',
                                    color: 'var(--text-primary)',
                                    fontWeight: '500'
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.8',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        marginTop: '2rem'
                    }}>
                        If you build things, learn constantly, and value control over your digital space—this is for you.
                    </p>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="final-cta" style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2520 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', color: 'white' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        lineHeight: '1.3'
                    }}>
                        ThoughtOS doesn't try to change how you work.
                    </h2>
                    <p style={{
                        fontSize: '1.3rem',
                        marginBottom: '3rem',
                        opacity: 0.95
                    }}>
                        It just gives you a place to do it better.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="cta-button hover-lift"
                        style={{
                            padding: '1.25rem 3rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'var(--accent-primary)',
                            color: '#1A1A1A',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease',
                            marginBottom: '2rem'
                        }}
                    >
                        Get Started
                    </button>
                    <p style={{
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        opacity: 0.9,
                        letterSpacing: '0.5px'
                    }}>
                        Private. Intentional. Yours.
                    </p>
                </div>
            </section>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-10px); }
                }

                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 50px rgba(0,0,0,0.4);
                }

                .feature-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--accent-primary);
                }

                @media (max-width: 768px) {
                    .hero-section {
                        min-height: 80vh;
                    }
                    
                    section {
                        padding: 4rem 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
