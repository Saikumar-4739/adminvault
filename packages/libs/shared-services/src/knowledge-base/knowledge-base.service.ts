import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CreateArticleRequestModel,
    UpdateArticleRequestModel,
    SearchArticleRequestModel,
    GlobalResponse,
    GetKnowledgeBaseStatsResponseModel,
    GetKnowledgeArticleResponseModel
} from '@adminvault/shared-models';

export class KnowledgeBaseService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/knowledge-base/' + childUrl;
    }

    async createArticle(reqObj: CreateArticleRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createArticle'), reqObj, config);
    }

    async updateArticle(reqObj: UpdateArticleRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateArticle'), reqObj, config);
    }

    async deleteArticle(reqObj: { id: number }, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteArticle'), reqObj, config);
    }

    async getArticle(id: number, config?: AxiosRequestConfig): Promise<GetKnowledgeArticleResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getArticle'), { id }, config);
    }

    async searchArticles(reqObj: SearchArticleRequestModel, config?: AxiosRequestConfig): Promise<any[]> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('searchArticles'), reqObj, config);
    }

    async getStats(companyId: number, config?: AxiosRequestConfig): Promise<GetKnowledgeBaseStatsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getStats'), { companyId }, config);
    }
}
