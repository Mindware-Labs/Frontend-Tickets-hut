const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Fetch data from backend API with automatic JWT authentication
 */
export async function fetchFromBackend(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${BACKEND_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Get auth token
  const token = getAuthToken();

  // Prepare headers
  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      document.cookie = 'auth-token=; path=/; max-age=0';

      // Redirect to login
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Backend Error: ${response.status}`, errorData);
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}
