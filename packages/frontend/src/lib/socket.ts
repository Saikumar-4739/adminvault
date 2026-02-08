'use client';

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.inolyse.live';

export function getSocket(): Socket {
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

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
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

