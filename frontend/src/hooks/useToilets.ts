import { useCallback, useEffect, useState } from 'react';
import type { Toilet, ToiletFilters } from '@/types';
import { getNearbyToilets, getToilets } from '@/services/toiletService';
import { DEFAULT_RADIUS_METERS } from '@/utils/constants';

/**
 * Hook to fetch and filter toilet data.
 * @param lat - User latitude (optional for nearby search)
 * @param lng - User longitude (optional for nearby search)
 * @returns toilets, isLoading, error, and refetch function
 */
export function useToilets(lat?: number | null, lng?: number | null) {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToilets = useCallback(async (filters?: Partial<ToiletFilters>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (lat && lng) {
        const data = await getNearbyToilets(lat, lng, DEFAULT_RADIUS_METERS, filters);
        setToilets(data);
      } else {
        const data = await getToilets();
        setToilets(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load toilets');
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => { void fetchToilets(); }, [fetchToilets]);

  return { toilets, isLoading, error, refetch: fetchToilets };
}
