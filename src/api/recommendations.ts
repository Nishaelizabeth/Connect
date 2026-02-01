import api from './axios';
import type { 
    RecommendedDestination, 
    SavedDestination, 
    GroupAnalysis 
} from '@/types/recommendations';

export const getRecommendations = async (
    tripId: number,
    category?: string,
    limit?: number
): Promise<RecommendedDestination[]> => {
    const params: Record<string, string | number> = {};
    if (category && category !== 'all') {
        params.category = category;
    }
    if (limit) {
        params.limit = limit;
    }
    const response = await api.get(`/trips/${tripId}/recommendations/`, { params });
    return response.data;
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
