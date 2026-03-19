import { CommonAxiosService } from '../common-axios-service';

export class SecurityService extends CommonAxiosService {
    async getThreats(companyId: number): Promise<any> {
        return this.axiosGetCall(`/security/threats/${companyId}`);
    }

    async getProtocols(companyId: number): Promise<any> {
        return this.axiosGetCall(`/security/protocols/${companyId}`);
    }
}
