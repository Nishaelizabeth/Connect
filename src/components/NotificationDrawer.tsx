import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle, AlertCircle, XCircle, UserPlus, Loader2 } from 'lucide-react';
import { getNotifications, markAllNotificationsRead } from '@/api/notifications.api';
import type { ApiNotification } from '@/api/notifications.api';

interface Notification {
    id: number;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock notifications data (fallback)
const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'success',
        message: 'Maya Chen accepted your connection request!',
        timestamp: '2MIN AGO',
        isRead: false,
    },
    {
        id: 2,
        type: 'info',
        message: 'Jordan Smith wants to join your Dolomites trip.',
        timestamp: '1HOUR AGO',
        isRead: false,
    },
    {
        id: 3,
        type: 'error',
        message: 'Zack Lee declined the buddy invitation.',
        timestamp: '3HOURS AGO',
        isRead: true,
    },
    {
        id: 4,
        type: 'success',
        message: 'Sarah Rivers followed you back.',
        timestamp: 'YESTERDAY',
        isRead: true,
    },
];

const mapApiTypeToDisplayType = (apiType: ApiNotification['type']): Notification['type'] => {
    switch (apiType) {
        case 'buddy_request_accepted':
            return 'success';
        case 'buddy_request_received':
            return 'info';
        case 'buddy_request_rejected':
            return 'error';
        case 'buddy_request_sent':
            return 'info';
        default:
            return 'info';
    }
};

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'JUST NOW';
    if (diffMinutes < 60) return `${diffMinutes}MIN AGO`;
    if (diffHours < 24) return `${diffHours}HOUR${diffHours > 1 ? 'S' : ''} AGO`;
    if (diffDays === 1) return 'YESTERDAY';
    if (diffDays < 7) return `${diffDays}DAYS AGO`;
    return date.toLocaleDateString().toUpperCase();
};

const transformApiNotification = (apiNotification: ApiNotification): Notification => ({
    id: apiNotification.id,
    type: mapApiTypeToDisplayType(apiNotification.type),
    message: apiNotification.message,
    timestamp: formatTimeAgo(apiNotification.created_at),
    isRead: apiNotification.is_read,
});

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'info':
            return <UserPlus className="w-5 h-5 text-yellow-500" />;
        case 'warning':
            return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        case 'error':
            return <XCircle className="w-5 h-5 text-red-500" />;
        default:
            return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
};

const getNotificationBgColor = (type: Notification['type'], isRead: boolean) => {
    if (isRead) return 'bg-gray-50 opacity-70';
    switch (type) {
        case 'success':
            return 'bg-green-50';
        case 'info':
            return 'bg-yellow-50';
        case 'warning':
            return 'bg-yellow-50';
        case 'error':
            return 'bg-red-50';
        default:
            return 'bg-gray-50';
    }
};

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMarkingRead, setIsMarkingRead] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getNotifications();
            const transformed = response.results.map(transformApiNotification);
            setNotifications(transformed);
        } catch (error) {
            console.error('Failed to fetch notifications, using mock data:', error);
            setNotifications(mockNotifications);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAllRead = async () => {
        setIsMarkingRead(true);
        try {
            await markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        } finally {
            setIsMarkingRead(false);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-[360px] bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Activity Center</h2>
                                {unreadCount > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Category Header */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <span className="text-xs font-semibold text-gray-500 tracking-wide">
                                            BUDDY REQUESTS
                                        </span>
                                    </div>

                                    {/* Notifications */}
                                    <div className="space-y-3">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`rounded-xl p-4 ${getNotificationBgColor(notification.type, notification.isRead)} transition-all hover:shadow-sm cursor-pointer`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-800">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                                                            {notification.timestamp}
                                                        </p>
                                                    </div>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {notifications.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No new notifications</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleMarkAllRead}
                                disabled={isMarkingRead || unreadCount === 0}
                                className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isMarkingRead && <Loader2 className="w-4 h-4 animate-spin" />}
                                Mark All Read
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDrawer;
