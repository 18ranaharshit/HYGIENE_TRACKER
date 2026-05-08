import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertTriangle, Users, Plus, Map, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/ui/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import HygieneScoreWidget from '@/components/dashboard/HygieneScoreWidget';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import Button from '@/components/ui/Button';
import { getAdminStats } from '@/services/analyticsService';
import api from '@/services/api';
import type { AdminStats, MaintenanceTicket, ApiResponse } from '@/types';
import { CHART_COLORS } from '@/utils/constants';

const DONUT_DATA = [
  { name: 'Good (75+)', value: 45 },
  { name: 'Fair (50-74)', value: 30 },
  { name: 'Poor (<50)', value: 25 },
];

/**
 * Dashboard — Main overview page with KPI cards, hygiene chart, and recent alerts.
 * Fetches data from /api/admin/stats and /api/admin/tickets on mount.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      api.get<ApiResponse<{ data: MaintenanceTicket[] }>>('/admin/tickets?limit=5'),
    ])
      .then(([s, t]) => {
        setStats(s);
        setTickets((t.data.data as unknown as { data: MaintenanceTicket[] }).data ?? []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-400 text-sm">Welcome back! Here's your sanitation overview.</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/map')} variant="secondary">
              <Map size={15} /> View Map
            </Button>
            <Button onClick={() => navigate('/analysis')} variant="secondary">
              <Brain size={15} /> AI Analysis
            </Button>
            <Button onClick={() => navigate('/map')}>
              <Plus size={15} /> Add Toilet
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Toilets"
            value={stats?.totalToilets ?? 0}
            change={8}
            icon={<MapPin size={20} />}
            color="teal"
            isLoading={isLoading}
          />
          <StatCard
            title="Avg Hygiene Score"
            value={stats ? `${stats.avgHygieneScore.toFixed(1)}` : '—'}
            change={3}
            icon={<ShieldCheck size={20} />}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Open Tickets"
            value={stats?.openTickets ?? 0}
            change={-12}
            icon={<AlertTriangle size={20} />}
            color="amber"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Users"
            value={stats?.totalUsers ?? 0}
            change={5}
            icon={<Users size={20} />}
            color="teal"
            isLoading={isLoading}
          />
        </div>

        {/* Main Content: Chart + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hygiene Overview */}
          <div className="lg:col-span-2 card space-y-4">
            <div className="flex items-center justify-between border-b border-surface-highest pb-3">
              <h2 className="font-heading font-semibold text-slate-100">Hygiene Score Overview</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <HygieneScoreWidget score={stats?.avgHygieneScore ?? 78} />
              <div className="flex-1 w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {DONUT_DATA.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#171f33', border: '1px solid #2d3449', borderRadius: '8px', color: '#dae2fd' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 shrink-0">
                {DONUT_DATA.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-slate-400">{d.name}</span>
                    <span className="ml-auto font-semibold text-slate-200">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-surface-highest pb-3">
              <h2 className="font-heading font-semibold text-slate-100">Recent Alerts</h2>
              <button onClick={() => navigate('/admin')} className="text-xs text-primary hover:underline">View all</button>
            </div>
            <RecentAlerts tickets={tickets} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
