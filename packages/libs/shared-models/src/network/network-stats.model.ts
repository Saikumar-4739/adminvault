/**
 * Network Monitoring Models
 * Defines types for real-time network statistics and monitoring
 */

/**
 * Network Statistics Response
 */
export class NetworkStatsResponse {
    activeNodes: number;
    connectedUsers: number;
    averageLatency: number;
    throughput: number;
    healthScore: number;
    status: 'optimal' | 'degraded' | 'critical';
    lastUpdated: Date;

    constructor(
        activeNodes: number,
        connectedUsers: number,
        averageLatency: number,
        throughput: number,
        healthScore: number,
        status: 'optimal' | 'degraded' | 'critical',
        lastUpdated: Date
    ) {
        this.activeNodes = activeNodes;
        this.connectedUsers = connectedUsers;
        this.averageLatency = averageLatency;
        this.throughput = throughput;
        this.healthScore = healthScore;
        this.status = status;
        this.lastUpdated = lastUpdated;
    }
}

/**
 * Connection Metrics
 */
export class ConnectionMetrics {
    userId: number;
    username: string;
    email: string;
    companyId: number;
    roleId: number;
    socketId: string;
    connectedAt: Date;
    latency: number;
    status: 'online' | 'away' | 'offline';

    constructor(
        userId: number,
        username: string,
        email: string,
        companyId: number,
        roleId: number,
        socketId: string,
        connectedAt: Date,
        latency: number,
        status: 'online' | 'away' | 'offline'
    ) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.companyId = companyId;
        this.roleId = roleId;
        this.socketId = socketId;
        this.connectedAt = connectedAt;
        this.latency = latency;
        this.status = status;
    }
}

/**
 * Network Health Status
 */
export class NetworkHealthStatus {
    overall: 'healthy' | 'warning' | 'critical';
    uptime: number;
    totalConnections: number;
    activeConnections: number;
    failedConnections: number;
    averageLatency: number;
    peakLatency: number;
    timestamp: Date;

    constructor(
        overall: 'healthy' | 'warning' | 'critical',
        uptime: number,
        totalConnections: number,
        activeConnections: number,
        failedConnections: number,
        averageLatency: number,
        peakLatency: number,
        timestamp: Date
    ) {
        this.overall = overall;
        this.uptime = uptime;
        this.totalConnections = totalConnections;
        this.activeConnections = activeConnections;
        this.failedConnections = failedConnections;
        this.averageLatency = averageLatency;
        this.peakLatency = peakLatency;
        this.timestamp = timestamp;
    }
}

/**
 * Real-time Network Metrics
 */
export class NetworkMetricsPayload {
    timestamp: Date;
    activeConnections: number;
    latency: number;
    throughput: number;
    cpuUsage?: number;
    memoryUsage?: number;

    constructor(
        timestamp: Date,
        activeConnections: number,
        latency: number,
        throughput: number,
        cpuUsage?: number,
        memoryUsage?: number
    ) {
        this.timestamp = timestamp;
        this.activeConnections = activeConnections;
        this.latency = latency;
        this.throughput = throughput;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
    }
}

/**
 * Connection Event Payload
 */
export class ConnectionEventPayload {
    userId: number;
    username: string;
    email: string;
    socketId: string;
    timestamp: Date;
    eventType: 'connected' | 'disconnected';

    constructor(
        userId: number,
        username: string,
        email: string,
        socketId: string,
        timestamp: Date,
        eventType: 'connected' | 'disconnected'
    ) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.socketId = socketId;
        this.timestamp = timestamp;
        this.eventType = eventType;
    }
}
