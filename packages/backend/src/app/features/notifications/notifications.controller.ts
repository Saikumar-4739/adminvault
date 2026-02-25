import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType, GlobalResponse } from '@adminvault/shared-models';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getByUser(
        @Request() req,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number
    ) {
        const userId = req.user.userId;
        return this.notificationsService.getByUser(userId, limit || 50, offset || 0);
    }

    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        const userId = req.user.userId;
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        const userId = req.user.userId;
        return this.notificationsService.markAsRead(Number(id), userId);
    }

    @Post('mark-all-read')
    async markAllRead(@Request() req) {
        const userId = req.user.userId;
        return this.notificationsService.markAllRead(userId);
    }

    @Delete(':id')
    async deleteNotification(@Param('id') id: string, @Request() req) {
        const userId = req.user.userId;
        return this.notificationsService.deleteNotification(Number(id), userId);
    }
}
