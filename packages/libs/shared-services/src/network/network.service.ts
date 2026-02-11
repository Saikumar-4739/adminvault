import { CommonAxiosService } from '../common-axios-service';
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
export class NetworkService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/network/' + childUrl;
    }

    /**
     * Get current network statistics
     */
    async getNetworkStats(): Promise<GlobalResponse<NetworkStatsResponse>> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('stats'));
    }

    /**
     * Get network health status
     */
    async getNetworkHealth(): Promise<GlobalResponse<NetworkHealthStatus>> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('health'));
    }

    /**
     * Get active connections
     */
    async getActiveConnections(): Promise<GlobalResponse<ConnectionMetrics[]>> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('connections'));
    }
}
