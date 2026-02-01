// Destination from database (has id)
export interface Destination {
    id: number;
    xid?: string;  // OpenTripMap identifier
    name: string;
    city: string;
    country: string;
    category: 'nature' | 'culture' | 'adventure' | 'food' | 'leisure';
    description: string;
    image_url: string | null;
    lat?: number;
    lon?: number;
    kinds?: string;
}

// Recommended destination from OpenTripMap API (may not have id yet)
export interface RecommendedDestination {
    xid: string;  // OpenTripMap identifier
    name: string;
    city: string;
    category: 'nature' | 'culture' | 'adventure' | 'food' | 'leisure';
    short_description: string;
    image: string | null;
    lat: number;
    lon: number;
    kinds: string;
    match_score?: number;  // How well it matches group interests
}

export interface SavedDestination {
    id: number;
    destination: Destination;
    saved_by: string;
    saved_at: string;
    order?: number;
    notes?: string;
}

export interface GroupAnalysis {
    member_count: number;
    dominant_interests: string[];
    budget_distribution: Record<string, number>;
    dominant_budget: string | null;
    style_distribution: Record<string, number>;
    dominant_style: string | null;
}

export type CategoryFilter = 'all' | 'nature' | 'adventure' | 'culture' | 'food' | 'leisure';
