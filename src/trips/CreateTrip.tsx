import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useLocationAutocomplete } from '@/hooks/useLocationAutocomplete';

interface Buddy {
    id: number;
    full_name?: string;
    email?: string;
    avatar_url?: string;
    primary_interest?: string;
    match_score?: number;
}

const CreateTrip: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState<{
        city: string;
        region: string;
        country: string;
        latitude: number;
        longitude: number;
    } | null>(null);
    const [destinationError, setDestinationError] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [_error, setError] = useState<string | null>(null);
    const [_successMessage, setSuccessMessage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        query,
        setQuery,
        results,
        loading: searchLoading,
        showDropdown,
        setShowDropdown,
        selectLocation,
    } = useLocationAutocomplete();

    useEffect(() => {
        const fetchConnected = async () => {
            setLoading(true);
            try {
                const resp = await api.get('/buddies/accepted/');
                setBuddies(resp.data.results || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load buddies.');
            } finally {
                setLoading(false);
            }
        };

        fetchConnected();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowDropdown]);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const validate = () => {
        if (!title.trim()) return 'Trip name is required.';
        if (!destination) {
            setDestinationError(true);
            return 'Please select a destination from the dropdown.';
        }
        if (!destination.city || !destination.country) return 'Invalid destination selected.';
        if (!startDate || !endDate) return 'Start and end dates are required.';
        const s = new Date(startDate);
        const e = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Invalid dates.';
        if (s < today) return 'Start date cannot be in the past.';
        if (s >= e) return 'End date must be after start date.';
        if (selectedIds.length === 0) return 'Select at least one buddy.';
        return null;
    };

    const handleSubmit = async (ev?: React.FormEvent) => {
        ev?.preventDefault();
        if (submitting) return;
        setError(null);
        setDestinationError(false);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/trips/', {
                title: title.trim(),
                city: destination!.city,
                region: destination!.region || null,
                country: destination!.country,
                latitude: destination!.latitude,
                longitude: destination!.longitude,
                start_date: startDate,
                end_date: endDate,
                invited_user_ids: selectedIds,
            });

            setSuccessMessage('Trip created successfully — redirecting to My Trips...');
            setTimeout(() => navigate('/dashboard'), 900);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.detail || 'Failed to create trip.');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = buddies.filter((b) => {
        const matchesSearch = b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter ? (b.primary_interest === activeFilter) : true;
        return matchesSearch && matchesFilter;
    });

    const allInterests = Array.from(new Set(buddies.map((b) => b.primary_interest).filter(Boolean))) as string[];

    const canSubmit = !!title.trim() && !!destination && startDate && endDate && (new Date(startDate) < new Date(endDate)) && selectedIds.length > 0;

    const handleLocationSelect = (result: any) => {
        const locationData = selectLocation(result);
        setDestination({
            city: locationData.city,
            region: locationData.region,
            country: locationData.country,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
        });
        setDestinationError(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="my-trips" onItemClick={() => {}} userName={''} />

            <main className="pt-20 ml-56 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
                    {/* Left narrow panel */}
                    <aside className="bg-white rounded-2xl p-6 shadow h-[80vh] sticky top-28">
                        <button className="text-sm text-blue-600 mb-4" onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan New<br/> <span className="text-blue-600">Journey</span></h2>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Trip Name</label>
                            <input
                                className="w-full border rounded-lg px-3 py-3 text-lg"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Summer Surf Weekend"
                            />
                        </div>

                        <div className="mb-4 relative" ref={dropdownRef}>
                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">
                                Destination <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full border rounded-lg px-3 py-3 text-lg ${destinationError ? 'border-red-500' : ''}`}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setDestination(null);
                                    setDestinationError(false);
                                }}
                                placeholder="Search city (e.g. Panaji, Interlaken, Tokyo)"
                            />
                            {searchLoading && (
                                <div className="absolute right-3 top-[42px] flex items-center">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                </div>
                            )}
                            {showDropdown && results.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {results.map((result, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleLocationSelect(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                                        >
                                            <div className="text-sm text-gray-800">{result.display_name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {destinationError && (
                                <p className="text-xs text-red-500 mt-1">Please select a destination from the dropdown</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Start Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">End Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-sm font-medium text-gray-700">Selected Buddies</p>
                                <div className="text-2xl font-bold text-blue-600">{selectedIds.length}</div>
                            </div>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!canSubmit || submitting}
                                className={`w-full py-3 rounded-xl font-semibold transition-colors ${(!canSubmit || submitting) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'}`}
                            >
                                {submitting ? 'Creating...' : 'Finalize & Create Trip'}
                            </button>
                        </div>
                    </aside>

                    {/* Right: Buddy discovery */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">Find Travel Buddies</h1>
                                <p className="text-sm text-gray-500">Search across your entire connection network.</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setSelectedIds(buddies.map(b => b.id)); }} className="px-3 py-1 border rounded-md text-sm">Select All</button>
                                <button onClick={() => { setSelectedIds([]); }} className="px-3 py-1 border rounded-md text-sm">Clear</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, hobby or destination..."
                                className="flex-1 border rounded-full px-4 py-2"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setActiveFilter(null)} className={`px-3 py-1 rounded-full text-sm ${activeFilter === null ? 'bg-black text-white' : 'bg-white border'}`}>All</button>
                                {allInterests.map((i) => (
                                    <button key={i} onClick={() => setActiveFilter(i)} className={`px-3 py-1 rounded-full text-sm ${activeFilter === i ? 'bg-black text-white' : 'bg-white border'}`}>{i}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {loading && <div className="text-gray-500">Loading buddies...</div>}
                            {!loading && filtered.length === 0 && (
                                <div className="text-gray-500">No buddies found.</div>
                            )}

                            {filtered.map((b) => {
                                const selected = selectedIds.includes(b.id);
                                return (
                                    <div 
                                        key={b.id} 
                                        onClick={() => toggleSelect(b.id)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                            selected 
                                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <img 
                                                src={b.avatar_url || '/images/avatar-placeholder.png'} 
                                                alt={b.full_name || b.email} 
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" 
                                            />
                                            {selected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">{b.full_name || b.email}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {b.primary_interest && (
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">{b.primary_interest}</span>
                                                )}
                                                {b.primary_interest && typeof b.match_score === 'number' && (
                                                    <span className="text-gray-300">•</span>
                                                )}
                                                {typeof b.match_score === 'number' && (
                                                    <span className="text-xs text-gray-400">{Math.round(b.match_score)}% match</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selection indicator */}
                                        <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            selected 
                                                ? 'bg-blue-600 border-blue-600' 
                                                : 'border-gray-300 bg-white'
                                        }`}>
                                            {selected && (
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default CreateTrip;
