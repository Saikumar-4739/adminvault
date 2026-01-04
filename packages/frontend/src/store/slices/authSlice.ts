import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/lib/api/services';
import type { LoginUserModel, RegisterUserModel, UpdateUserModel } from '@adminvault/shared-models';

export interface AuthUser {
    id: number;
    fullName: string;
    email: string;
    phNumber?: string;
    companyId: number;
    userRole: string;
    status: boolean;
    lastLogin?: Date;
    createdAt?: Date;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    loginAttempts: number;
    lastLoginAttempt: number | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    loginAttempts: 0,
    lastLoginAttempt: null,
};

// Load user from localStorage on initialization
const loadUserFromStorage = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;

    try {
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedToken) {
            return JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error loading user from storage:', error);
    }
    return null;
};

const loadTokenFromStorage = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

// Async thunks
export const loginUser = createAsyncThunk<
    { user: AuthUser; token: string; refreshToken?: string },
    LoginUserModel,
    { rejectValue: string }
>(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.loginUser(credentials);

            if (response.status && response.data) {
                const user: AuthUser = {
                    id: response.data.id,
                    fullName: response.data.fullName,
                    email: response.data.email,
                    phNumber: response.data.phNumber,
                    companyId: response.data.companyId,
                    userRole: response.data.userRole,
                    status: response.data.status,
                    lastLogin: response.data.lastLogin,
                    createdAt: response.data.createdAt,
                };

                const token = response.data.token || response.token || '';
                const refreshToken = response.data.refreshToken || response.refreshToken;

                // Store in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    localStorage.setItem('auth_token', token);
                    if (refreshToken) {
                        localStorage.setItem('auth_refresh_token', refreshToken);
                    }
                }

                return { user, token, refreshToken };
            }

            return rejectWithValue(response.message || 'Login failed');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk<
    { success: boolean; message: string },
    RegisterUserModel,
    { rejectValue: string }
>(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.registerUser(userData);

            if (response.status) {
                return {
                    success: true,
                    message: response.message || 'Registration successful'
                };
            }

            return rejectWithValue(response.message || 'Registration failed');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const updateUserProfile = createAsyncThunk<
    { success: boolean; message: string; user: AuthUser },
    UpdateUserModel,
    { rejectValue: string }
>(
    'auth/updateUserProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.updateUser(userData);

            if (response.status && response.data) {
                const updatedUser: AuthUser = {
                    id: response.data.id,
                    fullName: response.data.fullName,
                    email: response.data.email,
                    phNumber: response.data.phNumber,
                    companyId: response.data.companyId,
                    userRole: response.data.userRole,
                    status: response.data.status,
                    lastLogin: response.data.lastLogin,
                    createdAt: response.data.createdAt,
                };

                // Update localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                }

                return {
                    success: true,
                    message: response.message || 'Profile updated successfully',
                    user: updatedUser
                };
            }

            return rejectWithValue(response.message || 'Update failed');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Update failed');
        }
    }
);

export const logoutUser = createAsyncThunk<
    { success: boolean; message: string },
    { email: string },
    { rejectValue: string }
>(
    'auth/logoutUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.logOutUser(data);

            // Clear localStorage regardless of API response
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_refresh_token');
            }

            if (response.status) {
                return {
                    success: true,
                    message: response.message || 'Logged out successfully'
                };
            }

            // Even if API fails, we still logged out locally
            return {
                success: true,
                message: 'Logged out locally'
            };
        } catch (error: any) {
            // Clear local storage even on error
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_refresh_token');
            }
            return { success: true, message: 'Logged out locally' };
        }
    }
);

export const refreshAuthToken = createAsyncThunk<
    { token: string; refreshToken?: string },
    void,
    { rejectValue: string }
>(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const storedRefreshToken = typeof window !== 'undefined'
                ? localStorage.getItem('auth_refresh_token')
                : null;

            if (!storedRefreshToken) {
                return rejectWithValue('No refresh token available');
            }

            // Implement your refresh token API call here
            // const response = await authService.refreshToken(storedRefreshToken);

            // For now, return error as refresh endpoint needs to be implemented
            return rejectWithValue('Refresh token endpoint not implemented');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Token refresh failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        ...initialState,
        user: loadUserFromStorage(),
        token: loadTokenFromStorage(),
        isAuthenticated: !!loadUserFromStorage() && !!loadTokenFromStorage(),
    },
    reducers: {
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            state.isAuthenticated = true;

            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_user', JSON.stringify(action.payload));
            }
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;

            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', action.payload);
            }
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_refresh_token');
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        incrementLoginAttempts: (state) => {
            state.loginAttempts += 1;
            state.lastLoginAttempt = Date.now();
        },
        resetLoginAttempts: (state) => {
            state.loginAttempts = 0;
            state.lastLoginAttempt = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken || null;
                state.isAuthenticated = true;
                state.error = null;
                state.loginAttempts = 0;
                state.lastLoginAttempt = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Login failed';
                state.loginAttempts += 1;
                state.lastLoginAttempt = Date.now();
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Registration failed';
            })
            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Update failed';
            })
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
                state.loginAttempts = 0;
                state.lastLoginAttempt = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Still clear auth even on error
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Refresh Token
            .addCase(refreshAuthToken.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(refreshAuthToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken || state.refreshToken;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_token', action.payload.token);
                    if (action.payload.refreshToken) {
                        localStorage.setItem('auth_refresh_token', action.payload.refreshToken);
                    }
                }
            })
            .addCase(refreshAuthToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Token refresh failed';
                // Don't clear auth on refresh failure - let user try to re-login
            });
    },
});

export const {
    setUser,
    setToken,
    clearAuth,
    clearError,
    incrementLoginAttempts,
    resetLoginAttempts,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLoginAttempts = (state: { auth: AuthState }) => state.auth.loginAttempts;
export const selectLastLoginAttempt = (state: { auth: AuthState }) => state.auth.lastLoginAttempt;

// Computed selectors
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.userRole;
export const selectUserCompanyId = (state: { auth: AuthState }) => state.auth.user?.companyId;
export const selectUserFullName = (state: { auth: AuthState }) => state.auth.user?.fullName;
export const selectUserEmail = (state: { auth: AuthState }) => state.auth.user?.email;

// Check if user is locked out due to too many login attempts
export const selectIsLockedOut = (state: { auth: AuthState }) => {
    const { loginAttempts, lastLoginAttempt } = state.auth;
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    if (loginAttempts >= MAX_ATTEMPTS && lastLoginAttempt) {
        const timeSinceLastAttempt = Date.now() - lastLoginAttempt;
        return timeSinceLastAttempt < LOCKOUT_DURATION;
    }
    return false;
};

// Get remaining lockout time in seconds
export const selectLockoutTimeRemaining = (state: { auth: AuthState }) => {
    const { lastLoginAttempt } = state.auth;
    const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    if (!lastLoginAttempt) return 0;

    const timeSinceLastAttempt = Date.now() - lastLoginAttempt;
    const remaining = LOCKOUT_DURATION - timeSinceLastAttempt;

    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};
