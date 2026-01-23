import React from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface DestinationCardProps {
    name: string;
    location: string;
    description: string;
    image: string;
    tag: string;
    tagColor?: 'red' | 'purple' | 'blue';
    credit?: string;
    onExplore?: () => void;
}

const tagStyles = {
    red: 'bg-red-500/80 text-white',
    purple: 'bg-purple-500/80 text-white',
    blue: 'bg-blue-500/80 text-white',
};

const DestinationCard: React.FC<DestinationCardProps> = ({
    name,
    location,
    description,
    image,
    tag,
    tagColor = 'red',
    credit,
    onExplore
}) => {
    return (
        <div className="relative rounded-2xl overflow-hidden group h-72">
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Like Button */}
            <button className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <Heart className="w-4 h-4 text-white" />
            </button>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className={cn(
                    "inline-block px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded mb-2",
                    tagStyles[tagColor]
                )}>
                    {tag}
                </span>

                <h3 className="text-xl font-bold text-white mb-1">{name}, {location}</h3>
                <p className="text-sm text-white/80 mb-4 line-clamp-2">{description}</p>

                <button
                    onClick={onExplore}
                    className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Explore Spot
                </button>

                {credit && (
                    <p className="absolute bottom-2 right-4 text-[10px] text-white/60">
                        {credit}
                    </p>
                )}
            </div>
        </div>
    );
};

export default DestinationCard;
