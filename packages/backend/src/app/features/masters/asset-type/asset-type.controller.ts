import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AssetTypeService } from './asset-type.service';
import { CreateAssetTypeModel, UpdateAssetTypeModel, GetAllAssetTypesResponseModel, CreateAssetTypeResponseModel, UpdateAssetTypeResponseModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Asset Types Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class AssetTypeController {
    constructor(private assetTypeService: AssetTypeService) { }

    @Post('getAllAssetTypes')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllAssetTypes(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllAssetTypesResponseModel> {
        try {
            return await this.assetTypeService.getAllAssetTypes(reqModel);
        } catch (error) {
            return returnException(GetAllAssetTypesResponseModel, error);
        }
    }

    @Post('asset-types')
    @ApiBody({ type: CreateAssetTypeModel })
    async createAssetType(@Body() data: CreateAssetTypeModel, @Req() req: any): Promise<CreateAssetTypeResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.assetTypeService.createAssetType(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateAssetTypeResponseModel, error);
        }
    }

    @Post('updateAssetType')
    @ApiBody({ type: UpdateAssetTypeModel })
    async updateAssetType(@Body() data: UpdateAssetTypeModel, @Req() req: any): Promise<UpdateAssetTypeResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.assetTypeService.updateAssetType(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateAssetTypeResponseModel, error);
        }
    }

    @Post('deleteAssetType')
    @ApiBody({ type: IdRequestModel })
    async deleteAssetType(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.assetTypeService.deleteAssetType(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
