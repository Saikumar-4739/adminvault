import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateArticleModel, UpdateArticleModel, SearchArticleModel, GlobalResponse, KnowledgeBaseStatsModel } from '@adminvault/shared-models';

export class KnowledgeBaseService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/knowledge-base/' + childUrl;
    }

    async createArticle(reqObj: CreateArticleModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('create'), reqObj, config);
    }

    async updateArticle(reqObj: UpdateArticleModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('update'), reqObj, config);
    }

    async deleteArticle(reqObj: { id: number }, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint(`delete/${reqObj.id}`), reqObj, config);
    }

    async getArticle(id: number, config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint(`article/${id}`), config);
    }

    async searchArticles(reqObj: SearchArticleModel, config?: AxiosRequestConfig): Promise<any[]> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('search'), reqObj, config);
    }

    async getStats(companyId: number, config?: AxiosRequestConfig): Promise<KnowledgeBaseStatsModel> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint(`stats/${companyId}`), config);
    }
}
