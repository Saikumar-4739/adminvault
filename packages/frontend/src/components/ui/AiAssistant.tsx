'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Minimize2, Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/lib/api/services';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    data?: any[];
    intent?: string;
    entity?: string;
}

export default function AiAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const firstName = user?.fullName?.split(' ')[0] || 'there';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hi ${firstName}! I'm your AI Admin Assistant. How can I help you manage your enterprise today?`,
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Call Real AI Service
            const response = await aiService.query(newUserMsg.text);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'ai',
                timestamp: new Date(),
                data: response.data,
                intent: response.intent,
                entity: response.entity
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting to the server. Please check your network.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Bubble */}
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:scale-105 transition-all duration-300"
                >
                    <Bot className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                </button>
            </div>

            {/* Chat Window */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-300 ease-out border-l border-slate-200 dark:border-slate-800 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500">Active</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <Minimize2 className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white dark:bg-slate-950">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                            <Bot className="h-12 w-12 text-slate-300" />
                            <p className="text-sm text-slate-400">How can I help you today?</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] space-y-1 ${msg.sender === 'user' ? 'items-end flex flex-col' : ''}`}>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-400 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                    <div className="relative flex items-end gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-slate-900/10 dark:focus-within:ring-slate-100/10 focus-within:border-slate-400 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Message AI..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white px-3 py-2.5 max-h-32 resize-none custom-scrollbar placeholder:text-slate-400"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={`p-2 rounded-lg transition-all mb-0.5 ${inputValue.trim()
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-400">
                            AI-generated responses. Verify critical data.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
