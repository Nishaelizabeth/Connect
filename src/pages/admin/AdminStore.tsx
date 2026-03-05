import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  Tag,
  X,
  Star,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  type AdminProduct,
  type AdminCategory,
} from '@/api/admin.api';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  image: string;
  category_id: string;
  is_active: boolean;
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  image: '',
  category_id: '',
  is_active: true,
};

const AdminStore: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'categories'>('products');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts(search, catFilter, activeFilter);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, catFilter, activeFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      image: product.image,
      category_id: product.category_id ? String(product.category_id) : '',
      is_active: product.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        image: form.image.trim(),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        is_active: form.is_active,
      };
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
      } else {
        await createAdminProduct(payload);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await updateAdminProduct(product.id, { is_active: !product.is_active });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createAdminCategory({ name: newCatName.trim(), icon: newCatIcon.trim() });
      setNewCatName('');
      setNewCatIcon('');
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    try {
      await deleteAdminCategory(id);
      loadCategories();
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock_quantity, 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travel Store</h1>
        <p className="text-gray-500 text-sm">
          Manage products, categories, and inventory for the travel store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Products',
            value: totalProducts,
            icon: <Package className="w-5 h-5" />,
            color: 'from-blue-500 to-blue-600',
          },
          {
            label: 'Active Products',
            value: activeProducts,
            icon: <ToggleRight className="w-5 h-5" />,
            color: 'from-green-500 to-green-600',
          },
          {
            label: 'Out of Stock',
            value: outOfStock,
            icon: <Tag className="w-5 h-5" />,
            color: 'from-red-500 to-red-600',
          },
          {
            label: 'Inventory Value',
            value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            icon: <Star className="w-5 h-5" />,
            color: 'from-purple-500 to-purple-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit mb-4">
        {(['products', 'categories'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'products' ? 'Products' : 'Categories'}
          </button>
        ))}
      </div>

      {/* ─── Products Tab ─── */}
      {tab === 'products' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              onClick={openAddModal}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Price</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Stock</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Rating</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-900">{p.name}</span>
                              {p.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {p.category ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                              {p.category}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          ₹{p.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`font-medium ${
                              p.stock_quantity === 0
                                ? 'text-red-600'
                                : p.stock_quantity < 10
                                  ? 'text-amber-600'
                                  : 'text-gray-700'
                            }`}
                          >
                            {p.stock_quantity}
                          </span>
                          {p.stock_quantity === 0 && (
                            <span className="ml-1 text-xs text-red-500">Out</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-gray-700">{p.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleToggleActive(p)}>
                            {p.is_active ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <ToggleRight className="w-5 h-5" />
                                <span className="text-xs font-medium">Active</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400">
                                <ToggleLeft className="w-5 h-5" />
                                <span className="text-xs font-medium">Inactive</span>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Categories Tab ─── */}
      {tab === 'categories' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Icon name (optional)"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="max-w-[180px] px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Icon</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Products</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Created</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        No categories yet. Create one above.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-900">{c.name}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{c.icon || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                            {c.product_count}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Add/Edit Product Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active (visible in store)
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStore;
