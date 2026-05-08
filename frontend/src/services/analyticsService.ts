import api from './api';
import type { AdminStats, ExpenseSummary, ApiResponse } from '@/types';

/**
 * Fetches admin-level system stats.
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns AdminStats object
 */
export async function getAdminStats(startDate?: string, endDate?: string): Promise<AdminStats> {
  const res = await api.get<ApiResponse<AdminStats>>('/admin/stats', {
    params: { startDate, endDate },
  });
  return res.data.data!;
}

/**
 * Fetches expense summary data for charts.
 * @returns ExpenseSummary with monthly breakdown
 */
export async function getExpenseSummary(): Promise<ExpenseSummary> {
  const res = await api.get<ApiResponse<ExpenseSummary>>('/expenses/summary');
  return res.data.data!;
}
