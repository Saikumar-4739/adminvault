import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { CompanyInfoService } from './company-info.service';
import { CreateCompanyModel, UpdateCompanyModel, DeleteCompanyModel, GetCompanyModel } from '@adminvault/shared-models';

@ApiTags('Company Info')
@Controller('company-info')
export class CompanyInfoController {
    constructor(
        private service: CompanyInfoService
    ) { }

    @Post('createCompany')
    @ApiBody({ type: CreateCompanyModel })
    async createCompany(@Body() reqModel: CreateCompanyModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.createCompany(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateCompany')
    @ApiBody({ type: UpdateCompanyModel })
    async updateCompany(@Body() reqModel: UpdateCompanyModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.updateCompany(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getCompany')
    @ApiBody({ type: GetCompanyModel })
    async getCompany(@Body() reqModel: GetCompanyModel): Promise<GlobalResponse> {
        try {
            return await this.service.getCompany(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllCompanies')
    async getAllCompanies(): Promise<GlobalResponse> {
        try {
            return await this.service.getAllCompanies();
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteCompany')
    @ApiBody({ type: DeleteCompanyModel })
    async deleteCompany(@Body() reqModel: DeleteCompanyModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.deleteCompany(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
