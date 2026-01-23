'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/api/services';
import { LoginUserModel, LoginResponseModel } from '@adminvault/shared-models';
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
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

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
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (credentials: LoginUserModel): Promise<User | undefined> => {
        try {
            // Attempt to get geolocation coordinates
            let latitude: number | undefined;
            let longitude: number | undefined;

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error('Geolocation not supported'));
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0 // Fetch fresh position
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                console.log('✅ GPS obtained:', latitude, longitude);
            } catch (geoError) {
                console.warn('⚠️ Geolocation fallback to IP:', geoError);
                // Continue with login even if geolocation fails - backend will fallback to IP lookup
            }

            const loginData = new LoginUserModel(
                credentials.email,
                credentials.password,
                latitude,
                longitude
            );
            const response: LoginResponseModel = await authService.loginUser(loginData);
            const tokenToSave = response.accessToken || (response as any)?.access_token;
            if (response.status && tokenToSave) {
                const userData: User = {
                    id:
                        (response.userInfo as any)?.id ??
                        response.userInfo.companyId,
                    fullName: response.userInfo.fullName,
                    email: response.userInfo.email,
                    companyId: response.userInfo.companyId,
                    role: response.userInfo.role,
                };
                setUser(userData);
                setToken(tokenToSave);
                try {
                    localStorage.setItem("auth_token", tokenToSave);
                    localStorage.setItem("auth_user", JSON.stringify(userData));
                    if (response.refreshToken) {
                        localStorage.setItem("refresh_token", response.refreshToken);
                    }
                } catch (error: any) {
                    console.error('Storage Error:', error);
                }
                return userData;
            }
            throw new Error(response.message || 'Login Failed');
        } catch (error: any) {
            console.error('Login Context Error:', error);
            throw error;
        }
    };

    const logout = useCallback(async () => {
        try {
            if (user && token) {
                await authService.logOutUser({ email: user.email, token: token, });
            }
        } catch (error: any) {
            toast.error(error?.message);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('refresh_token');

        }
    }, [user, token, toast]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user && !!token, login, logout, }}>
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
