'use client';

import { useState } from 'react';
import { MessageSquare, Send, User, Bot, Ticket } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Message {
    id: number;
    sender: 'user' | 'support';
    text: string;
    timestamp: Date;
}

export default function SupportChatPage() {
    const searchParams = useSearchParams();
    const ticketId = searchParams.get('ticketId');
    const ticketTitle = searchParams.get('ticketTitle');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'support',
            text: ticketId
                ? `Hello! I see you're contacting us about ticket #${ticketId}: "${ticketTitle}". How can I help you with this?`
                : 'Hello! How can I help you today?',
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const newMessage: Message = {
            id: messages.length + 1,
            sender: 'user',
            text: inputMessage,
            timestamp: new Date(),
        };

        setMessages([...messages, newMessage]);
        setInputMessage('');

        // Simulate support response
        setTimeout(() => {
            const supportResponse: Message = {
                id: messages.length + 2,
                sender: 'support',
                text: 'Thank you for your message. Our IT support team will assist you shortly.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, supportResponse]);
        }, 1000);
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
                    {ticketId && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                            <Ticket className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                Ticket #{ticketId}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-900">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                                ? 'bg-indigo-600'
                                : 'bg-gradient-to-tr from-violet-600 to-purple-600'
                                }`}
                        >
                            {message.sender === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                            ) : (
                                <Bot className="h-4 w-4 text-white" />
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div
                            className={`max-w-md ${message.sender === 'user' ? 'items-end' : 'items-start'
                                }`}
                        >
                            <div
                                className={`px-4 py-2.5 rounded-2xl ${message.sender === 'user'
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 px-2">
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
