import { Injectable, Logger } from '@nestjs/common';
import {
    NetworkStatsResponse,
    NetworkHealthStatus,
    ConnectionMetrics,
} from '@adminvault/shared-models';

/**
 * Network Monitoring Service
 * Tracks WebSocket connections, calculates metrics, and provides network health status
 */
@Injectable()
export class NetworkService {
    private readonly logger = new Logger(NetworkService.name);
    private connectionMetrics: Map<string, ConnectionMetrics> = new Map();
    private latencyHistory: number[] = [];
    private readonly maxLatencyHistory = 100;

    /**
     * Get current network statistics
     */
    async getNetworkStats(): Promise<NetworkStatsResponse> {
        const activeConnections = this.connectionMetrics.size;
        const averageLatency = this.calculateAverageLatency();
        const healthScore = this.calculateHealthScore();

        return {
            activeNodes: activeConnections,
            connectedUsers: this.getUniqueUserCount(),
            averageLatency,
            throughput: this.calculateThroughput(),
            healthScore,
            status: this.getNetworkStatus(healthScore),
            lastUpdated: new Date(),
        };
    }

    /**
     * Get network health status
     */
    async getNetworkHealth(): Promise<NetworkHealthStatus> {
        const activeConnections = this.connectionMetrics.size;
        const averageLatency = this.calculateAverageLatency();
        const peakLatency = this.getPeakLatency();

        return {
            overall: this.getOverallHealth(averageLatency, activeConnections),
            uptime: process.uptime(),
            totalConnections: this.connectionMetrics.size,
            activeConnections,
            failedConnections: 0, // TODO: Track failed connections
            averageLatency,
            peakLatency,
            timestamp: new Date(),
        };
    }

    /**
     * Get active connections
     */
    async getActiveConnections(): Promise<ConnectionMetrics[]> {
        return Array.from(this.connectionMetrics.values());
    }

    /**
     * Register a new connection
     */
    registerConnection(metrics: ConnectionMetrics): void {
        this.connectionMetrics.set(metrics.socketId, metrics);
        this.logger.log(`Connection registered: ${metrics.username} (${metrics.socketId})`);
    }

    /**
     * Unregister a connection
     */
    unregisterConnection(socketId: string): void {
        const metrics = this.connectionMetrics.get(socketId);
        if (metrics) {
            this.connectionMetrics.delete(socketId);
            this.logger.log(`Connection unregistered: ${metrics.username} (${socketId})`);
        }
    }

    /**
     * Update connection latency
     */
    updateLatency(socketId: string, latency: number): void {
        const metrics = this.connectionMetrics.get(socketId);
        if (metrics) {
            metrics.latency = latency;
            this.connectionMetrics.set(socketId, metrics);
        }

        // Add to latency history
        this.latencyHistory.push(latency);
        if (this.latencyHistory.length > this.maxLatencyHistory) {
            this.latencyHistory.shift();
        }
    }

    /**
     * Calculate average latency
     */
    private calculateAverageLatency(): number {
        if (this.latencyHistory.length === 0) return 0;
        const sum = this.latencyHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.latencyHistory.length);
    }

    /**
     * Get peak latency
     */
    private getPeakLatency(): number {
        if (this.latencyHistory.length === 0) return 0;
        return Math.max(...this.latencyHistory);
    }

    /**
     * Calculate throughput (simulated for now)
     */
    private calculateThroughput(): number {
        // TODO: Implement actual throughput calculation
        // For now, return a simulated value based on active connections
        return this.connectionMetrics.size * 10.5; // GB/s
    }

    /**
     * Calculate health score (0-100)
     */
    private calculateHealthScore(): number {
        const latency = this.calculateAverageLatency();
        const connections = this.connectionMetrics.size;

        // Health score based on latency and connection count
        let score = 100;

        // Deduct points for high latency
        if (latency > 100) score -= 20;
        else if (latency > 50) score -= 10;
        else if (latency > 30) score -= 5;

        // Deduct points for too many connections (potential overload)
        if (connections > 1000) score -= 20;
        else if (connections > 500) score -= 10;

        return Math.max(0, score);
    }

    /**
     * Get network status based on health score
     */
    private getNetworkStatus(healthScore: number): 'optimal' | 'degraded' | 'critical' {
        if (healthScore >= 80) return 'optimal';
        if (healthScore >= 50) return 'degraded';
        return 'critical';
    }

    /**
     * Get overall health status
     */
    private getOverallHealth(
        latency: number,
        connections: number,
    ): 'healthy' | 'warning' | 'critical' {
        if (latency > 100 || connections > 1000) return 'critical';
        if (latency > 50 || connections > 500) return 'warning';
        return 'healthy';
    }

    /**
     * Get unique user count
     */
    private getUniqueUserCount(): number {
        const userIds = new Set<number>();
        this.connectionMetrics.forEach((metrics) => {
            userIds.add(metrics.userId);
        });
        return userIds.size;
    }

    /**
     * Get connection count
     */
    getConnectionCount(): number {
        return this.connectionMetrics.size;
    }
}
