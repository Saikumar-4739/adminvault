import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TicketCategoryService } from './ticket-category.service';
import { CreateTicketCategoryModel, UpdateTicketCategoryModel, GetAllTicketCategoriesResponseModel, CreateTicketCategoryResponseModel, UpdateTicketCategoryResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Ticket Categories Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class TicketCategoryController {
    constructor(private ticketCategoryService: TicketCategoryService) { }

    @Post('getAllTicketCategories')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllTicketCategories(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            return await this.ticketCategoryService.getAllTicketCategories(reqModel);
        } catch (error) {
            return returnException(GetAllTicketCategoriesResponseModel, error);
        }
    }

    @Post('ticket-categories')
    @ApiBody({ type: CreateTicketCategoryModel })
    async createTicketCategory(@Body() data: CreateTicketCategoryModel, @Req() req: any): Promise<CreateTicketCategoryResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.ticketCategoryService.createTicketCategory(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateTicketCategoryResponseModel, error);
        }
    }

    @Post('updateTicketCategory')
    @ApiBody({ type: UpdateTicketCategoryModel })
    async updateTicketCategory(@Body() data: UpdateTicketCategoryModel, @Req() req: any): Promise<UpdateTicketCategoryResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.ticketCategoryService.updateTicketCategory(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateTicketCategoryResponseModel, error);
        }
    }

    @Post('deleteTicketCategory')
    @ApiBody({ type: IdRequestModel })
    async deleteTicketCategory(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.ticketCategoryService.deleteTicketCategory(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
