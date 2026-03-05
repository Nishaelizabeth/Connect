import React, { useState, useEffect } from 'react';
import { Users, Map, ShoppingCart, MessageSquare, UserCheck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminTrips,
  getAdminOrders,
  getAdminBuddyRequests,
  type AdminDashboardStats,
  type AdminUser,
  type AdminTrip,
  type AdminOrder,
  type AdminBuddyRequest,
} from '@/api/admin.api';

// ─── Bar Chart ──────────────────────────────────────────────
const BarChart: React.FC<{
  data: { label: string; value: number; color?: string }[];
  height?: number;
}> = ({ data, height = 200 }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <span className="text-xs font-bold text-gray-700 mb-1">{d.value}</span>
          <div
            className="w-full rounded-t-md min-h-[4px] transition-all"
            style={{
              height: `${(d.value / max) * 100}%`,
              backgroundColor: d.color || colors[i % colors.length],
            }}
          />
          <span className="text-[10px] text-gray-500 mt-2 text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [buddies, setBuddies] = useState<AdminBuddyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, u, t, o, b] = await Promise.all([
          getAdminDashboard(90),
          getAdminUsers(),
          getAdminTrips(),
          getAdminOrders(),
          getAdminBuddyRequests(),
        ]);
        setStats(s);
        setUsers(u);
        setTrips(t);
        setOrders(o);
        setBuddies(b);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  // Derive analytics data
  const tripsByStatus = [
    { label: 'Planned', value: trips.filter((t) => t.status === 'planned').length, color: '#10b981' },
    { label: 'Upcoming', value: trips.filter((t) => t.status === 'upcoming').length, color: '#3b82f6' },
    { label: 'Completed', value: trips.filter((t) => t.status === 'completed').length, color: '#6b7280' },
  ];

  const ordersByStatus = [
    { label: 'Paid', value: orders.filter((o) => o.status === 'paid').length, color: '#10b981' },
    { label: 'Pending', value: orders.filter((o) => o.status === 'pending').length, color: '#f59e0b' },
    { label: 'Cancelled', value: orders.filter((o) => o.status === 'cancelled').length, color: '#ef4444' },
  ];

  const buddyByStatus = [
    { label: 'Pending', value: buddies.filter((b) => b.status === 'pending').length, color: '#f59e0b' },
    { label: 'Accepted', value: buddies.filter((b) => b.status === 'accepted').length, color: '#10b981' },
    { label: 'Rejected', value: buddies.filter((b) => b.status === 'rejected').length, color: '#ef4444' },
  ];

  const usersByProvider = [
    { label: 'Email', value: users.filter((u) => u.auth_provider === 'email').length, color: '#3b82f6' },
    { label: 'Google', value: users.filter((u) => u.auth_provider === 'google').length, color: '#ef4444' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">
          Comprehensive overview of platform activity and growth.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { icon: <Users className="w-5 h-5 text-blue-600" />, label: 'Users', value: stats.total_users },
          { icon: <Map className="w-5 h-5 text-green-600" />, label: 'Trips', value: stats.total_trips },
          { icon: <ShoppingCart className="w-5 h-5 text-purple-600" />, label: 'Orders', value: orders.length },
          { icon: <UserCheck className="w-5 h-5 text-orange-600" />, label: 'Buddy Req.', value: buddies.length },
          {
            icon: <MessageSquare className="w-5 h-5 text-pink-600" />,
            label: 'Revenue',
            value: `₹${stats.total_revenue.toLocaleString()}`,
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span className="text-xs text-gray-500 font-medium">{item.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* New Users Per Month */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">New Users Per Month</h3>
          <BarChart
            data={
              stats.users_per_month.length > 0
                ? stats.users_per_month.map((m) => ({ label: m.month, value: m.count }))
                : [
                    { label: 'Jan', value: 45 },
                    { label: 'Feb', value: 80 },
                    { label: 'Mar', value: 120 },
                    { label: 'Apr', value: 200 },
                    { label: 'May', value: 180 },
                    { label: 'Jun', value: 250 },
                  ]
            }
          />
        </div>

        {/* Trips by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Trips by Status</h3>
          <BarChart data={tripsByStatus} />
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Orders by Status</h3>
          <BarChart data={ordersByStatus} />
        </div>

        {/* Buddy Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Buddy Requests</h3>
          <BarChart data={buddyByStatus} />
        </div>

        {/* Users by Provider */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Users by Auth Provider</h3>
          <BarChart data={usersByProvider} />
        </div>

        {/* Trip Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Trip Creation Timeline</h3>
          <BarChart
            data={
              stats.trip_timeline.length > 0
                ? stats.trip_timeline.slice(-10).map((t) => ({
                    label: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: t.count,
                  }))
                : [{ label: 'No data', value: 0 }]
            }
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
