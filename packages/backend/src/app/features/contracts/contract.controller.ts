import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractModel, UpdateContractModel, IdRequestModel, GlobalResponse } from '@adminvault/shared-models';
import { returnException } from '@adminvault/backend-utils';

@Controller('contract')
export class ContractController {
    constructor(private contractService: ContractService) { }

    @Post('createContract')
    async createContract(@Body() reqModel: CreateContractModel): Promise<GlobalResponse> {
        try {
            return await this.contractService.createContract(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error)
        }

    }

    @Get('getAllContracts')
    async getAllContracts(): Promise<GlobalResponse> {
        try {
            return await this.contractService.getAllContracts();
        } catch (error) {
            return returnException(GlobalResponse, error)
        }

    }

    @Get('getExpiringContracts')
    async getExpiringContracts(@Query('days') days?: string): Promise<GlobalResponse> {
        try {
            return await this.contractService.getExpiringContracts(days ? parseInt(days) : undefined);
        } catch (error) {
            return returnException(GlobalResponse, error)
        }
    }

    @Post('updateContract')
    async updateContract(@Body() reqModel: UpdateContractModel): Promise<GlobalResponse> {
        try {
            return await this.contractService.updateContract(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error)
        }
    }

    @Post('deleteContract')
    async deleteContract(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.contractService.deleteContract(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error)
        }
    }
}
