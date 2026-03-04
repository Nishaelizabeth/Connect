import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import api from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';

interface TripMember {
    membership_id: number;
    id: number;
    full_name: string;
    email: string;
    role: 'creator' | 'member';
    status: 'accepted' | 'invited' | 'rejected';
    joined_at: string | null;
}

interface TripImage {
    id: number;
    url: string | null;
}

interface ConflictingTrip {
    id: number;
    name: string;
    creator: string;
    start_date: string;
    end_date: string;
}

interface ConflictInfo {
    conflicting_trip: ConflictingTrip;
    total_conflicts: number;
}

interface InvitationItem {
    membership_id: number;
    trip_id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    creator_id: number;
    creator_name: string;
    status: string;
    members: TripMember[];
    images?: TripImage[];
    conflict?: ConflictInfo | null;
}

const Invitations: React.FC = () => {
    const [invitations, setInvitations] = useState<InvitationItem[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const resp = await api.get('/trips/invitations/');
                setInvitations(resp.data.results || []);
                if (resp.data.results && resp.data.results.length > 0) setSelected(resp.data.results[0].membership_id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const selectInvitation = (id: number) => setSelected(id);

    const handleAccept = async (tripId: number) => {
        const inv = invitations.find(i => i.trip_id === tripId);
        if (!inv) return;

        // If there's a conflict detected from the serializer, show the modal
        if (inv.conflict) {
            setShowConflictModal(true);
            return;
        }

        // No conflict – try normal accept
        setActionLoading(true);
        try {
            await api.post(`/trips/${tripId}/accept/`);
            setInvitations(prev => prev.filter(i => i.trip_id !== tripId));
            setSelected(prev => (prev === tripId ? null : prev));
            navigate('/dashboard?tab=my-trips');
        } catch (err: any) {
            // Server detected conflict at accept-time (race condition guard)
            if (err.response?.status === 409 && err.response?.data?.conflict) {
                // Update local data with conflict info from server
                const serverConflicts = err.response.data.conflicting_trips;
                if (serverConflicts?.length) {
                    setInvitations(prev => prev.map(i =>
                        i.trip_id === tripId
                            ? { ...i, conflict: { conflicting_trip: serverConflicts[0], total_conflicts: serverConflicts.length } }
                            : i
                    ));
                }
                setShowConflictModal(true);
            } else {
                console.error(err);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptWithConflict = async (tripId: number) => {
        setActionLoading(true);
        try {
            await api.post(`/trips/${tripId}/accept-with-conflict/`);
            setInvitations(prev => prev.filter(i => i.trip_id !== tripId));
            setSelected(prev => (prev === tripId ? null : prev));
            setShowConflictModal(false);
            navigate('/dashboard?tab=my-trips');
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async (tripId: number) => {
        setActionLoading(true);
        try {
            await api.post(`/trips/${tripId}/reject/`);
            setInvitations(prev => prev.filter(i => i.trip_id !== tripId));
            setSelected(prev => (prev === tripId ? null : prev));
            setShowConflictModal(false);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const selectedInvitation = invitations.find((i) => i.membership_id === selected) || invitations[0] || null;

    const formatDateRange = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="invitations" onItemClick={() => {}} userName={''} />

            <main className="pt-20 ml-56 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
                    <aside className="bg-white rounded-2xl p-4 shadow h-[80vh] sticky top-28">
                        <h3 className="text-sm font-semibold mb-4">Inbox</h3>
                        <div className="space-y-3 overflow-auto max-h-[70vh]">
                            {loading && <div className="text-gray-500">Loading...</div>}
                            {!loading && invitations.map((inv) => (
                                <button key={inv.membership_id} onClick={() => selectInvitation(inv.membership_id)} className={`w-full text-left p-3 rounded-lg ${selected === inv.membership_id ? 'border-2 border-blue-500 bg-blue-50' : 'border'} flex items-center gap-3`}>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shrink-0">
                                        <span className="text-white font-semibold text-sm">
                                            {inv.creator_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium flex items-center gap-1.5">
                                            {inv.creator_name}
                                            {inv.conflict && (
                                                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{inv.title}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section>
                        {!selectedInvitation ? (
                            <div className="bg-white rounded-2xl p-6 shadow">No invitations</div>
                        ) : (
                            <div className="space-y-6">
                            <div className="bg-white rounded-2xl overflow-hidden shadow">
                                    {(() => {
                                        const coverSrc = selectedInvitation.images?.[0]?.url || null;
                                        return coverSrc ? (
                                            <img
                                                src={coverSrc}
                                                alt={selectedInvitation.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600" />
                                        );
                                    })()}
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold">{selectedInvitation.title}</h2>
                                        <p className="text-sm text-gray-500">{selectedInvitation.destination}</p>
                                    </div>
                                </div>

                                {/* Conflict Warning Banner */}
                                {selectedInvitation.conflict && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-orange-800 text-sm">Date Conflict Detected</p>
                                            <p className="text-sm text-orange-700 mt-1">
                                                You are already part of <span className="font-medium">{selectedInvitation.conflict.conflicting_trip.name}</span> ({formatDateRange(selectedInvitation.conflict.conflicting_trip.start_date, selectedInvitation.conflict.conflicting_trip.end_date)}) which overlaps with this trip.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">Planned Dates</div>
                                        <div className="font-medium">{selectedInvitation.start_date} — {selectedInvitation.end_date}</div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">Creator</div>
                                        <div className="font-medium">{selectedInvitation.creator_name}</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Trip Members</h3>
                                    <div className="space-y-3">
                                        {selectedInvitation.members?.filter(m => m.status === 'accepted').map((member) => (
                                            <div key={member.membership_id} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
                                                    <span className="text-white font-semibold text-sm">
                                                        {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{member.full_name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {member.role === 'creator' ? 'Trip Creator' : 'Member'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedInvitation.members?.filter(m => m.status === 'invited' && m.id !== selectedInvitation.membership_id).length > 0 && (
                                            <div className="pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-500 mb-2">Also Invited</div>
                                                {selectedInvitation.members?.filter(m => m.status === 'invited').slice(0, 3).map((member) => (
                                                    <div key={member.membership_id} className="flex items-center gap-2 py-1">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                            <span className="text-gray-600 font-semibold text-xs">
                                                                {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">{member.full_name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button onClick={() => handleDecline(selectedInvitation.trip_id)} disabled={actionLoading} className="px-5 py-2 rounded-lg border">Decline Invitation</button>
                                    <button onClick={() => handleAccept(selectedInvitation.trip_id)} disabled={actionLoading} className="px-5 py-2 rounded-lg bg-blue-600 text-white">Accept & Join Trip</button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Conflict Resolution Modal */}
            {showConflictModal && selectedInvitation?.conflict && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-bold text-gray-900">Trip Conflict Warning</h3>
                            </div>
                            <button onClick={() => setShowConflictModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 space-y-4">
                            <p className="text-sm text-gray-600">You are already part of another trip:</p>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                                <p className="font-semibold text-gray-900">{selectedInvitation.conflict.conflicting_trip.name}</p>
                                <p className="text-sm text-gray-600">Creator: {selectedInvitation.conflict.conflicting_trip.creator}</p>
                                <p className="text-sm text-gray-600">
                                    Dates: {formatDateRange(selectedInvitation.conflict.conflicting_trip.start_date, selectedInvitation.conflict.conflicting_trip.end_date)}
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800">
                                    If you accept this invitation, you will <span className="font-semibold">automatically leave</span> that trip.
                                </p>
                            </div>

                            <p className="text-sm text-gray-500">Do you want to continue?</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 px-6 pb-6">
                            <button
                                onClick={() => handleDecline(selectedInvitation.trip_id)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Decline Invitation
                            </button>
                            <button
                                onClick={() => handleAcceptWithConflict(selectedInvitation.trip_id)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
                            >
                                {actionLoading ? 'Processing...' : 'Accept New Trip'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invitations;
