import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plane,
  RefreshCw,
  DollarSign,
  Settings,
  FileEdit,
  ClipboardCheck,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminTrips,
  getAdminOrders,
  type AdminDashboardStats,
  type AdminUser,
  type AdminTrip,
  type AdminOrder,
} from '@/api/admin.api';

// ─── Simple Bar Chart ──────────────────────────────────────────────
const MiniBarChart: React.FC<{ data: { label: string; value: number }[]; color?: string }> = ({
  data,
  color = '#3b82f6',
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t-sm min-h-[4px]"
            style={{
              height: `${(d.value / max) * 100}%`,
              backgroundColor: color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
          <span className="text-[10px] text-gray-500 mt-1">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Simple Line Chart (SVG) ──────────────────────────────────────
const MiniLineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 280;
  const h = 120;
  const padding = 10;
  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * (w - 2 * padding),
    y: h - padding - (d.value / max) * (h - 2 * padding),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${h - padding} L${points[0].x},${h - padding} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#3b82f6" />
      ))}
    </svg>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, badge, gradient }) => (
  <div className={`rounded-2xl p-5 text-white ${gradient} relative overflow-hidden`}>
    <div className="absolute right-3 top-3 opacity-20">
      <div className="w-16 h-16">{icon}</div>
    </div>
    <div className="flex items-center gap-2 mb-1">
      <div className="opacity-80">{icon}</div>
      <span className="text-sm font-medium opacity-90">{label}</span>
      {badge && (
        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-[11px] font-bold">{badge}</span>
      )}
    </div>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dashData, usersData, tripsData, ordersData] = await Promise.all([
          getAdminDashboard(period),
          getAdminUsers(),
          getAdminTrips(),
          getAdminOrders(),
        ]);
        setStats(dashData);
        setUsers(usersData);
        setTrips(tripsData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, Admin</h1>
          <p className="text-gray-500 text-sm">Here is an overview of the latest activity.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* ─── Stat Cards Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          gradient="bg-gradient-to-br from-blue-600 to-blue-800"
        />
        <StatCard
          icon={<Plane className="w-5 h-5" />}
          label="Trips Booked"
          value={stats.trips_booked.toLocaleString()}
          badge={`${stats.trips_change_pct >= 0 ? '+' : ''}${stats.trips_change_pct}%`}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
        />
        <StatCard
          icon={<RefreshCw className="w-5 h-5" />}
          label="Pending Refund"
          value={stats.pending_orders}
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Revenue"
          value={`₹${stats.total_revenue.toLocaleString()}`}
          gradient="bg-gradient-to-br from-slate-700 to-slate-900"
        />
      </div>

      {/* ─── Main Grid: Left + Right columns ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (2/3) ────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* User Management Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => navigate('/admin/users')}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                View All Users
              </button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">User</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Trips</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {(u.full_name || u.email)[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.full_name || 'No Name'}</span>
                      </td>
                      <td className="py-3 text-gray-600">{u.email}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700">{u.trip_count}</td>
                      <td className="py-3 flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/users`)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                        >
                          View
                        </button>
                        <button className="px-3 py-1 text-gray-600 text-xs hover:text-red-600">
                          Block
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trip Monitoring Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Trip Monitoring</h2>
              <button
                onClick={() => navigate('/admin/trips')}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                View All Trips
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Trip Name</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Destination</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Dates</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 5).map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-900">{t.title}</td>
                      <td className="py-3 text-gray-600">{t.destination}</td>
                      <td className="py-3 text-gray-600">
                        {new Date(t.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(t.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            t.status === 'planned'
                              ? 'bg-green-100 text-green-700'
                              : t.status === 'completed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {t.status === 'planned' ? 'Active' : t.status === 'completed' ? 'Cancelled' : t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Analytics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">User Analytics</h2>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                View Reports
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar chart placeholder */}
              <div>
                <MiniBarChart
                  data={
                    stats.users_per_month.length > 0
                      ? stats.users_per_month.map((m) => ({ label: m.month, value: m.count }))
                      : [
                          { label: 'Jan', value: 120 },
                          { label: 'Feb', value: 200 },
                          { label: 'Mar', value: 350 },
                          { label: 'Apr', value: 280 },
                          { label: 'May', value: 420 },
                          { label: 'Jun', value: 500 },
                        ]
                  }
                  color="#3b82f6"
                />
              </div>
              {/* Donut-like stats */}
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Active</span>
                    <span className="font-bold text-gray-900 ml-auto">
                      {users.filter((u) => u.is_active).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Banned</span>
                    <span className="font-bold text-gray-900 ml-auto">
                      {users.filter((u) => !u.is_active).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-gray-600">Staff</span>
                    <span className="font-bold text-gray-900 ml-auto">
                      {users.filter((u) => u.is_staff).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900 ml-auto">{stats.total_users}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (1/3) ───────────────────────────────── */}
        <div className="space-y-6">
          {/* Trip Monitoring Mini + Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Trip Monitoring</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.total_trips}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/trips')}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
              >
                View All Trips
              </button>
            </div>
            <MiniLineChart
              data={
                stats.trip_timeline.length > 0
                  ? stats.trip_timeline.map((t) => ({
                      label: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      value: t.count,
                    }))
                  : [
                      { label: 'Apr 1', value: 200 },
                      { label: 'Apr 10', value: 800 },
                      { label: 'Apr 15', value: 400 },
                      { label: 'Apr 22', value: 1200 },
                      { label: 'Apr 29', value: 1500 },
                    ]
              }
            />
          </div>

          {/* Refund Requests */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Refund Requests</h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="px-3 py-1 border border-blue-600 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-50"
              >
                View All Requests
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 text-gray-500 font-medium">User</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Date</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Amount</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {(pendingOrders.length > 0 ? pendingOrders : orders)
                    .slice(0, 4)
                    .map((o) => (
                      <tr key={o.id} className="border-b border-gray-50">
                        <td className="py-2 text-blue-600 font-medium">{o.user_name || o.user_email}</td>
                        <td className="py-2 text-gray-500">
                          {new Date(o.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2 font-medium text-gray-900">₹{o.total_amount.toLocaleString()}</td>
                        <td className="py-2">
                          <button
                            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                              o.status === 'pending'
                                ? 'bg-orange-500 text-white'
                                : o.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {o.status === 'pending' ? 'Review' : o.status === 'paid' ? 'Paid' : 'Reject'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Analytics (New Users Per Month) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3">New Users Per Month</h3>
            <MiniBarChart
              data={
                stats.users_per_month.length > 0
                  ? stats.users_per_month.map((m) => ({ label: m.month, value: m.count }))
                  : [
                      { label: 'Feb', value: 80 },
                      { label: 'Mar', value: 150 },
                      { label: 'Apr', value: 200 },
                      { label: 'May', value: 250 },
                      { label: 'Jun', value: 180 },
                    ]
              }
              color="#8b5cf6"
            />
          </div>

          {/* System Level Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">System Level Controls</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm text-gray-700"
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Manage Settings</span>
              </button>
              <button
                onClick={() => navigate('/admin/chat')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm text-gray-700"
              >
                <FileEdit className="w-4 h-4 text-green-600" />
                <span className="font-medium">Content Moderation</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm text-gray-700">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span className="font-medium">View Audit Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
