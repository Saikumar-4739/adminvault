import { Controller, Post, Get, UploadedFile, UseInterceptors, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MastersBulkService } from './masters-bulk.service';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';


@ApiTags('Masters Bulk Import')
@Controller('masters')
export class MastersBulkController {
    private readonly logger = new Logger(MastersBulkController.name);

    constructor(private readonly bulkService: MastersBulkService) { }

    @Post('bulk-import')
    @ApiOperation({ summary: 'Bulk import masters from Excel' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async bulkImport(@UploadedFile() file: Express.Multer.File): Promise<GlobalResponse> {
        if (!file) {
            throw new ErrorResponse(400, 'File is required');
        }

        try {
            return await this.bulkService.bulkImport(file);
        } catch (error: any) {
            this.logger.error(`Import failed: ${error.message}`, error.stack);
            throw new ErrorResponse(500, `Import failed: ${error.message}`);
        }
    }

    @Get('bulk-import/template')
    @ApiOperation({ summary: 'Download Excel template for bulk import' })
    async downloadTemplate(@Res() res: Response) {
        try {
            const buffer = await this.bulkService.generateTemplate();
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=masters_import_template.xlsx',
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        } catch (error: any) {
            this.logger.error(`Failed to generate template: ${error.message}`, error.stack);
            throw new ErrorResponse(500, `Failed to generate template: ${error.message}`);
        }
    }
}
