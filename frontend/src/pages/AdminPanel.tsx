import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, MapPin, Ticket, Settings, BarChart3, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { getAdminStats } from '@/services/analyticsService';
import { formatDate } from '@/utils/formatters';
import { PAGE_SIZE } from '@/utils/constants';
import type { User, Toilet, MaintenanceTicket, AdminStats, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

type AdminTab = 'overview' | 'users' | 'toilets' | 'tickets' | 'settings';

const TICKET_STATUS_COLS: MaintenanceTicket['status'][] = ['open', 'in-progress', 'resolved'];
const STATUS_BADGE: Record<string, 'red' | 'amber' | 'green'> = { open: 'red', 'in-progress': 'amber', resolved: 'green' };

/**
 * AdminPanel — Protected admin-only page with tabbed interface.
 * Tabs: Overview | Users | Toilets | Tickets (Kanban) | Settings
 */
export default function AdminPanel() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'user' | 'toilet' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    setIsLoading(true);
    Promise.all([
      getAdminStats(),
      api.get<ApiResponse<{ data: User[] }>>(`/admin/users?page=${page}&search=${search}`),
      api.get<ApiResponse<{ data: Toilet[] }>>(`/toilets?page=${page}`),
      api.get<ApiResponse<{ data: MaintenanceTicket[] }>>('/admin/tickets'),
    ]).then(([s, u, t, tk]) => {
      setStats(s);
      setUsers((u.data.data as unknown as { data: User[] }).data ?? []);
      setToilets((t.data.data as unknown as { data: Toilet[] }).data ?? []);
      setTickets((tk.data.data as unknown as { data: MaintenanceTicket[] }).data ?? []);
    }).finally(() => setIsLoading(false));
  }, [authLoading, page, search]);

  if (!authLoading && !isAdmin) return <Navigate to="/dashboard" replace />;

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    try { await api.put(`/admin/users/${userId}/role`, { role }); toast.success('Role updated'); fetchData(); }
    catch { toast.error('Failed to update role'); }
  };

  const fetchData = () => {
    api.get<ApiResponse<{ data: User[] }>>(`/admin/users?page=${page}&search=${search}`)
      .then(u => setUsers((u.data.data as unknown as { data: User[] }).data ?? []));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/${deleteTarget.type === 'user' ? 'users' : '../toilets'}/${deleteTarget.id}`);
      toast.success('Deleted successfully');
      setDeleteTarget(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const moveTicket = async (ticketId: string, status: MaintenanceTicket['status']) => {
    try {
      await api.put(`/admin/tickets/${ticketId}`, { status });
      setTickets(ts => ts.map(t => t._id === ticketId ? { ...t, status } : t));
    } catch { toast.error('Failed to update ticket'); }
  };

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { key: 'users', label: 'Users', icon: <Users size={15} /> },
    { key: 'toilets', label: 'Toilets', icon: <MapPin size={15} /> },
    { key: 'tickets', label: 'Tickets', icon: <Ticket size={15} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Admin Panel" />
      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <nav className="w-48 shrink-0 border-r border-surface-highest bg-surface p-3 space-y-1">
          {TABS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full ${tab === key ? 'nav-item-active' : 'nav-item'}`}>
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Toilets" value={stats?.totalToilets ?? 0} icon={<MapPin size={20} />} color="teal" isLoading={isLoading} />
                <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<Users size={20} />} color="blue" isLoading={isLoading} />
                <StatCard title="Avg Score" value={stats ? `${stats.avgHygieneScore.toFixed(1)}` : '—'} icon={<span>🛡️</span>} color="teal" isLoading={isLoading} />
                <StatCard title="Open Tickets" value={stats?.openTickets ?? 0} icon={<Ticket size={20} />} color="amber" isLoading={isLoading} />
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-highest">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-surface-highest">
                    <tr>{['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{u.name.charAt(0)}</div>
                            <span className="font-medium text-slate-200">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-slate-400">{u.email}</td>
                        <td className="table-cell">
                          <select className="bg-surface-high border border-surface-highest rounded-lg px-2 py-1 text-xs text-slate-300"
                            value={u.role} onChange={e => void handleRoleChange(u._id, e.target.value as 'user' | 'admin')}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="table-cell text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="table-cell">
                          <button onClick={() => setDeleteTarget({ id: u._id, type: 'user' })} className="btn-ghost p-1.5 text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center px-5 py-3 border-t border-surface-highest text-sm text-slate-500">
                <span>Page {page}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-2 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /></button>
                  <button onClick={() => setPage(p => p + 1)} className="btn-ghost px-2 py-1 text-xs"><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>
          )}

          {/* TOILETS */}
          {tab === 'toilets' && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-highest flex justify-between items-center">
                <h3 className="font-heading font-semibold text-slate-100">All Facilities</h3>
                <Button><span className="text-xs">+ Add Toilet</span></Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-surface-highest">
                    <tr>{['Name', 'Type', 'Score', 'Status', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {toilets.map(t => (
                      <tr key={t._id} className="table-row">
                        <td className="table-cell font-medium text-slate-200">{t.name}</td>
                        <td className="table-cell"><Badge variant="gray">{t.type}</Badge></td>
                        <td className="table-cell font-semibold" style={{ color: t.hygieneScore >= 75 ? '#14b8a6' : t.hygieneScore >= 50 ? '#fbbf24' : '#ef4444' }}>{t.hygieneScore}/100</td>
                        <td className="table-cell"><Badge variant={t.isOpen ? 'green' : 'red'}>{t.isOpen ? 'Open' : 'Closed'}</Badge></td>
                        <td className="table-cell">
                          <div className="flex gap-1">
                            <button className="btn-ghost p-1.5"><Pencil size={13} /></button>
                            <button onClick={() => setDeleteTarget({ id: t._id, type: 'toilet' })} className="btn-ghost p-1.5 text-red-400"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TICKETS — Kanban */}
          {tab === 'tickets' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TICKET_STATUS_COLS.map(col => (
                <div key={col} className="card space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-highest pb-3">
                    <h3 className="font-heading font-semibold text-slate-200 capitalize text-sm">{col}</h3>
                    <Badge variant={STATUS_BADGE[col]}>{tickets.filter(t => t.status === col).length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {tickets.filter(t => t.status === col).map(ticket => (
                      <div key={ticket._id} className="p-3 rounded-lg bg-surface-high border border-surface-highest space-y-2">
                        <p className="text-sm text-slate-200 font-medium">{ticket.issue}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={{ low: 'blue', medium: 'amber', high: 'red', critical: 'red' }[ticket.severity] as 'blue' | 'amber' | 'red'}>{ticket.severity}</Badge>
                          <div className="flex gap-1">
                            {TICKET_STATUS_COLS.filter(s => s !== col).map(s => (
                              <button key={s} onClick={() => void moveTicket(ticket._id, s)}
                                className="text-xs text-slate-500 hover:text-primary transition-colors px-1">→ {s}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="card max-w-lg space-y-4">
              <h3 className="font-heading font-semibold text-slate-100">Platform Settings</h3>
              <p className="text-sm text-slate-400">Settings panel coming soon. Configure API keys, notification preferences, and data retention policies here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" size="sm">
        <p className="text-slate-300 text-sm mb-4">This action cannot be undone. Are you sure?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => void handleDelete()}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
