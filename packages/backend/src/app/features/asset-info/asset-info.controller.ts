import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AssetInfoService } from './asset-info.service';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAllAssetsModel, GetAssetByIdModel } from '@adminvault/shared-models';

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
}
