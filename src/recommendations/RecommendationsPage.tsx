import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Search, Users } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import DestinationCard from './DestinationCard';
import DestinationDetail from './DestinationDetail';
import { LoadingState } from './SkeletonLoader';
import type { RecommendedDestination, SavedDestination, GroupAnalysis } from '@/types/recommendations';
import { getRecommendations, saveDestination, getSavedDestinations, getGroupAnalysis, type RecommendationsResponse } from '@/api/recommendations';
import { getTripById } from '@/api/trips.api';



const POLLING_INTERVAL = 2000; // Poll every 2 seconds
const MAX_POLLING_TIME = 60000; // Stop polling after 60 seconds

const RecommendationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();

    const [destinations, setDestinations] = useState<RecommendedDestination[]>([]);
    const [savedDestinations, setSavedDestinations] = useState<Set<string>>(new Set()); // Track by xid

    const [searchText, setSearchText] = useState('');
    const [selectedDestination, setSelectedDestination] = useState<RecommendedDestination | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false); // Background generation in progress
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tripData, setTripData] = useState<{ name: string; destination: string } | null>(null);
    const [groupAnalysis, setGroupAnalysis] = useState<GroupAnalysis | null>(null);

    const pollingIntervalRef = useRef<number | null>(null);
    const pollingStartTimeRef = useRef<number>(0);

    // Fetch trip data and group analysis on mount
    useEffect(() => {
        const fetchTripData = async () => {
            if (!tripId) return;
            try {
                const [trip, analysis] = await Promise.all([
                    getTripById(parseInt(tripId)),
                    getGroupAnalysis(parseInt(tripId)).catch(() => null),
                ]);
                setTripData({
                    name: trip.title,
                    destination: trip.destination,
                });
                setGroupAnalysis(analysis);
            } catch (err) {
                console.error('Failed to fetch trip data:', err);
            }
        };
        fetchTripData();
    }, [tripId]);

    // Clear polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Start polling for recommendations
    const startPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingStartTimeRef.current = Date.now();
        setIsGenerating(true);

        pollingIntervalRef.current = setInterval(async () => {
            // Stop polling after max time - show empty state instead of error
            if (Date.now() - pollingStartTimeRef.current > MAX_POLLING_TIME) {
                stopPolling();
                // Don't set error, just show empty state with refresh option
                setDestinations([]);
                setLoading(false);
                return;
            }

            await fetchRecommendations();
        }, POLLING_INTERVAL);
    };

    // Stop polling
    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsGenerating(false);
    };

    // Fetch recommendations (used both directly and during polling)
    const fetchRecommendations = async () => {
        if (!tripId) return;

        try {
            const response: RecommendationsResponse = await getRecommendations(
                parseInt(tripId)
            );

            if (response.status === 'loading') {
                // Still generating - continue polling
                if (!pollingIntervalRef.current && !isGenerating) {
                    // Start polling if not already started
                    startPolling();
                }
                setLoading(false); // Remove initial loading state
            } else if (response.status === 'ready') {
                // Recommendations ready (may be empty - that's OK)
                stopPolling();
                setDestinations(response.recommendations || []);
                setLoading(false);
                setError(null); // Clear any previous errors
            } else if (response.status === 'error') {
                // Only set error for actual failures, not empty data
                stopPolling();
                // Treat as empty data instead of error
                setDestinations([]);
                setLoading(false);
                setError(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch recommendations:', err);
            stopPolling();
            // Only show error for HTTP 500+ errors
            if (err.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                // For other errors, just show empty state
                setError(null);
            }
            setDestinations([]);
            setLoading(false);
        }
    };

    // Fetch recommendations on mount
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchRecommendations();

        // Cleanup polling on unmount
        return () => {
            stopPolling();
        };
    }, [tripId]);

    // Fetch saved destinations
    useEffect(() => {
        const fetchSaved = async () => {
            if (!tripId) return;
            try {
                const saved = await getSavedDestinations(parseInt(tripId));
                setSavedDestinations(new Set(saved.map((s: SavedDestination) => s.destination.xid || String(s.destination.id))));
            } catch (err) {
                console.error('Failed to fetch saved destinations:', err);
            }
        };
        fetchSaved();
    }, [tripId]);

    // Filter destinations by search text
    const filteredDestinations = useMemo(() => {
        if (!searchText.trim()) return destinations;

        const search = searchText.toLowerCase();
        return destinations.filter(
            (d) =>
                d.name.toLowerCase().includes(search) ||
                d.city.toLowerCase().includes(search) ||
                (d.short_description && d.short_description.toLowerCase().includes(search))
        );
    }, [destinations, searchText]);

    // Handle save destination
    const handleSaveDestination = async (destination: RecommendedDestination) => {
        if (!tripId || savedDestinations.has(destination.xid)) return;

        setSaving(true);
        try {
            await saveDestination(parseInt(tripId), destination);
            setSavedDestinations((prev) => new Set([...prev, destination.xid]));
            setSaveSuccess(`${destination.name} added to your itinerary!`);
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (error: any) {
            if (error.response?.status === 400) {
                // Already saved
                setSavedDestinations((prev) => new Set([...prev, destination.xid]));
            }
            console.error('Failed to save destination:', error);
        } finally {
            setSaving(false);
        }
    };

    // Handle modal save
    const handleModalSave = async () => {
        if (!selectedDestination) return;
        await handleSaveDestination(selectedDestination);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="my-trips" />

            <main className="pt-20 ml-56 p-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(`/trips/${tripId}`)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Exploring for:</span>
                        <p className="text-sm font-medium text-gray-700">{tripData?.name || 'Loading...'}</p>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider rounded-md mb-3">
                        Smart Discovery
                    </span>
                    <h1 className="text-4xl font-bold text-gray-900 mb-1">
                        Discover
                    </h1>
                    <h1 className="text-4xl font-bold text-blue-600 mb-3">
                        Hidden Gems
                    </h1>
                    <p className="text-gray-500">
                        Personalized recommendations for your group based in {tripData?.destination || 'your destination'}.
                    </p>
                    
                    {/* Group Analysis Summary */}
                    {groupAnalysis && groupAnalysis.dominant_interests && groupAnalysis.dominant_interests.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                    Based on {groupAnalysis.member_count} group member{groupAnalysis.member_count !== 1 ? 's' : ''}'s interests
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {groupAnalysis.dominant_interests.slice(0, 5).map((interest, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-white text-blue-700 text-xs rounded-md border border-blue-200"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {/* Content */}
                {isGenerating ? (
                    // Background generation in progress - show skeleton with loading message
                    <LoadingState />
                ) : loading ? (
                    // Initial loading skeleton
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-52 bg-gray-200" />
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    // Error State - Only shown for HTTP 500 errors
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Server Error
                        </h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                fetchRecommendations();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredDestinations.length === 0 ? (
                    // Empty State - Friendly message, not an error
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No recommendations found yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchText
                                ? 'Try adjusting your search terms'
                                : 'We couldn\'t find destinations for this trip yet. Try a different category or check back later.'}
                        </p>
                        {!searchText && (
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    fetchRecommendations();
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Refresh
                            </button>
                        )}
                    </div>
                ) : (
                    // Destination Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDestinations.map((destination) => (
                            <DestinationCard
                                key={destination.xid}
                                destination={destination}
                                isSaved={savedDestinations.has(destination.xid)}
                                onSave={handleSaveDestination}
                                onClick={() => setSelectedDestination(destination)}
                            />
                        ))}
                    </div>
                )}

                {/* Success Toast */}
                {saveSuccess && (
                    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">{saveSuccess}</span>
                    </div>
                )}
            </main>

            {/* Destination Detail Modal */}
            {selectedDestination && (
                <DestinationDetail
                    destination={selectedDestination}
                    isSaved={savedDestinations.has(selectedDestination.xid)}
                    isSaving={saving}
                    onClose={() => setSelectedDestination(null)}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
};

export default RecommendationsPage;
