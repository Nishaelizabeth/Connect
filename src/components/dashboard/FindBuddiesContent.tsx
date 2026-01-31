import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import BuddyCard from './BuddyCard';
import {
    getBuddyMatches,
    sendBuddyRequest,
    cancelBuddyRequest,
    acceptBuddyRequest,
    rejectBuddyRequest,
    disconnectBuddy,
} from '@/api/buddies.api';
import type { BuddyMatch } from '@/api/buddies.api';

// Avatar placeholder images
const avatarPlaceholders = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
];

const getAvatarForBuddy = (index: number): string => {
    return avatarPlaceholders[index % avatarPlaceholders.length];
};

interface FindBuddiesContentProps {
    highlightBuddyId?: number;
}

const FindBuddiesContent: React.FC<FindBuddiesContentProps> = ({ highlightBuddyId }) => {
    const [buddies, setBuddies] = useState<BuddyMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const highlightedCardRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const matchesRes = await getBuddyMatches(20);
            setBuddies(matchesRes.results);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setBuddies([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    // Scroll to highlighted buddy card
    useEffect(() => {
        if (highlightBuddyId && highlightedCardRef.current && !isLoading) {
            setTimeout(() => {
                highlightedCardRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    }, [highlightBuddyId, isLoading]);

    const handleSendRequest = async (buddyId: number) => {
        try {
            // Optimistic update
            setBuddies(prev => prev.map(b =>
                b.matched_user_id === buddyId
                    ? { ...b, request_status: 'pending_outgoing' as const }
                    : b
            ));

            const newReq = await sendBuddyRequest(buddyId);

            // Update with real ID
            setBuddies(prev => prev.map(b =>
                b.matched_user_id === buddyId
                    ? { ...b, request_status: 'pending_outgoing' as const, request_id: newReq.id }
                    : b
            ));
        } catch (error) {
            console.error('Failed to send request:', error);
            // Revert
            fetchData();
        }
    };

    const handleCancelRequest = async (buddy: BuddyMatch) => {
        if (!buddy.request_id && buddy.request_status !== 'pending_outgoing') return;

        // We need request ID. If it's missing (shouldn't be if status is pending), we can't cancel via API easily unless we look it up
        // But the backend now returns it.
        const reqId = buddy.request_id;
        if (!reqId) {
            console.error("Missing request ID for cancellation");
            return;
        }

        try {
            // Optimistic update
            setBuddies(prev => prev.map(b =>
                b.matched_user_id === buddy.matched_user_id
                    ? { ...b, request_status: 'none' as const, request_id: null }
                    : b
            ));

            await cancelBuddyRequest(reqId);
        } catch (error) {
            console.error('Failed to cancel request:', error);
            fetchData(); // Revert
        }
    };

    const handleAcceptRequest = async (buddy: BuddyMatch) => {
        if (!buddy.request_id) return;
        try {
            setBuddies(prev => prev.map(b =>
                b.matched_user_id === buddy.matched_user_id
                    ? { ...b, request_status: 'accepted' as const }
                    : b
            ));
            await acceptBuddyRequest(buddy.request_id);
        } catch (error) {
            console.error('Failed to accept request:', error);
            fetchData();
        }
    };

    const handleRejectRequest = async (buddy: BuddyMatch) => {
        if (!buddy.request_id) return;
        try {
            setBuddies(prev => prev.map(b =>
                b.matched_user_id === buddy.matched_user_id
                    ? { ...b, request_status: 'rejected' as const }
                    : b
            ));
            await rejectBuddyRequest(buddy.request_id);
        } catch (error) {
            console.error('Failed to reject request:', error);
            fetchData();
        }
    };

    const handleDisconnect = async (buddy: BuddyMatch) => {
        try {
            // Optimistic update - change status to 'none'
            setBuddies(prev => prev.map(b =>
                b.matched_user_id === buddy.matched_user_id
                    ? { ...b, request_status: 'none' as const, request_id: null }
                    : b
            ));
            await disconnectBuddy(buddy.matched_user_id);
            // Refetch to ensure UI is in sync
            await fetchData();
        } catch (error) {
            console.error('Failed to disconnect buddy:', error);
            fetchData(); // Revert on error
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Find Your <span className="text-blue-600">Perfect Match</span>
                    </h1>
                    <p className="text-gray-600">
                        Based on your shared interests and travel preferences.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Buddies Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse h-48" />
                    ))}
                </div>
            ) : buddies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {buddies.map((buddy, index) => {
                        const isHighlighted = highlightBuddyId === buddy.matched_user_id;
                        return (
                            <div
                                key={buddy.matched_user_id}
                                ref={isHighlighted ? highlightedCardRef : null}
                            >
                                <BuddyCard
                                    name={buddy.matched_user_name}
                                    interests={buddy.shared_interests.slice(0, 3)}
                                    matchPercentage={Math.round(buddy.match_score)}
                                    avatar={getAvatarForBuddy(index)}
                                    requestStatus={buddy.request_status}
                                    highlighted={isHighlighted}
                                    onSendRequest={() => handleSendRequest(buddy.matched_user_id)}
                                    onCancelRequest={() => handleCancelRequest(buddy)}
                                    onAcceptRequest={() => handleAcceptRequest(buddy)}
                                    onRejectRequest={() => handleRejectRequest(buddy)}
                                    onDisconnect={() => handleDisconnect(buddy)}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                    <p className="text-gray-500">No buddies found. Complete your preferences to get matched with travel companions!</p>
                </div>
            )}
        </div>
    );
};

export default FindBuddiesContent;
