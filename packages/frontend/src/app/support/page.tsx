'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSocket } from '@/lib/socket';
import { ticketService } from '@/lib/api/services';
import { TicketStatusEnum } from '@adminvault/shared-models';
import { MessageSquare, Send, User, Bot, Ticket, PlusCircle } from 'lucide-react';

interface Message {
    id: number;
    senderId: number;
    senderType: 'user' | 'support';
    message: string;
    createdAt: string;
}

export default function SupportChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const ticketId = searchParams.get('ticketId');

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ticketId) return;

        const fetchTicket = async () => {
            try {
                const response = await ticketService.getTicket({ id: Number(ticketId) });
                if (response.status) {
                    setTicket(response.data);
                }
            } catch (error) {
                console.error('Error fetching ticket:', error);
            }
        };

        fetchTicket();

        const socket = getSocket();
        console.log(`[SupportChat] Connecting to ticket room: ${ticketId}`);

        const handleJoin = () => {
            console.log(`[SupportChat] Joining room ticket_${ticketId}`);
            socket.emit('joinTicket', { ticketId: Number(ticketId) });
        };

        const handleHistory = (history: Message[]) => {
            console.log(`[SupportChat] Received ${history.length} previous messages`);
            setMessages(history);
        };

        const handleNewMessage = (message: Message) => {
            console.log(`[SupportChat] Received new message from ${message.senderType}:`, message.message);
            setMessages((prev) => {
                // Check if message already exists (prevent duplicates if history/live lists overlap)
                if (prev.some(m => String(m.id) === String(message.id))) {
                    console.log(`[SupportChat] Skipping duplicate message id: ${message.id}`);
                    return prev;
                }
                return [...prev, message];
            });
        };

        const handleStatusUpdate = (updatedTicket: any) => {
            if (String(updatedTicket.id) === String(ticketId)) {
                setTicket(updatedTicket);
            }
        };

        // If already connected, join now. Otherwise the 'connect' listener will handle it.
        if (socket.connected) {
            handleJoin();
        }

        socket.on('connect', handleJoin);
        socket.on('previousMessages', handleHistory);
        socket.on('newMessage', handleNewMessage);
        socket.on('ticketUpdated', handleStatusUpdate);

        return () => {
            console.log(`[SupportChat] Cleaning up listeners for ticket: ${ticketId}`);
            socket.off('connect', handleJoin);
            socket.off('previousMessages', handleHistory);
            socket.off('newMessage', handleNewMessage);
            socket.off('ticketUpdated', handleStatusUpdate);
        };
    }, [ticketId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !ticketId || !user) {
            console.warn('[SupportChat] Cannot send: missing data', { ticketId, user, hasInput: !!inputMessage.trim() });
            return;
        }

        const socket = getSocket();

        // Determine sender type more robustly
        const isAdmin = user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'super_admin';
        const senderType = isAdmin ? 'support' : 'user';

        console.log(`[SupportChat] Emitting sendMessage for ticket ${ticketId}`);
        socket.emit('sendMessage', {
            ticketId: Number(ticketId),
            senderId: user.id,
            senderType: senderType,
            message: inputMessage,
        });

        setInputMessage('');
    };

    const isClosed = ticket?.ticketStatus === TicketStatusEnum.CLOSED || ticket?.ticketStatus === TicketStatusEnum.RESOLVED;

    const getStatusColor = (status: TicketStatusEnum) => {
        switch (status) {
            case TicketStatusEnum.OPEN:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            case TicketStatusEnum.IN_PROGRESS:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case TicketStatusEnum.RESOLVED:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case TicketStatusEnum.CLOSED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">IT Support Chat</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Get help from our support team</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                            <Ticket className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                Ticket #{ticketId}
                            </span>
                        </div>
                        {ticket?.ticketStatus && (
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(ticket.ticketStatus)}`}>
                                {ticket.ticketStatus.replace('_', ' ')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-900"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                        <Bot className="h-12 w-12 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super_admin';
                        const currentSenderType = isAdmin ? 'support' : 'user';
                        const isMine = message.senderType === currentSenderType;

                        return (
                            <div
                                key={message.id}
                                className={`flex items-start gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMine
                                        ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20'
                                        : 'bg-gradient-to-tr from-violet-600 to-purple-600 shadow-lg shadow-purple-900/20'
                                        }`}
                                >
                                    {message.senderType === 'user' ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-white" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`max-w-md flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${isMine
                                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.message}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 px-2 uppercase tracking-tighter">
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area / Status Indicator */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
                {isClosed ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 max-w-5xl mx-auto text-center">
                        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-2xl border border-red-100 dark:border-red-800/50">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                This ticket has been closed. If you need further assistance, please create a new ticket.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/create-ticket')}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Create New Ticket
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 max-w-5xl mx-auto">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Describe your issue or ask a question..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium text-sm"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-600/20 flex-shrink-0"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


