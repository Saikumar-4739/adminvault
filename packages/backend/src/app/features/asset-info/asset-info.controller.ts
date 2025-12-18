import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AssetInfoService } from './asset-info.service';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAllAssetsModel, GetAssetByIdModel, AssetStatisticsResponseModel, AssetSearchRequestModel, GetAssetsWithAssignmentsResponseModel } from '@adminvault/shared-models';

@ApiTags('Asset Info')
@Controller('asset-info')
export class AssetInfoController {
    constructor(private service: AssetInfoService) { }

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
    async updateAsset(@Body() reqModel: UpdateAssetModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateAsset(reqModel);
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
    async deleteAsset(@Body() reqModel: DeleteAssetModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteAsset(reqModel);
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
}
