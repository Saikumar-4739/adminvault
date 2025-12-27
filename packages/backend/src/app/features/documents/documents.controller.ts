import { Body, Controller, Post, Query, Get, Param, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import express from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentModel, DeleteDocumentModel, GetDocumentModel, GetAllDocumentsModel, GetDocumentByIdModel, UploadDocumentResponseModel } from '@adminvault/shared-models';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
    constructor(private service: DocumentsService) { }

    /**
     * Upload a new document with file
     * Accepts multipart/form-data with file upload
     * @param file - Uploaded file from multipart form
     * @param reqModel - Document metadata
     * @returns UploadDocumentResponseModel with saved document details
     */
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body() reqModel: UploadDocumentModel
    ): Promise<UploadDocumentResponseModel> {
        try {
            return await this.service.uploadDocument(reqModel, file);
        } catch (error) {
            return returnException(UploadDocumentResponseModel, error);
        }
    }

    /**
     * Delete a document and its file
     * @param reqModel - Request with document ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('delete')
    @ApiBody({ type: DeleteDocumentModel })
    async deleteDocument(@Body() reqModel: DeleteDocumentModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteDocument(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Retrieve document metadata by ID
     * @param reqModel - Request with document ID
     * @returns GetDocumentByIdModel with document metadata
     */
    @Post('get')
    @ApiBody({ type: GetDocumentModel })
    async getDocument(@Body() reqModel: GetDocumentModel): Promise<GetDocumentByIdModel> {
        try {
            return await this.service.getDocument(reqModel);
        } catch (error) {
            return returnException(GetDocumentByIdModel, error);
        }
    }

    /**
     * Retrieve all documents with optional filtering
     * @param companyId - Optional company ID query parameter
     * @param category - Optional category query parameter
     * @returns GetAllDocumentsModel with list of documents
     */
    @Post('getAll')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    @ApiQuery({ name: 'category', required: false, type: String })
    async getAllDocuments(
        @Query('companyId') companyId?: number,
        @Query('category') category?: string
    ): Promise<GetAllDocumentsModel> {
        try {
            return await this.service.getAllDocuments(companyId, category);
        } catch (error) {
            return returnException(GetAllDocumentsModel, error);
        }
    }

    /**
     * Download a document file
     * @param id - Document ID from URL parameter
     * @param res - Express response object for file download
     */
    @Get('download/:id')
    async downloadDocument(@Param('id') id: number, @Res() res: express.Response) {
        try {
            const { filePath, originalName } = await this.service.downloadDocument(id);
            res.download(filePath, originalName);
        } catch (error) {
            res.status(500).json(returnException(GlobalResponse, error));
        }
    }
}
