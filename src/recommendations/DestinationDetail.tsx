import React from 'react';
import { X, MapPin, Share2, Bookmark, Check, Sparkles, ExternalLink } from 'lucide-react';
import type { RecommendedDestination } from '@/types/recommendations';

interface DestinationDetailProps {
    destination: RecommendedDestination;
    isSaved: boolean;
    isSaving: boolean;
    onClose: () => void;
    onSave: () => void;
}

// Generate feature chips based on kinds/category
const getFeatureChips = (destination: RecommendedDestination) => {
    const chips: { icon: string; label: string }[] = [];
    const kinds = destination.kinds?.toLowerCase() || '';
    const category = destination.category;

    if (kinds.includes('water') || kinds.includes('lake') || kinds.includes('river')) {
        chips.push({ icon: '🚣', label: 'Water Activities' });
    }
    if (kinds.includes('natural') || kinds.includes('nature') || category === 'nature') {
        chips.push({ icon: '🌿', label: 'Nature & Scenery' });
    }
    if (kinds.includes('historic') || kinds.includes('cultural') || category === 'culture') {
        chips.push({ icon: '🏛️', label: 'Historic Site' });
    }
    if (kinds.includes('view') || kinds.includes('interesting')) {
        chips.push({ icon: '📷', label: 'Photography Spots' });
    }
    if (kinds.includes('sport') || kinds.includes('adventure') || category === 'adventure') {
        chips.push({ icon: '🏃', label: 'Active Adventures' });
    }
    if (kinds.includes('food') || kinds.includes('restaurant') || category === 'food') {
        chips.push({ icon: '🍽️', label: 'Food & Dining' });
    }
    if (kinds.includes('museum') || kinds.includes('art')) {
        chips.push({ icon: '🎨', label: 'Museums & Art' });
    }
    if (kinds.includes('mountain') || kinds.includes('alpine')) {
        chips.push({ icon: '⛰️', label: 'Mountain Views' });
    }
    
    // Add default chips if none matched
    if (chips.length === 0) {
        chips.push({ icon: '🎯', label: 'Must Visit' });
        chips.push({ icon: '⭐', label: 'Local Favorite' });
    }
    
    return chips.slice(0, 4); // Max 4 chips
};

const categoryFallbackImages: Record<string, string> = {
    nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
    culture: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
    leisure: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
};

const DestinationDetail: React.FC<DestinationDetailProps> = ({
    destination,
    isSaved,
    isSaving,
    onClose,
    onSave,
}) => {
    const matchScore = destination.match_score || Math.floor(Math.random() * 15 + 80); // Default 80-95
    const featureChips = getFeatureChips(destination);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        <span>BACK TO RESULTS</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'text-blue-600 fill-current' : 'text-gray-600'}`} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
                        {/* Left Column */}
                        <div className="p-6">
                            {/* Hero Image */}
                            <div className="relative rounded-2xl overflow-hidden mb-8">
                                <img
                                    src={destination.image || categoryFallbackImages[destination.category] || categoryFallbackImages['culture']}
                                    alt={destination.name}
                                    className="w-full h-72 object-cover"
                                />

                                {/* TOP RATED badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        TOP RATED MATCH
                                    </span>
                                </div>

                                {/* Title overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {destination.name}
                                    </h1>
                                    <div className="flex items-center gap-1 text-white/90">
                                        <MapPin className="w-4 h-4" />
                                        <span>{destination.city}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Overview */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {destination.short_description || 'Discover this amazing destination and create unforgettable memories with your travel buddies.'}
                                </p>
                            </div>

                            {/* Coordinates link */}
                            {destination.lat && destination.lon && (
                                <div className="mb-8">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View on Google Maps
                                    </a>
                                </div>
                            )}

                            {/* What's in Store */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">What's in Store</h2>
                                <div className="flex flex-wrap gap-3">
                                    {featureChips.map((chip, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        >
                                            <span>{chip.icon}</span>
                                            <span>{chip.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Match Panel */}
                        <div className="p-6 lg:border-l border-gray-100">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
                                {/* Target Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Why this matches */}
                                <h3 className="font-bold text-gray-900 text-center mb-2">
                                    Why this matches?
                                </h3>
                                <p className="text-sm text-gray-500 text-center mb-6">
                                    Great for nature/photography and active group adventures.
                                </p>

                                {/* Match Percentage */}
                                <div className="mb-6">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 text-center">
                                        Match Relevance
                                    </div>
                                    <div className="text-center">
                                        <span className="text-5xl font-bold text-gray-900">{matchScore}</span>
                                        <span className="text-2xl font-bold text-gray-400">%</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${matchScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Add to Trip Button */}
                                <button
                                    onClick={onSave}
                                    disabled={isSaved || isSaving}
                                    className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isSaved
                                        ? 'bg-green-500 text-white cursor-default'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                                        } disabled:opacity-70`}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : isSaved ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>ADDED TO ITINERARY</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>ADD TO TRIP ITINERARY</span>
                                            <span>✓</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetail;
