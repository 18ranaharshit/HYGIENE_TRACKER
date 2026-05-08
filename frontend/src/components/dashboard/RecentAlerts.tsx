import { AlertTriangle, Clock } from 'lucide-react';
import type { MaintenanceTicket } from '@/types';
import { formatDate } from '@/utils/formatters';
import { SEVERITY_COLORS } from '@/utils/constants';
import Badge from '@/components/ui/Badge';

/**
 * RecentAlerts — List of recent maintenance tickets as an activity feed.
 * @param tickets - Array of MaintenanceTicket objects
 * @param isLoading - Show skeleton if true
 */
interface RecentAlertsProps {
  tickets: MaintenanceTicket[];
  isLoading?: boolean;
}

const severityVariant: Record<string, 'red' | 'amber' | 'blue' | 'green'> = {
  critical: 'red',
  high: 'red',
  medium: 'amber',
  low: 'blue',
};

export default function RecentAlerts({ tickets, isLoading = false }: RecentAlertsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
        <AlertTriangle size={32} className="mb-2 opacity-30" />
        <p className="text-sm">No recent alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map(ticket => (
        <div key={ticket._id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-high border border-surface-highest hover:border-surface-bright transition-colors">
          <div
            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
            style={{ backgroundColor: SEVERITY_COLORS[ticket.severity] }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{ticket.issue}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={severityVariant[ticket.severity]}>{ticket.severity}</Badge>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={10} />
                {formatDate(ticket.createdAt, 'relative')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
