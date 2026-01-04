import { Body, Controller, Post, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AssetInfoService } from './asset-info.service';
import { AssetTabsService } from './asset-tabs.service';
import { AssetBulkService } from './asset-bulk.service';
import { AssetHistoryService } from './asset-history.service';
import { AssetAssignService } from './asset-assign.service';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAllAssetsModel, GetAssetByIdModel, AssetStatisticsResponseModel, AssetSearchRequestModel, GetAssetsWithAssignmentsResponseModel, GetStoreAssetsRequestModel, GetStoreAssetsResponseModel, GetReturnAssetsRequestModel, GetReturnAssetsResponseModel, ProcessReturnRequestModel, ProcessReturnResponseModel, GetNextAssignmentsRequestModel, GetNextAssignmentsResponseModel, CreateNextAssignmentRequestModel, CreateNextAssignmentResponseModel, AssignFromQueueRequestModel, AssignFromQueueResponseModel, BulkImportResponseModel, BulkImportRequestModel, AssetTimelineResponseModel, CompanyIdRequestModel, CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAllAssetAssignsModel, GetAssetAssignByIdModel } from '@adminvault/shared-models';

@ApiTags('Asset Info')
@Controller('asset-info')
export class AssetInfoController {
    constructor(
        private service: AssetInfoService,
        private assetTabsService: AssetTabsService,
        private assetBulkService: AssetBulkService,
        private assetHistoryService: AssetHistoryService,
        private assetAssignService: AssetAssignService
    ) { }

    @Post('timeline')
    @ApiBody({ schema: { properties: { id: { type: 'number' }, companyId: { type: 'number' } } } })
    async getTimeline(@Body() body: { id: number, companyId: number }): Promise<AssetTimelineResponseModel> {
        try {
            return await this.assetHistoryService.getAssetTimeline(Number(body.id), Number(body.companyId));
        } catch (error) {
            return returnException(AssetTimelineResponseModel, error);
        }
    }

    @Post('bulk-import')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async bulkImport(@UploadedFile() file: any, @Body('companyId') companyId: number, @Body('userId') userId: number): Promise<BulkImportResponseModel> {
        try {
            if (!file) {
                return new BulkImportResponseModel(false, 400, 'No file provided', 0, 0, []);
            }
            const reqModel = new BulkImportRequestModel(file.buffer, Number(companyId), Number(userId));
            return await this.assetBulkService.processBulkImport(reqModel);
        } catch (error) {
            return returnException(BulkImportResponseModel, error);
        }
    }

    @Post('createAsset')
    @ApiBody({ type: CreateAssetModel })
    async createAsset(@Body() reqModel: CreateAssetModel): Promise<GlobalResponse> {
        try {
            return await this.service.createAsset(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateAsset')
    @ApiBody({ type: UpdateAssetModel })
    async updateAsset(@Body() reqModel: UpdateAssetModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            return await this.service.updateAsset(reqModel, userId);
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
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllAssets(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllAssetsModel> {
        try {
            return await this.service.getAllAssets(reqModel.id);
        } catch (error) {
            return returnException(GetAllAssetsModel, error);
        }
    }

    @Post('deleteAsset')
    @ApiBody({ type: DeleteAssetModel })
    async deleteAsset(@Body() reqModel: DeleteAssetModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            return await this.service.deleteAsset(reqModel, userId);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('statistics')
    @ApiBody({ type: CompanyIdRequestModel })
    async getStatistics(@Body() reqModel: CompanyIdRequestModel): Promise<AssetStatisticsResponseModel> {
        try {
            return await this.service.getAssetStatistics(reqModel.id);
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
    @ApiBody({ type: CompanyIdRequestModel })
    async getAssetsWithAssignments(@Body() reqModel: CompanyIdRequestModel): Promise<GetAssetsWithAssignmentsResponseModel> {
        try {
            return await this.service.getAssetsWithAssignments(reqModel.id);
        } catch (error) {
            return returnException(GetAssetsWithAssignmentsResponseModel, error);
        }
    }


    @Post('store-assets')
    @ApiBody({ type: GetStoreAssetsRequestModel })
    async getStoreAssets(@Body() reqModel: GetStoreAssetsRequestModel): Promise<GetStoreAssetsResponseModel> {
        try {
            return await this.assetTabsService.getStoreAssets(reqModel);
        } catch (error) {
            return returnException(GetStoreAssetsResponseModel, error);
        }
    }

    @Post('return-assets')
    @ApiBody({ type: GetReturnAssetsRequestModel })
    async getReturnAssets(@Body() reqModel: GetReturnAssetsRequestModel): Promise<GetReturnAssetsResponseModel> {
        try {
            return await this.assetTabsService.getReturnAssets(reqModel);
        } catch (error) {
            return returnException(GetReturnAssetsResponseModel, error);
        }
    }

    @Post('process-return')
    @ApiBody({ type: ProcessReturnRequestModel })
    async processReturn(@Body() reqModel: ProcessReturnRequestModel): Promise<ProcessReturnResponseModel> {
        try {
            return await this.assetTabsService.processReturn(reqModel);
        } catch (error) {
            return returnException(ProcessReturnResponseModel, error);
        }
    }

    @Post('next-assignments')
    @ApiBody({ type: GetNextAssignmentsRequestModel })
    async getNextAssignments(@Body() reqModel: GetNextAssignmentsRequestModel): Promise<GetNextAssignmentsResponseModel> {
        try {
            return await this.assetTabsService.getNextAssignments(reqModel);
        } catch (error) {
            return returnException(GetNextAssignmentsResponseModel, error);
        }
    }

    @Post('create-next-assignment')
    @ApiBody({ type: CreateNextAssignmentRequestModel })
    async createNextAssignment(@Body() reqModel: CreateNextAssignmentRequestModel): Promise<CreateNextAssignmentResponseModel> {
        try {
            return await this.assetTabsService.createNextAssignment(reqModel);
        } catch (error) {
            return returnException(CreateNextAssignmentResponseModel, error);
        }
    }

    @Post('assign-from-queue')
    @ApiBody({ type: AssignFromQueueRequestModel })
    async assignFromQueue(@Body() reqModel: AssignFromQueueRequestModel): Promise<AssignFromQueueResponseModel> {
        try {
            return await this.assetTabsService.assignFromQueue(reqModel);
        } catch (error) {
            return returnException(AssignFromQueueResponseModel, error);
        }
    }

    @Post('createAssignment')
    @ApiBody({ type: CreateAssetAssignModel })
    async createAssignment(@Body() reqModel: CreateAssetAssignModel): Promise<GlobalResponse> {
        try {
            return await this.assetAssignService.createAssignment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateAssignment')
    @ApiBody({ type: UpdateAssetAssignModel })
    async updateAssignment(@Body() reqModel: UpdateAssetAssignModel): Promise<GlobalResponse> {
        try {
            return await this.assetAssignService.updateAssignment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAssignment')
    @ApiBody({ type: GetAssetAssignModel })
    async getAssignment(@Body() reqModel: GetAssetAssignModel): Promise<GetAssetAssignByIdModel> {
        try {
            return await this.assetAssignService.getAssignment(reqModel);
        } catch (error) {
            return returnException(GetAssetAssignByIdModel, error);
        }
    }

    @Post('getAllAssignments')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllAssignments(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllAssetAssignsModel> {
        try {
            return await this.assetAssignService.getAllAssignments(reqModel.id);
        } catch (error) {
            return returnException(GetAllAssetAssignsModel, error);
        }
    }

    @Post('deleteAssignment')
    @ApiBody({ type: DeleteAssetAssignModel })
    async deleteAssignment(@Body() reqModel: DeleteAssetAssignModel): Promise<GlobalResponse> {
        try {
            return await this.assetAssignService.deleteAssignment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
