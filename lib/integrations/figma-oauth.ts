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
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get access token using client credentials (OAuth2)
   * For server-to-server authentication
   */
  async getAccessToken(): Promise<string> {
    // If token is still valid, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Request new token
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
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma OAuth error: ${response.status} - ${error}`);
    }

    const tokenData: OAuthTokenResponse = await response.json();
    
    this.accessToken = tokenData.access_token;
    // Set expiry (with 5 minute buffer)
    this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;

    return this.accessToken;
  }

  /**
   * Make authenticated request to Figma API
   */
  async request(endpoint: string) {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma API error: ${response.status} - ${error}`);
    }

    return response.json();
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

    oauthClient = new FigmaOAuthClient(clientId, clientSecret);
  }
  return oauthClient;
}





