import React from 'react';

interface SkeletonCardProps {
    count?: number;
}

const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="h-48 bg-gray-200"></div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                
                {/* Location */}
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                
                {/* Description */}
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                
                {/* Category tag */}
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
        </div>
    );
};

const RecommendationsSkeletonGrid: React.FC<SkeletonCardProps> = ({ count = 9 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};

export const LoadingState: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Loading message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center space-y-4">
                    {/* Animated spinner */}
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    
                    {/* Loading text */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-1">
                            ✨ Generating AI Recommendations
                        </h3>
                        <p className="text-sm text-blue-700">
                            We're analyzing destinations, fetching images, and personalizing suggestions for your trip...
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                            This usually takes 10-30 seconds
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Skeleton cards */}
            <RecommendationsSkeletonGrid count={9} />
        </div>
    );
};

export default RecommendationsSkeletonGrid;
