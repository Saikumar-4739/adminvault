import { Body, Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreatePOModel, GetAllPOsModel, GetPOByIdModel, GetAllPOsRequestModel, GetPORequestModel, UpdatePOStatusRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Procurement')
@Controller('procurement')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
    constructor(private readonly service: ProcurementService) { }

    @Post('createPO')
    @ApiBody({ type: CreatePOModel })
    async createPO(@Body() data: CreatePOModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const userEmail = req.user?.email;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.createPO(data, userId, userEmail, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updatePO/:id')
    @ApiBody({ type: CreatePOModel })
    async updatePO(@Param('id') id: number, @Body() data: CreatePOModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const userEmail = req.user?.email;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.updatePO(id, data, userId, userEmail, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllPOs')
    @ApiBody({ type: GetAllPOsRequestModel })
    async getAllPOs(@Body() reqModel: GetAllPOsRequestModel): Promise<GetAllPOsModel> {
        try {
            return await this.service.getAllPOs(reqModel);
        } catch (error) {
            return returnException(GetAllPOsModel, error);
        }
    }

    @Post('getPO')
    @ApiBody({ type: GetPORequestModel })
    async getPO(@Body() reqModel: GetPORequestModel): Promise<GetPOByIdModel> {
        try {
            return await this.service.getPO(reqModel);
        } catch (error) {
            return returnException(GetPOByIdModel, error);
        }
    }

    @Post('updatePOStatus')
    @ApiBody({ type: UpdatePOStatusRequestModel })
    async updatePOStatus(@Body() reqModel: UpdatePOStatusRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.updatePOStatus(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
