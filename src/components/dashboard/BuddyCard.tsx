import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface BuddyCardProps {
    name: string;
    interests: string[];
    matchPercentage: number;
    avatar: string;
    requestStatus?: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted' | 'rejected';
    highlighted?: boolean;
    onSendRequest?: () => void;
    onCancelRequest?: () => void;
    onAcceptRequest?: () => void;
    onRejectRequest?: () => void;
    onDisconnect?: () => void;
}

const BuddyCard: React.FC<BuddyCardProps> = ({
    name,
    interests,
    matchPercentage,
    avatar,
    requestStatus = 'none',
    highlighted = false,
    onSendRequest,
    onCancelRequest,
    onAcceptRequest,
    onRejectRequest,
    onDisconnect
}) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    
    const getMatchColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 80) return 'bg-orange-500';
        if (percentage >= 70) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className={cn(
            "bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center transition-all",
            highlighted 
                ? "ring-4 ring-blue-500 ring-offset-2 shadow-xl scale-105 bg-blue-50 animate-pulse" 
                : "hover:shadow-md"
        )}>
            <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className={cn(
                    "absolute -bottom-1 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                    getMatchColor(matchPercentage)
                )}>
                    {matchPercentage}%
                </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-xs text-gray-500 mb-4">
                {interests.join(' • ')}
            </p>

            <div className="w-full">
                {requestStatus === 'none' && (
                    <button
                        onClick={onSendRequest}
                        type="button"
                        className="w-full py-2 px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        Send Request
                    </button>
                )}

                {requestStatus === 'pending_outgoing' && (
                    <button
                        onClick={onCancelRequest}
                        type="button"
                        className="w-full py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel Request
                    </button>
                )}

                {requestStatus === 'pending_incoming' && (
                    <div className="flex gap-2">
                        <button
                            onClick={onAcceptRequest}
                            type="button"
                            className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            onClick={onRejectRequest}
                            type="button"
                            className="flex-1 py-2 px-4 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                )}

                {requestStatus === 'accepted' && (
                    <>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowConfirmDialog(true);
                            }}
                            type="button"
                            className="w-full py-2 px-4 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            Connected
                        </button>
                        
                        {/* Confirmation Dialog */}
                        {showConfirmDialog && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirmDialog(false)}>
                                <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Disconnect Buddy?</h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Are you sure you want to disconnect from {name}? You can always send them a buddy request again later.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowConfirmDialog(false);
                                            }}
                                            type="button"
                                            className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowConfirmDialog(false);
                                                onDisconnect?.();
                                            }}
                                            type="button"
                                            className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BuddyCard;
