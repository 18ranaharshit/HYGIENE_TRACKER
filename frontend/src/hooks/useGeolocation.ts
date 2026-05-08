import { useEffect, useState } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook that tracks the user's live geolocation using watchPosition.
 * @returns Current lat, lng, error, and loading state
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: null, lng: null, error: null, isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported', isLoading: false }));
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      pos => setState({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        error: null,
        isLoading: false,
      }),
      err => setState(s => ({ ...s, error: err.message, isLoading: false })),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
