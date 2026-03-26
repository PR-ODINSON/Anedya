import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const exportAuthContext = () => AuthContext;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial load: check if user is already logged in via cookie
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        // Listen for 401 interceptor events
        const handleUnauthorized = () => setUser(null);
        window.addEventListener('auth-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data);
        return res.data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user || (!user.role && !user.roles)) return false;
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        // Handle case where user has single role string or array of roles
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
        return requiredRoles.some(r => userRoles.includes(r));
    };

    const rolePermissions = {
        Admin: ['device:read', 'relay:toggle', 'user:manage'],
        Operator: ['device:read', 'relay:toggle'],
        Viewer: ['device:read']
    };

    const hasPermission = (action) => {
        if (!user || (!user.role && !user.roles)) return false;
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
        return userRoles.some(role => rolePermissions[role]?.includes(action));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasRole, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
