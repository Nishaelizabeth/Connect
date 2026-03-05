import api from './axios';

// ─── Types ─────────────────────────────────────────────────────────
export interface AdminDashboardStats {
  total_users: number;
  total_trips: number;
  active_trips: number;
  cancelled_trips: number;
  total_revenue: number;
  pending_orders: number;
  trips_booked: number;
  trips_change_pct: number;
  users_per_month: { month: string; count: number }[];
  trip_timeline: { date: string; count: number }[];
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  auth_provider: string;
  trip_count: number;
}

export interface AdminTrip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  creator_email: string;
  creator_name: string;
  member_count: number;
}

export interface AdminOrder {
  id: number;
  user_email: string;
  user_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
}

export interface AdminChatRoom {
  id: number;
  trip_title: string;
  message_count: number;
  created_at: string;
}

export interface AdminMessage {
  id: number;
  room_id: number;
  sender_name: string;
  sender_email: string;
  content: string;
  message_type: string;
  is_system: boolean;
  created_at: string;
}

export interface AdminNotification {
  id: number;
  user_email: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image: string;
  category_id: number | null;
  category: string;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  icon: string;
  product_count: number;
  created_at: string;
}

export interface AdminBuddyRequest {
  id: number;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  status: string;
  created_at: string;
}

// ─── API Calls ─────────────────────────────────────────────────────
export const getAdminDashboard = async (days = 30): Promise<AdminDashboardStats> => {
  const res = await api.get<AdminDashboardStats>(`/admin-panel/dashboard/?days=${days}`);
  return res.data;
};

export const getAdminUsers = async (search = ''): Promise<AdminUser[]> => {
  const res = await api.get<AdminUser[]>(`/admin-panel/users/?search=${search}`);
  return res.data;
};

export const toggleUserBlock = async (userId: number, isActive: boolean) => {
  const res = await api.patch(`/admin-panel/users/${userId}/`, { is_active: isActive });
  return res.data;
};

export const getAdminTrips = async (search = '', status = ''): Promise<AdminTrip[]> => {
  const res = await api.get<AdminTrip[]>(`/admin-panel/trips/?search=${search}&status=${status}`);
  return res.data;
};

export const getAdminOrders = async (status = ''): Promise<AdminOrder[]> => {
  const res = await api.get<AdminOrder[]>(`/admin-panel/orders/?status=${status}`);
  return res.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const res = await api.patch('/admin-panel/orders/', { order_id: orderId, status });
  return res.data;
};

export const getAdminChatRooms = async (): Promise<AdminChatRoom[]> => {
  const res = await api.get<AdminChatRoom[]>('/admin-panel/chatrooms/');
  return res.data;
};

export const getAdminMessages = async (roomId?: number): Promise<AdminMessage[]> => {
  const url = roomId ? `/admin-panel/messages/?room_id=${roomId}` : '/admin-panel/messages/';
  const res = await api.get<AdminMessage[]>(url);
  return res.data;
};

export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
  const res = await api.get<AdminNotification[]>('/admin-panel/notifications/');
  return res.data;
};

export const getAdminProducts = async (
  search = '',
  category = '',
  isActive = ''
): Promise<AdminProduct[]> => {
  const res = await api.get<AdminProduct[]>(
    `/admin-panel/products/?search=${search}&category=${category}&is_active=${isActive}`
  );
  return res.data;
};

export const createAdminProduct = async (data: {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  image?: string;
  category_id?: number | null;
  is_active?: boolean;
}) => {
  const res = await api.post('/admin-panel/products/', data);
  return res.data;
};

export const updateAdminProduct = async (
  productId: number,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    image: string;
    category_id: number | null;
    is_active: boolean;
  }>
) => {
  const res = await api.patch(`/admin-panel/products/${productId}/`, data);
  return res.data;
};

export const deleteAdminProduct = async (productId: number) => {
  const res = await api.delete(`/admin-panel/products/${productId}/`);
  return res.data;
};

export const getAdminCategories = async (): Promise<AdminCategory[]> => {
  const res = await api.get<AdminCategory[]>('/admin-panel/categories/');
  return res.data;
};

export const createAdminCategory = async (data: { name: string; icon?: string }) => {
  const res = await api.post('/admin-panel/categories/', data);
  return res.data;
};

export const deleteAdminCategory = async (id: number) => {
  const res = await api.delete('/admin-panel/categories/', { data: { id } });
  return res.data;
};

export const getAdminBuddyRequests = async (): Promise<AdminBuddyRequest[]> => {
  const res = await api.get<AdminBuddyRequest[]>('/admin-panel/buddies/');
  return res.data;
};
