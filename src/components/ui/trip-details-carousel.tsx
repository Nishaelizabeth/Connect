import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MapPin,
    Calendar,
    Compass,
    MessageSquare,
    ListOrdered,
    UserPlus,
    Clock,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    X,
    CloudSun,
    Thermometer
} from 'lucide-react';

// Types
interface TripMember {
    membership_id: number;
    id: number;
    full_name: string;
    email: string;
    role: 'creator' | 'member';
    status: 'accepted' | 'invited' | 'rejected';
    joined_at: string | null;
}

interface TripWeather {
    temperature: number;
    condition: string;
    description: string;
    icon: string;
    icon_url: string;
    city_name: string;
}

interface TripImage {
    id: number;
    url: string;
    caption?: string;
}

interface TripData {
    id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    cover_image?: string;
    images?: TripImage[];
    status: 'planned' | 'upcoming' | 'completed';
    creator_id: number;
    members: TripMember[];
    weather?: TripWeather | null;
}

interface SlideConfig {
    id: string;
    title: string;
    accent: string;
}

interface TripDetailsCarouselProps {
    trip: TripData;
    currentUserId?: number;
    isCreator: boolean;
    onLeaveTrip: () => void;
    onCancelTrip: () => void;
    onInviteBuddies: () => void;
    onExploreDestinations: () => void;
    onTripChat: () => void;
    onItinerary: () => void;
    onSyncCalendar: () => void;
    onRemoveMember: (member: TripMember) => void;
    onConnectUser: (userId: number) => void;
    connectingUserId: number | null;
    sentRequestUserIds: Set<number>;
    acceptedRequestUserIds: Set<number>;
    buddyRequests: Array<{ id: number; sender_id: number; status: string }>;
    onAcceptBuddyRequest: (requestId: number, senderId: number) => void;
    onRejectBuddyRequest: (requestId: number) => void;
    processingRequestId: number | null;
}

const SLIDE_CONFIG: SlideConfig[] = [
    { id: 'summary', title: 'Overview', accent: '#3b82f6' },
    { id: 'crew', title: 'Crew', accent: '#8b5cf6' },
    { id: 'actions', title: 'Actions', accent: '#10b981' },
    { id: 'intelligence', title: 'Intel', accent: '#f59e0b' }
];

// Default destination images for when no trip images are available
const DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=900&h=1200&fit=crop&q=80'
];

const SLIDE_DURATION = 8000;
const TRANSITION_DURATION = 600;

export default function TripDetailsCarousel({
    trip,
    currentUserId,
    isCreator,
    onLeaveTrip,
    onCancelTrip,
    onInviteBuddies,
    onExploreDestinations,
    onTripChat,
    onItinerary,
    onSyncCalendar,
    onRemoveMember,
    onConnectUser,
    connectingUserId,
    sentRequestUserIds,
    acceptedRequestUserIds,
    buddyRequests,
    onAcceptBuddyRequest,
    onRejectBuddyRequest,
    processingRequestId
}: TripDetailsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Build image array from trip data
    const tripImages = trip.images?.length
        ? trip.images.map(img => img.url)
        : trip.cover_image
            ? [trip.cover_image]
            : [];

    // Get current image based on slide index
    const getCurrentImage = (index: number): string => {
        if (tripImages.length === 0) {
            return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
        }
        if (tripImages.length === 1) {
            return tripImages[0];
        }
        return tripImages[index % tripImages.length];
    };

    // Calculate helper values
    const getDaysUntil = (dateStr: string) => {
        const tripDate = new Date(dateStr);
        const today = new Date();
        const diffTime = tripDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} — ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    };

    const daysUntil = getDaysUntil(trip.start_date);
    const duration = getDuration(trip.start_date, trip.end_date);
    const acceptedMembers = trip.members.filter(m => m.status === 'accepted');
    const pendingMembers = trip.members.filter(m => m.status === 'invited');

    // Calculate trip readiness (mock calculation)
    const tripReadiness = Math.min(100, Math.round(
        (acceptedMembers.length > 0 ? 25 : 0) +
        (trip.weather ? 25 : 0) +
        (duration > 0 ? 25 : 0) +
        25 // Base readiness
    ));

    const goToSlide = useCallback((index: number) => {
        if (isTransitioning || index === currentIndex) return;
        setIsTransitioning(true);
        setProgress(0);

        setTimeout(() => {
            setCurrentIndex(index);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, TRANSITION_DURATION / 2);
    }, [isTransitioning, currentIndex]);

    const goNext = useCallback(() => {
        const nextIndex = (currentIndex + 1) % SLIDE_CONFIG.length;
        goToSlide(nextIndex);
    }, [currentIndex, goToSlide]);

    const goPrev = useCallback(() => {
        const prevIndex = (currentIndex - 1 + SLIDE_CONFIG.length) % SLIDE_CONFIG.length;
        goToSlide(prevIndex);
    }, [currentIndex, goToSlide]);

    // Auto-advance slides
    useEffect(() => {
        if (isPaused) return;

        progressRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 100 / (SLIDE_DURATION / 50);
            });
        }, 50);

        intervalRef.current = setInterval(() => {
            goNext();
        }, SLIDE_DURATION);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [currentIndex, isPaused, goNext]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev]);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 60) {
            if (diff > 0) goNext();
            else goPrev();
        }
    };

    const currentSlide = SLIDE_CONFIG[currentIndex];
    const transitionClass = isTransitioning ? 'transitioning' : 'visible';

    // Render slide content based on current index
    const renderSlideContent = () => {
        switch (currentIndex) {
            case 0: // Trip Summary
                return (
                    <div className={`trip-slide-content ${transitionClass}`}>
                        {/* Status Badge */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full tracking-wide ${
                                trip.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                                trip.status === 'planned' ? 'bg-purple-100 text-purple-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                                {trip.status}
                            </span>
                            {daysUntil > 0 && (
                                <span className="text-sm text-gray-500">
                                    {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                </span>
                            )}
                        </div>

                        {/* Destination */}
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span className="text-lg text-gray-600">{trip.destination}</span>
                        </div>

                        {/* Date & Duration Info */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="trip-info-badge">
                                <Calendar className="w-4 h-4" />
                                {formatDateRange(trip.start_date, trip.end_date)}
                            </div>
                            <div className="trip-info-badge trip-info-badge--accent">
                                <Clock className="w-4 h-4" />
                                {duration} {duration === 1 ? 'Night' : 'Nights'}
                            </div>
                        </div>

                        {/* Weather Preview */}
                        {trip.weather && (
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl mb-6">
                                <img 
                                    src={trip.weather.icon_url} 
                                    alt={trip.weather.condition}
                                    className="w-14 h-14"
                                />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {Math.round(trip.weather.temperature)}°C
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {trip.weather.description}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Leave/Cancel Button */}
                        <div className="mt-auto pt-4">
                            {isCreator ? (
                                <button
                                    onClick={onCancelTrip}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel Trip
                                </button>
                            ) : (
                                <button
                                    onClick={onLeaveTrip}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Leave Trip
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 1: // Crew Management
                return (
                    <div className={`trip-slide-content ${transitionClass}`}>
                        {/* Active Crew Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                    Active Crew
                                </h3>
                                <span className="text-xs text-gray-400">{acceptedMembers.length} members</span>
                            </div>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2">
                                {acceptedMembers.slice(0, 4).map((member) => {
                                    const incomingRequest = buddyRequests.find(
                                        req => req.sender_id === member.id && req.status === 'pending'
                                    );
                                    
                                    return (
                                        <div key={member.membership_id} className="trip-member-card">
                                            <div 
                                                className="trip-member-avatar"
                                                style={{ 
                                                    background: member.role === 'creator' 
                                                        ? 'linear-gradient(135deg, #f97316, #ec4899)' 
                                                        : 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                                                }}
                                            >
                                                {member.full_name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="trip-member-info">
                                                <div className="trip-member-name">{member.full_name}</div>
                                                <div className="trip-member-role">
                                                    {member.role === 'creator' ? 'Creator' : 
                                                     member.id === currentUserId ? 'You' : 'Member'}
                                                </div>
                                            </div>
                                            {isCreator && member.role !== 'creator' && (
                                                <button
                                                    onClick={() => onRemoveMember(member)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            {!isCreator && member.id !== currentUserId && member.role !== 'creator' && (
                                                incomingRequest ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => onAcceptBuddyRequest(incomingRequest.id, member.id)}
                                                            disabled={processingRequestId === incomingRequest.id}
                                                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => onRejectBuddyRequest(incomingRequest.id)}
                                                            disabled={processingRequestId === incomingRequest.id}
                                                            className="px-2 py-1 text-xs text-red-500 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : acceptedRequestUserIds.has(member.id) ? (
                                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => onConnectUser(member.id)}
                                                        disabled={connectingUserId === member.id || sentRequestUserIds.has(member.id)}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                        {sentRequestUserIds.has(member.id) ? 'Sent' : 'Connect'}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                                {acceptedMembers.length > 4 && (
                                    <div className="text-xs text-gray-400 text-center py-2">
                                        +{acceptedMembers.length - 4} more members
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pending Section */}
                        {pendingMembers.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                        Pending
                                    </h3>
                                    <span className="text-xs text-gray-400">{pendingMembers.length} invited</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {pendingMembers.slice(0, 5).map((member) => (
                                        <div 
                                            key={member.membership_id}
                                            className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                                            title={member.full_name}
                                        >
                                            {member.full_name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    ))}
                                    {pendingMembers.length > 5 && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                                            +{pendingMembers.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Invite Button */}
                        {isCreator && (
                            <button
                                onClick={onInviteBuddies}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Invite More Buddies
                            </button>
                        )}
                        {!isCreator && (
                            <p className="text-xs text-gray-400 text-center">
                                Only the trip creator can invite new members.
                            </p>
                        )}
                    </div>
                );

            case 2: // Action Hub
                return (
                    <div className={`trip-slide-content ${transitionClass}`}>
                        <p className="text-sm text-gray-500 mb-6">
                            Plan your adventure with these tools
                        </p>

                        <div className="space-y-3">
                            {/* Explore Destinations */}
                            <button onClick={onExploreDestinations} className="trip-action-card w-full text-left">
                                <div className="trip-action-card-icon bg-gradient-to-br from-blue-500 to-cyan-400">
                                    <Compass className="w-5 h-5 text-white" />
                                </div>
                                <div className="trip-action-card-content">
                                    <div className="trip-action-card-title">Explore Destination</div>
                                    <div className="trip-action-card-desc">Discover attractions, experiences & local insights</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </button>

                            {/* Trip Chat */}
                            <button onClick={onTripChat} className="trip-action-card w-full text-left">
                                <div className="trip-action-card-icon bg-gradient-to-br from-purple-500 to-pink-400">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div className="trip-action-card-content">
                                    <div className="trip-action-card-title">Trip Chat</div>
                                    <div className="trip-action-card-desc">Discuss plans with your crew</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </button>

                            {/* Itinerary */}
                            <button onClick={onItinerary} className="trip-action-card w-full text-left">
                                <div className="trip-action-card-icon bg-gradient-to-br from-emerald-500 to-teal-400">
                                    <ListOrdered className="w-5 h-5 text-white" />
                                </div>
                                <div className="trip-action-card-content">
                                    <div className="trip-action-card-title">Itinerary</div>
                                    <div className="trip-action-card-desc">View and manage daily trip schedule</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>
                    </div>
                );

            case 3: // Trip Intelligence
                return (
                    <div className={`trip-slide-content ${transitionClass}`}>
                        {/* Countdown & Readiness */}
                        <div className="flex items-start gap-6 mb-6">
                            {/* Progress Ring */}
                            <div className="trip-progress-ring flex-shrink-0">
                                <svg className="w-full h-full" viewBox="0 0 120 120">
                                    <circle
                                        className="trip-progress-ring-bg"
                                        cx="60"
                                        cy="60"
                                        r="52"
                                    />
                                    <circle
                                        className="trip-progress-ring-fill"
                                        cx="60"
                                        cy="60"
                                        r="52"
                                        strokeDasharray={`${(tripReadiness / 100) * 327} 327`}
                                    />
                                </svg>
                                <div className="trip-progress-ring-text">
                                    <span className="trip-progress-ring-value">{daysUntil}</span>
                                    <span className="trip-progress-ring-label">Days</span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="text-sm text-gray-500 mb-1">Trip Readiness</div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{tripReadiness}%</div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${tripReadiness}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Weather Forecast */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <CloudSun className="w-5 h-5 text-amber-500" />
                                <span className="text-sm font-semibold text-gray-700">Weather Outlook</span>
                            </div>
                            {trip.weather ? (
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={trip.weather.icon_url} 
                                        alt={trip.weather.condition}
                                        className="w-12 h-12"
                                    />
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {Math.round(trip.weather.temperature)}°C
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {trip.weather.description}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Thermometer className="w-4 h-4" />
                                    <span className="text-sm">Weather data unavailable</span>
                                </div>
                            )}
                        </div>

                        {/* AI Insight */}
                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl mb-6">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 mb-1">AI Suggestion</div>
                                    <p className="text-sm text-gray-600">
                                        {daysUntil <= 7 
                                            ? "Your trip is coming up soon! Consider finalizing your itinerary and confirming reservations."
                                            : daysUntil <= 30
                                            ? "Great time to start planning activities and checking visa requirements if needed."
                                            : "Plenty of time to research and find the best deals for your destination."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Get slide titles for each slide
    const getSlideTitle = () => {
        switch (currentIndex) {
            case 0: return trip.title;
            case 1: return 'Your Crew';
            case 2: return 'Action Hub';
            case 3: return 'Trip Intelligence';
            default: return trip.title;
        }
    };

    const getSlideSubtitle = () => {
        switch (currentIndex) {
            case 0: return trip.status === 'upcoming' ? 'Upcoming Adventure' : trip.status === 'planned' ? 'Planned Trip' : 'Completed';
            case 1: return `${acceptedMembers.length} Members`;
            case 2: return 'Plan & Coordinate';
            case 3: return 'Insights & Analytics';
            default: return '';
        }
    };

    return (
        <div
            className="trip-carousel-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background accent wash */}
            <div
                className="trip-carousel-bg-wash"
                style={{
                    background: `radial-gradient(ellipse at 70% 50%, ${currentSlide.accent}18 0%, transparent 70%)`
                }}
            />

            <div className="trip-carousel-inner">
                {/* Left: Text Content */}
                <div className="trip-carousel-content">
                    <div className="trip-carousel-content-inner">
                        {/* Slide number */}
                        <div className={`trip-carousel-slide-num ${transitionClass}`}>
                            <span className="trip-carousel-num-line" />
                            <span className="trip-carousel-num-text">
                                {String(currentIndex + 1).padStart(2, '0')} / {String(SLIDE_CONFIG.length).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className={`trip-carousel-title ${transitionClass}`}>
                            {getSlideTitle()}
                        </h2>

                        {/* Subtitle */}
                        <p 
                            className={`trip-carousel-subtitle ${transitionClass}`}
                            style={{ color: currentSlide.accent }}
                        >
                            {getSlideSubtitle()}
                        </p>

                        {/* Slide Content */}
                        {renderSlideContent()}

                        {/* Navigation Arrows */}
                        <div className="trip-carousel-nav-arrows">
                            <button
                                onClick={goPrev}
                                className="trip-carousel-arrow-btn"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goNext}
                                className="trip-carousel-arrow-btn"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Image */}
                <div className="trip-carousel-image-container">
                    <div className={`trip-carousel-image-frame ${transitionClass}`}>
                        <img
                            src={getCurrentImage(currentIndex)}
                            alt={trip.destination}
                            className="trip-carousel-image"
                        />
                        <div
                            className="trip-carousel-image-overlay"
                            style={{
                                background: `linear-gradient(135deg, ${currentSlide.accent}22 0%, transparent 50%)`
                            }}
                        />
                    </div>

                    {/* Decorative frame corners */}
                    <div 
                        className="trip-carousel-frame-corner trip-carousel-frame-corner--tl" 
                        style={{ borderColor: currentSlide.accent }} 
                    />
                    <div 
                        className="trip-carousel-frame-corner trip-carousel-frame-corner--br" 
                        style={{ borderColor: currentSlide.accent }} 
                    />
                </div>
            </div>

            {/* Progress Indicators */}
            <div className="trip-carousel-progress-bar">
                {SLIDE_CONFIG.map((slide, index) => (
                    <button
                        key={slide.id}
                        onClick={() => goToSlide(index)}
                        className={`trip-carousel-progress-item ${index === currentIndex ? 'active' : ''}`}
                        aria-label={`Go to ${slide.title}`}
                    >
                        <div className="trip-carousel-progress-track">
                            <div
                                className="trip-carousel-progress-fill"
                                style={{
                                    width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%',
                                    backgroundColor: index === currentIndex ? currentSlide.accent : undefined
                                }}
                            />
                        </div>
                        <span className="trip-carousel-progress-label">{slide.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
