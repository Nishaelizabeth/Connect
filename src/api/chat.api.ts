import api from './axios';

// Types
export interface ChatMessage {
    id: number;
    sender_id: number | null;
    sender_name: string | null;
    sender_avatar: string | null;
    content: string;
    created_at: string;
    is_system: boolean;
    is_me: boolean;
}

export interface ChatMessagesResponse {
    room_id: number;
    trip_id: number;
    trip_title: string;
    messages: ChatMessage[];
}

/**
 * Fetch chat messages for a trip (initial load)
 */
export const getChatMessages = async (tripId: number): Promise<ChatMessagesResponse> => {
    const response = await api.get(`/trips/${tripId}/chat/messages/`);
    return response.data;
};

/**
 * Send a chat message via REST API (fallback for WebSocket)
 */
export const sendChatMessage = async (tripId: number, content: string): Promise<ChatMessage> => {
    const response = await api.post(`/trips/${tripId}/chat/messages/`, { content });
    return response.data;
};
