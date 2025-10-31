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
   */
  async getContent(model: string = 'page', options: Record<string, any> = {}) {
    const params = new URLSearchParams({
      apiKey: this.apiKey,
      ...options,
    });

    const url = `${this.baseUrl}/content/${model}?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Builder.io API error: ${response.status}`);
    }

    return response.json();
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
    builderClient = new BuilderClient(apiKey);
  }
  return builderClient;
}





