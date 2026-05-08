// ─── Utility Formatters ─────────────────────────────────────────────────────

/**
 * Formats a number as Indian currency (INR).
 * @param amount - The number to format
 * @param currency - Currency code (default: INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a distance in meters to a human-readable string.
 * @param meters - Distance in meters
 * @returns Formatted distance string (e.g., "1.2 km" or "450 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

/**
 * Formats a date string to a human-readable format.
 * @param date - ISO date string or Date object
 * @param format - 'short' | 'long' | 'relative'
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date);
  if (format === 'relative') {
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Returns hygiene score color class based on score value.
 * @param score - Score from 0-100
 * @returns Tailwind color class string
 */
export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-primary';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Returns hygiene score stroke color for SVG rings.
 * @param score - Score from 0-100
 * @returns Hex color string
 */
export function getScoreStroke(score: number): string {
  if (score >= 75) return '#14b8a6';
  if (score >= 50) return '#fbbf24';
  return '#ef4444';
}

/**
 * Calculates the Haversine distance between two lat/lng points.
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in meters
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Converts a file to base64 string for API upload.
 * @param file - File object
 * @returns Promise resolving to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts an array of objects to CSV string.
 * @param data - Array of objects
 * @param headers - Optional header map {key: label}
 * @returns CSV string
 */
export function toCSV<T extends Record<string, unknown>>(data: T[], headers?: Record<keyof T, string>): string {
  if (!data.length) return '';
  const keys = Object.keys(data[0]) as (keyof T)[];
  const headerRow = keys.map(k => (headers ? headers[k] : String(k))).join(',');
  const rows = data.map(row => keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','));
  return [headerRow, ...rows].join('\n');
}

/**
 * Triggers a CSV file download in the browser.
 * @param csv - CSV string content
 * @param filename - File name without extension
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Capitalizes first letter of a string.
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
