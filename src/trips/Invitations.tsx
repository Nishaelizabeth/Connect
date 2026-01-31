import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import api from '@/api/axios';
import { useNavigate } from 'react-router-dom';

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
}

const Invitations: React.FC = () => {
    const [invitations, setInvitations] = useState<InvitationItem[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
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

    const handleAction = async (tripId: number, action: 'accept' | 'reject') => {
        setActionLoading(true);
        try {
            await api.post(`/trips/${tripId}/${action}/`);
            // remove invitation from list
            setInvitations((prev) => prev.filter((i) => i.trip_id !== tripId));
            setSelected((prev) => (prev === tripId ? null : prev));
            
            // Navigate to my trips tab after accepting
            if (action === 'accept') {
                navigate('/dashboard?tab=my-trips');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const selectedInvitation = invitations.find((i) => i.membership_id === selected) || invitations[0] || null;

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
                                    <img src={'/images/avatar-placeholder.png'} alt={inv.creator_name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <div className="font-medium">{inv.creator_name}</div>
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
                                    <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=400&fit=crop" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold">{selectedInvitation.title}</h2>
                                        <p className="text-sm text-gray-500">{selectedInvitation.destination}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">Planned Dates</div>
                                        <div className="font-medium">{selectedInvitation.start_date} — {selectedInvitation.end_date}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">Invite Status</div>
                                        <div className="font-medium text-yellow-600">{selectedInvitation.status}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">Creator</div>
                                        <div className="font-medium">{selectedInvitation.creator_name}</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <img src={'/images/avatar-placeholder.png'} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <div className="font-medium">{selectedInvitation.creator_name}</div>
                                            <div className="text-xs text-gray-500">98% Travel Match • 12 Adventures Shared</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button onClick={() => handleAction(selectedInvitation.trip_id, 'reject')} disabled={actionLoading} className="px-5 py-2 rounded-lg border">Decline Invitation</button>
                                    <button onClick={() => handleAction(selectedInvitation.trip_id, 'accept')} disabled={actionLoading} className="px-5 py-2 rounded-lg bg-blue-600 text-white">Accept & Join Trip</button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Invitations;
