'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useWebSocketEvent } from '@/hooks/useWebSocket';
import { WebSocketEvent, NotificationPayload, NotificationType } from '@adminvault/shared-models';

interface NotificationBadgeProps {
    className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
    const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Subscribe to notification events
    useWebSocketEvent(WebSocketEvent.NOTIFICATION, (notification: NotificationPayload) => {
        console.log('[NotificationBadge] Received notification:', notification);
        setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10
    });

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const clearAll = () => {
        setNotifications([]);
        setIsOpen(false);
    };

    const getNotificationColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.SUCCESS:
                return 'text-green-600 bg-green-50';
            case NotificationType.WARNING:
                return 'text-yellow-600 bg-yellow-50';
            case NotificationType.ERROR:
                return 'text-red-600 bg-red-50';
            default:
                return 'text-blue-600 bg-blue-50';
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Bell Icon with Badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-blue-600' : 'bg-gray-300'
                                                        }`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {new Date(notification.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded ${getNotificationColor(
                                                        notification.type
                                                    )}`}
                                                >
                                                    {notification.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
