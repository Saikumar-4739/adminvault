import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsEntity } from './entities/tickets.entity';
import { TicketMessageEntity } from './entities/ticket-messages.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';

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

    constructor(private dataSource: DataSource) { }

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

        // Notify admins with a badge notification
        this.server.to('admin_room').emit('notification', {
            id: Date.now(),
            title: 'New Support Ticket',
            message: `New ticket: ${ticket.subject}`,
            time: new Date(),
            type: 'ticket',
            link: '/tickets'
        });
    }

    async emitTicketUpdated(ticket: any) {
        const room = `ticket_${ticket.id}`;
        this.server.to(room).emit('ticketUpdated', ticket);
        // Also notify admins
        this.server.to('admin_room').emit('ticketCreated', ticket);

        // Resolve userId for targeting notification
        const userId = await this.resolveUserId(ticket);

        if (userId) {
            const userRoom = `user_${userId}`;
            this.server.to(userRoom).emit('notification', {
                id: Date.now(),
                title: 'Ticket Updated',
                message: `Your ticket "${ticket.subject}" has been updated to ${ticket.ticketStatus}`,
                time: new Date(),
                type: 'ticket',
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
            this.server.to('admin_room').emit('notification', {
                id: Date.now(),
                title: 'New Message',
                message: data.message,
                time: new Date(),
                type: 'message',
                link: `/support?ticketId=${data.ticketId}`
            });
        } else {
            // Find the ticket to know who the user is
            const ticket = await this.dataSource.getRepository(TicketsEntity).findOne({ where: { id: data.ticketId } });
            if (ticket) {
                const userId = await this.resolveUserId(ticket);
                if (userId) {
                    const userRoom = `user_${userId}`;
                    console.log(`Sending notification to user room ${userRoom}`);
                    this.server.to(userRoom).emit('notification', {
                        id: Date.now(),
                        title: 'Support Response',
                        message: data.message,
                        time: new Date(),
                        type: 'message',
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
