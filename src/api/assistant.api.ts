import api from './axios';

// Types
export interface AssistantMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Conversation {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    messages: AssistantMessage[];
}

export interface BuddyCard {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    match_score: number;
    tags: string[];
    request_status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted';
}

export interface ChatResponse {
    reply: string;
    conversation_id: number;
    message_id: number;
    buddy_cards?: BuddyCard[];
    has_more_buddies?: boolean;
}

export interface AssistantStatus {
    available: boolean;
    model: string | null;
    fallback_enabled: boolean;
}

// API Functions

/**
 * Send a message to the AI travel assistant
 */
export const sendAssistantMessage = async (
    message: string,
    conversationId?: number
): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/assistant/chat/', {
        message,
        conversation_id: conversationId || null,
    });
    return response.data;
};

/**
 * Get assistant status (check if Ollama is available)
 */
export const getAssistantStatus = async (): Promise<AssistantStatus> => {
    const response = await api.get<AssistantStatus>('/assistant/status/');
    return response.data;
};

/**
 * Get user's conversation history
 */
export const getConversations = async (): Promise<{
    count: number;
    conversations: Conversation[];
}> => {
    const response = await api.get('/assistant/conversations/');
    return response.data;
};

/**
 * Get a specific conversation with all messages
 */
export const getConversation = async (conversationId: number): Promise<Conversation> => {
    const response = await api.get<Conversation>(`/assistant/conversations/${conversationId}/`);
    return response.data;
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId: number): Promise<void> => {
    await api.delete(`/assistant/conversations/${conversationId}/`);
};
