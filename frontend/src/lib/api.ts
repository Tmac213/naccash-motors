const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rfzxzkjfimaywufxdiav.supabase.co';
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${SUPABASE_URL}/functions/v1`;

export interface ApiError extends Error {
  status?: number;
  body?: any;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Construct API URL for Express backend
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: ApiError = new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.body = errorData;
    throw error;
  }

  return response.json();
}
