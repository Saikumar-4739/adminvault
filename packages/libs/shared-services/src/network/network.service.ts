import { AxiosInstance } from '../axios-instance';
import {
    NetworkStatsResponse,
    NetworkHealthStatus,
    ConnectionMetrics,
    GlobalResponse,
} from '@adminvault/shared-models';

/**
 * Network Monitoring Service
 * Handles API calls for network statistics and health monitoring
 */
export class NetworkService {
    private readonly baseUrl = '/network';

    /**
     * Get current network statistics
     */
    async getNetworkStats(): Promise<GlobalResponse<NetworkStatsResponse>> {
        const response = await AxiosInstance.get<GlobalResponse<NetworkStatsResponse>>(
            `${this.baseUrl}/stats`
        );
        return response.data;
    }

    /**
     * Get network health status
     */
    async getNetworkHealth(): Promise<GlobalResponse<NetworkHealthStatus>> {
        const response = await AxiosInstance.get<GlobalResponse<NetworkHealthStatus>>(
            `${this.baseUrl}/health`
        );
        return response.data;
    }

    /**
     * Get active connections
     */
    async getActiveConnections(): Promise<GlobalResponse<ConnectionMetrics[]>> {
        const response = await AxiosInstance.get<GlobalResponse<ConnectionMetrics[]>>(
            `${this.baseUrl}/connections`
        );
        return response.data;
    }
}
