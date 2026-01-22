import { Body, Controller, Post, Get, Param, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import express from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentModel, DeleteDocumentModel, GetDocumentModel, GetAllDocumentsResponseModel, GetDocumentResponseModel, UploadDocumentResponseModel, GetAllDocumentsRequestModel, DownloadDocumentRequestModel, DownloadDocumentResponseModel } from '@adminvault/shared-models';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
    constructor(private readonly service: DocumentsService) { }

    @Post('uploadDocument')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(@UploadedFile() file: Express.Multer.File, @Body() reqModel: UploadDocumentModel): Promise<UploadDocumentResponseModel> {
        try {
            return await this.service.uploadDocument(reqModel, file);
        } catch (error) {
            return returnException(UploadDocumentResponseModel, error);
        }
    }

    @Post('deleteDocument')
    @ApiBody({ type: DeleteDocumentModel })
    async deleteDocument(@Body() reqModel: DeleteDocumentModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteDocument(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getDocument')
    @ApiBody({ type: GetDocumentModel })
    async getDocument(@Body() reqModel: GetDocumentModel): Promise<GetDocumentResponseModel> {
        try {
            return await this.service.getDocument(reqModel);
        } catch (error) {
            return returnException(GetDocumentResponseModel, error);
        }
    }

    @Post('getAllDocuments')
    @ApiBody({ type: GetAllDocumentsRequestModel })
    async getAllDocuments(@Body() reqModel: GetAllDocumentsRequestModel): Promise<GetAllDocumentsResponseModel> {
        try {
            return await this.service.getAllDocuments(reqModel);
        } catch (error) {
            return returnException(GetAllDocumentsResponseModel, error);
        }
    }

    @Get('downloadDocument/:id')
    async downloadDocument(@Param('id') id: number, @Res() res: express.Response) {
        try {
            const reqModel: DownloadDocumentRequestModel = { id };
            const response = await this.service.downloadDocument(reqModel);
            res.download(response.filePath, response.originalName);
        } catch (error) {
            res.status(500).json(returnException(GlobalResponse, error));
        }
    }
}
