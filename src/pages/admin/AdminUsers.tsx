import React, { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminUsers, toggleUserBlock, type AdminUser } from '@/api/admin.api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers(search);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleToggleBlock = async (user: AdminUser) => {
    try {
      await toggleUserBlock(user.id, !user.is_active);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter((u) => {
    if (filter === 'active') return u.is_active;
    if (filter === 'banned') return !u.is_active;
    return true;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm">
          Manage all registered users — {users.length} total based on your accounts model.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['all', 'active', 'banned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Provider</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Staff</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Trips</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Joined</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {(u.full_name || u.email)[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                        {u.auth_provider}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.is_staff ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{u.trip_count}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleBlock(u)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          u.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <Ban className="w-3 h-3" /> Block
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" /> Unblock
                          </>
                        )}
                      </button>
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

export default AdminUsers;
