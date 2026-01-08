/**
 * AdminVault IAM Client
 * 
 * A TypeScript/JavaScript client library for integrating external applications
 * with AdminVault's Identity and Access Management system.
 * 
 * @example
 * ```typescript
 * import { AdminVaultClient } from '@adminvault/iam-client';
 * 
 * const client = new AdminVaultClient({
 *   baseURL: 'http://localhost:3001/api',
 *   apiKey: 'av_live_your_api_key_here'
 * });
 * 
 * // Check if user has permission
 * const canCreate = await client.hasPermission(userId, 'Product', 'CREATE');
 * ```
 */

import axios, { AxiosInstance } from 'axios';

export interface AdminVaultConfig {
    baseURL: string;
    apiKey: string;
    timeout?: number;
}

export interface Permission {
    id: number;
    name: string;
    code: string;
    description: string;
    resource: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE';
    isActive: boolean;
}

export interface Role {
    id: number;
    name: string;
    code: string;
    description: string;
    permissions: Permission[];
    isSystemRole: boolean;
    isActive: boolean;
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    companyId: number;
    role: string;
    roles?: Role[];
}

export class AdminVaultClient {
    private client: AxiosInstance;
    private permissionCache: Map<string, { permissions: Permission[], timestamp: number }>;
    private cacheTTL: number = 300000; // 5 minutes

    constructor(config: AdminVaultConfig) {
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 10000,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        this.permissionCache = new Map();
    }

    /**
     * Get all permissions for a specific user
     * @param userId - The user ID
     * @returns Array of permissions
     */
    async getUserPermissions(userId: number): Promise<Permission[]> {
        const cacheKey = `user:${userId}:permissions`;
        const cached = this.permissionCache.get(cacheKey);

        // Return cached if valid
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.permissions;
        }

        try {
            const response = await this.client.post(`/administration/iam/users/${userId}/permissions`);

            if (response.data.status) {
                const permissions = response.data.data;
                this.permissionCache.set(cacheKey, {
                    permissions,
                    timestamp: Date.now()
                });
                return permissions;
            }

            return [];
        } catch (error) {
            console.error('Failed to get user permissions:', error);
            throw error;
        }
    }

    /**
     * Check if a user has a specific permission
     * @param userId - The user ID
     * @param resource - The resource name (e.g., 'Product', 'Order')
     * @param action - The action (CREATE, READ, UPDATE, DELETE, EXECUTE)
     * @returns True if user has permission, false otherwise
     */
    async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
        try {
            const response = await this.client.post('/administration/iam/users/check-permission', {
                userId,
                resource,
                action
            });

            return response.data.data?.hasPermission || false;
        } catch (error) {
            console.error('Failed to check permission:', error);
            return false;
        }
    }

    /**
     * Check if user has ANY of the specified permissions
     * @param userId - The user ID
     * @param permissions - Array of {resource, action} pairs
     * @returns True if user has at least one permission
     */
    async hasAnyPermission(userId: number, permissions: Array<{ resource: string, action: string }>): Promise<boolean> {
        const checks = await Promise.all(
            permissions.map(p => this.hasPermission(userId, p.resource, p.action))
        );
        return checks.some(result => result === true);
    }

    /**
     * Check if user has ALL of the specified permissions
     * @param userId - The user ID
     * @param permissions - Array of {resource, action} pairs
     * @returns True if user has all permissions
     */
    async hasAllPermissions(userId: number, permissions: Array<{ resource: string, action: string }>): Promise<boolean> {
        const checks = await Promise.all(
            permissions.map(p => this.hasPermission(userId, p.resource, p.action))
        );
        return checks.every(result => result === true);
    }

    /**
     * Get all roles for a specific user
     * @param userId - The user ID
     * @returns Array of roles
     */
    async getUserRoles(userId: number): Promise<Role[]> {
        try {
            const response = await this.client.post(`/administration/iam/principals/findAll`, {
                id: userId
            });

            if (response.data.success) {
                const user = response.data.data.find((u: any) => u.userId === userId);
                return user?.roles || [];
            }

            return [];
        } catch (error) {
            console.error('Failed to get user roles:', error);
            throw error;
        }
    }

    /**
     * Validate a JWT token
     * @param token - The JWT token to validate
     * @returns User information if valid
     */
    async validateToken(token: string): Promise<User | null> {
        try {
            const response = await this.client.post('/auth-users/validate-token', {
                token
            });

            if (response.data.status) {
                return response.data.user;
            }

            return null;
        } catch (error) {
            console.error('Failed to validate token:', error);
            return null;
        }
    }

    /**
     * Clear cached permissions for a user
     * @param userId - The user ID
     */
    clearUserCache(userId: number): void {
        const cacheKey = `user:${userId}:permissions`;
        this.permissionCache.delete(cacheKey);
    }

    /**
     * Clear all cached permissions
     */
    clearAllCache(): void {
        this.permissionCache.clear();
    }

    /**
     * Set cache TTL (Time To Live)
     * @param ttl - TTL in milliseconds
     */
    setCacheTTL(ttl: number): void {
        this.cacheTTL = ttl;
    }
}

/**
 * Express middleware factory for permission checking
 */
export function createPermissionMiddleware(client: AdminVaultClient) {
    return function requirePermission(resource: string, action: string) {
        return async (req: any, res: any, next: any) => {
            try {
                const userId = req.user?.id;

                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'User not authenticated'
                    });
                }

                const hasPermission = await client.hasPermission(userId, resource, action);

                if (!hasPermission) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: `You don't have permission to ${action} ${resource}`
                    });
                }

                next();
            } catch (error) {
                console.error('Permission check failed:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Permission check failed'
                });
            }
        };
    };
}

/**
 * React hook for permission checking
 */
export function createUsePermission(client: AdminVaultClient) {
    return function usePermission(resource: string, action: string) {
        const [hasPermission, setHasPermission] = React.useState(false);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
            async function checkPermission() {
                try {
                    // Get current user from your auth context
                    const user = getCurrentUser(); // Implement this based on your auth system
                    const result = await client.hasPermission(user.id, resource, action);
                    setHasPermission(result);
                } catch (error) {
                    console.error('Permission check failed:', error);
                    setHasPermission(false);
                } finally {
                    setLoading(false);
                }
            }

            checkPermission();
        }, [resource, action]);

        return { hasPermission, loading };
    };
}

// Helper function placeholder - implement based on your auth system
declare function getCurrentUser(): User;
declare const React: any;

export default AdminVaultClient;
