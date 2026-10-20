export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    let code = 'UNKNOWN';
    let message = 'An unexpected error occurred';

    try {
      const error = await response.json();
      code = error.code || code;
      message = error.message || message;
    } catch {
      // response body wasn't JSON
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    throw new ApiError(response.status, code, message);
  }

  return response.json();
}
