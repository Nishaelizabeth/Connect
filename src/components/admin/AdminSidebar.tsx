import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Map,
  CreditCard,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
  { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
  { id: 'trips', label: 'Trip Monitoring', icon: <Map className="w-5 h-5" />, path: '/admin/trips' },
  { id: 'store', label: 'Travel Store', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/store' },
  { id: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    const match = navItems.find((item) => item.path !== '/admin' && path.startsWith(item.path));
    return match?.id || 'dashboard';
  };

  const activeId = getActiveId();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#1e293b] flex flex-col z-50">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Travel Buddy</h1>
          <span className="text-slate-400 text-xs">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
                  activeId === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/auth');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
