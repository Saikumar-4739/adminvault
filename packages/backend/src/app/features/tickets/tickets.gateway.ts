import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsEntity } from './entities/tickets.entity';
import { TicketMessageEntity } from './entities/ticket-messages.entity';

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

    emitTicketCreated(ticket: any) {
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

    emitTicketUpdated(ticket: any) {
        const room = `ticket_${ticket.id}`;
        this.server.to(room).emit('ticketUpdated', ticket);
        // Also notify admins
        this.server.to('admin_room').emit('ticketCreated', ticket);

        // Notify the specific user room (only if employeeId exists)
        if (ticket.employeeId) {
            const userRoom = `user_${ticket.employeeId}`;
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
                const userRoom = `user_${ticket.employeeId}`;
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

        console.log(`Successfully processed sendMessage for ticket ${data.ticketId}`);
    }
}
