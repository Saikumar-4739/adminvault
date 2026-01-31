import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

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
