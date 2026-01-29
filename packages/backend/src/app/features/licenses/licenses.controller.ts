import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { LicensesService } from './licenses.service';
import { CreateLicenseModel, UpdateLicenseModel, DeleteLicenseModel, GetAllLicensesResponseModel, GetLicenseStatisticsResponseModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { IAuthenticatedRequest } from '../../interfaces/auth.interface';
import { AuditLog } from '../audit-logs/audit-log.decorator';

@ApiTags('Licenses')
@Controller('licenses')
export class LicensesController {
    constructor(private readonly licensesService: LicensesService) { }

    /**
     * Retrieve all license assignments, optionally filtered by company
     * @param reqModel - Request with company ID
     * @returns GetAllLicensesResponseModel with license data
     */
    @Post('getAllLicenses')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllLicenses(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllLicensesResponseModel> {
        try {
            return await this.licensesService.getAllLicenses(reqModel);
        } catch (error) {
            return returnException(GetAllLicensesResponseModel, error);
        }
    }

    /**
     * Get license statistics for dashboard
     * @param reqModel - Request with company ID
     * @returns GetLicenseStatisticsResponseModel with license statistics
     */
    @Post('getLicenseStatistics')
    @ApiBody({ type: CompanyIdRequestModel })
    async getLicenseStatistics(@Body() reqModel: CompanyIdRequestModel): Promise<GetLicenseStatisticsResponseModel> {
        try {
            return await this.licensesService.getLicenseStatistics(reqModel);
        } catch (error) {
            return returnException(GetLicenseStatisticsResponseModel, error);
        }
    }

    /**
     * Create a new license assignment
     * @param reqModel - License assignment creation data
     * @returns GlobalResponse indicating creation success
     */
    @Post('createLicense')
    @AuditLog({ action: 'CREATE', module: 'Licenses' })
    @ApiBody({ type: CreateLicenseModel })
    async createLicense(@Body() reqModel: CreateLicenseModel, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const userId = req.user.userId;
            const ipAddress = this.extractIp(req);
            return await this.licensesService.createLicense(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update an existing license assignment
     * @param reqModel - License update data with ID
     * @returns GlobalResponse indicating update success
     */
    @Post('updateLicense')
    @AuditLog({ action: 'UPDATE', module: 'Licenses' })
    @ApiBody({ type: UpdateLicenseModel })
    async updateLicense(@Body() reqModel: UpdateLicenseModel, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const userId = req.user.userId;
            const ipAddress = this.extractIp(req);
            return await this.licensesService.updateLicense(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Remove a license assignment
     * @param reqModel - Delete request with license ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('deleteLicense')
    @AuditLog({ action: 'DELETE', module: 'Licenses' })
    @ApiBody({ type: DeleteLicenseModel })
    async deleteLicense(@Body() reqModel: DeleteLicenseModel, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const userId = req.user.userId;
            const ipAddress = this.extractIp(req);
            return await this.licensesService.deleteLicense(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    private extractIp(req: any): string {
        const xForwardedFor = req.headers['x-forwarded-for'];
        if (xForwardedFor) {
            return Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0].trim();
        }
        return req.ip || req.connection?.remoteAddress || 'unknown';
    }
}
