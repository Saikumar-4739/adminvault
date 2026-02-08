import { configVariables } from '@adminvault/shared-services';

let socketInstance: any | null = null;

export const getSocket = (): any => {
    if (!socketInstance) {
        // Use 127.0.0.1 instead of localhost for better compatibility on Windows
        // and allow polling as a fallback transport to prevent timeout errors
        const baseUrl = configVariables.APP_AVS_SERVICE_URL; // e.g. https://api.inolyse.live/api

        console.log(`[Socket] Initializing connection to ${baseUrl}/tickets`);

        socketInstance = io(`${baseUrl}/tickets`, {
            transports: ['polling', 'websocket'], // Allow polling + websocket
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000, // Increase timeout to 20s
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Successfully connected to Tickets namespace');
        });

        socketInstance.on('disconnect', (reason: string) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socketInstance.on('connect_error', (error: any) => {
            console.error('[Socket] Connection error:', error.message);
            // If websocket fails, it will automatically fallback to polling if allowed
        });
    }
    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        console.log('[Socket] Explicitly disconnecting');
        socketInstance.disconnect();
        socketInstance = null;
    }
};
