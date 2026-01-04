# Redux Auth Slice - Complete Usage Guide

## Overview
Complete authentication state management using Redux Toolkit with TypeScript. Includes login, logout, registration, profile updates, token refresh, and security features like login attempt tracking and account lockout.

## 🎯 Features

### 1. **Authentication**
- ✅ User login with credentials
- ✅ User registration
- ✅ User logout
- ✅ Profile updates
- ✅ Token refresh (structure ready)

### 2. **Security Features**
- ✅ Login attempt tracking
- ✅ Account lockout after 5 failed attempts
- ✅ 15-minute lockout duration
- ✅ Automatic lockout timer
- ✅ localStorage persistence

### 3. **State Management**
- ✅ User data
- ✅ Authentication tokens
- ✅ Loading states
- ✅ Error handling
- ✅ Login attempts counter

## 📦 Installation

The auth slice is already created in:
```
src/store/slices/authSlice.ts
```

And integrated into the Redux store:
```typescript
// src/store/index.ts
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // ... other reducers
    },
});
```

## 🚀 Usage Examples

### 1. **Login with useDispatch**

```typescript
'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
    loginUser, 
    selectIsAuthenticated, 
    selectAuthLoading,
    selectAuthError 
} from '@/store/slices/authSlice';

function LoginComponent() {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const handleLogin = async (email: string, password: string) => {
        try {
            const result = await dispatch(loginUser({ email, password })).unwrap();
            console.log('Login successful:', result);
            // Redirect to dashboard
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(email, password);
        }}>
            {/* Form fields */}
        </form>
    );
}
```

### 2. **Logout**

```typescript
import { logoutUser, selectAuthUser } from '@/store/slices/authSlice';

function LogoutButton() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser({ email: user?.email || '' })).unwrap();
            // Redirect to login
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
}
```

### 3. **Register User**

```typescript
import { registerUser } from '@/store/slices/authSlice';

function RegisterComponent() {
    const dispatch = useAppDispatch();

    const handleRegister = async (userData: RegisterUserModel) => {
        try {
            const result = await dispatch(registerUser(userData)).unwrap();
            console.log('Registration successful:', result.message);
            // Show success message and redirect to login
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (/* Registration form */);
}
```

### 4. **Update Profile**

```typescript
import { updateUserProfile, selectAuthUser } from '@/store/slices/authSlice';

function ProfileComponent() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);

    const handleUpdateProfile = async (updates: UpdateUserModel) => {
        try {
            const result = await dispatch(updateUserProfile(updates)).unwrap();
            console.log('Profile updated:', result.message);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (/* Profile form */);
}
```

### 5. **Check Authentication Status**

```typescript
import { selectIsAuthenticated, selectAuthUser } from '@/store/slices/authSlice';

function ProtectedComponent() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectAuthUser);

    if (!isAuthenticated) {
        return <div>Please login</div>;
    }

    return <div>Welcome, {user?.fullName}!</div>;
}
```

### 6. **Handle Lockout**

```typescript
import { 
    selectIsLockedOut, 
    selectLockoutTimeRemaining,
    selectLoginAttempts 
} from '@/store/slices/authSlice';

function LoginForm() {
    const dispatch = useAppDispatch();
    const isLockedOut = useAppSelector(selectIsLockedOut);
    const lockoutTime = useAppSelector(selectLockoutTimeRemaining);
    const attempts = useAppSelector(selectLoginAttempts);

    if (isLockedOut) {
        return (
            <div>
                Account locked. Try again in {Math.ceil(lockoutTime / 60)} minutes.
            </div>
        );
    }

    if (attempts > 0) {
        return (
            <div>
                {attempts} failed attempts. {5 - attempts} remaining.
            </div>
        );
    }

    return (/* Login form */);
}
```

## 📊 Available Selectors

### Basic Selectors
```typescript
import {
    selectAuthUser,           // Current user object
    selectAuthToken,          // JWT token
    selectIsAuthenticated,    // Boolean: is user logged in?
    selectAuthLoading,        // Boolean: is auth action in progress?
    selectAuthError,          // String: current error message
    selectLoginAttempts,      // Number: failed login attempts
    selectLastLoginAttempt,   // Number: timestamp of last attempt
} from '@/store/slices/authSlice';
```

### Computed Selectors
```typescript
import {
    selectUserRole,           // User's role
    selectUserCompanyId,      // User's company ID
    selectUserFullName,       // User's full name
    selectUserEmail,          // User's email
    selectIsLockedOut,        // Boolean: is account locked?
    selectLockoutTimeRemaining, // Number: seconds until unlock
} from '@/store/slices/authSlice';
```

## 🔧 Actions

### Async Actions (Thunks)
```typescript
import {
    loginUser,           // Login with email/password
    registerUser,        // Register new user
    updateUserProfile,   // Update user profile
    logoutUser,          // Logout user
    refreshAuthToken,    // Refresh JWT token
} from '@/store/slices/authSlice';
```

### Sync Actions
```typescript
import {
    setUser,                 // Manually set user
    setToken,                // Manually set token
    clearAuth,               // Clear all auth state
    clearError,              // Clear error message
    incrementLoginAttempts,  // Increment failed attempts
    resetLoginAttempts,      // Reset attempts counter
} from '@/store/slices/authSlice';
```

## 💾 LocalStorage Persistence

The auth slice automatically persists data to localStorage:

```typescript
// Stored keys:
localStorage.getItem('auth_user');          // User object (JSON)
localStorage.getItem('auth_token');         // JWT token
localStorage.getItem('auth_refresh_token'); // Refresh token
```

Data is automatically loaded on app initialization.

## 🔒 Security Features

### Login Attempt Tracking
- Tracks failed login attempts
- Maximum 5 attempts allowed
- Counter resets on successful login

### Account Lockout
- Activates after 5 failed attempts
- Locks account for 15 minutes
- Displays countdown timer
- Automatically unlocks after duration

### Example Lockout Logic
```typescript
const isLockedOut = useAppSelector(selectIsLockedOut);
const lockoutTime = useAppSelector(selectLockoutTimeRemaining);

if (isLockedOut) {
    const minutes = Math.ceil(lockoutTime / 60);
    console.log(`Account locked for ${minutes} more minutes`);
}
```

## 📝 TypeScript Types

### AuthUser Interface
```typescript
interface AuthUser {
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
```

### AuthState Interface
```typescript
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
```

## 🎨 Complete Login Page Example

See the complete example in:
```
src/app/login/LoginExample.tsx
```

Features:
- ✅ Email/password form
- ✅ Loading states
- ✅ Error display
- ✅ Lockout warning
- ✅ Attempt counter
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Beautiful UI with Tailwind

## 🔄 Data Flow

1. **User submits login form**
   ```typescript
   dispatch(loginUser({ email, password }))
   ```

2. **Redux dispatches async thunk**
   - Sets `isLoading = true`
   - Calls API via `authService.loginUser()`

3. **On success**
   - Stores user in state
   - Stores token in state
   - Saves to localStorage
   - Sets `isAuthenticated = true`
   - Resets login attempts

4. **On failure**
   - Sets error message
   - Increments login attempts
   - Checks for lockout condition

5. **Component re-renders**
   - Shows success/error message
   - Redirects or displays lockout

## 🛡️ Protected Routes Example

```typescript
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedPage() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return <div>Loading...</div>;
    }

    return <div>Protected Content</div>;
}
```

## 🚨 Error Handling

```typescript
try {
    const result = await dispatch(loginUser(credentials)).unwrap();
    // Success
    toast.success('Login successful!');
    router.push('/dashboard');
} catch (error: any) {
    // Error
    toast.error(error || 'Login failed');
    console.error('Login error:', error);
}
```

## 🔄 Token Refresh (Ready for Implementation)

The structure is ready for token refresh:

```typescript
import { refreshAuthToken } from '@/store/slices/authSlice';

// When token expires
dispatch(refreshAuthToken());
```

You need to implement the API endpoint in your backend.

## 📚 Best Practices

1. **Always use typed hooks**
   ```typescript
   import { useAppDispatch, useAppSelector } from '@/store/hooks';
   ```

2. **Handle async actions properly**
   ```typescript
   const result = await dispatch(action()).unwrap();
   ```

3. **Clear errors when appropriate**
   ```typescript
   useEffect(() => {
       return () => dispatch(clearError());
   }, [dispatch]);
   ```

4. **Check authentication before protected actions**
   ```typescript
   const isAuthenticated = useAppSelector(selectIsAuthenticated);
   if (!isAuthenticated) return;
   ```

5. **Use selectors for computed values**
   ```typescript
   const userRole = useAppSelector(selectUserRole);
   ```

## 🎯 Next Steps

1. **Install Redux packages** (if not already):
   ```bash
   npm install @reduxjs/toolkit react-redux
   ```

2. **Use the login example**:
   - Copy `LoginExample.tsx` to your login page
   - Customize styling as needed

3. **Add protected routes**:
   - Use `selectIsAuthenticated` in route guards
   - Redirect unauthenticated users

4. **Implement token refresh**:
   - Add refresh endpoint to backend
   - Update `refreshAuthToken` thunk

---

**Note**: The auth slice is fully functional and ready to use with `useDispatch` (via `useAppDispatch`)!
