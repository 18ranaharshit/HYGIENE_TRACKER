import api from './api';
import type { Toilet, ToiletFilters, PaginatedResponse, ApiResponse } from '@/types';

/**
 * Fetches nearby toilets based on user location and filters.
 * @param lat - User latitude
 * @param lng - User longitude
 * @param radius - Search radius in meters
 * @param filters - Active filter state
 * @returns Array of Toilet objects sorted by distance
 */
export async function getNearbyToilets(
  lat: number,
  lng: number,
  radius: number,
  filters?: Partial<ToiletFilters>,
): Promise<Toilet[]> {
  const params: Record<string, unknown> = { lat, lng, radius, ...filters };
  const res = await api.get<ApiResponse<Toilet[]>>('/toilets/nearby', { params });
  return res.data.data ?? [];
}

/**
 * Fetches a paginated list of all toilets.
 * @param page - Page number
 * @param type - Optional toilet type filter
 * @returns Paginated toilet response
 */
export async function getToilets(page = 1, type?: string): Promise<PaginatedResponse<Toilet>> {
  const res = await api.get<ApiResponse<PaginatedResponse<Toilet>>>('/toilets', {
    params: { page, type },
  });
  return res.data.data!;
}

/**
 * Fetches a single toilet by ID with aggregated ratings.
 * @param id - Toilet document ID
 * @returns Toilet object with avgRating and ratingCount
 */
export async function getToiletById(id: string): Promise<Toilet> {
  const res = await api.get<ApiResponse<Toilet>>(`/toilets/${id}`);
  return res.data.data!;
}

/**
 * Creates a new toilet entry.
 * @param data - Partial Toilet data
 * @returns Created Toilet object
 */
export async function createToilet(data: Partial<Toilet>): Promise<Toilet> {
  const res = await api.post<ApiResponse<Toilet>>('/toilets', data);
  return res.data.data!;
}

/**
 * Updates an existing toilet.
 * @param id - Toilet ID
 * @param data - Update payload
 * @returns Updated Toilet object
 */
export async function updateToilet(id: string, data: Partial<Toilet>): Promise<Toilet> {
  const res = await api.put<ApiResponse<Toilet>>(`/toilets/${id}`, data);
  return res.data.data!;
}

/**
 * Deletes a toilet (admin only).
 * @param id - Toilet ID
 */
export async function deleteToilet(id: string): Promise<void> {
  await api.delete(`/toilets/${id}`);
}
