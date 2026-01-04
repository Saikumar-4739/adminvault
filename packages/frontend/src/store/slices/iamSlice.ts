import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { iamService } from '@/lib/api/services';
import type { IAMUser, SSOProvider, Role } from '@adminvault/shared-services';

interface IAMState {
    users: IAMUser[];
    ssoProviders: SSOProvider[];
    roles: Role[];
    isLoading: boolean;
    error: string | null;
    activeTab: 'users' | 'sso' | 'roles';
}

const initialState: IAMState = {
    users: [],
    ssoProviders: [],
    roles: [],
    isLoading: false,
    error: null,
    activeTab: 'users',
};

// Async thunks for Users
export const fetchUsers = createAsyncThunk<
    IAMUser[],
    number | undefined,
    { rejectValue: string }
>(
    'iam/fetchUsers',
    async (companyId, { rejectWithValue }) => {
        try {
            const response = await iamService.getAllUsers(companyId);
            if (response.status && response.data) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch users');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch users');
        }
    }
);

export const updateUser = createAsyncThunk<
    { success: boolean; message: string },
    { userId: number; data: Partial<IAMUser> },
    { rejectValue: string }
>(
    'iam/updateUser',
    async ({ userId, data }, { rejectWithValue }) => {
        try {
            const response = await iamService.updateUser(userId, data);
            if (response.status) {
                return { success: true, message: response.message || 'User updated successfully' };
            }
            return rejectWithValue(response.message || 'Failed to update user');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk<
    { success: boolean; message: string },
    string,
    { rejectValue: string }
>(
    'iam/deleteUser',
    async (email, { rejectWithValue }) => {
        try {
            const response = await iamService.deleteUser(email);
            if (response.status) {
                return { success: true, message: response.message || 'User deleted successfully' };
            }
            return rejectWithValue(response.message || 'Failed to delete user');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete user');
        }
    }
);

// Async thunks for SSO Providers
export const fetchSSOProviders = createAsyncThunk<
    SSOProvider[],
    void,
    { rejectValue: string }
>(
    'iam/fetchSSOProviders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await iamService.getAllSSOProviders();
            if (response.status && response.data) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch SSO providers');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch SSO providers');
        }
    }
);

export const createSSOProvider = createAsyncThunk<
    { success: boolean; message: string },
    Partial<SSOProvider>,
    { rejectValue: string }
>(
    'iam/createSSOProvider',
    async (data, { rejectWithValue }) => {
        try {
            const response = await iamService.createSSOProvider(data);
            if (response.status) {
                return { success: true, message: response.message || 'SSO provider created successfully' };
            }
            return rejectWithValue(response.message || 'Failed to create SSO provider');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create SSO provider');
        }
    }
);

export const updateSSOProvider = createAsyncThunk<
    { success: boolean; message: string },
    { id: number; data: Partial<SSOProvider> },
    { rejectValue: string }
>(
    'iam/updateSSOProvider',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await iamService.updateSSOProvider(id, data);
            if (response.status) {
                return { success: true, message: response.message || 'SSO provider updated successfully' };
            }
            return rejectWithValue(response.message || 'Failed to update SSO provider');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update SSO provider');
        }
    }
);

export const deleteSSOProvider = createAsyncThunk<
    { success: boolean; message: string },
    number,
    { rejectValue: string }
>(
    'iam/deleteSSOProvider',
    async (id, { rejectWithValue }) => {
        try {
            const response = await iamService.deleteSSOProvider(id);
            if (response.status) {
                return { success: true, message: response.message || 'SSO provider deleted successfully' };
            }
            return rejectWithValue(response.message || 'Failed to delete SSO provider');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete SSO provider');
        }
    }
);

// Async thunks for Roles
export const fetchRoles = createAsyncThunk<
    Role[],
    number | undefined,
    { rejectValue: string }
>(
    'iam/fetchRoles',
    async (companyId, { rejectWithValue }) => {
        try {
            const response = await iamService.getAllRoles(companyId);
            if (response.status && response.data) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch roles');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch roles');
        }
    }
);

export const createRole = createAsyncThunk<
    { success: boolean; message: string },
    { data: Partial<Role>; permissionIds?: number[] },
    { rejectValue: string }
>(
    'iam/createRole',
    async ({ data, permissionIds }, { rejectWithValue }) => {
        try {
            const response = await iamService.createRole(data, permissionIds);
            if (response.status) {
                return { success: true, message: response.message || 'Role created successfully' };
            }
            return rejectWithValue(response.message || 'Failed to create role');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create role');
        }
    }
);

export const updateRole = createAsyncThunk<
    { success: boolean; message: string },
    { id: number; data: Partial<Role>; permissionIds?: number[] },
    { rejectValue: string }
>(
    'iam/updateRole',
    async ({ id, data, permissionIds }, { rejectWithValue }) => {
        try {
            const response = await iamService.updateRole(id, data, permissionIds);
            if (response.status) {
                return { success: true, message: response.message || 'Role updated successfully' };
            }
            return rejectWithValue(response.message || 'Failed to update role');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update role');
        }
    }
);

export const deleteRole = createAsyncThunk<
    { success: boolean; message: string },
    number,
    { rejectValue: string }
>(
    'iam/deleteRole',
    async (id, { rejectWithValue }) => {
        try {
            const response = await iamService.deleteRole(id);
            if (response.status) {
                return { success: true, message: response.message || 'Role deleted successfully' };
            }
            return rejectWithValue(response.message || 'Failed to delete role');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete role');
        }
    }
);

const iamSlice = createSlice({
    name: 'iam',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<'users' | 'sso' | 'roles'>) => {
            state.activeTab = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch users';
            })
            // Update user
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to update user';
            })
            // Delete user
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete user';
            })
            // Fetch SSO providers
            .addCase(fetchSSOProviders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSSOProviders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.ssoProviders = action.payload;
            })
            .addCase(fetchSSOProviders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch SSO providers';
            })
            // Create SSO provider
            .addCase(createSSOProvider.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSSOProvider.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createSSOProvider.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to create SSO provider';
            })
            // Update SSO provider
            .addCase(updateSSOProvider.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSSOProvider.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateSSOProvider.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to update SSO provider';
            })
            // Delete SSO provider
            .addCase(deleteSSOProvider.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSSOProvider.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteSSOProvider.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete SSO provider';
            })
            // Fetch roles
            .addCase(fetchRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch roles';
            })
            // Create role
            .addCase(createRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to create role';
            })
            // Update role
            .addCase(updateRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to update role';
            })
            // Delete role
            .addCase(deleteRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete role';
            });
    },
});

export const { setActiveTab, clearError } = iamSlice.actions;
export default iamSlice.reducer;

// Selectors
export const selectUsers = (state: { iam: IAMState }) => state.iam.users;
export const selectSSOProviders = (state: { iam: IAMState }) => state.iam.ssoProviders;
export const selectRoles = (state: { iam: IAMState }) => state.iam.roles;
export const selectIAMLoading = (state: { iam: IAMState }) => state.iam.isLoading;
export const selectIAMError = (state: { iam: IAMState }) => state.iam.error;
export const selectActiveTab = (state: { iam: IAMState }) => state.iam.activeTab;

// Computed selectors
export const selectActiveUsers = (state: { iam: IAMState }) =>
    state.iam.users.filter(user => user.status);

export const selectActiveSSOProviders = (state: { iam: IAMState }) =>
    state.iam.ssoProviders.filter(provider => provider.isActive);

export const selectActiveRoles = (state: { iam: IAMState }) =>
    state.iam.roles.filter(role => role.isActive);
