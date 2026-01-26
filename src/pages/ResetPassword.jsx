import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase automatically handles the access token in the URL fragment
        // We just need to check if we're on the right page
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await auth.updatePassword(password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.error || 'Failed to update password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
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
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        New Password
                    </h1>
                </div>

                <div className="glass-strong" style={{
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: 'var(--shadow-xl)'
                }}>
                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(52, 199, 89, 0.1)',
                                border: '1px solid #34c759',
                                borderRadius: '16px',
                                color: '#34c759',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Success!</h3>
                                <p style={{ fontSize: '0.9rem' }}>Your password has been updated. Redirecting to login...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>

                            {error && (
                                <div style={{
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
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-press"
                                disabled={loading}
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
