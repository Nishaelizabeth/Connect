import api from './axios';

export interface ApiNotification {
    id: number;
    type: 'buddy_request_sent' | 'buddy_request_received' | 'buddy_request_accepted' | 'buddy_request_rejected' | 'buddy_disconnected';
    message: string;
    is_read: boolean;
    related_object_id: number | null;
    metadata?: {
        buddy_request_id?: number;
        sender_id?: number;
        disconnector_id?: number;
    };
    created_at: string;
}

export interface NotificationsResponse {
    count: number;
    results: ApiNotification[];
}

export const getNotifications = async (): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>('/notifications/');
    return response.data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
    await api.post('/notifications/mark-all-read/');
};

export const clearAllNotifications = async (): Promise<void> => {
    await api.delete('/notifications/clear-all/');
};
