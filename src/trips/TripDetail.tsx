import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, MapPin, MessageSquare, Compass, Calendar, Sun, AlertTriangle, UserPlus, X, Users, Trash2 } from 'lucide-react';
import api from '@/api/axios';
import { getUser } from '@/utils/storage';
import { getBuddyRequests, acceptBuddyRequest, rejectBuddyRequest, type BuddyRequest } from '@/api/buddies.api';
import { TripChatDrawer } from '@/chat';

// Types
interface TripMember {
    membership_id: number;
    id: number; // user id
    full_name: string;
    email: string;
    role: 'creator' | 'member';
    status: 'accepted' | 'invited' | 'rejected';
    joined_at: string | null;
}

interface TripDetails {
    id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    cover_image?: string;
    status: 'planned' | 'upcoming' | 'completed';
    creator_id: number;
    members: TripMember[];
}

interface ConnectedBuddy {
    id: number;
    full_name: string;
    email: string;
    match_score: number;
}

const TripDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [trip, setTrip] = useState<TripDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState<TripMember | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [connectedBuddies, setConnectedBuddies] = useState<ConnectedBuddy[]>([]);
    const [buddiesLoading, setBuddiesLoading] = useState(false);
    const [invitingUserId, setInvitingUserId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [connectingUserId, setConnectingUserId] = useState<number | null>(null);
    const [sentRequestUserIds, setSentRequestUserIds] = useState<Set<number>>(new Set());
    const [buddyRequests, setBuddyRequests] = useState<BuddyRequest[]>([]);
    const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
    const [acceptedRequestUserIds, setAcceptedRequestUserIds] = useState<Set<number>>(new Set());
    const [showChatDrawer, setShowChatDrawer] = useState(false);

    const currentUser = getUser();
    const currentUserId = currentUser?.id;

    useEffect(() => {
        const fetchTripData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [tripResponse, requestsResponse] = await Promise.all([
                    api.get(`/trips/${id}/`),
                    getBuddyRequests()
                ]);
                setTrip(tripResponse.data);
                setBuddyRequests(requestsResponse.results);
            } catch (err: any) {
                console.error('Failed to fetch trip details:', err);
                setError(err.response?.data?.detail || 'Failed to load trip details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTripData();
        }
    }, [id]);

    const acceptedMembers = trip?.members.filter(m => m.status === 'accepted') || [];
    const pendingMembers = trip?.members.filter(m => m.status === 'invited') || [];
    const isCreator = trip?.creator_id === currentUserId;
    
    // Get current user's membership status for chat access
    const currentUserMembership = trip?.members.find(m => m.id === currentUserId);
    const currentUserStatus = currentUserMembership?.status as 'accepted' | 'invited' | 'rejected' | null;

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
        setActionLoading(true);
        try {
            await api.post(`/trips/${id}/leave/`);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Failed to leave trip:', err);
            alert(err.response?.data?.detail || 'Failed to leave trip.');
        } finally {
            setActionLoading(false);
            setShowLeaveModal(false);
        }
    };

    const handleCancelTrip = async () => {
        setActionLoading(true);
        try {
            await api.delete(`/trips/${id}/delete/`);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Failed to cancel trip:', err);
            alert(err.response?.data?.detail || 'Failed to cancel trip.');
        } finally {
            setActionLoading(false);
            setShowCancelModal(false);
        }
    };

    const handleRemoveMember = async (member: TripMember) => {
        setActionLoading(true);
        try {
            await api.post(`/trips/${id}/remove-member/${member.membership_id}/`);
            // Refresh trip data
            const response = await api.get(`/trips/${id}/`);
            setTrip(response.data);
        } catch (err: any) {
            console.error('Failed to remove member:', err);
            alert(err.response?.data?.detail || 'Failed to remove member.');
        } finally {
            setActionLoading(false);
            setShowRemoveModal(null);
        }
    };

    const handleConnectUser = async (userId: number) => {
        setConnectingUserId(userId);
        try {
            await api.post('/buddies/requests/', { receiver_id: userId });
            // Add to sent requests set
            setSentRequestUserIds(prev => new Set(prev).add(userId));
        } catch (err: any) {
            console.error('Failed to send buddy request:', err);
            // Silently handle error or show a toast notification instead of alert
        } finally {
            setConnectingUserId(null);
        }
    };

    const handleAcceptBuddyRequest = async (requestId: number, senderId: number) => {
        setProcessingRequestId(requestId);
        try {
            await acceptBuddyRequest(requestId);
            // Remove from buddy requests list
            setBuddyRequests(prev => prev.filter(req => req.id !== requestId));
            // Add to accepted users set
            setAcceptedRequestUserIds(prev => new Set(prev).add(senderId));
        } catch (err: any) {
            console.error('Failed to accept buddy request:', err);
        } finally {
            setProcessingRequestId(null);
        }
    };

    const handleRejectBuddyRequest = async (requestId: number) => {
        setProcessingRequestId(requestId);
        try {
            await rejectBuddyRequest(requestId);
            // Remove from buddy requests list
            setBuddyRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (err: any) {
            console.error('Failed to reject buddy request:', err);
        } finally {
            setProcessingRequestId(null);
        }
    };

    const handleExploreDestinations = () => {
        navigate(`/trips/${id}/recommendations`);
    };

    const handleTripChat = () => {
        setShowChatDrawer(true);
    };

    const handleInviteBuddies = async () => {
        setShowInviteModal(true);
        setBuddiesLoading(true);
        try {
            const response = await api.get('/buddies/accepted/');
            // Filter out users already in the trip
            const existingMemberIds = trip?.members.map(m => m.id) || [];
            const availableBuddies = (response.data.results || []).filter(
                (buddy: ConnectedBuddy) => !existingMemberIds.includes(buddy.id)
            );
            setConnectedBuddies(availableBuddies);
        } catch (err: any) {
            console.error('Failed to fetch buddies:', err);
        } finally {
            setBuddiesLoading(false);
        }
    };

    const handleInviteBuddy = async (userId: number) => {
        setInvitingUserId(userId);
        try {
            await api.post(`/trips/${id}/invite/`, { user_id: userId });
            // Remove from available list
            setConnectedBuddies(prev => prev.filter(b => b.id !== userId));
            // Refresh trip data
            const response = await api.get(`/trips/${id}/`);
            setTrip(response.data);
        } catch (err: any) {
            console.error('Failed to invite buddy:', err);
            alert(err.response?.data?.detail || 'Failed to send invitation.');
        } finally {
            setInvitingUserId(null);
        }
    };

    const handleSyncCalendar = () => {
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

    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar activeItem="my-trips" />
                <main className="pt-20 ml-56 p-8">
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-gray-700">{error || 'Trip not found'}</h2>
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
                                <div className="w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500">
                                    {trip.cover_image ? (
                                        <img
                                            src={trip.cover_image}
                                            alt={trip.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-white font-bold text-3xl">{trip.title.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Trip Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wide ${trip.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                                            trip.status === 'planned' ? 'bg-purple-100 text-purple-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {trip.status} Expedition
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {daysUntil > 0 ? `Upcoming in ${daysUntil} days` : 'In progress'}
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
                                    {acceptedMembers.map((member) => {
                                        // Check if there's a pending incoming request from this member
                                        const incomingRequest = buddyRequests.find(
                                            req => req.sender_id === member.id && req.status === 'pending'
                                        );
                                        const isProcessing = processingRequestId === incomingRequest?.id;

                                        return (
                                            <div
                                                key={member.membership_id}
                                                className={`flex items-center gap-3 p-3 rounded-xl ${member.id === currentUserId
                                                    ? 'bg-blue-50 border border-blue-100'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-sm">
                                                        {member.full_name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900">{member.full_name}</div>
                                                    <div className="text-xs text-gray-500 uppercase">
                                                        {member.role === 'creator' ? 'Creator' :
                                                            member.id === currentUserId ? 'Accepted (You)' : 'Accepted'}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {isCreator && member.role !== 'creator' && (
                                                    <button
                                                        onClick={() => setShowRemoveModal(member)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove member"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {!isCreator && member.id !== currentUserId && member.role !== 'creator' && (
                                                    acceptedRequestUserIds.has(member.id) ? (
                                                        // Show green tick if we've accepted their request
                                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    ) : incomingRequest ? (
                                                        // Show Accept/Reject buttons if there's a pending request from this member
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAcceptBuddyRequest(incomingRequest.id, member.id)}
                                                                disabled={isProcessing}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                            >
                                                                {isProcessing ? 'Processing...' : 'Accept'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectBuddyRequest(incomingRequest.id)}
                                                                disabled={isProcessing}
                                                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        // Show Connect button if no pending request
                                                        <button
                                                            onClick={() => handleConnectUser(member.id)}
                                                            disabled={connectingUserId === member.id || sentRequestUserIds.has(member.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                        >
                                                            <UserPlus className="w-3 h-3" />
                                                            {connectingUserId === member.id ? 'Sending...' : 
                                                             sentRequestUserIds.has(member.id) ? 'Request Sent' : 'Connect'}
                                                        </button>
                                                    )
                                                )}

                                                {(member.role === 'creator' || member.id === currentUserId) && (
                                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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

                                {isCreator ? (
                                    // Creator sees full pending list
                                    <div className="space-y-3">
                                        {pendingMembers.map((member) => (
                                            <div
                                                key={member.membership_id}
                                                className="flex items-center gap-3 p-3 rounded-xl opacity-60"
                                            >
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gray-600 font-semibold text-sm">
                                                        {member.full_name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-700">{member.full_name}</div>
                                                    <div className="text-xs text-gray-400 uppercase">Invited</div>
                                                </div>

                                                {/* Cancel Invite */}
                                                <button
                                                    onClick={() => setShowRemoveModal(member)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancel invitation"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {pendingMembers.length === 0 && (
                                            <div className="text-sm text-gray-400 text-center py-4">
                                                No pending invitations
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Member sees only count
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Users className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-700">{pendingMembers.length}</p>
                                        <p className="text-sm text-gray-500">pending invitation{pendingMembers.length !== 1 ? 's' : ''}</p>
                                    </div>
                                )}

                                {/* Invite Button - Creator Only */}
                                {isCreator && (
                                    <button
                                        onClick={handleInviteBuddies}
                                        className="w-full mt-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                                    >
                                        + Invite More Buddies
                                    </button>
                                )}

                                <p className="text-xs text-gray-400 text-center mt-3">
                                    {isCreator
                                        ? 'You can invite connected buddies to join this trip.'
                                        : 'Only the trip creator can dispatch new invitations.'}
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

                            {/* Adventure Level - Mock */}
                            <div className="mb-5">
                                <div className="text-xs text-gray-400 uppercase mb-2">Adventure Level</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full w-4/5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">PRO</span>
                                </div>
                            </div>

                            {/* Weather Forecast - Mock */}
                            <div className="mb-6">
                                <div className="text-xs text-gray-400 uppercase mb-2">Weather Forecast</div>
                                <div className="flex items-center gap-2">
                                    <Sun className="w-6 h-6 text-yellow-500" />
                                    <span className="text-2xl font-bold text-gray-900">14°C</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Clear skies in {trip.destination.split(',')[0]}
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

                            {/* Leave/Cancel Trip */}
                            {isCreator ? (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Cancel Trip
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowLeaveModal(true)}
                                    className="w-full py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    Leave Expedition
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Leave Trip Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowLeaveModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Abort Mission?
                        </h2>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Leaving this trip will remove you from the collective chat and itinerary. Are you absolutely sure?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleLeaveTrip}
                                disabled={actionLoading}
                                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Leaving...' : 'Yes, Leave Trip'}
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

            {/* Cancel Trip Modal (Creator) */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowCancelModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Cancel This Trip?
                        </h2>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            This will permanently delete the trip and notify all members. This action cannot be undone.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleCancelTrip}
                                disabled={actionLoading}
                                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Trip'}
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="w-full py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Keep Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Member Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowRemoveModal(null)}
                    />
                    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <X className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Remove {showRemoveModal.full_name}?
                        </h2>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            {showRemoveModal.status === 'invited'
                                ? 'This will cancel their invitation to join the trip.'
                                : 'This will remove them from the trip and they will be notified.'}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleRemoveMember(showRemoveModal)}
                                disabled={actionLoading}
                                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Removing...' : 'Yes, Remove'}
                            </button>
                            <button
                                onClick={() => setShowRemoveModal(null)}
                                className="w-full py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Buddies Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowInviteModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Invite Buddies
                            </h2>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Select connected buddies to invite to this trip.
                        </p>

                        <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                            {buddiesLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-gray-500">Loading buddies...</div>
                                </div>
                            ) : connectedBuddies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-center">
                                    <Users className="w-10 h-10 text-gray-300 mb-2" />
                                    <p className="text-gray-500 text-sm">No available buddies to invite.</p>
                                    <p className="text-gray-400 text-xs mt-1">All connected buddies are already part of this trip.</p>
                                </div>
                            ) : (
                                connectedBuddies.map((buddy) => (
                                    <div
                                        key={buddy.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-semibold text-sm">
                                                {buddy.full_name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900">{buddy.full_name}</div>
                                            <div className="text-xs text-gray-500">{buddy.match_score.toFixed(0)}% match</div>
                                        </div>

                                        {/* Invite Button */}
                                        <button
                                            onClick={() => handleInviteBuddy(buddy.id)}
                                            disabled={invitingUserId === buddy.id}
                                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            {invitingUserId === buddy.id ? 'Inviting...' : 'Invite'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="w-full py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trip Chat Drawer */}
            {trip && (
                <TripChatDrawer
                    isOpen={showChatDrawer}
                    onClose={() => setShowChatDrawer(false)}
                    tripId={trip.id}
                    tripTitle={trip.title}
                    members={trip.members}
                    currentUserStatus={currentUserStatus}
                />
            )}
        </div>
    );
};

export default TripDetail;
