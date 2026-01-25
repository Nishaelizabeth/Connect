import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, MapPin, MessageSquare, Compass, Calendar, Sun, AlertTriangle } from 'lucide-react';

// Types
interface TripMember {
    id: number;
    user_id: number;
    full_name: string;
    avatar_url?: string;
    role: 'creator' | 'member';
    status: 'accepted' | 'invited';
}

interface TripDetails {
    id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    image_url: string;
    status: 'confirmed' | 'planned' | 'completed';
    creator_id: number;
}

// Mock Data
const mockTrip: TripDetails = {
    id: 1,
    title: 'Swiss Alps Summit Hike',
    destination: 'Interlaken, Switzerland',
    start_date: '2024-09-12',
    end_date: '2024-09-20',
    image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=300&fit=crop',
    status: 'confirmed',
    creator_id: 1,
};

const mockMembers: TripMember[] = [
    { id: 1, user_id: 1, full_name: 'Maya Chen', avatar_url: '', role: 'creator', status: 'accepted' },
    { id: 2, user_id: 2, full_name: 'Alex Rivers', avatar_url: '', role: 'member', status: 'accepted' },
    { id: 3, user_id: 3, full_name: 'Jordan Smith', avatar_url: '', role: 'member', status: 'accepted' },
    { id: 4, user_id: 4, full_name: 'Elena Rod', avatar_url: '', role: 'member', status: 'invited' },
];

// Current user mock (you = Alex Rivers)
const currentUserId = 2;

const TripDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [trip, setTrip] = useState<TripDetails | null>(null);
    const [members, setMembers] = useState<TripMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leavingTrip, setLeavingTrip] = useState(false);

    useEffect(() => {
        // Simulate API fetch with mock data
        const fetchTripData = async () => {
            setLoading(true);
            try {
                // Mock API delay
                await new Promise(resolve => setTimeout(resolve, 300));
                setTrip(mockTrip);
                setMembers(mockMembers);
            } catch (err) {
                console.error('Failed to fetch trip details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTripData();
    }, [id]);

    const acceptedMembers = members.filter(m => m.status === 'accepted');
    const pendingMembers = members.filter(m => m.status === 'invited');
    const isCreator = trip?.creator_id === currentUserId;

    // Calculate days until trip
    const getDaysUntil = (dateStr: string) => {
        const tripDate = new Date(dateStr);
        const today = new Date();
        const diffTime = tripDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Calculate duration
    const getDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Format date range
    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} — ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    };

    const handleLeaveTrip = async () => {
        setLeavingTrip(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // api.post(`/trips/${id}/leave/`);
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to leave trip:', err);
        } finally {
            setLeavingTrip(false);
            setShowLeaveModal(false);
        }
    };

    const handleExploreDestinations = () => {
        navigate(`/trips/${id}/recommendations`);
    };

    const handleTripChat = () => {
        // UI only - would navigate to chat
        console.log('Navigate to trip chat');
    };

    const handleInviteBuddies = () => {
        // UI only - would show invite modal
        console.log('Invite more buddies');
    };

    const handleSyncCalendar = () => {
        // UI only
        console.log('Sync with calendar');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar activeItem="my-trips" />
                <main className="pt-20 ml-56 p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading trip details...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar activeItem="my-trips" />
                <main className="pt-20 ml-56 p-8">
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-gray-700">Trip not found</h2>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Back to My Trips
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const daysUntil = getDaysUntil(trip.start_date);
    const duration = getDuration(trip.start_date, trip.end_date);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="my-trips" />

            <main className="pt-20 ml-56 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                    {/* Left Column - Main Content */}
                    <div className="space-y-6">
                        {/* Back Button + Header */}
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="uppercase text-xs font-medium tracking-wider">Adventure Hub</span>
                            </button>
                        </div>

                        {/* Trip Hero Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex gap-6">
                                {/* Trip Image */}
                                <div className="w-36 h-28 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={trip.image_url}
                                        alt={trip.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Trip Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-600 tracking-wide">
                                            Confirmed Expedition
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Upcoming in {daysUntil} days
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                        {trip.title}
                                    </h1>

                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        {trip.destination}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleExploreDestinations}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            <span>Explore Destinations</span>
                                            <Compass className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleTripChat}
                                            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Trip Chat</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Active Crew Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900">Active Crew</h2>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {acceptedMembers.length} Accepted
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {acceptedMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl ${member.user_id === currentUserId
                                                ? 'bg-blue-50 border border-blue-100'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-semibold text-sm">
                                                        {member.full_name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900">{member.full_name}</div>
                                                <div className="text-xs text-gray-500 uppercase">
                                                    {member.role === 'creator' ? 'Creator' :
                                                        member.user_id === currentUserId ? 'Accepted (You)' : 'Accepted'}
                                                </div>
                                            </div>

                                            {/* Status Icon */}
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pending Response Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900">Pending Response</h2>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {pendingMembers.length} Invited
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {pendingMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-3 p-3 rounded-xl opacity-60"
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-600 font-semibold text-sm">
                                                        {member.full_name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-700">{member.full_name}</div>
                                                <div className="text-xs text-gray-400 uppercase">Invited</div>
                                            </div>
                                        </div>
                                    ))}

                                    {pendingMembers.length === 0 && (
                                        <div className="text-sm text-gray-400 text-center py-4">
                                            No pending invitations
                                        </div>
                                    )}
                                </div>

                                {/* Invite Button */}
                                {isCreator && (
                                    <button
                                        onClick={handleInviteBuddies}
                                        className="w-full mt-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                                    >
                                        + Invite More Buddies
                                    </button>
                                )}

                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Only the trip creator can dispatch new invitations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Trip Intelligence */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-4">
                                Trip Intelligence
                            </h3>

                            {/* Timeframe */}
                            <div className="mb-5">
                                <div className="text-xs text-gray-400 uppercase mb-1">Timeframe</div>
                                <div className="text-lg font-bold text-gray-900">
                                    {formatDateRange(trip.start_date, trip.end_date)}
                                </div>
                                <div className="text-sm text-blue-600 font-medium">
                                    {duration} Exciting Days
                                </div>
                            </div>

                            {/* Adventure Level */}
                            <div className="mb-5">
                                <div className="text-xs text-gray-400 uppercase mb-2">Adventure Level</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full w-4/5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">PRO</span>
                                </div>
                            </div>

                            {/* Weather Forecast */}
                            <div className="mb-6">
                                <div className="text-xs text-gray-400 uppercase mb-2">Weather Forecast</div>
                                <div className="flex items-center gap-2">
                                    <Sun className="w-6 h-6 text-yellow-500" />
                                    <span className="text-2xl font-bold text-gray-900">14°C</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Clear skies in Interlaken
                                </div>
                            </div>

                            {/* Sync with Calendar */}
                            <button
                                onClick={handleSyncCalendar}
                                className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                Sync with Calendar
                            </button>

                            {/* Leave Expedition */}
                            <button
                                onClick={() => setShowLeaveModal(true)}
                                className="w-full py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                                Leave Expedition
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Leave Trip Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowLeaveModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Abort Mission?
                        </h2>

                        {/* Description */}
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Leaving this trip will remove you from the collective chat and itinerary. Are you absolutely sure?
                        </p>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleLeaveTrip}
                                disabled={leavingTrip}
                                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {leavingTrip ? 'Leaving...' : 'Yes, Leave Trip'}
                            </button>
                            <button
                                onClick={() => setShowLeaveModal(false)}
                                className="w-full py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Stay in Crew
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDetail;
