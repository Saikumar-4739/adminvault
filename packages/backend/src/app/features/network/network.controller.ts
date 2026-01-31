import { Controller, Get, UseGuards } from '@nestjs/common';
import { NetworkService } from './network.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
    NetworkStatsResponse,
    NetworkHealthStatus,
    ConnectionMetrics,
    GlobalResponse,
} from '@adminvault/shared-models';

/**
 * Network Monitoring Controller
 * Provides REST API endpoints for network statistics and health monitoring
 */
@Controller('network')
@UseGuards(JwtAuthGuard)
export class NetworkController {
    constructor(private readonly networkService: NetworkService) { }

    /**
     * Get current network statistics
     * @returns Network statistics including active nodes, latency, throughput
     */
    @Get('stats')
    async getNetworkStats(): Promise<GlobalResponse<NetworkStatsResponse>> {
        const stats = await this.networkService.getNetworkStats();
        return {
            status: true,
            code: 200,
            message: 'Network statistics retrieved successfully',
            data: stats,
        };
    }

    /**
     * Get network health status
     * @returns Network health metrics and status
     */
    @Get('health')
    async getNetworkHealth(): Promise<GlobalResponse<NetworkHealthStatus>> {
        const health = await this.networkService.getNetworkHealth();
        return {
            status: true,
            code: 200,
            message: 'Network health retrieved successfully',
            data: health,
        };
    }

    /**
     * Get active connections
     * @returns List of active WebSocket connections
     */
    @Get('connections')
    async getActiveConnections(): Promise<GlobalResponse<ConnectionMetrics[]>> {
        const connections = await this.networkService.getActiveConnections();
        return {
            status: true,
            code: 200,
            message: 'Active connections retrieved successfully',
            data: connections,
        };
    }
}
