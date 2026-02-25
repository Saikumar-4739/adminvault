import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ContractService } from './contract.service';
import {
    CreateContractModel,
    UpdateContractModel,
    IdRequestModel
} from '@adminvault/shared-models';

@Controller('contract')
export class ContractController {
    constructor(private contractService: ContractService) { }

    @Post('createContract')
    async createContract(@Body() reqModel: CreateContractModel) {
        return await this.contractService.createContract(reqModel);
    }

    @Get('getAllContracts')
    async getAllContracts() {
        return await this.contractService.getAllContracts();
    }

    @Get('getExpiringContracts')
    async getExpiringContracts(@Query('days') days?: string) {
        return await this.contractService.getExpiringContracts(days ? parseInt(days) : undefined);
    }

    @Post('updateContract')
    async updateContract(@Body() reqModel: UpdateContractModel) {
        return await this.contractService.updateContract(reqModel);
    }

    @Post('deleteContract')
    async deleteContract(@Body() reqModel: IdRequestModel) {
        return await this.contractService.deleteContract(reqModel);
    }
}
