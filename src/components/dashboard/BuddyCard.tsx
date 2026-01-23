import React from 'react';
import { cn } from '@/lib/utils';

interface BuddyCardProps {
    name: string;
    interests: string[];
    matchPercentage: number;
    avatar: string;
    onSendRequest?: () => void;
}

const BuddyCard: React.FC<BuddyCardProps> = ({
    name,
    interests,
    matchPercentage,
    avatar,
    onSendRequest
}) => {
    const getMatchColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 80) return 'bg-orange-500';
        if (percentage >= 70) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all">
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

            <button
                onClick={onSendRequest}
                className="w-full py-2 px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
                Send Request
            </button>
        </div>
    );
};

export default BuddyCard;
