/**
 * WebSocket Event Types
 * Defines all real-time events used across the application
 */
export enum WebSocketEvent {
    // Connection events
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    ERROR = 'error',

    // Notification events
    NOTIFICATION = 'notification',
    NOTIFICATION_READ = 'notification:read',
    NOTIFICATION_CLEAR = 'notification:clear',

    // Dashboard events
    DASHBOARD_UPDATE = 'dashboard:update',
    STATS_UPDATE = 'stats:update',

    // Ticket events
    TICKET_CREATED = 'ticket:created',
    TICKET_UPDATED = 'ticket:updated',
    TICKET_ASSIGNED = 'ticket:assigned',
    TICKET_RESOLVED = 'ticket:resolved',
    TICKET_COMMENTED = 'ticket:commented',

    // Asset events
    ASSET_CREATED = 'asset:created',
    ASSET_UPDATED = 'asset:updated',
    ASSET_ASSIGNED = 'asset:assigned',

    // User events
    USER_STATUS = 'user:status',
    USER_ONLINE = 'user:online',
    USER_OFFLINE = 'user:offline',

    // System events
    SYSTEM_ALERT = 'system:alert',
    SYSTEM_MAINTENANCE = 'system:maintenance',

    // Audit events
    AUDIT_LOG = 'audit:log',

    // Workflow events
    WORKFLOW_UPDATED = 'workflow:updated',
    APPROVAL_PENDING = 'approval:pending',
    APPROVAL_APPROVED = 'approval:approved',
    APPROVAL_REJECTED = 'approval:rejected',

    // Network monitoring events
    NETWORK_STATS_UPDATE = 'network:stats:update',
    NETWORK_METRICS = 'network:metrics',
    NETWORK_HEALTH_CHANGE = 'network:health:change',
    CONNECTION_EVENT = 'network:connection:event',
}

/**
 * Notification Types
 */
export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

/**
 * Base WebSocket Payload
 */
export interface WebSocketPayload {
    timestamp: Date;
    userId?: number;
    companyId?: number;
}

/**
 * Notification Payload
 */
export interface NotificationPayload extends WebSocketPayload {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    icon?: string;
    read: boolean;
}

/**
 * Dashboard Update Payload
 */
export interface DashboardUpdatePayload extends WebSocketPayload {
    metric: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
}

/**
 * Ticket Event Payload
 */
export interface TicketEventPayload extends WebSocketPayload {
    ticketId: number;
    ticketNumber: string;
    title: string;
    status?: string;
    priority?: string;
    assignedTo?: number;
    assignedToName?: string;
    comment?: string;
}

/**
 * Asset Event Payload
 */
export interface AssetEventPayload extends WebSocketPayload {
    assetId: number;
    assetTag: string;
    assetName: string;
    assetType?: string;
    assignedTo?: number;
    assignedToName?: string;
}

/**
 * User Status Payload
 */
export interface UserStatusPayload extends WebSocketPayload {
    userId: number;
    username: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
}

/**
 * System Alert Payload
 */
export interface SystemAlertPayload extends WebSocketPayload {
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    action?: string;
    actionUrl?: string;
}

/**
 * Audit Log Payload
 */
export interface AuditLogPayload extends WebSocketPayload {
    action: string;
    entity: string;
    entityId: number;
    changes?: Record<string, any>;
    performedBy: number;
    performedByName: string;
}

/**
 * Approval Event Payload
 */
export interface ApprovalEventPayload extends WebSocketPayload {
    approvalId: number;
    workflowId: number;
    workflowName: string;
    requestedBy: number;
    requestedByName: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
}

/**
 * WebSocket Room Types
 */
export enum WebSocketRoom {
    USER = 'user',
    COMPANY = 'company',
    ROLE = 'role',
    GLOBAL = 'global',
}

/**
 * Helper to generate room names
 */
export class WebSocketRoomHelper {
    static getUserRoom(userId: number): string {
        return `${WebSocketRoom.USER}:${userId}`;
    }

    static getCompanyRoom(companyId: number): string {
        return `${WebSocketRoom.COMPANY}:${companyId}`;
    }

    static getRoleRoom(roleId: number): string {
        return `${WebSocketRoom.ROLE}:${roleId}`;
    }

    static getGlobalRoom(): string {
        return WebSocketRoom.GLOBAL;
    }
}
