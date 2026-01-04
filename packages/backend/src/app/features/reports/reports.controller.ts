import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly service: ReportsService) { }

    @Get('generate')
    async generateReport(@Query('type') type: string, @Query() filters: any, @Req() req: any, @Res() res: Response) {
        const userId = req.user?.id || req.user?.userId;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        try {
            const result: any = await this.service.generateReport(type, filters, userId, ipAddress);

            if (result && result.fileBuffer) {
                res.set({
                    'Content-Type': result.mimeType,
                    'Content-Disposition': `attachment; filename="${result.fileName}"`,
                    'Content-Length': result.fileBuffer.length
                });
                return res.send(result.fileBuffer);
            }

            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}
