import { CommonAxiosService } from '../common-axios-service';

const CONTROLLER_NAME = '/audit-logs';

export class AuditLogsService extends CommonAxiosService {
    getLogs = async (): Promise<any> => {
        return await this.axiosGetCall(`${CONTROLLER_NAME}`);
    }
}
