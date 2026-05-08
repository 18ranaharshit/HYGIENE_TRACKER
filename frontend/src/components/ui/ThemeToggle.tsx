import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

/**
 * ThemeToggle — Pill-shaped sun/moon toggle in top-right navbar area.
 * Smoothly animates between dark and light mode.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-14 h-7 rounded-full border border-surface-highest bg-surface-high transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <Sun size={12} className="absolute left-1.5 text-amber-400" />
      <Moon size={12} className="absolute right-1.5 text-primary" />
      {/* Thumb */}
      <span
        className={`absolute w-5 h-5 rounded-full bg-primary shadow-glow transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
