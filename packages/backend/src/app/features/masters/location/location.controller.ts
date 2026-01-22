import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationModel, UpdateLocationModel, GetAllLocationsResponseModel, CreateLocationResponseModel, UpdateLocationResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Locations Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class LocationController {
    constructor(private locationService: LocationService) { }

    @Post('getAllLocations')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllLocations(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllLocationsResponseModel> {
        try {
            return await this.locationService.getAllLocations(reqModel);
        } catch (error) {
            return returnException(GetAllLocationsResponseModel, error);
        }
    }

    @Post('locations')
    @ApiBody({ type: CreateLocationModel })
    async createLocation(@Body() data: CreateLocationModel, @Req() req: any): Promise<CreateLocationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.locationService.createLocation(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateLocationResponseModel, error);
        }
    }

    @Post('updateLocation')
    @ApiBody({ type: UpdateLocationModel })
    async updateLocation(@Body() data: UpdateLocationModel, @Req() req: any): Promise<UpdateLocationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.locationService.updateLocation(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateLocationResponseModel, error);
        }
    }

    @Post('deleteLocation')
    @ApiBody({ type: IdRequestModel })
    async deleteLocation(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.locationService.deleteLocation(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
