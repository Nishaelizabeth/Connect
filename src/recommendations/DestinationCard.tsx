import React from 'react';
import { Bookmark, MapPin } from 'lucide-react';
import type { Destination } from '@/types/recommendations';

interface DestinationCardProps {
    destination: Destination;
    isSaved: boolean;
    onSave: (id: number) => void;
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

const DestinationCard: React.FC<DestinationCardProps> = ({
    destination,
    isSaved,
    onSave,
    onClick,
}) => {
    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSaved) {
            onSave(destination.id);
        }
    };

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

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

                {/* Optional credit text */}
                <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] text-white/70 bg-black/30 px-2 py-1 rounded">
                        {destination.city}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                    {destination.name}
                </h3>

                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{destination.city}, {destination.country}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {destination.description}
                </p>
            </div>
        </div>
    );
};

export default DestinationCard;
