import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                    // Verify with backend
                    const res = await authAPI.getMe();
                    if (res.success && res.user) {
                        setUser(res.user);
                        localStorage.setItem('user', JSON.stringify(res.user));
                    }
                } catch (err) {
                    console.warn('Session verification failed, logging out:', err.message);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password, requestedRole = null) => {
        const res = await authAPI.login({ email, password, requestedRole });
        if (res.success) {
            setUser(res.user);
            setToken(res.token);
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            return res.user;
        }
        throw new Error(res.message || 'Login failed');
    };

    const register = async (userData) => {
        const res = await authAPI.register(userData);
        if (res.success) {
            setUser(res.user);
            setToken(res.token);
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            return res.user;
        }
        throw new Error(res.message || 'Registration failed');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
