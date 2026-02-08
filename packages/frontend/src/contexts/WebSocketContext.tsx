'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { WebSocketEvent } from '@adminvault/shared-models';
import { configVariables } from '@adminvault/shared-services';

interface WebSocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting' | 'error';
    subscribe: (event: string, handler: (...args: any[]) => void) => void;
    unsubscribe: (event: string, handler: (...args: any[]) => void) => void;
    emit: (event: string, data?: any) => void;
    error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const eventHandlers = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());

    /**
     * Initialize WebSocket connection
     */
    useEffect(() => {
        // Only connect if user is authenticated and has a token
        if (!user || !token) {
            if (socket) {
                console.log('[WebSocket] Disconnecting due to logout');
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
                setConnectionStatus('disconnected');
            }
            return;
        }

        console.log('[WebSocket] Initializing connection...');

        const wsUrl = configVariables.APP_AVS_SERVICE_URL; // e.g. https://api.inolyse.live/api

        const newSocket = io(`${wsUrl}/ws`, {
            auth: {
                token: token,
            },
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
            transports: ['websocket', 'polling'],
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('[WebSocket] Connected successfully');
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);
            reconnectAttempts.current = 0;
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[WebSocket] Disconnected:', reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');

            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect manually
                newSocket.connect();
            }
        });

        newSocket.on('connect_error', (err) => {
            console.error('[WebSocket] Connection error:', err.message);
            setError(err.message);
            setConnectionStatus('error');
            reconnectAttempts.current++;

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.error('[WebSocket] Max reconnection attempts reached');
                setConnectionStatus('error');
            }
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`[WebSocket] Reconnection attempt ${attemptNumber}`);
            setConnectionStatus('reconnecting');
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`[WebSocket] Reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);
            reconnectAttempts.current = 0;
        });

        newSocket.on('reconnect_failed', () => {
            console.error('[WebSocket] Reconnection failed');
            setConnectionStatus('error');
            setError('Failed to reconnect to server');
        });

        // Error event
        newSocket.on(WebSocketEvent.ERROR, (errorData) => {
            console.error('[WebSocket] Server error:', errorData);
            setError(errorData.message || 'Server error');
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('[WebSocket] Cleaning up connection');
            newSocket.disconnect();
        };
    }, [user, token]);

    /**
     * Subscribe to an event
     */
    const subscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
        if (!socket) {
            console.warn('[WebSocket] Cannot subscribe: socket not initialized');
            return;
        }

        // Add to handlers map
        if (!eventHandlers.current.has(event)) {
            eventHandlers.current.set(event, new Set());
        }
        eventHandlers.current.get(event)!.add(handler);

        // Register with socket
        socket.on(event, handler);
        console.log(`[WebSocket] Subscribed to event: ${event}`);
    }, [socket]);

    /**
     * Unsubscribe from an event
     */
    const unsubscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
        if (!socket) {
            console.warn('[WebSocket] Cannot unsubscribe: socket not initialized');
            return;
        }

        // Remove from handlers map
        const handlers = eventHandlers.current.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                eventHandlers.current.delete(event);
            }
        }

        // Unregister from socket
        socket.off(event, handler);
        console.log(`[WebSocket] Unsubscribed from event: ${event}`);
    }, [socket]);

    /**
     * Emit an event to the server
     */
    const emit = useCallback((event: string, data?: any) => {
        if (!socket || !isConnected) {
            console.warn('[WebSocket] Cannot emit: socket not connected');
            return;
        }

        socket.emit(event, data);
        console.log(`[WebSocket] Emitted event: ${event}`, data);
    }, [socket, isConnected]);

    const value: WebSocketContextType = {
        socket,
        isConnected,
        connectionStatus,
        subscribe,
        unsubscribe,
        emit,
        error,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

/**
 * Hook to use WebSocket context
 */
export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
