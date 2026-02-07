/**
 * Protected Route Component
 * Redirects unauthenticated users to landing page.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
