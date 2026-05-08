import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar — Top bar with search, notifications, and theme toggle.
 * @param title - Current page title to display
 */
interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = 'Dashboard' }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-surface-highest bg-surface/80 backdrop-blur-sm shrink-0">
      {/* Page Title */}
      <h1 className="font-heading text-xl font-semibold text-slate-100">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg border border-surface-highest text-slate-500 text-sm w-52">
          <Search size={14} className="shrink-0" />
          <input
            type="search"
            placeholder="Search..."
            className="bg-transparent outline-none text-slate-300 placeholder:text-slate-500 w-full text-sm"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative btn-ghost p-2"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-surface" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Avatar */}
        {user && (
          <div
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm cursor-pointer"
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
