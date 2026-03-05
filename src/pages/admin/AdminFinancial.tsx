import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminOrders, getAdminProducts, type AdminOrder, type AdminProduct } from '@/api/admin.api';

const AdminFinancial: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordersData, productsData] = await Promise.all([
          getAdminOrders(),
          getAdminProducts(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total_amount, 0);
  const totalPending = orders.filter((o) => o.status === 'pending').reduce((sum, o) => sum + o.total_amount, 0);
  const totalCancelled = orders.filter((o) => o.status === 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Logs</h1>
        <p className="text-gray-500 text-sm">Revenue overview, products, and order financials from the store.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Revenue (Paid)</p>
          <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Cancelled / Refunded</p>
          <p className="text-2xl font-bold text-red-600">₹{totalCancelled.toLocaleString()}</p>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Store Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Stock</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Rating</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-gray-600">{p.category || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">₹{p.price.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-medium ${
                          p.stock_quantity < 5 ? 'text-red-600' : 'text-gray-700'
                        }`}
                      >
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">⭐ {p.rating.toFixed(1)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Order #</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 15).map((o) => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono text-gray-600">#{o.id}</td>
                  <td className="px-5 py-3 text-gray-700">{o.user_name || o.user_email}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">₹{o.total_amount.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        o.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : o.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFinancial;
