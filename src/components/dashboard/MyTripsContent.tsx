import React from 'react';
import { cn } from '@/lib/utils';

interface TripCardProps {
    title: string;
    location: string;
    dates: string;
    image: string;
    status: 'upcoming' | 'planned' | 'completed';
    buddyCount: number;
}

const statusStyles = {
    upcoming: 'bg-blue-500 text-white',
    planned: 'bg-purple-500 text-white',
    completed: 'bg-green-500 text-white',
};

const statusLabels = {
    upcoming: 'UPCOMING',
    planned: 'PLANNED',
    completed: 'COMPLETED',
};

const TripCard: React.FC<TripCardProps> = ({
    title,
    location,
    dates,
    image,
    status,
    buddyCount,
}) => {
    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "inline-block px-2 py-0.5 text-[10px] font-semibold rounded mb-1",
                    statusStyles[status]
                )}>
                    {statusLabels[status]}
                </span>
                <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                <p className="text-sm text-gray-500">{location} • {dates}</p>
                <div className="flex items-center gap-1 mt-2">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(buddyCount, 3))].map((_, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"
                            />
                        ))}
                    </div>
                    {buddyCount > 3 && (
                        <span className="text-xs text-blue-600 font-medium ml-1">+{buddyCount - 3}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Mock trips data
const mockTrips: TripCardProps[] = [
    {
        title: 'Rocky Mountain Hike',
        location: 'Banff, Canada',
        dates: 'Aug 12 - Aug 18',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop',
        status: 'upcoming',
        buddyCount: 4,
    },
    {
        title: 'Neon Tokyo Lights',
        location: 'Tokyo, Japan',
        dates: 'Nov 04 - Nov 12',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=200&fit=crop',
        status: 'planned',
        buddyCount: 3,
    },
    {
        title: 'Bali Beach Retreat',
        location: 'Bali, Indonesia',
        dates: 'Dec 20 - Dec 28',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=200&fit=crop',
        status: 'planned',
        buddyCount: 5,
    },
    {
        title: 'Swiss Alps Expedition',
        location: 'Zermatt, Switzerland',
        dates: 'Jan 15 - Jan 22',
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=200&fit=crop',
        status: 'upcoming',
        buddyCount: 2,
    },
];

const MyTripsContent: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My <span className="text-blue-600">Adventures</span>
                </h1>
                <p className="text-gray-600">
                    Manage your itineraries and connected buddies for upcoming trips.
                </p>
            </div>

            {/* Trips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockTrips.map((trip, index) => (
                    <TripCard key={index} {...trip} />
                ))}
            </div>
        </div>
    );
};

export default MyTripsContent;
