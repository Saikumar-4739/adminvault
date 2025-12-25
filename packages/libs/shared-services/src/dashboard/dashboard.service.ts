import { DashboardStatsResponseModel } from '@adminvault/shared-models';
import { CommonAxiosService } from '../common-axios-service';

const CONTROLLER_NAME = '/dashboard';

export class DashboardService extends CommonAxiosService {
    getStats = async (): Promise<DashboardStatsResponseModel> => {
        return await this.axiosPostCall(`${CONTROLLER_NAME}`);
    }
}
