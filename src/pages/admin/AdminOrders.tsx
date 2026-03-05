import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminOrders, updateOrderStatus, type AdminOrder } from '@/api/admin.api';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders(statusFilter);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5" />,
    paid: <Check className="w-3.5 h-3.5" />,
    cancelled: <X className="w-3.5 h-3.5" />,
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Refund Requests / Orders</h1>
        <p className="text-gray-500 text-sm">
          Manage all orders and refund requests from the store.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                statusFilter === f.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Items</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-gray-600">#{o.id}</td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900">{o.user_name || o.user_email}</span>
                      <br />
                      <span className="text-xs text-gray-400">{o.user_email}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{o.item_count}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">₹{o.total_amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          statusColors[o.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusIcons[o.status]}
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {o.status === 'pending' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(o.id, 'paid')}
                            className="px-2.5 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(o.id, 'cancelled')}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
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

export default AdminOrders;
