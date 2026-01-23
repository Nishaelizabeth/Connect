import api from './axios';

export interface BuddyMatch {
    matched_user_id: number;
    matched_user_name: string;
    matched_user_email: string;
    shared_interests: string[];
    match_score: number;
}

export interface BuddyMatchResponse {
    count: number;
    results: BuddyMatch[];
}

export const getBuddyMatches = async (limit: number = 10, minScore: number = 0): Promise<BuddyMatchResponse> => {
    const response = await api.get<BuddyMatchResponse>('/buddies/matches/', {
        params: { limit, min_score: minScore }
    });
    return response.data;
};
