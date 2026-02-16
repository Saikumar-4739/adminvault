import { GlobalResponse } from '../common/global-response';

export class DocumentModel {
    id!: number;
    fileName!: string;
    originalName!: string;
    fileSize!: number;
    mimeType!: string;
    category?: string;
    filePath!: string;
    uploadedBy!: number;
    description?: string;
    tags?: string;
    companyId!: number;
    createdAt?: Date;
    updatedAt?: Date;
    isSecure?: boolean;
    password?: string;

    constructor(data: Partial<DocumentModel>) {
        Object.assign(this, data);
    }
}

export class UploadDocumentModel {
    category?: string;
    description?: string;
    tags?: string;
    companyId!: number;
    userId!: number;
    isSecure?: boolean;
    password?: string;
}

export class GetAllDocumentsRequestModel {
    companyId?: number;
    category?: string;
    isSecure?: boolean;
}

export class DeleteDocumentModel {
    id!: number;
    userId!: number;
}

export class GetDocumentModel {
    id!: number;
}

export class DownloadDocumentRequestModel {
    id!: number;
    password?: string;
}

export class GlobalDocumentResponseModel extends GlobalResponse<DocumentModel> {
    document!: DocumentModel;
    constructor(status: boolean, code: number, message: string, document: DocumentModel) {
        super(status, code, message, document);
        this.document = document;
    }
}

export class GetAllDocumentsResponseModel extends GlobalResponse<DocumentModel[]> {
    documents!: DocumentModel[];
    constructor(status: boolean, code: number, message: string, documents: DocumentModel[]) {
        super(status, code, message, documents);
        this.documents = documents;
    }
}

export class GetDocumentResponseModel extends GlobalDocumentResponseModel { }

export class UploadDocumentResponseModel extends GlobalDocumentResponseModel { }

export class DownloadDocumentResponseModel extends GlobalResponse {
    filePath!: string;
    originalName!: string;
    constructor(status: boolean, code: number, message: string, filePath: string, originalName: string) {
        super(status, code, message);
        this.filePath = filePath;
        this.originalName = originalName;
    }
}
