import React from 'react';
import { cn } from '@/lib/utils';
import type { BuddyCard } from '@/api/assistant.api';
import { User } from 'lucide-react';

interface AssistantBuddyCardProps {
    buddy: BuddyCard;
}

const AssistantBuddyCard: React.FC<AssistantBuddyCardProps> = ({ buddy }) => {
    const getMatchColor = (score: number) => {
        if (score >= 90) return 'bg-red-500';
        if (score >= 80) return 'bg-orange-500';
        if (score >= 70) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStatusDisplay = () => {
        switch (buddy.request_status) {
            case 'pending_outgoing':
                return { text: 'Request Sent', color: 'text-gray-600 bg-gray-100' };
            case 'pending_incoming':
                return { text: 'Respond', color: 'text-blue-600 bg-blue-100' };
            case 'accepted':
                return { text: 'Connected', color: 'text-green-600 bg-green-100' };
            default:
                return { text: 'Connect', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' };
        }
    };

    const status = getStatusDisplay();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-all">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                        {buddy.avatar ? (
                            <img
                                src={buddy.avatar}
                                alt={buddy.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-purple-500">
                                <User className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>
                    {/* Match Score Badge */}
                    <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm",
                        getMatchColor(buddy.match_score)
                    )}>
                        {buddy.match_score}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
                        {buddy.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                        {buddy.email}
                    </p>
                    
                    {/* Tags */}
                    {buddy.tags && buddy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {buddy.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                            {buddy.tags.length > 3 && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    +{buddy.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Status Button */}
                    <button
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
                            status.color
                        )}
                        disabled={buddy.request_status !== 'none'}
                    >
                        {status.text}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssistantBuddyCard;
