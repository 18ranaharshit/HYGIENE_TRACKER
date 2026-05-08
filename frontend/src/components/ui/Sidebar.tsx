import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Brain, Receipt, ShieldCheck,
  Star, BarChart3, LogOut, Droplets, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

/** Nav link definition */
interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Map Locator', to: '/map', icon: <Map size={18} /> },
  { label: 'AI Analysis', to: '/analysis', icon: <Brain size={18} /> },
  { label: 'Expenses', to: '/expenses', icon: <Receipt size={18} />, adminOnly: true },
  { label: 'Rate a Toilet', to: '/rate', icon: <Star size={18} /> },
  { label: 'Analytics', to: '/analytics', icon: <BarChart3 size={18} />, adminOnly: true },
  { label: 'Admin Panel', to: '/admin', icon: <ShieldCheck size={18} />, adminOnly: true },
];

/**
 * Sidebar — Collapsible navigation sidebar for CleanRoute.
 * Shows all routes; admin-only items hidden for regular users.
 */
export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={`flex flex-col h-screen bg-surface border-r border-surface-highest transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-highest ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Droplets size={16} className="text-slate-900" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-gradient">CleanRoute</span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleItems.map(item => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={active ? 'nav-item-active' : 'nav-item'}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme + User + Collapse */}
      <div className="border-t border-surface-highest p-3 space-y-3">
        {!collapsed && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">Theme</span>
            <ThemeToggle />
          </div>
        )}

        {/* User info */}
        {user && !collapsed && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => void logout()}
          title="Logout"
          className="btn-ghost w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="btn-ghost w-full justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
