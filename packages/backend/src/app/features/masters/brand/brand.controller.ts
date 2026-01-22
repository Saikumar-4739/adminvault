import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandModel, UpdateBrandModel, GetAllBrandsResponseModel, CreateBrandResponseModel, UpdateBrandResponseModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Brands Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class BrandController {
    constructor(private brandService: BrandService) { }

    @Post('getAllBrands')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllBrands(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllBrandsResponseModel> {
        try {
            return await this.brandService.getAllBrands(reqModel);
        } catch (error) {
            return returnException(GetAllBrandsResponseModel, error);
        }
    }

    @Post('brands')
    @ApiBody({ type: CreateBrandModel })
    async createBrand(@Body() data: CreateBrandModel, @Req() req: any): Promise<CreateBrandResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.brandService.createBrand(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateBrandResponseModel, error);
        }
    }

    @Post('updateBrand')
    @ApiBody({ type: UpdateBrandModel })
    async updateBrand(@Body() data: UpdateBrandModel, @Req() req: any): Promise<UpdateBrandResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.brandService.updateBrand(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateBrandResponseModel, error);
        }
    }

    @Post('deleteBrand')
    @ApiBody({ type: IdRequestModel })
    async deleteBrand(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.brandService.deleteBrand(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
