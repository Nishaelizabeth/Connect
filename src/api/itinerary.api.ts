import api from './axios';

// Types
export interface ItineraryDestination {
    id: number;
    name: string;
    city: string;
    country: string;
    category: string;
    image_url: string | null;
    lat: number | null;
    lon: number | null;
}

export interface ItineraryItem {
    id: number;
    destination: ItineraryDestination;
    added_by_id: number;
    added_by_name: string;
    notes: string;
    position: number | null;
    saved_at: string;
}

export interface ItineraryResponse {
    count: number;
    items: ItineraryItem[];
}

export interface ReorderItem {
    id: number;
    position: number;
}

// API Functions

/**
 * Get all itinerary items for a trip
 */
export const getItinerary = async (tripId: number): Promise<ItineraryResponse> => {
    const response = await api.get<ItineraryResponse>(`/trips/${tripId}/itinerary/`);
    return response.data;
};

/**
 * Add a destination to the trip itinerary
 */
export const addToItinerary = async (
    tripId: number,
    destinationId: number,
    notes?: string
): Promise<ItineraryItem> => {
    const response = await api.post<ItineraryItem>(`/trips/${tripId}/itinerary/`, {
        destination_id: destinationId,
        notes: notes || '',
    });
    return response.data;
};

/**
 * Remove an item from the itinerary
 */
export const removeFromItinerary = async (
    tripId: number,
    itemId: number
): Promise<void> => {
    await api.delete(`/trips/${tripId}/itinerary/${itemId}/`);
};

/**
 * Update notes for an itinerary item
 */
export const updateItineraryNotes = async (
    tripId: number,
    itemId: number,
    notes: string
): Promise<ItineraryItem> => {
    const response = await api.patch<ItineraryItem>(`/trips/${tripId}/itinerary/${itemId}/`, {
        notes,
    });
    return response.data;
};

/**
 * Reorder itinerary items
 */
export const reorderItinerary = async (
    tripId: number,
    items: ReorderItem[]
): Promise<ItineraryResponse> => {
    const response = await api.patch<ItineraryResponse>(`/trips/${tripId}/itinerary/reorder/`, {
        items,
    });
    return response.data;
};
