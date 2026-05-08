// ─── CleanRoute App Constants ───────────────────────────────────────────────

/** API base URL from environment */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Google Maps API key */
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';

/** JWT storage key in localStorage */
export const TOKEN_KEY = 'cleanroute_token';

/** User storage key in localStorage */
export const USER_KEY = 'cleanroute_user';

/** Default map center — Bengaluru, India */
export const DEFAULT_MAP_CENTER = { lat: 12.9716, lng: 77.5946 };

/** Default search radius in meters */
export const DEFAULT_RADIUS_METERS = 2000;

/** Max photo uploads per review */
export const MAX_REVIEW_PHOTOS = 3;

/** Hygiene score thresholds */
export const HYGIENE_SCORE = {
  GOOD: 75,
  FAIR: 50,
  POOR: 0,
} as const;

/** Category colors for expense tracker */
export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  cleaning: '#14b8a6',
  repair: '#ef4444',
  supplies: '#3b82f6',
  inspection: '#f59e0b',
};

/** Ticket severity colors */
export const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

/** Ticket status labels */
export const TICKET_STATUSES = ['open', 'in-progress', 'resolved'] as const;

/** Toilet types */
export const TOILET_TYPES = ['public', 'private', 'paid'] as const;

/** Toilet amenities */
export const AMENITIES = ['wheelchair', 'soap', 'paper', 'sanitizer'] as const;

/** Rating dimensions */
export const RATING_DIMENSIONS = ['cleanliness', 'accessibility', 'facilities'] as const;

/** Number of items per page */
export const PAGE_SIZE = 10;

/** Recharts color palette */
export const CHART_COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#22c55e'];
