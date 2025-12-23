import { Body, Controller, Post } from '@nestjs/common';
import { AssetTabsService } from './asset-tabs.service';
import {
    GetStoreAssetsRequestModel, GetStoreAssetsResponseModel,
    GetReturnAssetsRequestModel, GetReturnAssetsResponseModel,
    ProcessReturnRequestModel, ProcessReturnResponseModel,
    GetNextAssignmentsRequestModel, GetNextAssignmentsResponseModel,
    CreateNextAssignmentRequestModel, CreateNextAssignmentResponseModel,
    AssignFromQueueRequestModel, AssignFromQueueResponseModel
} from '@adminvault/shared-models';
import { returnException } from '@adminvault/backend-utils';

@Controller('asset-info')
export class AssetTabsController {
    constructor(private assetTabsService: AssetTabsService) { }

    // ============================================
    // STORE ASSETS TAB
    // ============================================
    @Post('store-assets')
    async getStoreAssets(@Body() reqModel: GetStoreAssetsRequestModel): Promise<GetStoreAssetsResponseModel> {
        try {
            return await this.assetTabsService.getStoreAssets(reqModel);
        } catch (error) {
            return returnException(GetStoreAssetsResponseModel, error);
        }
    }

    // ============================================
    // RETURN ASSETS TAB
    // ============================================
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

    // ============================================
    // NEXT ASSIGN ASSETS TAB
    // ============================================
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
