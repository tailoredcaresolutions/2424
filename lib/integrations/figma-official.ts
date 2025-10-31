/**
 * Figma API Client - Official Implementation
 * Based on: https://developers.figma.com/docs/rest-api/
 * 
 * Authentication:
 * - Personal Access Token: X-Figma-Token header
 * - OAuth2: Authorization code flow (requires user consent)
 */

interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url?: string;
}

interface FigmaFile {
  name: string;
  key: string;
  lastModified: string;
  thumbnailUrl?: string;
}

interface FigmaTeam {
  id: string;
  name: string;
}

interface FigmaProject {
  id: string;
  name: string;
}

/**
 * Official Figma API Client
 * Uses Personal Access Token or OAuth2 token
 */
export class FigmaOfficialClient {
  private token: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(token: string) {
    // Security validation
    if (!token || token.length < 20) {
      throw new Error('Figma API token appears invalid (too short)');
    }
    if (!token.startsWith('figd_') && !/^[A-Za-z0-9_-]{20,}$/.test(token)) {
      throw new Error('Figma API token appears invalid (invalid format)');
    }
    this.token = token;
  }

  /**
   * Make authenticated request to Figma API
   * Official endpoint format per docs
   * Includes error handling, retry logic, and rate limit handling
   */
  private async request(endpoint: string, options: RequestInit = {}, retries = 3) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'X-Figma-Token': this.token,
            'Content-Type': 'application/json',
            ...options.headers,
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
          throw new Error(`Figma API ${response.status}: ${error}`);
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
        
        // Exponential backoff for retries
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
   * Get current user info
   * GET /v1/me
   */
  async getMe(): Promise<FigmaUser> {
    return this.request('/me');
  }

  /**
   * Get teams (requires organization account)
   * GET /v1/teams
   */
  async getTeams(): Promise<{ teams: FigmaTeam[] }> {
    return this.request('/teams');
  }

  /**
   * Get projects for a team
   * GET /v1/teams/{team_id}/projects
   */
  async getProjects(teamId: string): Promise<{ projects: FigmaProject[] }> {
    return this.request(`/teams/${teamId}/projects`);
  }

  /**
   * Get files in a project
   * GET /v1/projects/{project_id}/files
   */
  async getProjectFiles(projectId: string): Promise<{ files: FigmaFile[] }> {
    return this.request(`/projects/${projectId}/files`);
  }

  /**
   * Get a file by key
   * GET /v1/files/{file_key}
   * File key comes from URL: https://www.figma.com/file/{file_key}/FileName
   */
  async getFile(fileKey: string): Promise<any> {
    return this.request(`/files/${fileKey}`);
  }

  /**
   * Get specific nodes from a file
   * GET /v1/files/{file_key}/nodes?ids={ids}
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    const ids = nodeIds.join(',');
    return this.request(`/files/${fileKey}/nodes?ids=${ids}`);
  }

  /**
   * Get file images
   * GET /v1/images/{file_key}
   */
  async getFileImages(fileKey: string, options?: {
    ids?: string[];
    format?: 'jpg' | 'png' | 'svg' | 'pdf';
    scale?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (options?.ids) params.append('ids', options.ids.join(','));
    if (options?.format) params.append('format', options.format);
    if (options?.scale) params.append('scale', options.scale.toString());
    
    const query = params.toString();
    return this.request(`/images/${fileKey}${query ? `?${query}` : ''}`);
  }
}

/**
 * OAuth2 Helper - For authorization code flow
 * According to docs: https://developers.figma.com/docs/rest-api/authentication/
 */
export class FigmaOAuth2Helper {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Get authorization URL
   * User must visit this URL to grant permission
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'file_read',
      response_type: 'code',
      ...(state && { state }),
    });

    return `https://www.figma.com/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * After user grants permission and redirects back
   */
  async exchangeCodeForToken(code: string): Promise<{ access_token: string; token_type: string }> {
    const response = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton
let figmaClient: FigmaOfficialClient | null = null;

export function getFigmaClient(): FigmaOfficialClient {
  if (!figmaClient) {
    const token = process.env.FIGMA_API_TOKEN;
    if (!token) {
      throw new Error('FIGMA_API_TOKEN not set in environment');
    }
    // Additional validation
    if (token.includes('your_') || token.includes('CHANGE_THIS')) {
      throw new Error('FIGMA_API_TOKEN appears to be a placeholder - please set a real token');
    }
    figmaClient = new FigmaOfficialClient(token);
  }
  return figmaClient;
}



