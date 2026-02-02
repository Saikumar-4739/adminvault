import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandModel, UpdateBrandModel, GetAllBrandsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Brands Master')
@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandController {
    constructor(private brandService: BrandService) { }

    @Post('getAllBrands')
    async getAllBrands(): Promise<GetAllBrandsResponseModel> {
        try {
            return await this.brandService.getAllBrands();
        } catch (error) {
            return returnException(GetAllBrandsResponseModel, error);
        }
    }

    @Post('createBrand')
    @ApiBody({ type: CreateBrandModel })
    async createBrand(@Body() reqModel: CreateBrandModel, @Req() req: any): Promise<GlobalResponse> {
        reqModel.userId = req.user.userId;
        try {
            return await this.brandService.createBrand(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateBrand')
    @ApiBody({ type: UpdateBrandModel })
    async updateBrand(@Body() reqModel: UpdateBrandModel): Promise<GlobalResponse> {
        try {
            return await this.brandService.updateBrand(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteBrand')
    @ApiBody({ type: IdRequestModel })
    async deleteBrand(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.brandService.deleteBrand(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
