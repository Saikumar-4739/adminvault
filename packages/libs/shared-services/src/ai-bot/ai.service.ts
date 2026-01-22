import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { AiQueryResponse } from '@adminvault/shared-models';

export class AiService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/ai/' + childUrl;
    }

    async query(queryText: string, config?: AxiosRequestConfig): Promise<AiQueryResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('query'), { query: queryText }, config);
    }
}
