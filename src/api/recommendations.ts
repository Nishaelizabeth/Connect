import api from './axios';
import type { Destination, SavedDestination } from '@/types/recommendations';

export const getRecommendations = async (
    tripId: number,
    category?: string
): Promise<Destination[]> => {
    const params = category && category !== 'all' ? { category } : {};
    const response = await api.get(`/trips/${tripId}/recommendations/`, { params });
    return response.data;
};

export const saveDestination = async (
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
