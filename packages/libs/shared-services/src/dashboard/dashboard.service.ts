import { CommonAxiosService } from '../common-axios-service';

const CONTROLLER_NAME = '/dashboard';

export class DashboardService extends CommonAxiosService {
    getStats = async () => {
        return await this.axiosGetCall(`${CONTROLLER_NAME}`);
    }
}
