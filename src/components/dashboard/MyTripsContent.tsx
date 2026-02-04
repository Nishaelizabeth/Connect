import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '@/api/axios';
import { getUser } from '@/utils/storage';
import { MapPin, Users, Calendar, ChevronRight } from 'lucide-react';

interface TripData {
    id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    status: 'upcoming' | 'planned' | 'completed';
    creator_id: number;
    member_count: number;
    cover_image?: string;
}

type TabType = 'all' | 'upcoming' | 'planned' | 'completed';

const statusStyles: Record<string, string> = {
    upcoming: 'bg-blue-500 text-white',
    planned: 'bg-purple-500 text-white',
    completed: 'bg-emerald-600 text-white',
};

const statusLabels: Record<string, string> = {
    upcoming: 'UPCOMING',
    planned: 'PLANNED',
    completed: 'COMPLETED',
};

interface TripCardProps {
    trip: TripData;
    onClick: () => void;
}

const TripRow: React.FC<TripCardProps> = ({ trip, onClick }) => {
    const formatDates = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} — ${endDate.toLocaleDateString('en-US', options)}`;
    };

    const getDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    };

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
            {/* Cover Image/Initial */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-blue-400 to-purple-500">
                {trip.cover_image ? (
                    <img
                        src={trip.cover_image}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                            {trip.title.charAt(0)}
                        </span>
                    </div>
                )}
                {/* Status Badge */}
                <span className={cn(
                    "absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase",
                    statusStyles[trip.status]
                )}>
                    {statusLabels[trip.status]}
                </span>
            </div>

            {/* Trip Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                    {trip.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDates(trip.start_date, trip.end_date)}</span>
                    </div>
                </div>
            </div>

            {/* Duration & Members */}
            <div className="flex items-center gap-6 shrink-0">
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Duration</div>
                    <div className="text-sm font-semibold text-gray-700">{getDuration(trip.start_date, trip.end_date)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Members</div>
                    <div className="flex items-center gap-1 justify-center">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{trip.member_count}</span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
        </div>
    );
};

interface ListSectionProps {
    title: string;
    icon: React.ReactNode;
    trips: TripData[];
    onTripClick: (id: number) => void;
    tripCount: number;
}

const ListSection: React.FC<ListSectionProps> = ({
    title,
    icon,
    trips,
    onTripClick,
    tripCount,
}) => {
    if (trips.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
                </div>
                <span className="text-sm text-gray-400">{tripCount} trips</span>
            </div>
            <div className="space-y-3">
                {trips.map((trip) => (
                    <TripRow
                        key={trip.id}
                        trip={trip}
                        onClick={() => onTripClick(trip.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const MyTripsContent: React.FC = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<TripData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const currentUser = getUser();

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

    // Filter trips by status
    const filterByStatus = (tripsToFilter: TripData[]) => {
        if (activeTab === 'all') return tripsToFilter;
        return tripsToFilter.filter((trip) => trip.status === activeTab);
    };

    // Separate created and joined trips
    const createdTrips = filterByStatus(
        trips.filter((trip) => trip.creator_id === currentUser?.id)
    );
    const joinedTrips = filterByStatus(
        trips.filter((trip) => trip.creator_id !== currentUser?.id)
    );

    // Tab counts
    const counts = {
        all: trips.length,
        upcoming: trips.filter((trip) => trip.status === 'upcoming').length,
        planned: trips.filter((trip) => trip.status === 'planned').length,
        completed: trips.filter((trip) => trip.status === 'completed').length,
    };

    const tabs = [
        { key: 'all' as TabType, label: 'All Trips' },
        { key: 'upcoming' as TabType, label: 'Upcoming' },
        { key: 'planned' as TabType, label: 'Planned' },
        { key: 'completed' as TabType, label: 'Completed' },
    ];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Trips</h1>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "pb-3 text-sm font-medium transition-colors relative",
                            activeTab === tab.key
                                ? "text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab.label}{' '}
                        <span className={cn(
                            "ml-1",
                            activeTab === tab.key ? "text-blue-600" : "text-gray-400"
                        )}>
                            {counts[tab.key]}
                        </span>
                        {activeTab === tab.key && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-8">
                    <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                </div>
            ) : error ? (
                <div className="bg-red-50 rounded-xl p-8 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center">
                    <p className="text-gray-500 mb-4">No trips yet. Create your first adventure!</p>
                    <button
                        onClick={() => navigate('/trips/create')}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Trip
                    </button>
                </div>
            ) : (
                <>
                    {/* Created by You Section */}
                    <ListSection
                        title="Created by You"
                        icon={
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                            </div>
                        }
                        trips={createdTrips}
                        onTripClick={handleTripClick}
                        tripCount={createdTrips.length}
                    />

                    {/* Joined Journeys Section */}
                    <ListSection
                        title="Joined Journeys"
                        icon={
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Users className="w-3 h-3 text-emerald-600" />
                            </div>
                        }
                        trips={joinedTrips}
                        onTripClick={handleTripClick}
                        tripCount={joinedTrips.length}
                    />

                    {/* Show message if no trips match current filter */}
                    {createdTrips.length === 0 && joinedTrips.length === 0 && (
                        <div className="bg-gray-50 rounded-xl p-8 text-center">
                            <p className="text-gray-500">No {activeTab === 'all' ? '' : activeTab} trips found.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyTripsContent;
