/**
 * Figma OAuth2 Client
 * Uses REST API with client ID/secret for authentication
 */

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export class FigmaOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl = 'https://api.figma.com/v1';
  private authUrl = 'https://www.figma.com/api/oauth/token';

  constructor(clientId: string, clientSecret: string) {
    // Security validation
    if (!clientId || clientId.length < 10) {
      throw new Error('Figma OAuth client ID appears invalid');
    }
    if (!clientSecret || clientSecret.length < 20) {
      throw new Error('Figma OAuth client secret appears invalid');
    }
    if (clientId.includes('your_') || clientSecret.includes('your_')) {
      throw new Error('Figma OAuth credentials appear to be placeholders');
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get access token using client credentials (OAuth2)
   * For server-to-server authentication
   * Includes error handling and retry logic
   */
  async getAccessToken(): Promise<string> {
    // If token is still valid, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Request new token with retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(this.authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text().catch(() => 'Unknown error');
          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`Figma OAuth error ${response.status}: ${error}`);
          }
          throw new Error(`Figma OAuth error ${response.status}: ${error}`);
        }

        const tokenData: OAuthTokenResponse = await response.json();
        
        // Validate token response
        if (!tokenData?.access_token) {
          throw new Error('Figma OAuth returned invalid token response');
        }
        
        this.accessToken = tokenData.access_token;
        // Set expiry (with 5 minute buffer)
        this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;

        return this.accessToken;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on abort or client errors
        if (error.name === 'AbortError' || (error.message?.includes('40'))) {
          clearTimeout(timeoutId);
          throw error;
        }
        
        // Exponential backoff
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        }
      }
    }
    
    clearTimeout(timeoutId);
    throw lastError || new Error('Figma OAuth token request failed after retries');
  }

  /**
   * Make authenticated request to Figma API
   * Includes error handling and retry logic
   */
  async request(endpoint: string, retries = 3) {
    const token = await this.getAccessToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle rate limiting (429)
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * Math.pow(2, attempt);
            if (attempt < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          
          const error = await response.text().catch(() => 'Unknown error');
          throw new Error(`Figma API error ${response.status}: ${error}`);
        }

        const data = await response.json();
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Figma API returned invalid response format');
        }
        
        return data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on abort or client errors (except 429)
        if (error.name === 'AbortError' || (error.message?.includes('40') && !error.message?.includes('429'))) {
          clearTimeout(timeoutId);
          throw error;
        }
        
        // Exponential backoff
        if (attempt < retries - 1) {
          const waitTime = 500 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    clearTimeout(timeoutId);
    throw lastError || new Error('Figma API request failed after retries');
  }

  /**
   * Get teams (using OAuth token)
   */
  async getTeams() {
    return this.request('/teams');
  }

  /**
   * Get projects for a team
   */
  async getProjects(teamId: string) {
    return this.request(`/teams/${teamId}/projects`);
  }

  /**
   * Get files in a project
   */
  async getProjectFiles(projectId: string) {
    return this.request(`/projects/${projectId}/files`);
  }

  /**
   * Get a specific file
   */
  async getFile(fileKey: string) {
    return this.request(`/files/${fileKey}`);
  }

  /**
   * Get file nodes (components)
   */
  async getFileNodes(fileKey: string, nodeIds: string[]) {
    return this.request(`/files/${fileKey}/nodes?ids=${nodeIds.join(',')}`);
  }
}

let oauthClient: FigmaOAuthClient | null = null;

export function getFigmaOAuthClient(): FigmaOAuthClient {
  if (!oauthClient) {
    const clientId = process.env.FIGMA_CLIENT_ID;
    const clientSecret = process.env.FIGMA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET must be set');
    }
    
    // Additional validation
    if (clientId.includes('your_') || clientSecret.includes('your_')) {
      throw new Error('Figma OAuth credentials appear to be placeholders - please set real credentials');
    }
    
    oauthClient = new FigmaOAuthClient(clientId, clientSecret);
  }
  return oauthClient;
}





