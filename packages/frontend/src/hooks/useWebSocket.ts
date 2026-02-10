import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';

/**
 * Base hook for WebSocket functionality
 * NOT exported - used internally by other hooks
 */
const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');
    const [error, setError] = useState<string | null>(null);

    // Initial value for isConnected to avoid hydration mismatch if possible, 
    // but socket is client-only.

    const socket = typeof window !== 'undefined' ? getSocket() : null;

    useEffect(() => {
        if (!socket) return;

        const onConnect = () => {
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);
        };

        const onDisconnect = () => {
            setIsConnected(false);
            setConnectionStatus('disconnected');
        };

        const onConnectError = (err: Error) => {
            setConnectionStatus('error');
            setError(err.message);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        setIsConnected(socket.connected);
        setConnectionStatus(socket.connected ? 'connected' : 'disconnected');

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
        };
    }, [socket]);

    const subscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
        socket?.on(event, handler);
    }, [socket]);

    const unsubscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
        socket?.off(event, handler);
    }, [socket]);

    const emit = useCallback((event: string, data?: any) => {
        socket?.emit(event, data);
    }, [socket]);

    return {
        subscribe,
        unsubscribe,
        emit,
        isConnected,
        connectionStatus,
        error
    };
};


/**
 * Custom hook for WebSocket event subscriptions
 * Automatically handles subscription/unsubscription on mount/unmount
 */
export const useWebSocketEvent = (
    event: string,
    handler: (...args: any[]) => void,
    dependencies: any[] = []
) => {
    const { subscribe, unsubscribe, isConnected } = useWebSocket();
    const handlerRef = useRef(handler);

    // Update handler ref when it changes
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        const wrappedHandler = (...args: any[]) => {
            handlerRef.current(...args);
        };

        subscribe(event, wrappedHandler);

        return () => {
            unsubscribe(event, wrappedHandler);
        };
    }, [event, isConnected, subscribe, unsubscribe, ...dependencies]);
};

/**
 * Hook for emitting WebSocket events
 */
export const useWebSocketEmit = () => {
    const { emit, isConnected } = useWebSocket();

    const safeEmit = useCallback((event: string, data?: any) => {
        if (!isConnected) {
            console.warn(`[useWebSocketEmit] Cannot emit ${event}: not connected`);
            return false;
        }
        emit(event, data);
        return true;
    }, [emit, isConnected]);

    return { emit: safeEmit, isConnected };
};

/**
 * Hook for WebSocket connection status
 */
export const useWebSocketStatus = () => {
    const { isConnected, connectionStatus, error } = useWebSocket();

    return {
        isConnected,
        connectionStatus,
        error,
        isReconnecting: connectionStatus === 'reconnecting',
        hasError: connectionStatus === 'error',
    };
};
