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
    async createCompany(@Body() reqModel: CreateCompanyModel): Promise<GlobalResponse> {
        try {
            return await this.service.createCompany(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateCompany')
    @ApiBody({ type: UpdateCompanyModel })
    async updateCompany(@Body() reqModel: UpdateCompanyModel,): Promise<GlobalResponse> {
        try {
            return await this.service.updateCompany(reqModel);
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

    @Post('getAllCompaniesDropdown')
    async getAllCompaniesDropdown(): Promise<GlobalResponse> {
        try {
            return await this.service.getAllCompaniesDropdown();
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteCompany')
    @ApiBody({ type: DeleteCompanyModel })
    async deleteCompany(@Body() reqModel: DeleteCompanyModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteCompany(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
