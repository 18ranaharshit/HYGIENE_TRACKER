import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/ui/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import { getAdminStats } from '@/services/analyticsService';
import { CHART_COLORS } from '@/utils/constants';
import type { AdminStats } from '@/types';

const MOCK_TREND = [
  { month: 'Jan', north: 72, south: 68, east: 80 },
  { month: 'Feb', north: 75, south: 70, east: 82 },
  { month: 'Mar', north: 78, south: 74, east: 79 },
  { month: 'Apr', north: 80, south: 76, east: 83 },
  { month: 'May', north: 82, south: 78, east: 85 },
  { month: 'Jun', north: 85, south: 80, east: 87 },
];

const TOP_TOILETS = [
  { name: 'Cubbon Park Block A', score: 92 },
  { name: 'Lalbagh Entrance', score: 89 },
  { name: 'MG Road Metro Exit', score: 87 },
  { name: 'Ulsoor Lake East', score: 85 },
  { name: 'Brigade Road Public', score: 83 },
];

const ISSUE_CATEGORIES = [
  { name: 'Cleanliness', value: 38 },
  { name: 'Broken Fixtures', value: 25 },
  { name: 'No Supplies', value: 22 },
  { name: 'Poor Lighting', value: 15 },
];

/**
 * Analytics — Charts dashboard with hygiene trends, top toilets,
 * issue breakdown, and date-range-filtered KPI cards.
 */
export default function Analytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setIsLoading(true);
    getAdminStats(startDate, endDate).then(setStats).finally(() => setIsLoading(false));
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Analytics" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Date Range Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading font-semibold text-slate-200">Platform Overview</h2>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">From</label>
            <input type="date" className="input py-1.5 text-sm w-36" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <label className="text-xs text-slate-400">To</label>
            <input type="date" className="input py-1.5 text-sm w-36" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Toilets" value={stats?.totalToilets ?? 0} change={8} icon={<span>🚽</span>} color="teal" isLoading={isLoading} />
          <StatCard title="Avg Hygiene" value={stats ? `${stats.avgHygieneScore.toFixed(1)}` : '—'} change={3} icon={<span>🛡️</span>} color="blue" isLoading={isLoading} />
          <StatCard title="Tickets Resolved" value={stats?.resolvedThisMonth ?? 0} change={15} icon={<span>✅</span>} color="teal" isLoading={isLoading} />
          <StatCard title="New Toilets" value={stats?.newToiletsThisMonth ?? 0} change={-2} icon={<span>📍</span>} color="amber" isLoading={isLoading} />
        </div>

        {/* Row 2: Line + Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-heading font-semibold text-slate-100 text-sm">Hygiene Score Trend by Zone</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TREND}>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#171f33', border: '1px solid #2d3449', borderRadius: '8px', color: '#dae2fd' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="north" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} name="North Zone" />
                  <Line type="monotone" dataKey="south" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} name="South Zone" />
                  <Line type="monotone" dataKey="east" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} name="East Zone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-heading font-semibold text-slate-100 text-sm">Top 5 Rated Facilities</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_TOILETS} layout="vertical">
                  <XAxis type="number" domain={[70, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#bbcac6', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#171f33', border: '1px solid #2d3449', borderRadius: '8px', color: '#dae2fd' }} />
                  <Bar dataKey="score" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-heading font-semibold text-slate-100 text-sm">Issue Category Breakdown</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ISSUE_CATEGORIES} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {ISSUE_CATEGORIES.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#171f33', border: '1px solid #2d3449', borderRadius: '8px', color: '#dae2fd' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-heading font-semibold text-slate-100 text-sm">Zone Summary</h3>
            <div className="space-y-3">
              {[['North Zone', 85, 'teal'], ['South Zone', 78, 'amber'], ['East Zone', 87, 'blue'], ['West Zone', 72, 'red']].map(([zone, score, color]) => (
                <div key={zone as string} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{zone}</span>
                    <span className="font-semibold text-slate-200">{score}/100</span>
                  </div>
                  <div className="w-full h-2 bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${score}%`, backgroundColor: color === 'teal' ? '#14b8a6' : color === 'amber' ? '#fbbf24' : color === 'blue' ? '#3b82f6' : '#ef4444' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
