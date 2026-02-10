'use client';

import { io } from 'socket.io-client';

let socketInstance: any = null;

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://adminvault.inolyse.live/api';

export function getSocket(): any {
  if (!socketInstance) {
    socketInstance = io(`${baseUrl}/tickets`, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason: string) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('[Socket] Connection error:', error.message);
    });
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

