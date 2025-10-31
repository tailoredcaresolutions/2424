/**
 * Builder.io API Client (Modern API)
 * Simplified - only needs API key now
 */

export class BuilderClient {
  private apiKey: string;
  private baseUrl = 'https://cdn.builder.io/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get content from Builder.io
   * Includes error handling, retry logic, and validation
   */
  async getContent(model: string = 'page', options: Record<string, any> = {}) {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        ...options,
      });

      const url = `${this.baseUrl}/content/${model}?${params}`;
      
      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      let response: Response;
      let attempts = 0;
      const maxRetries = 3;
      
      while (attempts < maxRetries) {
        try {
          response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          clearTimeout(timeoutId);
          break;
        } catch (error: any) {
          attempts++;
          if (attempts >= maxRetries) {
            clearTimeout(timeoutId);
            throw new Error(`Builder.io API request failed after ${maxRetries} attempts: ${error.message}`);
          }
          // Exponential backoff: 500ms, 1000ms, 2000ms
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts - 1)));
        }
      }

      if (!response!) {
        throw new Error('Builder.io API request failed');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Builder.io API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Builder.io returned invalid response format');
      }
      
      return data;
    } catch (error: any) {
      // Log error for monitoring (use structured logger in production)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Builder.io API error:', error);
      }
      
      // Re-throw with context
      throw new Error(`Failed to fetch Builder.io content: ${error.message}`);
    }
  }

  /**
   * Get a specific page by URL
   */
  async getPage(url: string) {
    return this.getContent('page', { url });
  }

  /**
   * List all pages
   */
  async listPages(limit = 100) {
    return this.getContent('page', { limit });
  }
}

let builderClient: BuilderClient | null = null;

export function getBuilderClient(): BuilderClient {
  if (!builderClient) {
    const apiKey = process.env.BUILDER_API_KEY;
    if (!apiKey) {
      throw new Error('BUILDER_API_KEY not set in environment');
    }
    // Security validation
    if (apiKey.length < 32) {
      throw new Error('BUILDER_API_KEY appears invalid (too short)');
    }
    // Basic pattern check (Builder.io keys are typically base64-like)
    if (!/^[A-Za-z0-9_-]{32,}$/.test(apiKey)) {
      throw new Error('BUILDER_API_KEY appears invalid (invalid characters)');
    }
    builderClient = new BuilderClient(apiKey);
  }
  return builderClient;
}





