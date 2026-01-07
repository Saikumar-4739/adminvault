import { Body, Controller, Post, Get, Param, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import express from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentModel, DeleteDocumentModel, GetDocumentModel, GetAllDocumentsModel, GetDocumentByIdModel, UploadDocumentResponseModel, FilterDocumentModel } from '@adminvault/shared-models';

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
    async getDocument(@Body() reqModel: GetDocumentModel): Promise<GetDocumentByIdModel> {
        try {
            return await this.service.getDocument(reqModel);
        } catch (error) {
            return returnException(GetDocumentByIdModel, error);
        }
    }

    @Post('getAllDocuments')
    @ApiBody({ type: FilterDocumentModel })
    async getAllDocuments(@Body() reqModel: FilterDocumentModel): Promise<GetAllDocumentsModel> {
        try {
            return await this.service.getAllDocuments(reqModel.companyId, reqModel.category);
        } catch (error) {
            return returnException(GetAllDocumentsModel, error);
        }
    }

    @Get('downloadDocument/:id')
    async downloadDocument(@Param('id') id: number, @Res() res: express.Response) {
        try {
            const { filePath, originalName } = await this.service.downloadDocument(id);
            res.download(filePath, originalName);
        } catch (error) {
            res.status(500).json(returnException(GlobalResponse, error));
        }
    }
}
