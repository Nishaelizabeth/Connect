import React from 'react';
import DestinationCard from './DestinationCard';

// Extended mock destinations data
const allDestinations = [
    {
        id: 1,
        name: 'The Dolomites',
        location: 'Italy',
        description: 'Perfect for bouldering and high-altitude hiking expeditions.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
        tag: 'Highly Trending',
        tagColor: 'red' as const,
        credit: 'Janska82/Getty Images',
    },
    {
        id: 2,
        name: 'Tokyo',
        location: 'Japan',
        description: 'Explore hidden street-ball courts and urban parkour spots.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
        tag: 'Urban Vibe',
        tagColor: 'purple' as const,
        credit: 'MasterLu/Getty Images',
    },
    {
        id: 3,
        name: 'Santorini',
        location: 'Greece',
        description: 'Iconic white-washed buildings with stunning sunset views.',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
        tag: 'Beach Paradise',
        tagColor: 'blue' as const,
        credit: 'TravelShots/Getty Images',
    },
    {
        id: 4,
        name: 'Machu Picchu',
        location: 'Peru',
        description: 'Ancient Incan citadel set high in the Andes Mountains.',
        image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=400&fit=crop',
        tag: 'Adventure',
        tagColor: 'red' as const,
        credit: 'ExploreWorld/Getty Images',
    },
    {
        id: 5,
        name: 'Northern Lights',
        location: 'Iceland',
        description: 'Witness the magical aurora borealis in pristine wilderness.',
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop',
        tag: 'Natural Wonder',
        tagColor: 'purple' as const,
        credit: 'NatureCapture/Getty Images',
    },
    {
        id: 6,
        name: 'Bali',
        location: 'Indonesia',
        description: 'Tropical paradise with stunning temples and rice terraces.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
        tag: 'Wellness',
        tagColor: 'blue' as const,
        credit: 'TropicalVibes/Getty Images',
    },
];

const DestinationsContent: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Explore <span className="text-blue-600">Destinations</span>
                </h1>
                <p className="text-gray-600">
                    Discover amazing places curated for your travel style and interests.
                </p>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDestinations.map((destination) => (
                    <DestinationCard
                        key={destination.id}
                        name={destination.name}
                        location={destination.location}
                        description={destination.description}
                        image={destination.image}
                        tag={destination.tag}
                        tagColor={destination.tagColor}
                        credit={destination.credit}
                        onExplore={() => console.log(`Exploring ${destination.name}`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DestinationsContent;
