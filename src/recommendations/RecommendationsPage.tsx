import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Search, Users } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import DestinationCard from './DestinationCard';
import DestinationDetail from './DestinationDetail';
import type { RecommendedDestination, CategoryFilter, SavedDestination, GroupAnalysis } from '@/types/recommendations';
import { getRecommendations, saveDestination, getSavedDestinations, getGroupAnalysis } from '@/api/recommendations';
import { getTripById } from '@/api/trips.api';

const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All Places' },
    { key: 'nature', label: 'Nature' },
    { key: 'adventure', label: 'Adventure' },
    { key: 'culture', label: 'Culture' },
    { key: 'food', label: 'Gastronomy' },
];

const RecommendationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();

    const [destinations, setDestinations] = useState<RecommendedDestination[]>([]);
    const [savedDestinations, setSavedDestinations] = useState<Set<string>>(new Set()); // Track by xid
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
    const [searchText, setSearchText] = useState('');
    const [selectedDestination, setSelectedDestination] = useState<RecommendedDestination | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tripData, setTripData] = useState<{ name: string; destination: string } | null>(null);
    const [groupAnalysis, setGroupAnalysis] = useState<GroupAnalysis | null>(null);

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

    // Fetch recommendations
    useEffect(() => {
        const fetchData = async () => {
            if (!tripId) return;

            setLoading(true);
            setError(null);
            try {
                const [recommendations, saved] = await Promise.all([
                    getRecommendations(parseInt(tripId), selectedCategory === 'all' ? undefined : selectedCategory),
                    getSavedDestinations(parseInt(tripId)),
                ]);

                setDestinations(recommendations);
                // Track saved destinations by xid
                setSavedDestinations(new Set(saved.map((s: SavedDestination) => s.destination.xid || String(s.destination.id))));
            } catch (err: any) {
                console.error('Failed to fetch recommendations:', err);
                setError(err.response?.data?.detail || 'Failed to load recommendations. Please try again.');
                setDestinations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripId, selectedCategory]);

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

                {/* Filters Row */}
                <div className="flex items-center justify-between mb-8">
                    {/* Category Pills */}
                    <div className="flex items-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.key
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
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
                {loading ? (
                    // Loading Skeleton
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
                    // Error State
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredDestinations.length === 0 ? (
                    // Empty State
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No destinations found
                        </h3>
                        <p className="text-gray-500">
                            {searchText
                                ? 'Try adjusting your search terms'
                                : 'No recommendations available for this category'}
                        </p>
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
