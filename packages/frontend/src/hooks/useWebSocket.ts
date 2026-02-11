import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';

/**
 * Base hook for WebSocket functionality
 * NOT exported - used internally by other hooks
 * @param namespace The namespace to connect to
 */
const useWebSocket = (namespace: string = '/ws') => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');
    const [error, setError] = useState<string | null>(null);

    // Get socket for the specified namespace
    const socket = typeof window !== 'undefined' ? getSocket(namespace) : null;

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
    }, [socket, namespace]);

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
        error,
        socket
    };
};


/**
 * Custom hook for WebSocket event subscriptions
 * Automatically handles subscription/unsubscription on mount/unmount
 */
export const useWebSocketEvent = (
    event: string,
    handler: (...args: any[]) => void,
    dependencies: any[] = [],
    namespace: string = '/ws'
) => {
    const { subscribe, unsubscribe, isConnected } = useWebSocket(namespace);
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
    }, [event, isConnected, subscribe, unsubscribe, namespace, ...dependencies]);
};

/**
 * Hook for emitting WebSocket events
 */
export const useWebSocketEmit = (namespace: string = '/ws') => {
    const { emit, isConnected } = useWebSocket(namespace);

    const safeEmit = useCallback((event: string, data?: any) => {
        if (!isConnected) {
            console.warn(`[useWebSocketEmit] Cannot emit ${event} on ${namespace}: not connected`);
            return false;
        }
        emit(event, data);
        return true;
    }, [emit, isConnected, namespace]);

    return { emit: safeEmit, isConnected };
};

/**
 * Hook for WebSocket connection status
 */
export const useWebSocketStatus = (namespace: string = '/ws') => {
    const { isConnected, connectionStatus, error } = useWebSocket(namespace);

    return {
        isConnected,
        connectionStatus,
        error,
        isReconnecting: connectionStatus === 'reconnecting',
        hasError: connectionStatus === 'error',
    };
};
