// ─── CleanRoute Type Definitions ────────────────────────────────────────────

/** User role */
export type UserRole = 'user' | 'admin';

/** User object returned from API */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/** GeoJSON Point */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

/** Toilet amenities */
export type Amenity = 'wheelchair' | 'soap' | 'paper' | 'sanitizer';

/** Toilet type */
export type ToiletType = 'public' | 'private' | 'paid';

/** Toilet object */
export interface Toilet {
  _id: string;
  name: string;
  address: string;
  location: GeoPoint;
  type: ToiletType;
  isOpen: boolean;
  amenities: Amenity[];
  hygieneScore: number;
  lastInspected?: string;
  photos: string[];
  addedBy: string | User;
  createdAt: string;
  updatedAt: string;
  /** Computed fields from API */
  distance?: number;
  avgRating?: number;
  ratingCount?: number;
}

/** Rating object */
export interface Rating {
  _id: string;
  toiletId: string;
  userId: string | User;
  cleanliness: number;
  accessibility: number;
  facilities: number;
  comment: string;
  photos: string[];
  helpful: string[];
  createdAt: string;
}

/** Expense category */
export type ExpenseCategory = 'cleaning' | 'repair' | 'supplies' | 'inspection';

/** Expense object */
export interface Expense {
  _id: string;
  toiletId: string | Toilet;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  date: string;
  addedBy: string | User;
  receipt?: string;
  createdAt: string;
}

/** Ticket severity */
export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Ticket status */
export type TicketStatus = 'open' | 'in-progress' | 'resolved';

/** Maintenance ticket */
export interface MaintenanceTicket {
  _id: string;
  toiletId: string | Toilet;
  issue: string;
  severity: TicketSeverity;
  status: TicketStatus;
  reportedBy: string | User;
  assignedTo?: string | User;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** AI hygiene report */
export interface AIReport {
  score: number;
  issues: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  toiletId: string;
  createdAt: string;
}

/** Admin stats */
export interface AdminStats {
  totalToilets: number;
  totalUsers: number;
  avgHygieneScore: number;
  openTickets: number;
  resolvedThisMonth: number;
  newToiletsThisMonth: number;
}

/** Expense summary from API */
export interface ExpenseSummary {
  totalThisMonth: number;
  pendingRepairs: number;
  avgPerToilet: number;
  byMonth: { month: string; cleaning: number; repair: number; supplies: number; inspection: number }[];
}

/** Filter state for toilet locator */
export interface ToiletFilters {
  openOnly: boolean;
  paidOnly: boolean;
  wheelchair: boolean;
  maxDistance: number;
}

/** Login form data */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Register form data */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Expense form data */
export interface ExpenseFormData {
  toiletId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  receipt?: File;
}

/** API paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

/** Standard API response */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
