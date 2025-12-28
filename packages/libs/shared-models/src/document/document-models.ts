import { GlobalResponse } from '../common/global-response';

export interface DocumentModel {
    id: number;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    category?: string;
    filePath: string;
    uploadedBy: number;
    description?: string;
    tags?: string;
    companyId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UploadDocumentModel {
    originalName!: string;
    fileSize!: number;
    mimeType!: string;
    category?: string;
    description?: string;
    tags?: string;
    companyId!: number;
    userId!: number;
}

export class DeleteDocumentModel {
    id!: number;
    userId!: number;
}

export class GetDocumentModel {
    id!: number;
}

export class GetAllDocumentsModel extends GlobalResponse {
    documents: DocumentModel[];
    constructor(status: boolean, code: number, message: string, documents: DocumentModel[]) {
        super(status, code, message);
        this.documents = documents;
    }
}

export class GetDocumentByIdModel extends GlobalResponse {
    document: DocumentModel;
    constructor(status: boolean, code: number, message: string, document: DocumentModel) {
        super(status, code, message);
        this.document = document;
    }
}

export class UploadDocumentResponseModel extends GlobalResponse {
    document: DocumentModel;
    constructor(status: boolean, code: number, message: string, document: DocumentModel) {
        super(status, code, message);
        this.document = document;
    }
}
