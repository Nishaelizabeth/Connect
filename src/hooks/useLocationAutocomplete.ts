import { useState, useEffect, useCallback, useRef } from 'react';

interface NominatimAddress {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
}

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    address: NominatimAddress;
    name?: string;
}

export interface LocationData {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    displayName: string;
}

export const useLocationAutocomplete = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const abortController = useRef<AbortController | null>(null);

    const searchLocations = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        if (abortController.current) {
            abortController.current.abort();
        }

        abortController.current = new AbortController();
        setLoading(true);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                format: 'json',
                addressdetails: '1',
                limit: '5',
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params}`,
                {
                    signal: abortController.current.signal,
                    headers: {
                        'User-Agent': 'travel-buddy-app',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }

            const data: NominatimResult[] = await response.json();
            setResults(data);
            setShowDropdown(data.length > 0);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Location search error:', err);
                setResults([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchLocations(query);
        }, 400);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query, searchLocations]);

    const selectLocation = (result: NominatimResult): LocationData => {
        const city = result.address.city || result.address.town || result.address.village || result.name || '';
        const region = result.address.state || '';
        const country = result.address.country || '';
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        setQuery(result.display_name);
        setShowDropdown(false);
        setResults([]);

        return {
            city,
            region,
            country,
            latitude,
            longitude,
            displayName: result.display_name,
        };
    };

    const clearSelection = () => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
    };

    return {
        query,
        setQuery,
        results,
        loading,
        showDropdown,
        setShowDropdown,
        selectLocation,
        clearSelection,
    };
};
