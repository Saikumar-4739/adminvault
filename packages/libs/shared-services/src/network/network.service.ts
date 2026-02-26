import { CommonAxiosService } from '../common-axios-service';
import { NetworkStatsResponse, NetworkHealthStatus, ConnectionMetrics, GlobalResponse } from '@adminvault/shared-models';

export class NetworkService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/network/' + childUrl;
    }

    async getNetworkStats(): Promise<GlobalResponse<NetworkStatsResponse>> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('stats'));
    }

    async getNetworkHealth(): Promise<GlobalResponse<NetworkHealthStatus>> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('health'));
    }

    async getActiveConnections(): Promise<GlobalResponse<ConnectionMetrics[]>> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('connections'));
    }
}
