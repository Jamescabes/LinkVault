// ── Auth ──
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  roles: string[];
}

export interface UserProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

// ── Links ──
export interface CreateLinkRequest {
  originalUrl: string;
  customCode?: string;
}

export interface LinkResponse {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
}

export interface LinkStatsResponse {
  linkId: number;
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  clicksByCountry: Record<string, number>;
  recentClicks: ClickDetail[];
}

export interface ClickDetail {
  ipAddress: string;
  country: string;
  userAgent: string;
  clickedAt: string;
}

// ── Pagination (Spring Page<T>) ──
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
