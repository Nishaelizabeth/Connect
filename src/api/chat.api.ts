import api from './axios';

// Types
export interface PollOption {
    id: number;
    text: string;
    order: number;
    vote_count: number;
}

export interface PollData {
    id: number;
    message_id?: number;
    question: string;
    allow_multiple: boolean;
    is_closed: boolean;
    options: PollOption[];
    total_votes: number;
    user_vote_option_ids: number[];
    voters_per_option: Record<string, number[]>;
}

export interface ChatMessage {
    id: number;
    sender_id: number | null;
    sender_name: string | null;
    sender_avatar: string | null;
    content: string;
    message_type: 'text' | 'poll';
    created_at: string;
    is_system: boolean;
    is_me: boolean;
    poll?: PollData | null;
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

/**
 * Create a new poll in the trip chat
 */
export const createPoll = async (
    tripId: number,
    data: { question: string; options: string[]; allow_multiple: boolean }
): Promise<ChatMessage> => {
    const response = await api.post(`/trips/${tripId}/chat/polls/`, data);
    return response.data;
};

/**
 * Cast or update vote on a poll
 */
export const votePoll = async (
    tripId: number,
    pollId: number,
    optionIds: number[]
): Promise<PollData> => {
    const response = await api.post(`/trips/${tripId}/chat/polls/${pollId}/vote/`, {
        option_ids: optionIds,
    });
    return response.data;
};

/**
 * Remove all votes from a poll
 */
export const removeVotePoll = async (
    tripId: number,
    pollId: number
): Promise<PollData> => {
    const response = await api.delete(`/trips/${tripId}/chat/polls/${pollId}/vote/`);
    return response.data;
};

/**
 * Close a poll (creator only)
 */
export const closePoll = async (
    tripId: number,
    pollId: number
): Promise<PollData> => {
    const response = await api.post(`/trips/${tripId}/chat/polls/${pollId}/close/`);
    return response.data;
};
