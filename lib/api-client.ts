/**
 * API Client for Hybrid Architecture
 *
 * This client automatically routes requests to:
 * - Local Next.js API routes (development)
 * - Remote backend server via Cloudflare Tunnel (production on Vercel)
 *
 * Usage:
 * import { apiClient } from '@/lib/api-client';
 * const response = await apiClient.get('/health');
 */

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // In production (Vercel), use backend URL from environment
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // In development, use local Next.js API routes
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side rendering fallback
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * API Client class
 */
class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}/api${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(endpoint);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API upload failed: ${endpoint}`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL);

// Export base URL for direct use
export const API_BASE_URL_PUBLIC = API_BASE_URL;

// Type-safe API endpoint helpers
export const api = {
  // Health
  health: () => apiClient.get('/health'),

  // Search
  search: (filters: Record<string, any>) => apiClient.get('/search', filters),

  // AI
  aiAudit: (data: any) => apiClient.post('/ai/audit', data),
  aiFeedback: (reportText: string) => apiClient.post('/ai/feedback', { reportText }),
  aiQuarterlyReview: (pswId: number, startDate: string, endDate: string) =>
    apiClient.post('/ai/quarterly-review', { pswId, startDate, endDate }),

  // Auth & MFA
  mfaEnroll: (userId: string, username: string) =>
    apiClient.post('/auth/mfa/enroll', { userId, username }),
  mfaVerify: (userId: string, code: string) =>
    apiClient.post('/auth/mfa/verify', { userId, code }),
  mfaVerifyEnrollment: (userId: string, enrollmentToken: string, code: string) =>
    apiClient.post('/auth/mfa/verify-enrollment', { userId, enrollmentToken, code }),
  mfaVerifyBackupCode: (userId: string, backupCode: string) =>
    apiClient.post('/auth/mfa/verify-backup-code', { userId, backupCode }),

  // Backup
  backupCreate: () => apiClient.post('/backup/create'),

  // Monitoring
  monitoringDashboard: () => apiClient.get('/monitoring/dashboard'),
  performanceMetrics: () => apiClient.get('/performance/metrics'),
};
