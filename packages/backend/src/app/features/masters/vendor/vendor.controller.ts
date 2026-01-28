import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorModel, UpdateVendorModel, GetAllVendorsResponseModel, CreateVendorResponseModel, UpdateVendorResponseModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Vendors Master')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorController {
    constructor(private vendorService: VendorService) { }

    @Post('getAllVendors')
    async getAllVendors(): Promise<GetAllVendorsResponseModel> {
        try {
            return await this.vendorService.getAllVendors();
        } catch (error) {
            return returnException(GetAllVendorsResponseModel, error);
        }
    }

    @Post('createVendor')
    @ApiBody({ type: CreateVendorModel })
    async createVendor(@Body() reqModel: CreateVendorModel, @Req() req: any): Promise<GlobalResponse> {
        reqModel.userId = req.user.userId;
        try {
            return await this.vendorService.createVendor(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateVendor')
    @ApiBody({ type: UpdateVendorModel })
    async updateVendor(@Body() reqModel: UpdateVendorModel): Promise<GlobalResponse> {
        try {
            return await this.vendorService.updateVendor(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteVendor')
    @ApiBody({ type: IdRequestModel })
    async deleteVendor(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.vendorService.deleteVendor(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
