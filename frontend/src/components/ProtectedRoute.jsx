import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-slate-200">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if user is not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        // Redirect to unauthorized if user doesn't have required roles
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
