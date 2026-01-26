import { useState } from 'react';
import { auth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            let result;
            if (isForgotPassword) {
                result = await auth.sendPasswordResetEmail(formData.email);
                if (result.success) {
                    setSuccessMessage('Password reset email sent! Please check your inbox.');
                }
            } else if (isLogin) {
                result = await auth.signIn(formData.email, formData.password);
            } else {
                result = await auth.signUp(formData.email, formData.password, formData.displayName);
            }

            if (result.success) {
                if (isForgotPassword) {
                    // Stay on page to show success message
                } else if (isLogin) {
                    navigate('/');
                } else {
                    // Show success message for signup
                    setSuccessMessage('Account created! Please check your email to confirm your account before logging in.');
                    setFormData({ email: '', password: '', displayName: '' });
                    // Switch to login tab after 3 seconds
                    setTimeout(() => setIsLogin(true), 3000);
                }
            } else {
                // Check if it's an email confirmation error
                if (result.error && result.error.toLowerCase().includes('email not confirmed')) {
                    setError('Please confirm your email before logging in. Check your inbox for the confirmation link.');
                } else {
                    setError(result.error || 'Authentication failed');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            const result = await auth.signInWithGoogle();
            if (!result.success) {
                setError(result.error || 'Google login failed');
            }
        } catch (err) {
            setError('An error occurred during Google login.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        if (!formData.email) {
            setError('Please enter your email address first');
            return;
        }

        setResendingEmail(true);
        setError('');
        setSuccessMessage('');

        try {
            const result = await auth.resendConfirmationEmail(formData.email);
            if (result.success) {
                setSuccessMessage('Confirmation email sent! Please check your inbox.');
            } else {
                setError(result.error || 'Failed to resend confirmation email');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setResendingEmail(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="animate-scale-in" style={{
                width: '100%',
                maxWidth: '450px'
            }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        ⚡
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '0.5rem'
                    }}>
                        ThoughtOS
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Your personal content hub
                    </p>
                </div>

                {/* Login/Signup Card */}
                <div className="glass-strong" style={{
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: 'var(--shadow-xl)'
                }}>
                    {/* Toggle Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '2rem',
                        background: 'var(--bg-tertiary)',
                        padding: '0.5rem',
                        borderRadius: '16px'
                    }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(true);
                                setIsForgotPassword(false);
                            }}
                            className="btn-glass"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                background: isLogin && !isForgotPassword ? 'var(--accent-gradient)' : 'transparent',
                                color: isLogin && !isForgotPassword ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(false);
                                setIsForgotPassword(false);
                            }}
                            className="btn-glass"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                background: !isLogin && !isForgotPassword ? 'var(--accent-gradient)' : 'transparent',
                                color: !isLogin && !isForgotPassword ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {isForgotPassword ? (
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Reset Password</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </div>
                    ) : null}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem'
                                }}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    className="input"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                autoComplete="email"
                            />
                        </div>

                        {!isForgotPassword && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <label style={{
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}>
                                        Password
                                    </label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--accent-primary)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    required={!isForgotPassword}
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="animate-shake" style={{
                                padding: '1rem',
                                background: 'rgba(255, 59, 48, 0.1)',
                                border: '1px solid var(--error)',
                                borderRadius: '12px',
                                color: 'var(--error)',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}>
                                {error}
                                {error.toLowerCase().includes('confirm your email') && (
                                    <button
                                        type="button"
                                        onClick={handleResendConfirmation}
                                        disabled={resendingEmail}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            marginTop: '0.75rem',
                                            padding: '0.5rem',
                                            background: 'var(--accent-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: resendingEmail ? 'not-allowed' : 'pointer',
                                            opacity: resendingEmail ? 0.7 : 1
                                        }}
                                    >
                                        {resendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
                                    </button>
                                )}
                            </div>
                        )}

                        {successMessage && (
                            <div className="animate-scale-in" style={{
                                padding: '1rem',
                                background: 'rgba(52, 199, 89, 0.1)',
                                border: '1px solid #34c759',
                                borderRadius: '12px',
                                color: '#34c759',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}>
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-press"
                            disabled={loading || googleLoading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span className="spinner-ring" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                                    Processing...
                                </span>
                            ) : (
                                isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Login' : 'Create Account')
                            )}
                        </button>

                        {!isForgotPassword && (
                            <>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    margin: '1.5rem 0',
                                    color: 'var(--text-tertiary)',
                                    fontSize: '0.85rem'
                                }}>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                                    <span>OR</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading || googleLoading}
                                    className="btn-glass btn-press"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'var(--text-primary)',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        opacity: googleLoading ? 0.7 : 1,
                                        cursor: googleLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {googleLoading ? (
                                        <span className="spinner-ring" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                                </button>
                            </>
                        )}
                    </form>

                    {/* Footer */}
                    <div style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.85rem'
                    }}>
                        {isForgotPassword ? (
                            <p>
                                Wait, I remember!{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Back to login
                                </button>
                            </p>
                        ) : isLogin ? (
                            <p>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Login
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Info Text */}
                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.85rem'
                }}>
                    <p>🔒 Your data is stored securely in the cloud</p>
                </div>
            </div>
        </div>
    );
}
