import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';
import { CreateInfrastructureMasterModel, UpdateInfrastructureMasterModel, GetAllInfrastructureMasterResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Infrastructure Master')
@Controller('infrastructure')
@UseGuards(JwtAuthGuard)
export class InfrastructureController {
    constructor(private infraService: InfrastructureService) { }

    @Post('createInfrastructure')
    @ApiBody({ type: CreateInfrastructureMasterModel })
    async createInfrastructure(@Body() reqModel: CreateInfrastructureMasterModel): Promise<GlobalResponse> {
        try {
            return await this.infraService.createInfrastructure(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateInfrastructure')
    @ApiBody({ type: UpdateInfrastructureMasterModel })
    async updateInfrastructure(@Body() reqModel: UpdateInfrastructureMasterModel): Promise<GlobalResponse> {
        try {
            return await this.infraService.updateInfrastructure(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getInfrastructure')
    @ApiBody({ type: IdRequestModel })
    async getInfrastructure(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.infraService.getInfrastructure(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllInfrastructure')
    async getAllInfrastructure(): Promise<GetAllInfrastructureMasterResponseModel> {
        try {
            return await this.infraService.getAllInfrastructure();
        } catch (error) {
            return returnException(GetAllInfrastructureMasterResponseModel, error);
        }
    }

    @Post('deleteInfrastructure')
    @ApiBody({ type: IdRequestModel })
    async deleteInfrastructure(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.infraService.deleteInfrastructure(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
