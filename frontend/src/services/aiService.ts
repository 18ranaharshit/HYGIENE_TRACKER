import api from './api';
import type { AIReport, ApiResponse } from '@/types';

/**
 * Runs AI hygiene analysis for a toilet.
 * @param toiletId - Toilet document ID
 * @param photoBase64 - Optional base64-encoded photo string
 * @returns AIReport with score, issues, recommendations, and riskLevel
 */
export async function analyzeHygiene(toiletId: string, photoBase64?: string): Promise<AIReport> {
  const res = await api.post<ApiResponse<AIReport>>('/ai/analyze', {
    toiletId,
    photo: photoBase64,
  });
  return res.data.data!;
}

/**
 * Fetches the latest AI hygiene report for a toilet.
 * @param toiletId - Toilet document ID
 * @returns Latest AIReport or null
 */
export async function getLatestReport(toiletId: string): Promise<AIReport | null> {
  try {
    const res = await api.get<ApiResponse<AIReport>>(`/ai/report/${toiletId}`);
    return res.data.data ?? null;
  } catch {
    return null;
  }
}
