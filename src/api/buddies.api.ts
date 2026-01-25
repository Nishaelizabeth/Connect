import api from './axios';

export interface BuddyMatch {
    matched_user_id: number;
    matched_user_name: string;
    matched_user_email: string;
    shared_interests: string[];
    match_score: number;
    request_status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted' | 'rejected';
    request_id: number | null;
}

export interface BuddyMatchResponse {
    count: number;
    results: BuddyMatch[];
}

export interface BuddyRequest {
    id: number;
    sender_id: number;
    sender_name: string;
    receiver_id: number;
    receiver_name: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export interface BuddyRequestResponse {
    count: number;
    results: BuddyRequest[];
}

export const getBuddyMatches = async (limit: number = 10, minScore: number = 0): Promise<BuddyMatchResponse> => {
    const response = await api.get<BuddyMatchResponse>('/buddies/matches/', {
        params: { limit, min_score: minScore }
    });
    return response.data;
};

export const getBuddyRequests = async (): Promise<BuddyRequestResponse> => {
    const response = await api.get<BuddyRequestResponse>('/buddies/requests/');
    return response.data;
};

export const sendBuddyRequest = async (receiverId: number): Promise<BuddyRequest> => {
    const response = await api.post<BuddyRequest>('/buddies/requests/', {
        receiver_id: receiverId
    });
    return response.data;
};

export const cancelBuddyRequest = async (requestId: number): Promise<void> => {
    await api.delete(`/buddies/requests/${requestId}/cancel/`);
};

export const acceptBuddyRequest = async (requestId: number): Promise<BuddyRequest> => {
    const response = await api.post<BuddyRequest>(`/buddies/requests/${requestId}/accept/`);
    return response.data;
};

export const rejectBuddyRequest = async (requestId: number): Promise<BuddyRequest> => {
    const response = await api.post<BuddyRequest>(`/buddies/requests/${requestId}/reject/`);
    return response.data;
};
