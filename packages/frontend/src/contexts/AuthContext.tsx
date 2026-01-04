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
    login: (credentials: LoginUserModel) => Promise<User | undefined>;
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
        try {
            const storedToken = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('auth_user');

            if (storedToken && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } else if (storedUser && !storedToken) {
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
            // Optional: Clear invalid storage
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(
        async (credentials: LoginUserModel) => {
            try {
                setIsLoading(true);

                const loginData = new LoginUserModel(
                    credentials.email,
                    credentials.password,
                    undefined,
                    undefined
                );

                const response: LoginResponseModel = await authService.loginUser(loginData);

                if (response.status && (response.accessToken || (response as any).access_token)) {
                    const tokenToSave = response.accessToken || (response as any).access_token;

                    const userData: User = {
                        id: (response.userInfo as any).id || response.userInfo.companyId,
                        fullName: response.userInfo.fullName,
                        email: response.userInfo.email,
                        companyId: response.userInfo.companyId,
                        role: response.userInfo.role,
                    };

                    setUser(userData);
                    setToken(tokenToSave);

                    // Store in localStorage
                    try {
                        localStorage.setItem('auth_token', tokenToSave);
                        localStorage.setItem('auth_user', JSON.stringify(userData));
                        localStorage.setItem('refresh_token', response.refreshToken);
                    } catch (storageErr) {
                        console.error('LocalStorage Save Error:', storageErr);
                    }

                    return userData;
                } else {
                    console.error('Login failed, status false or token missing', response);
                    throw new Error(response.message || 'Login failed');
                }
            } catch (error: any) {
                console.error('Login error in context:', error);
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
            // Silent error handling
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('refresh_token');

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
