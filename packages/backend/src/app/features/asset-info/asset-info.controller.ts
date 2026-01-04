import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AssetInfoService } from './asset-info.service';
import { AssetTabsService } from './asset-tabs.service';
import { AssetBulkService } from './asset-bulk.service';
import { AssetHistoryService } from './asset-history.service';
import { Request } from 'express';
import {
    CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAllAssetsModel, GetAssetByIdModel,
    AssetStatisticsResponseModel, AssetSearchRequestModel, GetAssetsWithAssignmentsResponseModel,
    GetStoreAssetsRequestModel, GetStoreAssetsResponseModel,
    GetReturnAssetsRequestModel, GetReturnAssetsResponseModel,
    ProcessReturnRequestModel, ProcessReturnResponseModel,
    GetNextAssignmentsRequestModel, GetNextAssignmentsResponseModel,
    CreateNextAssignmentRequestModel, CreateNextAssignmentResponseModel,
    AssignFromQueueRequestModel, AssignFromQueueResponseModel,
    BulkImportResponseModel, AssetTimelineResponseModel
} from '@adminvault/shared-models';

@ApiTags('Asset Info')
@Controller('asset-info')
export class AssetInfoController {
    constructor(
        private service: AssetInfoService,
        private assetTabsService: AssetTabsService,
        private assetBulkService: AssetBulkService,
        private assetHistoryService: AssetHistoryService
    ) { }

    @Get(':id/timeline')
    async getTimeline(@Param('id') id: number, @Query('companyId') companyId: number): Promise<AssetTimelineResponseModel> {
        try {
            return await this.assetHistoryService.getAssetTimeline(Number(id), Number(companyId));
        } catch (error) {
            return returnException(AssetTimelineResponseModel, error);
        }
    }

    @Post('bulk-import')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                companyId: { type: 'number' },
                userId: { type: 'number' }
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async bulkImport(
        @UploadedFile() file: any,
        @Body('companyId') companyId: number,
        @Body('userId') userId: number
    ): Promise<BulkImportResponseModel> {
        try {
            if (!file) {
                return new BulkImportResponseModel(false, 400, 'No file provided', 0, 0, []);
            }
            return await this.assetBulkService.processBulkImport(file.buffer, Number(companyId), Number(userId));
        } catch (error) {
            return returnException(BulkImportResponseModel, error);
        }
    }

    @Post('createAsset')
    @ApiBody({ type: CreateAssetModel })
    async createAsset(@Body() reqModel: CreateAssetModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.createAsset(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateAsset')
    @ApiBody({ type: UpdateAssetModel })
    async updateAsset(@Body() reqModel: UpdateAssetModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.updateAsset(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAsset')
    @ApiBody({ type: GetAssetModel })
    async getAsset(@Body() reqModel: GetAssetModel): Promise<GetAssetByIdModel> {
        try {
            return await this.service.getAsset(reqModel);
        } catch (error) {
            return returnException(GetAssetByIdModel, error);
        }
    }

    @Post('getAllAssets')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    async getAllAssets(@Query('companyId') companyId?: number): Promise<GetAllAssetsModel> {
        try {
            return await this.service.getAllAssets(companyId);
        } catch (error) {
            return returnException(GetAllAssetsModel, error);
        }
    }

    @Post('deleteAsset')
    @ApiBody({ type: DeleteAssetModel })
    async deleteAsset(@Body() reqModel: DeleteAssetModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.deleteAsset(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('statistics')
    @ApiBody({ schema: { properties: { companyId: { type: 'number' } } } })
    async getStatistics(@Body('companyId') companyId: number): Promise<AssetStatisticsResponseModel> {
        try {
            return await this.service.getAssetStatistics(companyId);
        } catch (error) {
            return returnException(AssetStatisticsResponseModel, error);
        }
    }

    @Post('search')
    @ApiBody({ type: AssetSearchRequestModel })
    async searchAssets(@Body() reqModel: AssetSearchRequestModel): Promise<GetAllAssetsModel> {
        try {
            return await this.service.searchAssets(reqModel);
        } catch (error) {
            return returnException(GetAllAssetsModel, error);
        }
    }

    @Post('with-assignments')
    @ApiBody({ schema: { properties: { companyId: { type: 'number' } } } })
    async getAssetsWithAssignments(@Body('companyId') companyId: number): Promise<GetAssetsWithAssignmentsResponseModel> {
        try {
            return await this.service.getAssetsWithAssignments(companyId);
        } catch (error) {
            return returnException(GetAssetsWithAssignmentsResponseModel, error);
        }
    }

    // ============================================
    // ASSET TABS ENDPOINTS
    // ============================================

    @Post('store-assets')
    async getStoreAssets(@Body() reqModel: GetStoreAssetsRequestModel): Promise<GetStoreAssetsResponseModel> {
        try {
            return await this.assetTabsService.getStoreAssets(reqModel);
        } catch (error) {
            return returnException(GetStoreAssetsResponseModel, error);
        }
    }

    @Post('return-assets')
    async getReturnAssets(@Body() reqModel: GetReturnAssetsRequestModel): Promise<GetReturnAssetsResponseModel> {
        try {
            return await this.assetTabsService.getReturnAssets(reqModel);
        } catch (error) {
            return returnException(GetReturnAssetsResponseModel, error);
        }
    }

    @Post('process-return')
    async processReturn(@Body() reqModel: ProcessReturnRequestModel): Promise<ProcessReturnResponseModel> {
        try {
            return await this.assetTabsService.processReturn(reqModel);
        } catch (error) {
            return returnException(ProcessReturnResponseModel, error);
        }
    }

    @Post('next-assignments')
    async getNextAssignments(@Body() reqModel: GetNextAssignmentsRequestModel): Promise<GetNextAssignmentsResponseModel> {
        try {
            return await this.assetTabsService.getNextAssignments(reqModel);
        } catch (error) {
            return returnException(GetNextAssignmentsResponseModel, error);
        }
    }

    @Post('create-next-assignment')
    async createNextAssignment(@Body() reqModel: CreateNextAssignmentRequestModel): Promise<CreateNextAssignmentResponseModel> {
        try {
            return await this.assetTabsService.createNextAssignment(reqModel);
        } catch (error) {
            return returnException(CreateNextAssignmentResponseModel, error);
        }
    }

    @Post('assign-from-queue')
    async assignFromQueue(@Body() reqModel: AssignFromQueueRequestModel): Promise<AssignFromQueueResponseModel> {
        try {
            return await this.assetTabsService.assignFromQueue(reqModel);
        } catch (error) {
            return returnException(AssignFromQueueResponseModel, error);
        }
    }
}
