import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { DeleteDocumentModel, GetDocumentModel, GetAllDocumentsResponseModel, GetDocumentResponseModel, UploadDocumentResponseModel, UploadDocumentModel, GlobalResponse, GetAllDocumentsRequestModel } from '@adminvault/shared-models';

export class DocumentsService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/documents/' + childUrl;
    }

    async uploadDocument(file: File, reqModel: UploadDocumentModel, config?: AxiosRequestConfig): Promise<UploadDocumentResponseModel> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalName', file.name);
        formData.append('fileSize', file.size.toString());
        formData.append('mimeType', file.type);
        formData.append('companyId', reqModel.companyId.toString());
        formData.append('userId', reqModel.userId.toString());
        if (reqModel.category) formData.append('category', reqModel.category);
        if (reqModel.description) formData.append('description', reqModel.description);
        if (reqModel.tags) formData.append('tags', reqModel.tags);

        return await this.axiosPostCall(this.getURLwithMainEndPoint('uploadDocument'), formData, {
            ...config,
            headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' }
        });
    }

    async deleteDocument(reqObj: DeleteDocumentModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteDocument'), reqObj, config);
    }

    async getDocument(reqObj: GetDocumentModel, config?: AxiosRequestConfig): Promise<GetDocumentResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getDocument'), reqObj, config);
    }

    async getAllDocuments(reqObj: GetAllDocumentsRequestModel, config?: AxiosRequestConfig): Promise<GetAllDocumentsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllDocuments'), reqObj, config);
    }

    getDownloadUrl(id: number): string {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${this.getURLwithMainEndPoint(`downloadDocument/${id}`)}`;
    }
}
