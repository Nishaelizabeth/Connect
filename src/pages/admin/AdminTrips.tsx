import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminTrips, type AdminTrip } from '@/api/admin.api';

const AdminTrips: React.FC = () => {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminTrips(search, statusFilter);
        setTrips(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, statusFilter]);

  const statusColors: Record<string, string> = {
    planned: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trip Monitoring</h1>
        <p className="text-gray-500 text-sm">
          Monitor all trips — status, destinations, creators, and members.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Trip Name</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Destination</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Creator</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Start Date</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">End Date</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Members</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No trips found.</td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{t.title}</td>
                    <td className="px-5 py-3 text-gray-600">{t.destination}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      <span className="font-medium">{t.creator_name}</span>
                      <br />
                      <span className="text-gray-400">{t.creator_email}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(t.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(t.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{t.member_count}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          statusColors[t.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTrips;
