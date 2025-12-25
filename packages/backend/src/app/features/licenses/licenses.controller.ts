
import { Body, Controller, Param, Post, Query } from '@nestjs/common';
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
     * @param companyId - Optional company ID query parameter
     * @returns GetAllLicensesModel with license data
     */
    @Post('findAll')
    async findAll(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllLicensesModel> {
        try {
            return await this.licensesService.findAll(reqModel.id);
        } catch (error) {
            return returnException(GetAllLicensesModel, error);
        }
    }

    /**
     * Get license statistics for dashboard
     * @param companyId - Optional company ID query parameter
     * @returns GetLicenseStatsModel with license statistics
     */
    @Post('stats')
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
    async create(@Body() reqModel: CreateLicenseModel): Promise<GlobalResponse> {
        try {
            return await this.licensesService.create(reqModel);
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
    async update(@Body() reqModel: UpdateLicenseModel): Promise<GlobalResponse> {
        try {
            return await this.licensesService.update(reqModel);
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
    async remove(@Body() reqModel: DeleteLicenseModel): Promise<GlobalResponse> {
        try {
            return await this.licensesService.remove(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
