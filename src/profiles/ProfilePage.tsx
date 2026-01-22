import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { getUser } from '@/utils/storage';
import api from '@/api/axios';
import {
    Users,
    Camera,
    Mail,
    Shield,
    Wallet,
    Compass,
    Calendar,
    Heart,
    Loader2,
    Plus,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Types ---
type Budget = 'low' | 'medium' | 'high';
type TravelStyle = 'solo' | 'group' | 'family' | 'adventure' | 'leisure';
type Duration = 'weekend' | 'short' | 'long';

interface Interest {
    id: number;
    name: string;
    is_active: boolean;
}

interface UserData {
    full_name: string;
    email: string;
    auth_provider?: string;
    // Mock fields
    avatar_url?: string;
    badge?: string;
    role_description?: string;
    stats?: {
        trips: number;
        buddies: number;
        points: string;
    };
}

const RECENT_BUDDIES = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80',
];

const ProfilePage = () => {
    // --- State ---
    const [userUser, setUserUser] = useState<UserData | null>(null);
    const [budget, setBudget] = useState<Budget>('medium');
    const [style, setStyle] = useState<TravelStyle>('solo');
    const [duration, setDuration] = useState<Duration>('weekend');
    const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
    const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);

    // UI State
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasPreferences, setHasPreferences] = useState(false);
    const [newInterestName, setNewInterestName] = useState("");
    const [isAddingInterest, setIsAddingInterest] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Load User from local storage
                const storedUser = getUser();
                if (storedUser) {
                    setUserUser({
                        ...storedUser,
                        badge: 'PRO ADVENTURER',
                        role_description: 'Urban Explorer & Marathon Enthusiast',
                        stats: { trips: 12, buddies: 84, points: '2.4k' }
                    });
                }

                // 2. Fetch Available Interests
                const interestsRes = await api.get('/preferences/interests/');
                setAvailableInterests(interestsRes.data);

                // 3. Fetch User Preferences
                try {
                    const prefsRes = await api.get('/preferences/me/');
                    if (prefsRes.data && Object.keys(prefsRes.data).length > 0) {
                        const data = prefsRes.data;
                        setBudget(data.budget_range);
                        setStyle(data.travel_style);
                        setDuration(data.preferred_trip_duration);

                        if (data.interests) {
                            setSelectedInterestIds(data.interests.map((i: Interest) => i.id));
                        }

                        setHasPreferences(true);
                    }
                } catch (error: any) {
                    console.log("No existing preferences found or fetch error", error);
                }

            } catch (error) {
                console.error("Failed to load profile data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Handlers ---
    const toggleInterest = (interestId: number) => {
        setSelectedInterestIds(prev => {
            const isSelected = prev.includes(interestId);
            setIsDirty(true);
            if (isSelected) {
                return prev.filter(id => id !== interestId);
            } else {
                return [...prev, interestId];
            }
        });
    };

    const handleAddInterest = async () => {
        if (!newInterestName.trim()) return;
        setIsAddingInterest(true);
        try {
            const res = await api.post('/preferences/interests/', { name: newInterestName, is_active: true });
            const newInterest = res.data;

            // Add to available list
            setAvailableInterests(prev => [...prev, newInterest]);
            // Auto-select it
            setSelectedInterestIds(prev => [...prev, newInterest.id]);
            setIsDirty(true);
            setNewInterestName("");
        } catch (error: any) {
            console.error("Failed to add interest", error);
            alert(error.response?.data?.detail || "Failed to add interest.");
        } finally {
            setIsAddingInterest(false);
        }
    };

    const updateBudget = (val: Budget) => { setBudget(val); setIsDirty(true); };
    const updateStyle = (val: TravelStyle) => { setStyle(val); setIsDirty(true); };
    const updateDuration = (val: Duration) => { setDuration(val); setIsDirty(true); };

    const handleDiscard = () => {
        window.location.reload();
    };

    const handleSave = async () => {
        setIsSaving(true);
        setFeedback(null);
        try {
            const payload = {
                budget_range: budget,
                travel_style: style,
                preferred_trip_duration: duration,
                interest_ids: selectedInterestIds
            };

            if (hasPreferences) {
                await api.put('/preferences/', payload);
            } else {
                await api.post('/preferences/', payload);
                setHasPreferences(true);
            }

            setIsDirty(false);
            setFeedback({ type: 'success', message: 'Preferences saved successfully!' });

            // Clear feedback after 3 seconds
            setTimeout(() => setFeedback(null), 3000);

        } catch (error) {
            console.error("Failed to save preferences", error);
            setFeedback({ type: 'error', message: 'Failed to save preferences. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !userUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <div className="flex-1 flex overflow-hidden pt-20 max-w-7xl mx-auto w-full px-6 gap-8">

                {/* --- LEFT COLUMN --- */}
                <aside className="w-[360px] flex-shrink-0 h-full overflow-y-auto pb-10 no-scrollbar">
                    <div className="space-y-6">

                        {/* Profile Header Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-70"></div>

                            <div className="relative pt-4 flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full p-1 bg-white shadow-lg">
                                        <img
                                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md">
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                        {userUser.full_name}
                                    </h2>
                                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {userUser.badge}
                                    </div>
                                    <p className="mt-3 text-gray-500 text-sm">
                                        {userUser.role_description}
                                    </p>
                                </div>

                                {/* Stats Row */}
                                <div className="mt-8 grid grid-cols-3 gap-4 w-full">
                                    <div className="bg-gray-50 rounded-2xl p-3 text-center">
                                        <span className="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Trips</span>
                                        <span className="block text-xl font-bold text-blue-600">{userUser.stats?.trips}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3 text-center">
                                        <span className="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Buddies</span>
                                        <span className="block text-xl font-bold text-green-600">{userUser.stats?.buddies}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3 text-center">
                                        <span className="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Points</span>
                                        <span className="block text-xl font-bold text-purple-600">{userUser.stats?.points}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-gray-900">ACCOUNT DETAILS</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                                    <div className="font-medium text-gray-900">{userUser.full_name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-gray-400" />
                                        {userUser.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Auth Provider</label>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                                        <span className="text-lg">G</span> Google Auth
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Completion</label>
                                        <span className="text-xs font-bold text-blue-600">85% Complete</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-[85%] bg-blue-600 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Buddies */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">RECENT BUDDIES</h3>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-blue-600 hover:underline">See All</button>
                        </div>
                        {/* Buddy Avatars Stack */}
                        <div className="flex -space-x-2 pl-4">
                            {RECENT_BUDDIES.map((src, i) => (
                                <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={src} alt="Buddy" />
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                +80
                            </div>
                        </div>

                    </div>
                </aside>

                {/* --- RIGHT COLUMN --- */}
                <main className="flex-1 h-full overflow-y-auto pb-20 no-scrollbar">
                    <div className="space-y-8">

                        {/* Header for Right Column */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Travel Preferences</h1>
                            </div>

                            {feedback && (
                                <div className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-2
                            ${feedback.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}
                        `}>
                                    {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {feedback.message}
                                </div>
                            )}
                        </div>

                        {/* 1. Travel Preferences Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">

                            {/* Budget Range */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wallet className="h-5 w-5 text-amber-500" />
                                    <h3 className="font-bold text-gray-900 text-lg">Budget Range</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['low', 'medium', 'high'] as Budget[]).map((b) => (
                                        <button
                                            key={b}
                                            onClick={() => updateBudget(b)}
                                            className={`
                                        relative p-4 rounded-2xl border-2 text-left transition-all duration-200
                                        ${budget === b
                                                    ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-50'
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}
                                    `}
                                        >
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {b === 'low' ? 'BACKPACK' : b === 'medium' ? 'STANDARD' : 'LUXURY'}
                                            </div>
                                            <div className="text-lg font-bold text-gray-900 capitalize">{b}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Travel Style */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="h-5 w-5 text-rose-500" />
                                    <h3 className="font-bold text-gray-900 text-lg">Travel Style</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(['solo', 'group', 'family', 'adventure', 'leisure'] as TravelStyle[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => updateStyle(s)}
                                            className={`
                                        px-6 py-3 rounded-full border-2 text-sm font-bold transition-all
                                        ${style === s
                                                    ? 'border-blue-600 text-blue-600 bg-transparent shadow-sm'
                                                    : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'}
                                    `}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Duration */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="h-5 w-5 text-emerald-500" />
                                    <h3 className="font-bold text-gray-900 text-lg">Preferred Duration</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${duration === 'weekend' ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                                    `}>
                                                {duration === 'weekend' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={duration === 'weekend'} onChange={() => updateDuration('weekend')} />
                                            <span className={`font-medium ${duration === 'weekend' ? 'text-blue-600' : 'text-gray-600'}`}>Weekend Getaway</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${duration === 'short' ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                                    `}>
                                                {duration === 'short' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={duration === 'short'} onChange={() => updateDuration('short')} />
                                            <span className={`font-medium ${duration === 'short' ? 'text-blue-600' : 'text-gray-600'}`}>Short Stay (3-5 days)</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${duration === 'long' ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                                    `}>
                                                {duration === 'long' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={duration === 'long'} onChange={() => updateDuration('long')} />
                                            <span className={`font-medium ${duration === 'long' ? 'text-blue-600' : 'text-gray-600'}`}>Long Expedition (7+ days)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Travel Interests Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Heart className="h-5 w-5 fill-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xl">Travel Interests</h3>
                                </div>
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-md">Multi-select</span>
                            </div>

                            {/* Add New Interest Input */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newInterestName}
                                    onChange={(e) => setNewInterestName(e.target.value)}
                                    placeholder="Add your own interest..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                                />
                                <button
                                    onClick={handleAddInterest}
                                    disabled={!newInterestName.trim() || isAddingInterest}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isAddingInterest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Add
                                </button>
                            </div>

                            {availableInterests.length === 0 ? (
                                <div className="text-gray-500 italic mb-4">No interests available. Add one above!</div>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    {availableInterests.map((interest) => {
                                        const isSelected = selectedInterestIds.includes(interest.id);
                                        return (
                                            <button
                                                key={interest.id}
                                                onClick={() => toggleInterest(interest.id)}
                                                className={`
                                            flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-200 border-2
                                            ${isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 transform scale-105'
                                                        : 'bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100'}
                                        `}
                                            >
                                                <span className="text-lg">
                                                    {/* Simple icon mapping based on name */}
                                                    {interest.name.includes('Beach') && '🏖️'}
                                                    {interest.name.includes('Mountain') && '🏔️'}
                                                    {interest.name.includes('Food') && '🍜'}
                                                    {interest.name.includes('Culture') && '🏛️'}
                                                    {interest.name.includes('Adventure') && '🧗'}
                                                    {interest.name.includes('Nature') && '🌿'}
                                                    {interest.name.includes('Heritage') && '🏰'}
                                                    {interest.name.includes('Nightlife') && '🎆'}
                                                    {!['Beach', 'Mountain', 'Food', 'Culture', 'Adventure', 'Nature', 'Heritage', 'Nightlife'].some(k => interest.name.includes(k)) && '✨'}
                                                </span>
                                                <span className="font-bold text-sm">{interest.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Action Area */}
                            <div className="mt-12 flex items-center justify-end gap-6 pt-6 border-t border-gray-100">
                                <button
                                    className={`font-bold text-gray-400 hover:text-gray-600 transition-colors ${!isDirty && 'opacity-50 cursor-not-allowed'}`}
                                    onClick={handleDiscard}
                                    disabled={!isDirty || isSaving}
                                >
                                    Discard Changes
                                </button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-bold text-base shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                                    onClick={handleSave}
                                    disabled={!isDirty || isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Preferences
                                            {isDirty && <span className="ml-2">✓</span>}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
