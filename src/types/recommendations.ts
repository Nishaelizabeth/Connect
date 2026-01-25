export interface Destination {
    id: number;
    name: string;
    city: string;
    country: string;
    category: 'nature' | 'culture' | 'adventure' | 'food' | 'leisure';
    description: string;
    image_url: string | null;
}

export interface SavedDestination {
    destination: Destination;
    saved_by: string;
    saved_at: string;
}

export type CategoryFilter = 'all' | 'nature' | 'adventure' | 'culture' | 'food' | 'leisure';
