import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import BuddyCard from './BuddyCard';
import {
    getBuddyMatches,
    getBuddyRequests,
    sendBuddyRequest,
    cancelBuddyRequest,
    acceptBuddyRequest,
    rejectBuddyRequest,
} from '@/api/buddies.api';
import type { BuddyMatch, BuddyRequest } from '@/api/buddies.api';
import { getUser } from '@/utils/storage';

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

const FindBuddiesContent: React.FC = () => {
    const [buddies, setBuddies] = useState<BuddyMatch[]>([]);
    const [requests, setRequests] = useState<BuddyRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = getUser();

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [matchesRes, requestsRes] = await Promise.all([
                getBuddyMatches(20),
                getBuddyRequests()
            ]);
            setBuddies(matchesRes.results);
            setRequests(requestsRes.results);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Fallback for demo purposes if backend fails
            setBuddies([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getRequestStatus = (buddyId: number) => {
        const userId = currentUser?.id;
        if (!userId) return 'none';

        const req = requests.find(r =>
            (r.sender_id === userId && r.receiver_id === buddyId) ||
            (r.receiver_id === userId && r.sender_id === buddyId)
        );

        if (!req) return 'none';
        if (req.status === 'accepted') return 'accepted';
        if (req.status === 'rejected') return 'none'; // Allow re-sending? or show rejected? Usually none or rejected.

        // Pending
        if (req.sender_id === userId) return 'pending_outgoing';
        return 'pending_incoming';
    };

    const getRequestId = (buddyId: number): number | undefined => {
        const userId = currentUser?.id;
        const req = requests.find(r =>
            (r.sender_id === userId && r.receiver_id === buddyId) ||
            (r.receiver_id === userId && r.sender_id === buddyId)
        );
        return req?.id;
    };

    const handleSendRequest = async (buddyId: number) => {
        try {
            const newReq = await sendBuddyRequest(buddyId);
            setRequests(prev => [...prev, newReq]);
        } catch (error) {
            console.error('Failed to send request:', error);
        }
    };

    const handleCancelRequest = async (buddyId: number) => {
        const requestId = getRequestId(buddyId);
        if (!requestId) return;
        try {
            await cancelBuddyRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error('Failed to cancel request:', error);
        }
    };

    const handleAcceptRequest = async (buddyId: number) => {
        const requestId = getRequestId(buddyId);
        if (!requestId) return;
        try {
            const updatedReq = await acceptBuddyRequest(requestId);
            setRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const handleRejectRequest = async (buddyId: number) => {
        const requestId = getRequestId(buddyId);
        if (!requestId) return;
        try {
            await rejectBuddyRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId)); // Remove rejected request from list so button resets? Or keep it as rejected?
            // If we remove it, the user can request again. Let's remove it for now.
        } catch (error) {
            console.error('Failed to reject request:', error);
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
                    {buddies.map((buddy, index) => (
                        <BuddyCard
                            key={buddy.matched_user_id}
                            name={buddy.matched_user_name}
                            interests={buddy.shared_interests.slice(0, 3)}
                            matchPercentage={Math.round(buddy.match_score)}
                            avatar={getAvatarForBuddy(index)}
                            requestStatus={getRequestStatus(buddy.matched_user_id)}
                            onSendRequest={() => handleSendRequest(buddy.matched_user_id)}
                            onCancelRequest={() => handleCancelRequest(buddy.matched_user_id)}
                            onAcceptRequest={() => handleAcceptRequest(buddy.matched_user_id)}
                            onRejectRequest={() => handleRejectRequest(buddy.matched_user_id)}
                        />
                    ))}
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
