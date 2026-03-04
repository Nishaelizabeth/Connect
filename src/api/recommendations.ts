import api from './axios';
import type { 
    RecommendedDestination, 
    SavedDestination, 
    GroupAnalysis 
} from '@/types/recommendations';

export interface RecommendationsResponse {
    status: 'loading' | 'ready' | 'error';
    recommendations?: RecommendedDestination[];
    message?: string;
    cached_at?: string;
    expires_at?: string;
}

export const getRecommendations = async (
    tripId: number,
    limit?: number
): Promise<RecommendationsResponse> => {
    const params: Record<string, string | number> = {};
    if (limit) {
        params.limit = limit;
    }
    
    try {
        const response = await api.get(`/trips/${tripId}/recommendations/`, { params });
        
        // Handle new response format
        if (response.data.status === 'loading') {
            return {
                status: 'loading',
                message: response.data.message || 'Generating recommendations...',
            };
        }
        
        if (response.data.status === 'ready') {
            return {
                status: 'ready',
                recommendations: response.data.recommendations || response.data,
                cached_at: response.data.cached_at,
                expires_at: response.data.expires_at,
            };
        }
        
        // Backward compatibility - if no status field, assume ready
        if (Array.isArray(response.data)) {
            return {
                status: 'ready',
                recommendations: response.data,
            };
        }
        
        return {
            status: 'error',
            message: 'Unexpected response format',
        };
    } catch (error: any) {
        if (error.response?.status === 202) {
            // 202 Accepted = loading
            return {
                status: 'loading',
                message: error.response.data?.message || 'Generating recommendations...',
            };
        }
        throw error;
    }
};

export const getGroupAnalysis = async (
    tripId: number
): Promise<GroupAnalysis> => {
    const response = await api.get(`/trips/${tripId}/group-analysis/`);
    return response.data;
};

// Save a destination from OpenTripMap recommendations
export const saveDestination = async (
    tripId: number,
    destination: RecommendedDestination
): Promise<SavedDestination> => {
    const response = await api.post(`/trips/${tripId}/save-destination/`, {
        xid: destination.xid,
        name: destination.name,
        city: destination.city,
        category: destination.category,
        short_description: destination.short_description,
        image: destination.image,
        lat: destination.lat,
        lon: destination.lon,
        kinds: destination.kinds,
    });
    return response.data;
};

// Save a destination by ID (for already-saved destinations)
export const saveDestinationById = async (
    tripId: number,
    destinationId: number
): Promise<SavedDestination> => {
    const response = await api.post(`/trips/${tripId}/save-destination/`, {
        destination_id: destinationId,
    });
    return response.data;
};

export const getSavedDestinations = async (
    tripId: number
): Promise<SavedDestination[]> => {
    const response = await api.get(`/trips/${tripId}/saved-destinations/`);
    return response.data;
};

export const removeDestination = async (
    tripId: number,
    savedDestinationId: number
): Promise<void> => {
    await api.delete(`/trips/${tripId}/saved-destinations/${savedDestinationId}/`);
};
