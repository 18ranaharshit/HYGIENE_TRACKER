import { useEffect, useState } from 'react';
import { Plus, Download, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/dashboard/StatCard';
import api from '@/services/api';
import { formatCurrency, formatDate, toCSV, downloadCSV } from '@/utils/formatters';
import { EXPENSE_CATEGORY_COLORS, CHART_COLORS, PAGE_SIZE } from '@/utils/constants';
import type { Expense, ExpenseSummary, ApiResponse, ExpenseFormData } from '@/types';
import toast from 'react-hot-toast';

const CATEGORY_BADGE: Record<string, 'green' | 'red' | 'blue' | 'amber'> = {
  cleaning: 'green', repair: 'red', supplies: 'blue', inspection: 'amber',
};

/**
 * ExpenseTracker — CRUD table for expenses with monthly bar chart and CSV export.
 * Admin-only page. Fetches from /api/expenses and /api/expenses/summary.
 */
export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState<ExpenseFormData>({ toiletId: '', category: 'cleaning', amount: 0, description: '', date: new Date().toISOString().split('T')[0] });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.get<ApiResponse<{ data: Expense[] }>>(`/expenses?page=${page}&category=${filterCat}`),
      api.get<ApiResponse<ExpenseSummary>>('/expenses/summary'),
    ]).then(([e, s]) => {
      setExpenses((e.data.data as unknown as { data: Expense[] }).data ?? []);
      setSummary(s.data.data ?? null);
    }).finally(() => setIsLoading(false));
  };

  useEffect(fetchData, [page, filterCat]);

  const handleSubmit = async () => {
    try {
      await api.post('/expenses', form);
      toast.success('Expense added!');
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to add expense'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/expenses/${deleteId}`);
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExport = () => {
    const csv = toCSV(expenses.map(e => ({
      date: formatDate(e.date),
      description: e.description,
      category: e.category,
      amount: e.amount,
      currency: e.currency,
    })));
    downloadCSV(csv, 'cleanroute-expenses');
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Expense Tracker" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total This Month" value={formatCurrency(summary?.totalThisMonth ?? 0)} icon={<span>₹</span>} color="teal" isLoading={isLoading} />
          <StatCard title="Pending Repairs" value={formatCurrency(summary?.pendingRepairs ?? 0)} icon={<span>🔧</span>} color="red" isLoading={isLoading} />
          <StatCard title="Avg Per Toilet" value={formatCurrency(summary?.avgPerToilet ?? 0)} icon={<span>🚽</span>} color="amber" isLoading={isLoading} />
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="xl:col-span-1 card space-y-3">
            <h3 className="font-heading font-semibold text-slate-100 text-sm">Monthly Breakdown</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary?.byMonth ?? []}>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#171f33', border: '1px solid #2d3449', borderRadius: '8px', color: '#dae2fd' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {(['cleaning', 'repair', 'supplies', 'inspection'] as const).map((cat, i) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={CHART_COLORS[i]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="xl:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-highest">
              <div className="flex gap-2 flex-wrap">
                {['', 'cleaning', 'repair', 'supplies', 'inspection'].map(cat => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${filterCat === cat ? 'bg-primary text-slate-900 border-primary' : 'border-surface-highest text-slate-400'}`}>
                    {cat || 'All'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleExport}><Download size={14} /> Export</Button>
                <Button onClick={() => setShowModal(true)}><Plus size={14} /> Add</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-surface-highest">
                  <tr>
                    {['Date', 'Description', 'Category', 'Amount', 'Actions'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, i) => (
                      <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
                    ))
                  ) : expenses.map(exp => (
                    <tr key={exp._id} className="table-row">
                      <td className="table-cell text-slate-400">{formatDate(exp.date)}</td>
                      <td className="table-cell">{exp.description}</td>
                      <td className="table-cell"><Badge variant={CATEGORY_BADGE[exp.category]}>{exp.category}</Badge></td>
                      <td className="table-cell font-semibold" style={{ color: EXPENSE_CATEGORY_COLORS[exp.category] }}>{formatCurrency(exp.amount)}</td>
                      <td className="table-cell">
                        <button onClick={() => setDeleteId(exp._id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-highest text-sm text-slate-500">
              <span>Page {page}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-2 py-1 text-xs disabled:opacity-40">Prev</button>
                <button onClick={() => setPage(p => p + 1)} className="btn-ghost px-2 py-1 text-xs">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense" size="md">
          <div className="space-y-4">
            {[
              { label: 'Description', key: 'description', type: 'text' },
              { label: 'Amount (INR)', key: 'amount', type: 'number' },
              { label: 'Date', key: 'date', type: 'date' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} className="input" value={String(form[key as keyof ExpenseFormData] ?? '')}
                  onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? +e.target.value : e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseFormData['category'] }))}>
                {['cleaning', 'repair', 'supplies', 'inspection'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => void handleSubmit()}>Save Expense</Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirm */}
        <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
          <p className="text-slate-300 text-sm mb-4">Are you sure you want to delete this expense? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => void handleDelete()}>Delete</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
