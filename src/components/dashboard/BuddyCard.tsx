import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuddyCardProps {
    name: string;
    bio: string;
    interests: string[];
    matchPercentage: number;
    avatar: string | null;
    requestStatus?: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted' | 'rejected';
    highlighted?: boolean;
    onSendRequest?: () => void;
    onCancelRequest?: () => void;
    onAcceptRequest?: () => void;
    onRejectRequest?: () => void;
    onDisconnect?: () => void;
}

const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-blue-600';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
};

const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 30) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
};

const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
};

const BuddyCard: React.FC<BuddyCardProps> = ({
    name,
    bio,
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
    const defaultBio = 'Travel enthusiast looking for adventure companions!';
    const displayBio = bio?.trim() || defaultBio;
    const scoreLabel = `${Math.round(matchPercentage)}% Match`;

    return (
        <div className={cn(
            "group cursor-pointer border border-gray-300/50 bg-white/50 shadow-none backdrop-blur-sm transition-shadow hover:shadow-md",
            highlighted
                ? "ring-4 ring-blue-500 ring-offset-2 shadow-xl scale-[1.02] bg-blue-50/30 animate-pulse"
                : ""
        )}>
            <div className="p-0">
                {/* Image Section */}
                <div className="relative mb-4 sm:mb-6">
                    {avatar ? (
                        <img
                            alt={name}
                            className="aspect-square h-44 w-full object-cover"
                            src={avatar}
                        />
                    ) : (
                        <div className="flex aspect-square h-44 w-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                            <span className="text-5xl font-bold text-blue-300/80">
                                {getInitial(name)}
                            </span>
                        </div>
                    )}
                    {/* Score Badge - positioned like the category badge */}
                    <p className={cn(
                        "absolute top-0 left-0 rounded-none border-0 px-2 py-0.5 font-medium text-[10px] uppercase backdrop-blur-sm sm:-top-0.5 sm:-left-0.5 sm:px-3 sm:py-1 sm:text-xs",
                        getScoreBg(matchPercentage)
                    )}>
                        #{scoreLabel}
                    </p>
                </div>

                {/* Content Section */}
                <div className="px-2.5 pb-2.5">
                    {/* Name */}
                    <h3 className="mb-1 font-normal text-sm text-gray-900 tracking-tight line-clamp-1">
                        {name}
                    </h3>

                    {/* Bio */}
                    <p className="mb-2 text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                        {displayBio}
                    </p>

                    {/* Shared Interests as inline tags */}
                    {interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {interests.slice(0, 2).map((interest) => (
                                <span
                                    key={interest}
                                    className="inline-flex items-center border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-medium text-gray-600 uppercase"
                                >
                                    {interest}
                                </span>
                            ))}
                            {interests.length > 2 && (
                                <span className="inline-flex items-center border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-medium text-gray-400">
                                    +{interests.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center justify-between">
                        {/* Action Button */}
                        <div>
                            {requestStatus === 'none' && (
                                <button
                                    onClick={onSendRequest}
                                    type="button"
                                    className="group/btn relative flex items-center overflow-hidden font-medium text-gray-900 text-[11px] transition-colors hover:text-gray-700"
                                >
                                    <span className="mr-1.5 overflow-hidden rounded-none border border-gray-200 p-1.5 transition-colors duration-300 ease-in group-hover/btn:bg-black group-hover/btn:text-white">
                                        <ArrowRight className="h-2.5 w-2.5 translate-x-0 opacity-100 transition-all duration-500 ease-in group-hover/btn:translate-x-6 group-hover/btn:opacity-0" />
                                        <ArrowRight className="absolute top-1/2 -left-3 h-2.5 w-2.5 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover/btn:left-1.5" />
                                    </span>
                                    Connect
                                </button>
                            )}

                            {requestStatus === 'pending_outgoing' && (
                                <button
                                    onClick={onCancelRequest}
                                    type="button"
                                    className="group/btn relative flex items-center overflow-hidden font-medium text-gray-500 text-[11px] transition-colors hover:text-gray-700"
                                >
                                    <span className="mr-1.5 overflow-hidden rounded-none border border-gray-200 bg-gray-50 p-1.5 transition-colors duration-300 ease-in group-hover/btn:bg-gray-200">
                                        <ArrowRight className="h-2.5 w-2.5 rotate-180" />
                                    </span>
                                    Cancel
                                </button>
                            )}

                            {requestStatus === 'pending_incoming' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onAcceptRequest}
                                        type="button"
                                        className="group/btn relative flex items-center overflow-hidden font-medium text-gray-900 text-[11px] transition-colors hover:text-gray-700"
                                    >
                                        <span className="mr-1.5 overflow-hidden rounded-none border border-gray-200 p-1.5 transition-colors duration-300 ease-in group-hover/btn:bg-black group-hover/btn:text-white">
                                            <ArrowRight className="h-2.5 w-2.5 translate-x-0 opacity-100 transition-all duration-500 ease-in group-hover/btn:translate-x-6 group-hover/btn:opacity-0" />
                                            <ArrowRight className="absolute top-1/2 -left-3 h-2.5 w-2.5 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover/btn:left-1.5" />
                                        </span>
                                        Accept
                                    </button>
                                    <button
                                        onClick={onRejectRequest}
                                        type="button"
                                        className="font-medium text-red-500 text-[11px] transition-colors hover:text-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {requestStatus === 'accepted' && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowConfirmDialog(true);
                                    }}
                                    type="button"
                                    className="group/btn relative flex items-center overflow-hidden font-medium text-emerald-600 text-[11px] transition-colors hover:text-emerald-700"
                                >
                                    <span className="mr-1.5 overflow-hidden rounded-none border border-emerald-200 bg-emerald-50 p-1.5 transition-colors duration-300 ease-in group-hover/btn:bg-emerald-600 group-hover/btn:text-white">
                                        <ArrowRight className="h-2.5 w-2.5" />
                                    </span>
                                    Connected
                                </button>
                            )}
                        </div>

                        {/* Match Score */}
                        <span className={cn(
                            "flex items-center gap-1.5 text-[10px] font-semibold",
                            getScoreColor(matchPercentage)
                        )}>
                            {scoreLabel}
                            <span className="w-4 border-gray-300 border-t" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Disconnect Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirmDialog(false)}>
                    <div className="bg-white p-6 max-w-sm mx-4 shadow-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
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
                                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
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
                                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuddyCard;
