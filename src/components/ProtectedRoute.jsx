import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth check timeout')), 5000)
            );

            const authPromise = auth.isAuthenticated();
            const authenticated = await Promise.race([authPromise, timeoutPromise]);

            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Auth check error:', error);
            // On error, assume not authenticated and redirect to login
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader message="Authenticating..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
