import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '@/api/axios';
import { getUser } from '@/utils/storage';
import { MapPin, Users, ChevronRight, ChevronLeft } from 'lucide-react';

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

const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
    const formatDates = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} — ${endDate.toLocaleDateString('en-US', options)}`;
    };

    return (
        <div
            onClick={onClick}
            className="flex-shrink-0 w-64 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
            {/* Cover Image */}
            <div className="relative h-36 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                {trip.cover_image ? (
                    <img
                        src={trip.cover_image}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white font-bold text-4xl opacity-50">
                            {trip.title.charAt(0)}
                        </span>
                    </div>
                )}
                {/* Status Badge */}
                <span className={cn(
                    "absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold rounded",
                    statusStyles[trip.status]
                )}>
                    {statusLabels[trip.status]}
                </span>
                {/* Edit Button */}
                <button className="absolute top-3 right-3 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate mb-1">{trip.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    <span className="truncate">{trip.destination}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDates(trip.start_date, trip.end_date)}</span>
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{trip.member_count}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface HorizontalScrollSectionProps {
    title: string;
    icon: React.ReactNode;
    trips: TripData[];
    onTripClick: (id: number) => void;
    tripCount: number;
}

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({
    title,
    icon,
    trips,
    onTripClick,
    tripCount,
}) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 280;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

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
            <div className="relative group">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity -ml-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            onClick={() => onTripClick(trip.id)}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-4"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
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

    // Calculate counts for tabs
    const getCounts = () => ({
        all: trips.length,
        upcoming: trips.filter((t) => t.status === 'upcoming').length,
        planned: trips.filter((t) => t.status === 'planned').length,
        completed: trips.filter((t) => t.status === 'completed').length,
    });

    const counts = getCounts();

    const tabs: { key: TabType; label: string }[] = [
        { key: 'all', label: 'All Trips' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'planned', label: 'Planned' },
        { key: 'completed', label: 'Completed' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Your <span className="text-blue-600">Expeditions</span>
                </h1>
                <p className="text-gray-500">
                    Easily navigate through your planned and joined adventures.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-gray-200">
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
                    <HorizontalScrollSection
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
                    <HorizontalScrollSection
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
