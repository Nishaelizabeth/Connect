import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '@/api/axios';

interface TripData {
    id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    status: 'upcoming' | 'planned' | 'completed';
    creator: {
        id: number;
        full_name: string;
    };
    member_count: number;
}

interface TripCardProps {
    trip: TripData;
    onClick: () => void;
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

const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
    const formatDates = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
        >
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                    {trip.title.charAt(0)}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "inline-block px-2 py-0.5 text-[10px] font-semibold rounded mb-1",
                    statusStyles[trip.status]
                )}>
                    {statusLabels[trip.status]}
                </span>
                <h3 className="font-semibold text-gray-900 truncate">{trip.title}</h3>
                <p className="text-sm text-gray-500">{trip.destination} • {formatDates(trip.start_date, trip.end_date)}</p>
                <div className="flex items-center gap-1 mt-2">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(trip.member_count || 1, 3))].map((_, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"
                            />
                        ))}
                    </div>
                    {(trip.member_count || 0) > 3 && (
                        <span className="text-xs text-blue-600 font-medium ml-1">+{(trip.member_count || 0) - 3}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyTripsContent: React.FC = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<TripData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrips = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/trips/');
                setTrips(response.data || []);
            } catch (err: any) {
                console.error('Failed to fetch trips:', err);
                setError('Failed to load trips. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const handleTripClick = (tripId: number) => {
        navigate(`/trips/${tripId}`);
    };

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

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 rounded-2xl p-8 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                    <p className="text-gray-500 mb-4">No trips yet. Create your first adventure!</p>
                    <button
                        onClick={() => navigate('/trips/create')}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Trip
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            onClick={() => handleTripClick(trip.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTripsContent;

