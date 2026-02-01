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
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Invalid dates.';
        if (s >= e) return 'Start date must be before end date.';
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
                                <input type="date" className="w-full border rounded-lg px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">End Date</label>
                                <input type="date" className="w-full border rounded-lg px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-blue-800 text-white rounded-2xl p-5 flex flex-col justify-between mt-6">
                            <div>
                                <p className="text-sm text-blue-200">Selected Buddies</p>
                                <div className="text-3xl font-bold mt-2">{selectedIds.length}</div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting}
                                    className={`w-full py-3 rounded-xl font-semibold ${(!canSubmit || submitting) ? 'bg-slate-600 text-slate-200 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                >
                                    {submitting ? 'Creating...' : 'Finalize & Create Trip'}
                                </button>
                            </div>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading && <div className="text-gray-500">Loading buddies...</div>}
                            {!loading && filtered.length === 0 && (
                                <div className="text-gray-500">No buddies found.</div>
                            )}

                            {filtered.map((b) => {
                                const selected = selectedIds.includes(b.id);
                                return (
                                    <div key={b.id} className="bg-white rounded-2xl p-6 shadow flex flex-col items-center text-center">
                                        <div className="-mt-10 mb-3">
                                            <img src={b.avatar_url || '/images/avatar-placeholder.png'} alt={b.full_name || b.email} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                                        </div>
                                        <div className="font-medium text-gray-800">{b.full_name || b.email}</div>
                                        {b.primary_interest && <div className="text-xs text-gray-500 uppercase mt-1">{b.primary_interest}</div>}
                                        {typeof b.match_score === 'number' && (
                                            <div className="text-xs text-gray-400 mt-2">{Math.round(b.match_score)}%</div>
                                        )}
                                        <div className="mt-4 w-full">
                                            <button onClick={() => toggleSelect(b.id)} className={`w-full py-2 rounded-lg ${selected ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                                                {selected ? 'Selected' : 'Select'}
                                            </button>
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
