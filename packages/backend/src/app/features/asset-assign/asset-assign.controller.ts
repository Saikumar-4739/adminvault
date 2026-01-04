import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AssetAssignService } from './asset-assign.service';
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAllAssetAssignsModel, GetAssetAssignByIdModel } from '@adminvault/shared-models';

@ApiTags('Asset Assign')
@Controller('asset-assign')
export class AssetAssignController {
    constructor(private service: AssetAssignService) { }

    /**
     * Create a new asset assignment
     * @param reqModel - Asset assignment creation data
     * @returns GlobalResponse indicating assignment success
     */
    @Post('createAssignment')
    @ApiBody({ type: CreateAssetAssignModel })
    async createAssignment(@Body() reqModel: CreateAssetAssignModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.createAssignment(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update existing asset assignment
     * @param reqModel - Asset assignment update data
     * @returns GlobalResponse indicating update success
     */
    @Post('updateAssignment')
    @ApiBody({ type: UpdateAssetAssignModel })
    async updateAssignment(@Body() reqModel: UpdateAssetAssignModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.updateAssignment(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Retrieve a specific asset assignment by ID
     * @param reqModel - Request with assignment ID
     * @returns GetAssetAssignByIdModel with assignment details
     */
    @Post('getAssignment')
    @ApiBody({ type: GetAssetAssignModel })
    async getAssignment(@Body() reqModel: GetAssetAssignModel): Promise<GetAssetAssignByIdModel> {
        try {
            return await this.service.getAssignment(reqModel);
        } catch (error) {
            return returnException(GetAssetAssignByIdModel, error);
        }
    }

    /**
     * Retrieve all asset assignments
     * @returns GetAllAssetAssignsModel with list of assignments
     */
    @Post('getAllAssignments')
    async getAllAssignments(): Promise<GetAllAssetAssignsModel> {
        try {
            return await this.service.getAllAssignments();
        } catch (error) {
            return returnException(GetAllAssetAssignsModel, error);
        }
    }

    /**
     * Delete an asset assignment (soft delete)
     * @param reqModel - Request with assignment ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('deleteAssignment')
    @ApiBody({ type: DeleteAssetAssignModel })
    async deleteAssignment(@Body() reqModel: DeleteAssetAssignModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.deleteAssignment(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
