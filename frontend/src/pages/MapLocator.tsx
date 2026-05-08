import { useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Accessibility, Droplets, Filter, Navigation } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToilets } from '@/hooks/useToilets';
import { formatDistance } from '@/utils/formatters';
import { GOOGLE_MAPS_KEY, DEFAULT_MAP_CENTER, HYGIENE_SCORE } from '@/utils/constants';
import type { Toilet, ToiletFilters } from '@/types';

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#0b1326' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#bbcac6' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1326' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#171f33' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060e20' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
};

/** Returns marker color based on hygiene score */
function markerColor(score: number): string {
  if (score >= HYGIENE_SCORE.GOOD) return '#14b8a6';
  if (score >= HYGIENE_SCORE.FAIR) return '#fbbf24';
  return '#ef4444';
}

/**
 * MapLocator — Full-screen Google Map with toilet sidebar, filters, and InfoWindow.
 * Uses live geolocation and fetches nearby toilets from the API.
 */
export default function MapLocator() {
  const { lat, lng } = useGeolocation();
  const { toilets, isLoading } = useToilets(lat, lng);
  const [selected, setSelected] = useState<Toilet | null>(null);
  const [filters, setFilters] = useState<ToiletFilters>({
    openOnly: false,
    paidOnly: false,
    wheelchair: false,
    maxDistance: 2000,
  });
  const sidebarRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const center = lat && lng ? { lat, lng } : DEFAULT_MAP_CENTER;

  /** Filter toilets based on active filter state */
  const filtered = toilets.filter(t => {
    if (filters.openOnly && !t.isOpen) return false;
    if (filters.paidOnly && t.type !== 'paid') return false;
    if (filters.wheelchair && !t.amenities.includes('wheelchair')) return false;
    return true;
  });

  const handleMarkerClick = useCallback((toilet: Toilet) => {
    setSelected(toilet);
    sidebarRefs.current.get(toilet._id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const openDirections = (toilet: Toilet) => {
    const [lng2, lat2] = toilet.location.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat2},${lng2}`, '_blank');
  };

  const toggleFilter = (key: keyof ToiletFilters) => {
    setFilters(f => ({ ...f, [key]: !f[key] }));
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Map Locator" />
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-80 shrink-0 flex flex-col border-r border-surface-highest bg-surface overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 border-b border-surface-highest space-y-2">
            <div className="flex items-center gap-1 flex-wrap">
              <Filter size={14} className="text-slate-500" />
              {(['openOnly', 'paidOnly', 'wheelchair'] as const).map(key => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filters[key]
                      ? 'bg-primary text-slate-900 border-primary'
                      : 'border-surface-highest text-slate-400 hover:border-primary/50'
                  }`}
                >
                  {key === 'openOnly' ? 'Open Only' : key === 'paidOnly' ? 'Paid' : '♿ Wheelchair'}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">{filtered.length} facilities found</p>
          </div>

          {/* Toilet List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading && (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            )}
            {!isLoading && filtered.map(toilet => {
              const [tLng, tLat] = toilet.location.coordinates;
              const dist = lat && lng ? Math.round(Math.sqrt((lat - tLat) ** 2 + (lng - tLng) ** 2) * 111139) : null;
              const isActive = selected?._id === toilet._id;

              return (
                <div
                  key={toilet._id}
                  ref={el => { if (el) sidebarRefs.current.set(toilet._id, el); }}
                  onClick={() => setSelected(isActive ? null : toilet)}
                  className={`card-hover transition-all ${isActive ? 'border-primary shadow-glow' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-100 leading-tight">{toilet.name}</h3>
                    <Badge variant={toilet.isOpen ? 'green' : 'red'}>
                      {toilet.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 truncate">{toilet.address}</p>
                  <div className="flex items-center justify-between">
                    <StarRating value={Math.round(toilet.avgRating ?? toilet.hygieneScore / 20)} readOnly size={13} />
                    <div className="flex items-center gap-2">
                      {toilet.amenities.includes('wheelchair') && (
                        <Accessibility size={13} className="text-blue-400" />
                      )}
                      {toilet.amenities.includes('soap') && (
                        <Droplets size={13} className="text-primary" />
                      )}
                      {dist !== null && (
                        <span className="text-xs text-slate-400">{formatDistance(dist)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openDirections(toilet); }}
                    className="mt-2 w-full btn-secondary text-xs py-1.5"
                  >
                    <Navigation size={13} /> Directions
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full bg-bg">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={14}
              options={MAP_OPTIONS}
            >
              {/* User marker */}
              {lat && lng && (
                <Marker
                  position={{ lat, lng }}
                  icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#14b8a6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }}
                />
              )}

              {/* Toilet markers */}
              {filtered.map(t => {
                const [tLng, tLat] = t.location.coordinates;
                return (
                  <Marker
                    key={t._id}
                    position={{ lat: tLat, lng: tLng }}
                    icon={{ path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 7, fillColor: markerColor(t.hygieneScore), fillOpacity: 1, strokeColor: '#0b1326', strokeWeight: 2 }}
                    onClick={() => handleMarkerClick(t)}
                  />
                );
              })}

              {/* InfoWindow */}
              {selected && (() => {
                const [sLng, sLat] = selected.location.coordinates;
                return (
                  <InfoWindow position={{ lat: sLat, lng: sLng }} onCloseClick={() => setSelected(null)}>
                    <div className="text-slate-900 min-w-[180px]">
                      <p className="font-bold text-sm">{selected.name}</p>
                      <p className="text-xs text-gray-600">{selected.address}</p>
                      <p className="text-xs mt-1">Score: <strong>{selected.hygieneScore}/100</strong></p>
                      <p className="text-xs">{selected.isOpen ? '✅ Open' : '🔴 Closed'}</p>
                    </div>
                  </InfoWindow>
                );
              })()}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
