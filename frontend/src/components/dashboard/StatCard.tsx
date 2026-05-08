import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard — KPI metric card with icon, value, and trend indicator.
 * @param title - Card label
 * @param value - Metric value (string or number)
 * @param change - % change (positive = up, negative = down, 0 = neutral)
 * @param icon - Lucide React icon node
 * @param color - Accent color class ('teal' | 'amber' | 'red' | 'blue')
 * @param isLoading - Show skeleton state
 */
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  color?: 'teal' | 'amber' | 'red' | 'blue';
  isLoading?: boolean;
}

const colorMap = {
  teal:  { bg: 'bg-primary/10', icon: 'text-primary', border: 'border-primary/20' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
  red:   { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20' },
  blue:  { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
};

export default function StatCard({ title, value, change, icon, color = 'teal', isLoading = false }: StatCardProps) {
  const c = colorMap[color];

  if (isLoading) {
    return (
      <div className="card animate-fade-in">
        <div className="skeleton h-10 w-10 rounded-lg mb-4" />
        <div className="skeleton h-4 w-24 mb-2" />
        <div className="skeleton h-8 w-16" />
      </div>
    );
  }

  const TrendIcon = change === undefined || change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown;
  const trendColor = change === undefined || change === 0 ? 'text-slate-500' : change > 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="card animate-fade-in group">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
        <span className={c.icon}>{icon}</span>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>

      {/* Value + Trend */}
      <div className="flex items-end justify-between gap-2">
        <span className="font-heading text-3xl font-bold text-slate-100">{value}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor} mb-1`}>
            <TrendIcon size={13} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
