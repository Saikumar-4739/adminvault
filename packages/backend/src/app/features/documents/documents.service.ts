import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UploadDocumentModel, DeleteDocumentModel, GetDocumentModel, GetAllDocumentsModel, GetDocumentByIdModel, DocumentModel, UploadDocumentResponseModel } from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentRepository } from './repositories/document.repository';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { DocumentEntity } from './entities/document.entity';

@Injectable()
export class DocumentsService {
    private readonly uploadPath = path.join(process.cwd(), 'uploads', 'documents');

    constructor(
        private readonly dataSource: DataSource,
        private readonly documentRepo: DocumentRepository
    ) {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    /**
     * Upload a new document to the system
     * Saves file to disk and creates database record with metadata
     * 
     * @param reqModel - Document metadata including category, description, tags, and company ID
     * @param file - Multer file object containing uploaded file buffer and metadata
     * @returns UploadDocumentResponseModel with saved document details
     * @throws ErrorResponse if file save or database operation fails
     */
    async uploadDocument(reqModel: UploadDocumentModel, file: Express.Multer.File): Promise<UploadDocumentResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        let fileSaved = false;
        let filePath = '';
        try {
            if (!file) {
                throw new ErrorResponse(400, 'No file uploaded');
            }

            if (!reqModel.userId) {
                throw new ErrorResponse(400, 'User ID is required');
            }

            const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const fileName = `${Date.now()}-${sanitizedOriginalName}`;
            filePath = path.join(this.uploadPath, fileName);
            // Save file to disk
            fs.writeFileSync(filePath, file.buffer);
            fileSaved = true;

            await transManager.startTransaction();

            const document = new DocumentEntity();
            document.fileName = fileName;
            document.originalName = file.originalname;
            document.fileSize = file.size;
            document.mimeType = file.mimetype;
            document.category = reqModel.category || 'General';
            document.filePath = filePath;
            document.uploadedBy = Number(reqModel.userId);
            document.description = reqModel.description;
            document.tags = reqModel.tags;
            document.companyId = Number(reqModel.companyId);
            document.userId = Number(reqModel.userId);
            const saved = await transManager.getRepository(DocumentEntity).save(document);
            await transManager.completeTransaction();
            return new UploadDocumentResponseModel(true, 201, 'Document uploaded successfully', saved as unknown as DocumentModel);
        } catch (error) {
            await transManager.releaseTransaction();
            if (fileSaved && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }

    /**
     * Delete a document from the system
     * Removes both the database record and physical file from disk
     * 
     * @param reqModel - Request containing document ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if document not found or deletion fails
     */
    async deleteDocument(reqModel: DeleteDocumentModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const document = await this.documentRepo.findOne({ where: { id: reqModel.id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }

            await transManager.startTransaction();
            
            // Delete from DB first
            await transManager.getRepository(DocumentEntity).delete(reqModel.id);

            // Delete file from disk
            if (fs.existsSync(document.filePath)) {
                fs.unlinkSync(document.filePath);
            }

            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Document deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Retrieve a specific document by ID
     * Fetches document metadata without the file content
     * 
     * @param reqModel - Request containing document ID
     * @returns GetDocumentByIdModel with document metadata
     * @throws ErrorResponse if document not found
     */
    async getDocument(reqModel: GetDocumentModel): Promise<GetDocumentByIdModel> {
        try {
            const document = await this.documentRepo.findOne({ where: { id: reqModel.id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }
            return new GetDocumentByIdModel(true, 200, 'Document retrieved successfully', document as unknown as DocumentModel);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieve all documents with optional filtering
     * Fetches documents filtered by company ID and/or category, ordered by creation date
     * 
     * @param companyId - Optional company ID to filter documents
     * @param category - Optional category to filter documents
     * @returns GetAllDocumentsModel with list of documents
     * @throws ErrorResponse if database query fails
     */
    async getAllDocuments(companyId?: number, category?: string): Promise<GetAllDocumentsModel> {
        try {
            const where: any = {};
            if (companyId) where.companyId = companyId;
            if (category) where.category = category;

            const documents = await this.documentRepo.find({ where, order: { createdAt: 'DESC' } });
            return new GetAllDocumentsModel(true, 200, 'Documents retrieved successfully', documents as unknown as DocumentModel[]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Prepare document for download
     * Retrieves file path and original filename for document download
     * 
     * @param id - Document ID to download
     * @returns Object containing file path and original filename
     * @throws ErrorResponse if document or file not found
     */
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
            throw error;
        }
    }
}
