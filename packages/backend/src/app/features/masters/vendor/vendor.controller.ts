import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorModel, UpdateVendorModel, GetAllVendorsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AuditLog } from '../../audit-logs/audit-log.decorator';

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
    @AuditLog({ action: 'CREATE', module: 'Vendor' })
    @ApiBody({ type: CreateVendorModel })
    async createVendor(@Body() createVendorModel: CreateVendorModel, @Req() req: any): Promise<GlobalResponse> {
        createVendorModel.userId = req.user.userId;
        try {
            return await this.vendorService.createVendor(createVendorModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateVendor')
    @AuditLog({ action: 'UPDATE', module: 'Vendor' })
    @ApiBody({ type: UpdateVendorModel })
    async updateVendor(@Body() updateVendorModel: UpdateVendorModel): Promise<GlobalResponse> {
        try {
            return await this.vendorService.updateVendor(updateVendorModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteVendor')
    @AuditLog({ action: 'DELETE', module: 'Vendor' })
    @ApiBody({ type: IdRequestModel })
    async deleteVendor(@Body() idRequestModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.vendorService.deleteVendor(idRequestModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
