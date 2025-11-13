// Detect API URL dynamically based on current hostname
export function getApiUrl(): string {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If running in browser, detect the current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Cloudflare Tunnel domains don't support port numbers
    // Check if we're on a Cloudflare domain
    if (hostname.includes('.trycloudflare.com')) {
      // For Cloudflare Tunnel, we need a separate tunnel for backend
      // Try to use a subdomain or check localStorage for backend URL
      const storedBackendUrl = localStorage.getItem('backend_api_url');
      if (storedBackendUrl) {
        return storedBackendUrl;
      }
      
      // If no stored URL, try using the same domain with /api path
      // (This requires Cloudflare Tunnel to route /api/* to backend)
      // For now, fall back to trying a subdomain pattern
      // Note: This won't work unless backend is also exposed via Cloudflare
      console.warn('Cloudflare Tunnel detected but backend URL not configured. Please expose backend via Cloudflare Tunnel or set VITE_API_URL environment variable.');
      
      // Try to construct backend URL (this may not work if backend isn't exposed)
      // User needs to expose backend separately or use environment variable
      return `${protocol}//${hostname.replace(/^([^.]+)/, '$1-backend')}`;
    }
    
    // Localtunnel domains
    if (hostname.includes('.loca.lt')) {
      // Localtunnel also doesn't support ports, need separate tunnel
      const storedBackendUrl = localStorage.getItem('backend_api_url');
      if (storedBackendUrl) {
        return storedBackendUrl;
      }
      // Fallback: try to use same pattern (won't work unless backend is exposed)
      console.warn('Localtunnel detected but backend URL not configured. Please expose backend via Localtunnel or set VITE_API_URL environment variable.');
      return `${protocol}//${hostname}`;
    }
    
    // For other domains (network IPs, ngrok, etc.), use port-based approach
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const port = '8001';
      // Use same protocol and hostname, but port 8001 for backend
      return `${protocol}//${hostname}:${port}`;
    }
  }

  // Default to localhost for local development
  return 'http://localhost:8001';
}

const API_URL = getApiUrl();

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getTokens() {
    return {
      access: this.accessToken,
      refresh: this.refreshToken,
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update both access and refresh tokens (refresh token may be rotated)
        this.setTokens(data.access, data.refresh || this.refreshToken!);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Log request for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${fetchOptions.method || 'GET'} ${url}`, { headers, body: fetchOptions.body });
    }

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Log response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response: ${response.status} ${response.statusText}`, { url });
    }

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && !skipAuth && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      }
    }

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      // Django Ninja returns errors with 'detail' field
      const errorMessage = errorData.detail || errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Export helper functions for token management
export const setTokens = (access: string, refresh: string) => {
  api.setTokens(access, refresh);
};

export const clearTokens = () => {
  api.clearTokens();
};

