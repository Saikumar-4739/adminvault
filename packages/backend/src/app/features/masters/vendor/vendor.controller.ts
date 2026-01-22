import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorModel, UpdateVendorModel, GetAllVendorsResponseModel, CreateVendorResponseModel, UpdateVendorResponseModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Vendors Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class VendorController {
    constructor(private vendorService: VendorService) { }

    @Post('getAllVendors')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllVendors(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllVendorsResponseModel> {
        try {
            return await this.vendorService.getAllVendors(reqModel);
        } catch (error) {
            return returnException(GetAllVendorsResponseModel, error);
        }
    }

    @Post('vendors')
    @ApiBody({ type: CreateVendorModel })
    async createVendor(@Body() data: CreateVendorModel, @Req() req: any): Promise<CreateVendorResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.vendorService.createVendor(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateVendorResponseModel, error);
        }
    }

    @Post('updateVendor')
    @ApiBody({ type: UpdateVendorModel })
    async updateVendor(@Body() data: UpdateVendorModel, @Req() req: any): Promise<UpdateVendorResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.vendorService.updateVendor(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateVendorResponseModel, error);
        }
    }

    @Post('deleteVendor')
    @ApiBody({ type: IdRequestModel })
    async deleteVendor(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.vendorService.deleteVendor(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
