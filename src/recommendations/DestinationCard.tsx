import React, { useState } from 'react';
import { Bookmark, MapPin, Mountain, Compass, Landmark, UtensilsCrossed, Palmtree } from 'lucide-react';
import type { RecommendedDestination } from '@/types/recommendations';

interface DestinationCardProps {
    destination: RecommendedDestination;
    isSaved: boolean;
    onSave: (destination: RecommendedDestination) => void;
    onClick: () => void;
}

const categoryColors: Record<string, string> = {
    nature: 'bg-green-500',
    adventure: 'bg-orange-500',
    culture: 'bg-purple-500',
    food: 'bg-red-500',
    leisure: 'bg-blue-500',
};

const categoryLabels: Record<string, string> = {
    nature: 'NATURE',
    adventure: 'ADVENTURE',
    culture: 'CULTURE',
    food: 'GASTRONOMY',
    leisure: 'LEISURE',
};

const categoryGradients: Record<string, string> = {
    nature: 'from-emerald-400 to-green-600',
    adventure: 'from-orange-400 to-amber-600',
    culture: 'from-violet-400 to-purple-600',
    food: 'from-rose-400 to-red-600',
    leisure: 'from-sky-400 to-blue-600',
};

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
    const cls = 'w-10 h-10 text-white/60';
    switch (category) {
        case 'nature': return <Mountain className={cls} />;
        case 'adventure': return <Compass className={cls} />;
        case 'culture': return <Landmark className={cls} />;
        case 'food': return <UtensilsCrossed className={cls} />;
        case 'leisure': return <Palmtree className={cls} />;
        default: return <Landmark className={cls} />;
    }
};

const DestinationCard: React.FC<DestinationCardProps> = ({
    destination,
    isSaved,
    onSave,
    onClick,
}) => {
    const [imgError, setImgError] = useState(false);
    const hasImage = !!destination.image && !imgError;

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSaved) {
            onSave(destination);
        }
    };

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative h-52 overflow-hidden">
                {hasImage ? (
                    <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[destination.category] || categoryGradients['culture']} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                        <CategoryIcon category={destination.category} />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-md ${categoryColors[destination.category]}`}>
                        {categoryLabels[destination.category]}
                    </span>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSaveClick}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isSaved
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-blue-600'
                        }`}
                >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                {/* City overlay */}
                <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] text-white/70 bg-black/30 px-2 py-1 rounded">
                        {destination.city}
                    </span>
                </div>

                {/* Match score badge */}
                {destination.match_score && (
                    <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] text-white bg-blue-600/90 px-2 py-1 rounded flex items-center gap-1">
                            <span>🎯</span>
                            <span>{destination.match_score}% match</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                    {destination.name}
                </h3>

                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{destination.city}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {destination.short_description || 'Discover this amazing destination and add it to your trip itinerary.'}
                </p>
            </div>
        </div>
    );
};

export default DestinationCard;
