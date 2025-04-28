import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
    username: string;
    avatarUrl: string;
    balance: number;
};

type AuthContextType = {
    user: User | null;
    fetchMe: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const fetchMe = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Not authenticated');
            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    };

    useEffect(() => {
        fetchMe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, fetchMe, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
