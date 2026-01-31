/**
 * Network Monitoring Models
 * Defines types for real-time network statistics and monitoring
 */

/**
 * Network Statistics Response
 */
export interface NetworkStatsResponse {
    activeNodes: number;
    connectedUsers: number;
    averageLatency: number;
    throughput: number;
    healthScore: number;
    status: 'optimal' | 'degraded' | 'critical';
    lastUpdated: Date;
}

/**
 * Connection Metrics
 */
export interface ConnectionMetrics {
    userId: number;
    username: string;
    email: string;
    companyId: number;
    roleId: number;
    socketId: string;
    connectedAt: Date;
    latency: number;
    status: 'online' | 'away' | 'offline';
}

/**
 * Network Health Status
 */
export interface NetworkHealthStatus {
    overall: 'healthy' | 'warning' | 'critical';
    uptime: number;
    totalConnections: number;
    activeConnections: number;
    failedConnections: number;
    averageLatency: number;
    peakLatency: number;
    timestamp: Date;
}

/**
 * Real-time Network Metrics
 */
export interface NetworkMetricsPayload {
    timestamp: Date;
    activeConnections: number;
    latency: number;
    throughput: number;
    cpuUsage?: number;
    memoryUsage?: number;
}

/**
 * Connection Event Payload
 */
export interface ConnectionEventPayload {
    userId: number;
    username: string;
    email: string;
    socketId: string;
    timestamp: Date;
    eventType: 'connected' | 'disconnected';
}
