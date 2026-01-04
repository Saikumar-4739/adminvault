import { CommonAxiosService } from '../common-axios-service';
import {
    UploadDocumentModel, DeleteDocumentModel, GetDocumentModel,
    GetAllDocumentsModel, GetDocumentByIdModel, UploadDocumentResponseModel, GlobalResponse
} from '@adminvault/shared-models';

export class DocumentsService extends CommonAxiosService {
    private BASE_PATH = '/documents';

    async uploadDocument(file: File, reqModel: UploadDocumentModel): Promise<UploadDocumentResponseModel> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalName', reqModel.originalName);
        formData.append('fileSize', reqModel.fileSize.toString());
        formData.append('mimeType', reqModel.mimeType);
        formData.append('companyId', reqModel.companyId.toString());
        formData.append('userId', reqModel.userId.toString());
        if (reqModel.category) formData.append('category', reqModel.category);
        if (reqModel.description) formData.append('description', reqModel.description);
        if (reqModel.tags) formData.append('tags', reqModel.tags);

        return await this.axiosPostCall(`${this.BASE_PATH}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    async deleteDocument(reqModel: DeleteDocumentModel): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/delete`, reqModel);
    }

    async getDocument(reqModel: GetDocumentModel): Promise<GetDocumentByIdModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/get`, reqModel);
    }

    async getAllDocuments(companyId?: number, category?: string): Promise<GetAllDocumentsModel> {
        let url = `${this.BASE_PATH}/getAll`;
        const params = [];
        if (companyId) params.push(`companyId=${companyId}`);
        if (category) params.push(`category=${category}`);
        if (params.length > 0) url += `?${params.join('&')}`;
        return await this.axiosPostCall(url, {});
    }

    getDownloadUrl(id: number): string {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${this.BASE_PATH}/download/${id}`;
    }
}
