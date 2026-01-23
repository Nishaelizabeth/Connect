import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import BuddyCard from './BuddyCard';

// Extended mock data for buddies
const allBuddies = [
    {
        id: 1,
        name: 'Maya Chen',
        interests: ['Hiking', 'Photography'],
        matchPercentage: 92,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 2,
        name: 'Jordan Smith',
        interests: ['Climbing', 'Bali'],
        matchPercentage: 88,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 3,
        name: 'Sarah Jenkins',
        interests: ['Backpacking', 'Nature'],
        matchPercentage: 81,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 4,
        name: 'Lucas Vance',
        interests: ['Urban', 'Europe'],
        matchPercentage: 76,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 5,
        name: 'Emma Wilson',
        interests: ['Beach', 'Yoga'],
        matchPercentage: 85,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 6,
        name: 'David Park',
        interests: ['Mountains', 'Skiing'],
        matchPercentage: 79,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 7,
        name: 'Olivia Brown',
        interests: ['Culture', 'Food'],
        matchPercentage: 73,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 8,
        name: 'James Lee',
        interests: ['Adventure', 'Diving'],
        matchPercentage: 70,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
];

const FindBuddiesContent: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Find Your <span className="text-blue-600">Perfect Match</span>
                    </h1>
                    <p className="text-gray-600">
                        Based on your shared interests in climbing, hiking and photography.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Buddies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {allBuddies.map((buddy) => (
                    <BuddyCard
                        key={buddy.id}
                        name={buddy.name}
                        interests={buddy.interests}
                        matchPercentage={buddy.matchPercentage}
                        avatar={buddy.avatar}
                        onSendRequest={() => console.log(`Request sent to ${buddy.name}`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FindBuddiesContent;
