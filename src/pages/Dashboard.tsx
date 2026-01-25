import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Users, MapPin, Award } from 'lucide-react';
import { getUser } from '@/utils/storage';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import StatCard from '@/components/dashboard/StatCard';
import BuddyCard from '@/components/dashboard/BuddyCard';
import DestinationCard from '@/components/dashboard/DestinationCard';
import FindBuddiesContent from '@/components/dashboard/FindBuddiesContent';
import MyTripsContent from '@/components/dashboard/MyTripsContent';
import DestinationsContent from '@/components/dashboard/DestinationsContent';
import { getBuddyMatches } from '@/api/buddies.api';
import { getDashboardStats } from '@/api/trips.api';
import type { BuddyMatch } from '@/api/buddies.api';

// Mock data for destinations (keeping this as backend not implemented yet)
const mockDestinations = [
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
];

// Avatar placeholder images for buddies without profile pictures
const avatarPlaceholders = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
];

const getAvatarForBuddy = (index: number): string => {
    return avatarPlaceholders[index % avatarPlaceholders.length];
};

// Dashboard Home Content Component
interface DashboardHomeContentProps {
    userName: string;
    buddies: BuddyMatch[];
    stats: { trips_created: number; trips_joined: number };
    isLoading: boolean;
    onSwitchTab: (tab: string) => void;
}

const DashboardHomeContent: React.FC<DashboardHomeContentProps> = ({
    userName,
    buddies,
    stats,
    isLoading,
    onSwitchTab
}) => {
    const firstName = userName.split(' ')[0];

    return (
        <>
            {/* Welcome Section + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Welcome Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
                        TRAVELER DASHBOARD
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Welcome back,<br />
                        <span className="text-blue-600">{firstName}!</span> 👋
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {buddies.length > 0
                            ? `You have ${buddies.length} matching buddies waiting for your signal.`
                            : 'Complete your preferences to find matching travel buddies.'
                        }
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => onSwitchTab('find-buddies')}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Explore Buddies
                        </button>
                        <button className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                            My Calendar
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="flex flex-col gap-4">
                    <StatCard
                        icon={<Users className="w-5 h-5" />}
                        value={buddies.length}
                        label="Active Buddies"
                        variant="green"
                    />
                    <StatCard
                        icon={<MapPin className="w-5 h-5" />}
                        value={stats.trips_joined}
                        label="Trips Joined"
                        variant="blue"
                    />
                    <StatCard
                        icon={<Award className="w-5 h-5" />}
                        value={stats.trips_created}
                        label="Trips Created"
                        variant="yellow"
                    />
                </div>
            </div>

            {/* Highly Recommended Buddies */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Highly Recommended <span className="text-blue-600">Buddies</span>
                    </h2>
                    <button
                        onClick={() => onSwitchTab('find-buddies')}
                        className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
                    >
                        View All
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse h-48" />
                        ))}
                    </div>
                ) : buddies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {buddies.slice(0, 4).map((buddy, index) => (
                            <BuddyCard
                                key={buddy.matched_user_id}
                                name={buddy.matched_user_name}
                                interests={buddy.shared_interests.slice(0, 3)}
                                matchPercentage={Math.round(buddy.match_score)}
                                avatar={getAvatarForBuddy(index)}
                                onSendRequest={() => console.log(`Request sent to ${buddy.matched_user_name}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                        <p className="text-gray-500">No buddies found matching your preferences</p>
                    </div>
                )}
            </section>

            {/* Recommended Destinations */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Recommended <span className="text-blue-600">Destinations</span>
                    </h2>
                    <button
                        onClick={() => onSwitchTab('destinations')}
                        className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
                    >
                        View All
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockDestinations.map((destination) => (
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
            </section>
        </>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [sidebarExpanded] = useState(true);
    const [activeNavItem, setActiveNavItem] = useState('dashboard');
    const [buddies, setBuddies] = useState<BuddyMatch[]>([]);
    const [stats, setStats] = useState({ trips_created: 0, trips_joined: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const userName = user?.full_name || 'Traveler';

    // Fetch buddies and stats from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [buddiesResponse, statsResponse] = await Promise.all([
                    getBuddyMatches(10),
                    getDashboardStats()
                ]);
                setBuddies(buddiesResponse.results);
                setStats(statsResponse);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setBuddies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleNavItemClick = (item: string) => {
        setActiveNavItem(item);
    };

    const renderContent = () => {
        switch (activeNavItem) {
            case 'find-buddies':
                return <FindBuddiesContent />;
            case 'my-trips':
                return <MyTripsContent />;
            case 'destinations':
                return <DestinationsContent />;
            default:
                return (
                    <DashboardHomeContent
                        userName={userName}
                        buddies={buddies}
                        stats={stats}
                        isLoading={isLoading}
                        onSwitchTab={handleNavItemClick}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Global Navbar */}
            <Navbar />

            {/* Sidebar */}
            <Sidebar
                activeItem={activeNavItem}
                onItemClick={handleNavItemClick}
                userName={userName}
            />

            {/* Main Content */}
            <main className={`transition-all duration-300 pt-20 ${sidebarExpanded ? 'ml-56' : 'ml-20'}`}>
                {/* Header */}
                <header className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center justify-between px-8 py-4">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search destinations, buddies or trips..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 ml-8">
                            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <button onClick={() => navigate('/trips/create')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Plus className="w-4 h-4" />
                                Create Trip
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
