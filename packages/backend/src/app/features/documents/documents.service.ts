import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../repository/document.repository';
import {
    UploadDocumentModel, DeleteDocumentModel, GetDocumentModel,
    GetAllDocumentsModel, GetDocumentByIdModel, DocumentModel, UploadDocumentResponseModel
} from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
    private readonly uploadPath = path.join(process.cwd(), 'uploads', 'documents');

    constructor(private documentRepo: DocumentRepository) {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadDocument(reqModel: UploadDocumentModel, file: Express.Multer.File): Promise<UploadDocumentResponseModel> {
        try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(this.uploadPath, fileName);

            // Save file to disk
            fs.writeFileSync(filePath, file.buffer);

            const document = this.documentRepo.create({
                fileName,
                originalName: reqModel.originalName,
                fileSize: reqModel.fileSize,
                mimeType: reqModel.mimeType,
                category: reqModel.category,
                filePath: filePath,
                uploadedBy: reqModel.userId,
                description: reqModel.description,
                tags: reqModel.tags,
                companyId: reqModel.companyId,
                userId: reqModel.userId
            });

            const saved = await this.documentRepo.save(document);
            return new UploadDocumentResponseModel(true, 201, 'Document uploaded successfully', saved as DocumentModel);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to upload document');
        }
    }

    async deleteDocument(reqModel: DeleteDocumentModel): Promise<GlobalResponse> {
        try {
            const document = await this.documentRepo.findOne({ where: { id: reqModel.id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }

            // Delete file from disk
            if (fs.existsSync(document.filePath)) {
                fs.unlinkSync(document.filePath);
            }

            await this.documentRepo.delete(reqModel.id);
            return new GlobalResponse(true, 200, 'Document deleted successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to delete document');
        }
    }

    async getDocument(reqModel: GetDocumentModel): Promise<GetDocumentByIdModel> {
        try {
            const document = await this.documentRepo.findOne({ where: { id: reqModel.id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }
            return new GetDocumentByIdModel(true, 200, 'Document retrieved successfully', document as DocumentModel);
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to fetch document');
        }
    }

    async getAllDocuments(companyId?: number, category?: string): Promise<GetAllDocumentsModel> {
        try {
            const where: any = {};
            if (companyId) where.companyId = companyId;
            if (category) where.category = category;

            const documents = await this.documentRepo.find({ where, order: { createdAt: 'DESC' } });
            return new GetAllDocumentsModel(true, 200, 'Documents retrieved successfully', documents as DocumentModel[]);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch documents');
        }
    }

    async downloadDocument(id: number): Promise<{ filePath: string; originalName: string }> {
        try {
            const document = await this.documentRepo.findOne({ where: { id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }
            if (!fs.existsSync(document.filePath)) {
                throw new ErrorResponse(404, 'File not found on disk');
            }
            return { filePath: document.filePath, originalName: document.originalName };
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to download document');
        }
    }
}
