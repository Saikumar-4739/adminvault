'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/api/services';
import { LoginUserModel, RegisterUserModel, LoginResponseModel } from '@adminvault/shared-models';
import { useToast } from './ToastContext';

interface User {
    id: number;
    fullName: string;
    email: string;
    companyId: number;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginUserModel) => Promise<void>;
    register: (data: RegisterUserModel) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (credentials: LoginUserModel) => {
            try {
                setIsLoading(true);
                const response: LoginResponseModel = await authService.loginUser(credentials);

                if (response.status && response.accessToken) {
                    const userData: User = {
                        id: response.userInfo.companyId, // Adjust based on actual response
                        fullName: response.userInfo.fullName,
                        email: response.userInfo.email,
                        companyId: response.userInfo.companyId,
                        role: response.userInfo.role,
                    };

                    setUser(userData);
                    setToken(response.accessToken);

                    // Store in localStorage
                    localStorage.setItem('auth_token', response.accessToken);
                    localStorage.setItem('auth_user', JSON.stringify(userData));
                    localStorage.setItem('refresh_token', response.refreshToken);

                    localStorage.setItem('refresh_token', response.refreshToken);
                } else {
                    throw new Error(response.message || 'Login failed');
                }
            } catch (error: any) {
                // toast.error('Login failed', error.message || 'Invalid credentials');
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    const register = useCallback(
        async (data: RegisterUserModel) => {
            try {
                setIsLoading(true);
                const response = await authService.registerUser(data);

                if (response.status) {
                    // Registration successful
                } else {
                    throw new Error(response.message || 'Registration failed');
                }
            } catch (error: any) {
                // toast.error('Registration failed', error.message);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    const logout = useCallback(async () => {
        try {
            if (user && token) {
                await authService.logOutUser({
                    email: user.email,
                    token: token,
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('refresh_token');
            toast.info('Logged out', 'You have been successfully logged out');
        }
    }, [user, token, toast]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
