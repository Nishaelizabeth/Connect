import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import { getUser, setUser } from '@/utils/storage';
import api from '@/api/axios';
import { getMe, updateProfile } from '@/api/auth.api';
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
    XCircle,
    Trash2,
    FileEdit,
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
    is_default: boolean;
    is_mine: boolean;
}

interface UserProfile {
    id: number;
    full_name: string;
    email: string;
    bio: string;
    profile_picture: string | null;
    profile_picture_url: string | null;
    google_picture_url: string | null;
    auth_provider: string;
    has_preferences: boolean;
}

// --- Avatar Component ---
const ProfileAvatar = ({
    profilePictureUrl,
    fullName,
    size = 128,
}: {
    profilePictureUrl: string | null;
    fullName: string;
    size?: number;
}) => {
    const initial = fullName ? fullName.charAt(0).toUpperCase() : '?';
    if (profilePictureUrl) {
        return (
            <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
            />
        );
    }
    return (
        <div
            className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
            style={{ fontSize: size * 0.4 }}
        >
            <span className="text-white font-bold">{initial}</span>
        </div>
    );
};

// --- Interest icon helper ---
const getInterestIcon = (name: string) => {
    if (name.includes('Beach')) return '\u{1F3D6}';
    if (name.includes('Mountain')) return '\u{1F3D4}';
    if (name.includes('Food') || name.includes('Culinary')) return '\u{1F35C}';
    if (name.includes('Culture') || name.includes('Cultural') || name.includes('Tourism')) return '\u{1F3DB}';
    if (name.includes('Adventure')) return '\u{1F9D7}';
    if (name.includes('Nature')) return '\u{1F33F}';
    if (name.includes('Heritage')) return '\u{1F3F0}';
    if (name.includes('Nightlife')) return '\u{1F386}';
    if (name.includes('Shopping')) return '\u{1F6D2}';
    if (name.includes('Wellness')) return '\u{1F9D8}';
    if (name.includes('Road')) return '\u{1F697}';
    if (name.includes('Photo')) return '\u{1F4F7}';
    if (name.includes('Art')) return '\u{1F3A8}';
    if (name.includes('History')) return '\u{1F4DC}';
    if (name.includes('Luxury')) return '\u{1F48E}';
    return '\u2728';
};
const RECENT_BUDDIES: string[] = [];

const ProfilePage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- User Profile State ---
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [bio, setBio] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // --- Profile Picture State ---
    const [picturePreview, setPicturePreview] = useState<string | null>(null);
    const [pendingPicture, setPendingPicture] = useState<File | null>(null);
    const [removePicture, setRemovePicture] = useState(false);

    // --- Preferences State ---
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
    const [newInterestName, setNewInterestName] = useState('');
    const [isAddingInterest, setIsAddingInterest] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch fresh user profile from API
                const freshUser = await getMe();
                setUserProfile(freshUser);
                setBio(freshUser.bio || '');
                // Sync to local storage
                const cached = getUser();
                if (cached) setUser({ ...cached, ...freshUser });

                // 2. Fetch Available Interests (default + user's own)
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
                } catch {
                    // No preferences yet -- that's fine
                }
            } catch (error) {
                console.error('Failed to load profile data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Profile Picture Handlers ---
    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingPicture(file);
        setRemovePicture(false);
        const url = URL.createObjectURL(file);
        setPicturePreview(url);
    };

    const handleRemovePicture = () => {
        setPendingPicture(null);
        setPicturePreview(null);
        setRemovePicture(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getDisplayPictureUrl = (): string | null => {
        if (removePicture) return null;
        if (picturePreview) return picturePreview;
        return userProfile?.profile_picture_url ?? null;
    };

    // --- Bio Save ---
    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const updated = await updateProfile({
                bio,
                profile_picture: pendingPicture,
                remove_picture: removePicture,
            });
            setUserProfile(updated);
            setPendingPicture(null);
            setRemovePicture(false);
            if (picturePreview) {
                URL.revokeObjectURL(picturePreview);
                setPicturePreview(null);
            }
            const cached = getUser();
            if (cached) setUser({ ...cached, ...updated });
            setIsEditingBio(false);
            setFeedback({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Failed to update profile', error);
            setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- Interests ---
    const toggleInterest = (interestId: number) => {
        setSelectedInterestIds(prev => {
            setIsDirty(true);
            return prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId];
        });
    };

    const handleAddInterest = async () => {
        if (!newInterestName.trim()) return;
        setIsAddingInterest(true);
        try {
            const res = await api.post('/preferences/interests/', { name: newInterestName });
            const newInterest: Interest = res.data;
            setAvailableInterests(prev => [...prev, newInterest]);
            setSelectedInterestIds(prev => [...prev, newInterest.id]);
            setIsDirty(true);
            setNewInterestName('');
        } catch (error: any) {
            console.error('Failed to add interest', error);
            alert(error.response?.data?.detail || 'Failed to add interest.');
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
                interest_ids: selectedInterestIds,
            };

            if (hasPreferences) {
                await api.put('/preferences/', payload);
            } else {
                await api.post('/preferences/', payload);
                setHasPreferences(true);
            }

            setIsDirty(false);
            setFeedback({ type: 'success', message: 'Preferences saved successfully!' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error('Failed to save preferences', error);
            setFeedback({ type: 'error', message: 'Failed to save preferences. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const displayPictureUrl = getDisplayPictureUrl();
    const hasUnsavedPictureOrBio = pendingPicture || removePicture || (bio !== (userProfile.bio || ''));

    // Separate interests into default and user-created
    const defaultInterests = availableInterests.filter(i => i.is_default);
    const myInterests = availableInterests.filter(i => i.is_mine);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans text-gray-900">
            <Navbar />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureChange}
            />

            <div className="flex-1 flex overflow-hidden pt-20 max-w-7xl mx-auto w-full px-6 gap-8">

                {/* --- LEFT COLUMN --- */}
                <aside className="w-[360px] flex-shrink-0 h-full overflow-y-auto pb-10 no-scrollbar">
                    <div className="space-y-6">

                        {/* Profile Header Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-70" />

                            <div className="relative pt-4 flex flex-col items-center text-center">
                                {/* Avatar with change/remove controls */}
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full p-1 bg-white shadow-lg overflow-hidden">
                                        <ProfileAvatar
                                            profilePictureUrl={displayPictureUrl}
                                            fullName={userProfile.full_name}
                                        />
                                    </div>

                                    {/* Camera button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                                        title="Change profile picture"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>

                                    {/* Remove button (shown if there's a picture) */}
                                    {displayPictureUrl && (
                                        <button
                                            onClick={handleRemovePicture}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                                            title="Remove profile picture"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-4 w-full">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {userProfile.full_name}
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">{userProfile.email}</p>

                                    {/* Bio section */}
                                    <div className="mt-4 text-left">
                                        {isEditingBio ? (
                                            <textarea
                                                value={bio}
                                                onChange={e => setBio(e.target.value)}
                                                rows={3}
                                                maxLength={300}
                                                placeholder="Write a short bio about yourself..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-500 italic min-h-[2.5rem]">
                                                {bio || 'No bio yet. Add one to tell others about yourself!'}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => setIsEditingBio(v => !v)}
                                            className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                                        >
                                            <FileEdit className="h-3 w-3" />
                                            {isEditingBio ? 'Cancel' : 'Edit Bio'}
                                        </button>
                                    </div>

                                    {/* Save profile button (bio + picture) */}
                                    {(hasUnsavedPictureOrBio && isEditingBio === false) || pendingPicture || removePicture ? (
                                        <Button
                                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl py-2"
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                        >
                                            {isSavingProfile ? (
                                                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                                            ) : 'Save Profile Changes'}
                                        </Button>
                                    ) : isEditingBio ? (
                                        <Button
                                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl py-2"
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                        >
                                            {isSavingProfile ? (
                                                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                                            ) : 'Save Bio'}
                                        </Button>
                                    ) : null}
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

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                                    <div className="font-medium text-gray-900">{userProfile.full_name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-gray-400" />
                                        {userProfile.email}
                                    </div>
                                </div>

                            </div>
                        </div>



                    </div>
                </aside>

                {/* --- RIGHT COLUMN --- */}
                <main className="flex-1 h-full overflow-y-auto pb-20 no-scrollbar">
                    <div className="space-y-8">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Travel Preferences</h1>
                            </div>

                            {feedback && (
                                <div className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm
                                    ${feedback.type === 'success'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'}
                                `}>
                                    {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {feedback.message}
                                </div>
                            )}
                        </div>

                        {/* Travel Preferences Card */}
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
                                            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200
                                                ${budget === b
                                                    ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-50'
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
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
                                            className={`px-6 py-3 rounded-full border-2 text-sm font-bold transition-all
                                                ${style === s
                                                    ? 'border-blue-600 text-blue-600 bg-transparent shadow-sm'
                                                    : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
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
                                <div className="flex items-center gap-6 flex-wrap">
                                    {([
                                        { val: 'weekend', label: 'Weekend Getaway' },
                                        { val: 'short', label: 'Short Stay (3-5 days)' },
                                        { val: 'long', label: 'Long Expedition (7+ days)' },
                                    ] as { val: Duration; label: string }[]).map(({ val, label }) => (
                                        <label key={val} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                                ${duration === val ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                {duration === val && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={duration === val} onChange={() => updateDuration(val)} />
                                            <span className={`font-medium ${duration === val ? 'text-blue-600' : 'text-gray-600'}`}>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Travel Interests Card */}
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

                            {/* Add New Custom Interest */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newInterestName}
                                    onChange={(e) => setNewInterestName(e.target.value)}
                                    placeholder="Add your own private interest..."
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

                            {/* Default (Global) Interests */}
                            {defaultInterests.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Global Interests
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {defaultInterests.map((interest) => {
                                            const isSelected = selectedInterestIds.includes(interest.id);
                                            return (
                                                <button
                                                    key={interest.id}
                                                    onClick={() => toggleInterest(interest.id)}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-200 border-2
                                                        ${isSelected
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                                            : 'bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    <span className="text-base">{getInterestIcon(interest.name)}</span>
                                                    <span className="font-bold text-sm">{interest.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* User's Private Interests */}
                            {myInterests.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        My Custom Interests <span className="text-purple-400">(only visible to you)</span>
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {myInterests.map((interest) => {
                                            const isSelected = selectedInterestIds.includes(interest.id);
                                            return (
                                                <button
                                                    key={interest.id}
                                                    onClick={() => toggleInterest(interest.id)}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-200 border-2
                                                        ${isSelected
                                                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                                                            : 'bg-purple-50 border-transparent text-purple-700 hover:bg-purple-100'}`}
                                                >
                                                    <span className="text-base">{getInterestIcon(interest.name)}</span>
                                                    <span className="font-bold text-sm">{interest.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {availableInterests.length === 0 && (
                                <div className="text-gray-500 italic">No interests available. Add one above!</div>
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
                                        <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                                    ) : (
                                        <>Save Preferences{isDirty && <span className="ml-2">\u2713</span>}</>
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
