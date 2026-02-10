import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UploadDocumentModel, DeleteDocumentModel, GetDocumentModel, GetAllDocumentsResponseModel, GetDocumentResponseModel, DocumentModel, UploadDocumentResponseModel, GetAllDocumentsRequestModel, DownloadDocumentRequestModel, DownloadDocumentResponseModel } from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentRepository } from './repositories/document.repository';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { DocumentEntity } from './entities/document.entity';

@Injectable()
export class DocumentsService {
    // Ensure uploads are stored in the workspace root, regardless of where the process is started
    private readonly uploadPath = path.resolve(__dirname, '../../../../../../uploads/documents');

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
            // Use dynamic path construction to ensure we look in the correct root uploads folder
            // This fixes issues where the DB might contain stale absolute paths from different environments
            const currentFilePath = path.join(this.uploadPath, document.fileName);

            if (fs.existsSync(currentFilePath)) {
                fs.unlinkSync(currentFilePath);
            } else if (document.filePath && fs.existsSync(document.filePath)) {
                // Fallback to stored path if relative path fails (legacy support)
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
    async getDocument(reqModel: GetDocumentModel): Promise<GetDocumentResponseModel> {
        try {
            const document = await this.documentRepo.findOne({ where: { id: reqModel.id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }
            return new GetDocumentResponseModel(true, 200, 'Document retrieved successfully', document as unknown as DocumentModel);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieve all documents with optional filtering
     * Fetches documents filtered by company ID and/or category, ordered by creation date
     * 
     * @param reqModel - Request containing filtering criteria (companyId, category)
     * @returns GetAllDocumentsModel with list of documents
     * @throws ErrorResponse if database query fails
     */
    async getAllDocuments(reqModel: GetAllDocumentsRequestModel): Promise<GetAllDocumentsResponseModel> {
        try {
            const where: any = {};
            if (reqModel.companyId) where.companyId = reqModel.companyId;
            if (reqModel.category) where.category = reqModel.category;

            const documents = await this.documentRepo.find({ where, order: { createdAt: 'DESC' } });
            return new GetAllDocumentsResponseModel(true, 200, 'Documents retrieved successfully', documents as unknown as DocumentModel[]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Prepare document for download
     * Retrieves file path and original filename for document download
     * 
     * @param reqModel - Request containing document ID to download
     * @returns DownloadDocumentResponseModel containing file path and original filename
     * @throws ErrorResponse if document or file not found
     */
    async downloadDocument(reqModel: DownloadDocumentRequestModel): Promise<DownloadDocumentResponseModel> {
        try {
            const document = await this.documentRepo.findOne({ where: { id: reqModel.id } });
            if (!document) {
                throw new ErrorResponse(404, 'Document not found');
            }

            // Construct path dynamically to enforce root uploads directory usage
            let downloadPath = path.join(this.uploadPath, document.fileName);

            if (!fs.existsSync(downloadPath)) {
                // Try legacy path if new path fails
                if (document.filePath && fs.existsSync(document.filePath)) {
                    downloadPath = document.filePath;
                } else {
                    throw new ErrorResponse(404, 'File not found on disk');
                }
            }

            return new DownloadDocumentResponseModel(true, 200, 'Document ready for download', downloadPath, document.originalName);
        } catch (error) {
            throw error;
        }
    }
}
