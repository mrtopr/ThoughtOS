import { useState, useEffect, useRef } from 'react';
import { aiService } from '../../utils/aiService';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Avatar3D from './Avatar3D';
import {
    Mic,
    Send,
    X,
    Maximize2,
    Minimize2,
    MessageSquare,
    Sparkles,
    RotateCcw
} from 'lucide-react';

export default function ChatbotContainer() {
    const { currentWorkspace } = useWorkspace();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const initialGreeting = {
        role: 'model',
        text: 'Hello! I am your ThoughtOS assistant (works offline with your saved local data). Ask me for a "summary", "my tasks", "my projects", or "add task <title>"!',
        isHindi: false
    };
    const [messages, setMessages] = useState([initialGreeting]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        setIsThinking(true);
        try {
            const response = await aiService.chat(text, history, currentWorkspace?.id);
            const modelMessage = {
                role: 'model',
                text: response.text,
                isHindi: /[\u0900-\u097F]/.test(response.text)
            };
            setMessages(prev => [...prev, modelMessage]);
        } finally {
            setIsThinking(false);
        }
    };

    const toggleSTT = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN,en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognition.start();
    };

    return (
        <div className="chatbot-wrapper" style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1rem'
        }}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="glass-strong animate-bounce-subtle"
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--text-primary)',
                        border: '1px solid var(--border-color-strong)',
                        color: 'var(--accent-primary)',
                        boxShadow: 'var(--shadow-xl)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Main Panel */}
            {isOpen && (
                <div
                    className={`glass-strong animate-scale-in ${isMinimized ? 'minimized' : ''}`}
                    style={{
                        width: isMinimized ? '300px' : '400px',
                        height: isMinimized ? '80px' : '600px',
                        borderRadius: '32px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color-strong)',
                        boxShadow: 'var(--shadow-2xl)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--glass-border-strong)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isThinking ? 'var(--accent-primary)' : 'var(--success)'
                            }} />
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '0.96rem' }}>ThoughtOS AI</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => setMessages([initialGreeting])} style={iconBtnStyle} title="Clear Chat">
                                <RotateCcw size={16} />
                            </button>
                            <button onClick={() => setIsMinimized(!isMinimized)} style={iconBtnStyle} title={isMinimized ? 'Expand' : 'Minimize'}>
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} style={iconBtnStyle} title="Close">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* 3D Avatar Area */}
                            <div style={{
                                height: '210px',
                                background: 'radial-gradient(circle at 50% 45%, rgba(232, 93, 44, 0.12) 0%, transparent 70%)',
                                borderBottom: '1px solid var(--border-color)',
                                position: 'relative'
                            }}>
                                <Avatar3D speaking={isThinking} />
                                <div style={{ position: 'absolute', bottom: '0.65rem', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.68rem',
                                        color: 'var(--text-secondary)',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px'
                                    }}>
                                        {isThinking ? 'PROCESSING...' : isListening ? 'LISTENING...' : 'LOCAL AI READY'}
                                    </span>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div
                                ref={scrollRef}
                                style={{
                                    flex: 1,
                                    padding: '1.5rem',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}
                            >
                                {messages.map((m, i) => (
                                    <div key={i} style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        padding: '0.8rem 1.2rem',
                                        borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                        background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                                        fontSize: '0.88rem',
                                        lineHeight: '1.55',
                                        whiteSpace: 'pre-line',
                                        boxShadow: 'var(--shadow-md)'
                                    }}>
                                        {m.text}
                                    </div>
                                ))}
                            </div>

                            {/* Quick-Ask Chips */}
                            <div style={{
                                padding: '0.5rem 1.25rem 0',
                                display: 'flex',
                                gap: '0.4rem',
                                flexWrap: 'wrap'
                            }}>
                                {['Summary', 'My Tasks', 'Projects', 'Links', 'Prompts'].map(chip => (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => handleSend(chip)}
                                        style={{
                                            fontSize: '0.72rem',
                                            fontWeight: '600',
                                            padding: '0.3rem 0.65rem',
                                            borderRadius: '999px',
                                            border: '1px solid var(--border-color-strong)',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Ask me anything..."
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem 1rem',
                                                paddingRight: '3rem',
                                                background: 'var(--bg-tertiary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '16px',
                                                color: 'var(--text-primary)',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={toggleSTT}
                                            style={{
                                                position: 'absolute',
                                                right: '0.5rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: isListening ? '#ef4444' : 'var(--text-tertiary)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleSend()}
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '14px',
                                            background: 'var(--accent-gradient)',
                                            border: 'none',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

const iconBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease'
};
