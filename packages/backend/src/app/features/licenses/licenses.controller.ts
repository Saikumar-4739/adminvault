
import { Body, Controller, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { LicensesService } from './licenses.service';
import {
    CreateLicenseModel,
    UpdateLicenseModel,
    DeleteLicenseModel,
    GetAllLicensesModel,
    GetLicenseStatsModel,
    CompanyIdRequestModel
} from '@adminvault/shared-models';


@ApiTags('Licenses')
@Controller('licenses')
export class LicensesController {
    constructor(private readonly licensesService: LicensesService) { }

    /**
     * Retrieve all license assignments, optionally filtered by company
     * @param reqModel - Request with company ID
     * @returns GetAllLicensesModel with license data
     */
    @Post('findAll')
    @ApiBody({ type: CompanyIdRequestModel })
    async findAll(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllLicensesModel> {
        try {
            return await this.licensesService.findAll(reqModel.id);
        } catch (error) {
            return returnException(GetAllLicensesModel, error);
        }
    }

    /**
     * Get license statistics for dashboard
     * @param reqModel - Request with company ID
     * @returns GetLicenseStatsModel with license statistics
     */
    @Post('stats')
    @ApiBody({ type: CompanyIdRequestModel })
    async getStats(@Body() reqModel: CompanyIdRequestModel): Promise<GetLicenseStatsModel> {
        try {
            return await this.licensesService.getStats(reqModel.id);
        } catch (error) {
            return returnException(GetLicenseStatsModel, error);
        }
    }

    /**
     * Create a new license assignment
     * @param reqModel - License assignment creation data
     * @returns GlobalResponse indicating creation success
     */
    @Post('create')
    @ApiBody({ type: CreateLicenseModel })
    async create(@Body() reqModel: CreateLicenseModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.licensesService.create(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update an existing license assignment
     * @param reqModel - License update data with ID
     * @returns GlobalResponse indicating update success
     */
    @Post('update')
    @ApiBody({ type: UpdateLicenseModel })
    async update(@Body() reqModel: UpdateLicenseModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.licensesService.update(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Remove a license assignment
     * @param reqModel - Delete request with license ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('delete')
    @ApiBody({ type: DeleteLicenseModel })
    async remove(@Body() reqModel: DeleteLicenseModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.licensesService.remove(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
