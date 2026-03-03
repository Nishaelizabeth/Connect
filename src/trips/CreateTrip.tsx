import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Upload, Search, X, ChevronDown, ChevronUp, Check, ArrowLeft, MapPin, Users, Image as ImageIcon } from 'lucide-react';
import api from '@/api/axios';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useLocationAutocomplete } from '@/hooks/useLocationAutocomplete';
import { TripDatePicker } from '@/components/ui/trip-date-picker';
import type { DateRange } from '@/components/ui/trip-date-picker';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Buddy {
    id: number;
    full_name?: string;
    email?: string;
    avatar_url?: string;
    primary_interest?: string;
    match_score?: number;
}

interface ImagePreview {
    file: File;
    url: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CreateTrip: React.FC = () => {
    const navigate = useNavigate();

    /* ---- form state ---- */
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState<{
        city: string; region: string; country: string;
        latitude: number; longitude: number;
    } | null>(null);
    const [destinationError, setDestinationError] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    /* ---- ui state ---- */
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalImagesExpanded, setModalImagesExpanded] = useState(false);
    const [modalBuddiesExpanded, setModalBuddiesExpanded] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        query, setQuery, results,
        loading: searchLoading, showDropdown, setShowDropdown, selectLocation,
    } = useLocationAutocomplete();

    /* ---- fetch buddies ---- */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const resp = await api.get('/buddies/accepted/');
                setBuddies(resp.data.results || []);
            } catch { setError('Failed to load buddies.'); }
            finally { setLoading(false); }
        })();
    }, []);

    /* ---- click-outside for location dropdown ---- */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [setShowDropdown]);

    /* ---- helpers ---- */
    const toggleSelect = (id: number) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleLocationSelect = (result: any) => {
        const d = selectLocation(result);
        setDestination({ city: d.city, region: d.region, country: d.country, latitude: d.latitude, longitude: d.longitude });
        setDestinationError(false);
    };

    /* ---- image handling ---- */
    const MAX_IMAGES = 6;

    const addImages = useCallback((files: FileList | File[]) => {
        const incoming = Array.from(files).slice(0, MAX_IMAGES - images.length);
        const newPreviews: ImagePreview[] = incoming.map(f => ({ file: f, url: URL.createObjectURL(f) }));
        setImages(prev => [...prev, ...newPreviews].slice(0, MAX_IMAGES));
    }, [images.length]);

    const removeImage = (idx: number) => {
        setImages(prev => {
            const copy = [...prev];
            URL.revokeObjectURL(copy[idx].url);
            copy.splice(idx, 1);
            return copy;
        });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) addImages(e.dataTransfer.files);
    }, [addImages]);

    /* ---- filtered buddies ---- */
    const filtered = buddies.filter(b => {
        const s = searchTerm.toLowerCase();
        const matchesSearch = b.full_name?.toLowerCase().includes(s) || b.email?.toLowerCase().includes(s);
        const matchesFilter = activeFilter ? b.primary_interest === activeFilter : true;
        return matchesSearch && matchesFilter;
    });
    const allInterests = Array.from(new Set(buddies.map(b => b.primary_interest).filter(Boolean))) as string[];
    const selectedBuddies = buddies.filter(b => selectedIds.includes(b.id));

    /* ---- validation ---- */
    const validate = (): string | null => {
        if (!title.trim()) return 'Trip name is required.';
        if (!destination) { setDestinationError(true); return 'Please select a destination.'; }
        if (!destination.city || !destination.country) return 'Invalid destination.';
        if (!dateRange?.start || !dateRange?.end) return 'Please select travel dates.';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (dateRange.start < today) return 'Start date cannot be in the past.';
        if (dateRange.start >= dateRange.end) return 'End date must be after start.';
        return null;
    };

    const canSubmit = !!title.trim() && !!destination && !!dateRange?.start && !!dateRange?.end && dateRange.start < dateRange.end;

    /* ---- open summary modal ---- */
    const handleSaveClick = () => {
        setError(null); setDestinationError(false);
        const v = validate();
        if (v) { setError(v); return; }
        setShowModal(true);
    };

    /* ---- final submit ---- */
    const handleConfirmCreate = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('city', destination!.city);
            formData.append('region', destination!.region || '');
            formData.append('country', destination!.country);
            formData.append('latitude', String(destination!.latitude));
            formData.append('longitude', String(destination!.longitude));
            formData.append('start_date', format(dateRange!.start!, 'yyyy-MM-dd'));
            formData.append('end_date', format(dateRange!.end!, 'yyyy-MM-dd'));
            formData.append('invited_user_ids', JSON.stringify(selectedIds));
            images.forEach(img => formData.append('images', img.file));

            await api.post('/trips/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to create trip.');
            setShowModal(false);
        } finally { setSubmitting(false); }
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */

    const destinationLabel = destination ? `${destination.city}, ${destination.country}` : '';
    const dateLabel = dateRange?.start && dateRange?.end
        ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
        : '';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="my-trips" onItemClick={() => { }} userName="" />

            <main className="pt-20 ml-56 p-6">
                {/* Page heading */}
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {title || 'New Trip'}{destinationLabel ? ` - ${destinationLabel} Trip Planner` : ''}
                </h1>
                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-5 items-start">

                    {/* =============== COL 1 — Trip Info =============== */}
                    <aside className="bg-white rounded-2xl p-5 shadow sticky top-24 flex flex-col gap-4">
                        <button className="text-sm text-blue-600 flex items-center gap-1 self-start" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">Plan New <span className="text-blue-600">Journey</span></h2>

                        {/* Trip Name */}
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Trip Name</label>
                            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={e => setTitle(e.target.value)} placeholder="Summer Surf Weekend" />
                        </div>

                        {/* Destination */}
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Destination <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    className={`w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${destinationError ? 'border-red-400' : 'border-gray-200'}`}
                                    value={query} onChange={e => { setQuery(e.target.value); setDestination(null); setDestinationError(false); }}
                                    placeholder="e.g. Siargao, Philippines"
                                />
                                {searchLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />}
                            </div>
                            {showDropdown && results.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {results.map((r, i) => (
                                        <button key={i} type="button" onClick={() => handleLocationSelect(r)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0">
                                            {r.display_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {destinationError && <p className="text-[11px] text-red-500 mt-1">Select a destination from dropdown</p>}
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Travel Dates</label>
                            <TripDatePicker value={dateRange} onChange={setDateRange} minValue={new Date()} placeholder="Pick start & end dates" />
                        </div>
                    </aside>

                    {/* =============== COL 2 — Trip Information + Images =============== */}
                    <section className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Trip Information</h2>
                        <p className="text-xs text-gray-500 mb-5">Fill in details and add photos to visualize your trip.</p>

                        {/* Read-only trip name */}
                        <div className="mb-4">
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Trip Name</label>
                            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50" value={title} readOnly />
                        </div>

                        {/* Read-only destination */}
                        <div className="mb-5">
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Destination <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm bg-gray-50" value={destinationLabel} readOnly placeholder="e.g. Siargao, Philippines" />
                            </div>
                        </div>

                        {/* Image upload area */}
                        <div className="mb-2">
                            <h3 className="text-base font-bold text-gray-900 mb-1">Add Inspiration Images</h3>
                            <p className="text-xs text-gray-500 mb-3">Upload images to help visualize your trip. Add photos of destinations, activities, or mood board items (max {MAX_IMAGES}).</p>

                            <div className="grid grid-cols-3 gap-3">
                                {/* Upload trigger */}
                                {images.length < MAX_IMAGES && (
                                    <div
                                        onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                                    >
                                        <Upload size={22} className="text-gray-400" />
                                        <span className="text-[11px] text-gray-400 text-center leading-tight px-2">Drag & Drop or Click to Upload</span>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) addImages(e.target.files); e.target.value = ''; }} />
                                    </div>
                                )}

                                {/* Previews */}
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={13} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        {dateLabel && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Summary</p>
                                <p className="text-sm font-medium text-gray-800">{dateLabel}</p>
                            </div>
                        )}
                    </section>

                    {/* =============== COL 3 — Invite Buddies =============== */}
                    <section className="bg-white rounded-2xl p-6 shadow flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Invite Your Buddies</h2>
                                <p className="text-xs text-gray-500">Select connected buddies to invite to your trip (optional).</p>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => setSelectedIds(buddies.map(b => b.id))} className="px-2.5 py-1 border rounded text-xs hover:bg-gray-50">Select All</button>
                                <button onClick={() => setSelectedIds([])} className="px-2.5 py-1 border rounded text-xs hover:bg-gray-50">Clear</button>
                            </div>
                        </div>

                        {/* Search + filters */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, or destination..." className="w-full border rounded-full pl-8 pr-3 py-2 text-sm" />
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => setActiveFilter(null)} className={`px-2.5 py-1 rounded-full text-xs ${activeFilter === null ? 'bg-gray-900 text-white' : 'bg-white border'}`}>All</button>
                                {allInterests.slice(0, 3).map(i => (
                                    <button key={i} onClick={() => setActiveFilter(i)} className={`px-2.5 py-1 rounded-full text-xs truncate max-w-20 ${activeFilter === i ? 'bg-gray-900 text-white' : 'bg-white border'}`}>{i}</button>
                                ))}
                            </div>
                        </div>

                        {/* Buddy list */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {loading && <p className="text-gray-400 text-sm py-6 text-center">Loading buddies...</p>}
                            {!loading && buddies.length === 0 && (
                                <div className="text-center py-10"><p className="text-gray-400 text-sm">No connected buddies yet</p></div>
                            )}
                            {!loading && buddies.length > 0 && filtered.length === 0 && (
                                <p className="text-gray-400 text-sm py-6 text-center">No matches found.</p>
                            )}
                            {filtered.map(b => {
                                const sel = selectedIds.includes(b.id);
                                return (
                                    <div key={b.id} onClick={() => toggleSelect(b.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${sel ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                        <img src={b.avatar_url || '/images/avatar-placeholder.png'} alt="" className="w-10 h-10 rounded-full object-cover border border-white shadow-sm shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{b.full_name || b.email}</p>
                                            <p className="text-[11px] text-gray-400 truncate">
                                                {b.primary_interest && <span>{b.primary_interest}</span>}
                                                {b.primary_interest && typeof b.match_score === 'number' && ' \u00b7 '}
                                                {typeof b.match_score === 'number' && `${Math.round(b.match_score)}% match`}
                                            </p>
                                        </div>
                                        <button className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${sel ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                            {sel && <Check size={14} className="text-white" />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Save button */}
                        <button type="button" onClick={handleSaveClick} disabled={!canSubmit}
                            className={`mt-4 w-full py-3 rounded-xl text-sm font-semibold transition-colors ${canSubmit ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                            Save & Continue to Itinerary
                        </button>
                    </section>
                </div>
            </main>

            {/* =============== SUMMARY MODAL =============== */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

                        <h2 className="text-xl font-bold text-gray-900 mb-1">Trip Summary</h2>
                        <p className="text-sm text-gray-500 mb-5">Review your trip before creating</p>

                        {/* Trip info */}
                        <div className="space-y-3 mb-5">
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Destination</p>
                                    <p className="text-sm font-medium text-gray-800">{destinationLabel}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg viewBox="0 0 16 16" width={16} height={16} className="text-blue-600 mt-0.5 shrink-0 fill-current">
                                    <path d="M5.5 0.5V2H10.5V0.5H12V2H14H15.5V3.5V13.5C15.5 14.8807 14.3807 16 13 16H3C1.61929 16 0.5 14.8807 0.5 13.5V3.5V2H2H4V0.5H5.5ZM2 3.5H14V6H2V3.5ZM2 7.5V13.5C2 14.0523 2.44772 14.5 3 14.5H13C13.5523 14.5 14 14.0523 14 13.5V7.5H2Z" />
                                </svg>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Dates</p>
                                    <p className="text-sm font-medium text-gray-800">{dateLabel}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stacked images preview */}
                        {images.length > 0 && (
                            <div className="mb-5">
                                <button onClick={() => setModalImagesExpanded(v => !v)} className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900">
                                    <ImageIcon size={15} className="text-blue-600" />
                                    Inspiration Images ({images.length})
                                    {modalImagesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {!modalImagesExpanded ? (
                                    /* Stacked avatar-style circles */
                                    <div className="flex items-center -space-x-3 cursor-pointer" onClick={() => setModalImagesExpanded(true)}>
                                        {images.slice(0, 3).map((img, i) => (
                                            <img key={i} src={img.url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                                        ))}
                                        {images.length > 3 && (
                                            <div className="w-12 h-12 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center border-2 border-white shadow">
                                                +{images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={11} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stacked buddies preview */}
                        {selectedBuddies.length > 0 && (
                            <div className="mb-6">
                                <button onClick={() => setModalBuddiesExpanded(v => !v)} className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900">
                                    <Users size={15} className="text-blue-600" />
                                    Invited Buddies ({selectedBuddies.length})
                                    {modalBuddiesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {!modalBuddiesExpanded ? (
                                    <div className="flex items-center -space-x-3 cursor-pointer" onClick={() => setModalBuddiesExpanded(true)}>
                                        {selectedBuddies.slice(0, 3).map(b => (
                                            <img key={b.id} src={b.avatar_url || '/images/avatar-placeholder.png'} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                                        ))}
                                        {selectedBuddies.length > 3 && (
                                            <div className="w-12 h-12 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center border-2 border-white shadow">
                                                +{selectedBuddies.length - 3}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedBuddies.map(b => (
                                            <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                                                <img src={b.avatar_url || '/images/avatar-placeholder.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{b.full_name || b.email}</p>
                                                    {b.primary_interest && <p className="text-[11px] text-gray-400">{b.primary_interest}</p>}
                                                </div>
                                                <button onClick={() => toggleSelect(b.id)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedBuddies.length === 0 && (
                            <p className="text-xs text-gray-400 mb-6">No buddies invited — this will be a solo trip.</p>
                        )}

                        {/* Confirm */}
                        <button onClick={handleConfirmCreate} disabled={submitting}
                            className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${submitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'}`}>
                            {submitting ? 'Creating Trip...' : 'Confirm & Create Trip'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTrip;
