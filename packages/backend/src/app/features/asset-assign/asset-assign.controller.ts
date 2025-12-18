import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AssetAssignService } from './asset-assign.service';
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAllAssetAssignsModel, GetAssetAssignByIdModel } from '@adminvault/shared-models';

@ApiTags('Asset Assign')
@Controller('asset-assign')
export class AssetAssignController {
    constructor(private service: AssetAssignService) { }

    @Post('createAssignment')
    @ApiBody({ type: CreateAssetAssignModel })
    async createAssignment(@Body() reqModel: CreateAssetAssignModel): Promise<GlobalResponse> {
        try {
            return await this.service.createAssignment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateAssignment')
    @ApiBody({ type: UpdateAssetAssignModel })
    async updateAssignment(@Body() reqModel: UpdateAssetAssignModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateAssignment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAssignment')
    @ApiBody({ type: GetAssetAssignModel })
    async getAssignment(@Body() reqModel: GetAssetAssignModel): Promise<GetAssetAssignByIdModel> {
        try {
            return await this.service.getAssignment(reqModel);
        } catch (error) {
            return returnException(GetAssetAssignByIdModel, error);
        }
    }

    @Post('getAllAssignments')
    async getAllAssignments(): Promise<GetAllAssetAssignsModel> {
        try {
            return await this.service.getAllAssignments();
        } catch (error) {
            return returnException(GetAllAssetAssignsModel, error);
        }
    }

    @Post('deleteAssignment')
    @ApiBody({ type: DeleteAssetAssignModel })
    async deleteAssignment(@Body() reqModel: DeleteAssetAssignModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteAssignment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
