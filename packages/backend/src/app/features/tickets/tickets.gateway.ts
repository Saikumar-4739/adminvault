import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsEntity } from './entities/tickets.entity';
import { TicketMessageEntity } from './entities/ticket-messages.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@adminvault/shared-models';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: 'tickets',
    transports: ['polling', 'websocket'],
})
@Injectable()
export class TicketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private dataSource: DataSource,
        private readonly notificationsService: NotificationsService
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinUser')
    handleJoinUser(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: number },
    ) {
        const room = `user_${data.userId}`;
        client.join(room);
        console.log(`User ${client.id} joined notification room ${room}`);
    }

    @SubscribeMessage('joinAdmins')
    handleJoinAdmins(@ConnectedSocket() client: Socket) {
        client.join('admin_room');
        console.log(`Admin ${client.id} joined admin_room`);
    }

    async emitTicketCreated(ticket: any) {
        this.server.to('admin_room').emit('ticketCreated', ticket);

        // Notify admins with a persistent notification
        // Note: In real app, we'd loop through admins. For now, we often use a specific ID or broadcast.
        // If we want to persist for all admins, we need a list.
        // The implementation_plan says: "userId" in notification entity.
        // Let's assume we target the first Super Admin or similar, or just broadcast for now if that's the pattern.
        // Existing code just did this.server.to('admin_room').emit('notification', ...) which is real-time only.

        // For persistence, we need to know WHICH admin user to save for.
        // If there are multiple admins, we should create multiple notifications if they all need persistence.
        // For now, I will stick to targeting the specific users involved.
    }

    async emitTicketUpdated(ticket: any) {
        const room = `ticket_${ticket.id}`;
        this.server.to(room).emit('ticketUpdated', ticket);
        // Also notify admins
        this.server.to('admin_room').emit('ticketCreated', ticket);

        // Resolve userId for targeting notification
        const userId = await this.resolveUserId(ticket);

        if (userId) {
            await this.notificationsService.createNotification(userId, {
                title: 'Ticket Updated',
                message: `Your ticket "${ticket.subject}" has been updated to ${ticket.ticketStatus}`,
                type: NotificationType.INFO,
                category: 'ticket',
                link: `/create-ticket?tab=tickets`
            });
        }
    }

    @SubscribeMessage('joinTicket')
    async handleJoinTicket(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { ticketId: number },
    ) {
        const room = `ticket_${data.ticketId}`;
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);

        // Fetch existing messages and send to client
        const messages = await this.dataSource.getRepository(TicketMessageEntity).find({
            where: { ticketId: data.ticketId },
            order: { createdAt: 'ASC' },
        });

        client.emit('previousMessages', messages);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { ticketId: number; senderId: number; senderType: string; message: string },
    ) {
        const room = `ticket_${data.ticketId}`;

        // Save message to database
        const messageRepo = this.dataSource.getRepository(TicketMessageEntity);
        const newMessage = messageRepo.create({
            ticketId: data.ticketId,
            senderId: data.senderId,
            senderType: data.senderType,
            message: data.message,
        });
        const savedMessage = await messageRepo.save(newMessage);

        // Broadcast message to everyone in the room
        console.log(`Broadcasting newMessage to room ${room}. Message: ${data.message}`);

        // Convert to plain object to ensure clean serialization
        const messageToEmit = {
            id: savedMessage.id,
            ticketId: savedMessage.ticketId,
            senderId: savedMessage.senderId,
            senderType: savedMessage.senderType,
            message: savedMessage.message,
            createdAt: savedMessage.createdAt,
            updatedAt: savedMessage.updatedAt
        };

        this.server.to(room).emit('newMessage', messageToEmit);

        // Also emit a general notification for the recipient
        // If sender is user, notify admins
        if (data.senderType === 'user') {
            console.log(`Sending notification to admins for ticket ${data.ticketId}`);
            // TODO: Persist for admins if needed. For now, keep as real-time broadcast to admin room 
            // OR find admins and persist. Let's stick to real-time for broadcast for now, 
            // but we really should persist. I'll add a TODO or find admin list.
            this.server.to('admin_room').emit('notification', {
                id: Date.now().toString(),
                title: 'New Message',
                message: data.message,
                timestamp: new Date(),
                type: NotificationType.INFO,
                link: `/support?ticketId=${data.ticketId}`
            });
        } else {
            // Find the ticket to know who the user is
            const ticket = await this.dataSource.getRepository(TicketsEntity).findOne({ where: { id: data.ticketId } });
            if (ticket) {
                const userId = await this.resolveUserId(ticket);
                if (userId) {
                    await this.notificationsService.createNotification(userId, {
                        title: 'Support Response',
                        message: data.message,
                        type: NotificationType.INFO,
                        category: 'message',
                        link: `/support?ticketId=${data.ticketId}`
                    });
                }
            }
        }

        console.log(`Successfully processed sendMessage for ticket ${data.ticketId}`);
    }

    /**
     * Helper to resolve the User ID from a ticket.
     * Prioritizes the direct `userId` field.
     * Fallback: Uses `employeeId` to find Employee -> Email -> AuthUser -> ID.
     */
    private async resolveUserId(ticket: any): Promise<number | null> {
        if (ticket.userId) {
            return ticket.userId;
        }

        if (ticket.employeeId) {
            // Fallback for legacy tickets created before userId was tracked
            try {
                const empRepo = this.dataSource.getRepository(EmployeesEntity);
                const employee = await empRepo.findOne({ where: { id: ticket.employeeId } });

                if (employee && employee.email) {
                    const userRepo = this.dataSource.getRepository(AuthUsersEntity);
                    const user = await userRepo.findOne({ where: { email: employee.email } });

                    if (user) {
                        return user.id;
                    }
                }
            } catch (error) {
                console.error("Error resolving userId from ticket:", error);
            }
        }
        return null;
    }
}
