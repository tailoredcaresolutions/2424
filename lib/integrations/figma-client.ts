/**
 * Figma API Client
 * Fetches designs, components, and design tokens from Figma
 */

interface FigmaFile {
  name: string;
  key: string;
  lastModified: string;
  thumbnailUrl?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'borderRadius';
}

export class FigmaClient {
  private apiToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async request(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.apiToken,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get all teams
   */
  async getTeams() {
    return this.request('/teams');
  }

  /**
   * Get all projects for a team
   */
  async getProjects(teamId: string) {
    return this.request(`/teams/${teamId}/projects`);
  }

  /**
   * Get all files in a project
   */
  async getProjectFiles(projectId: string): Promise<FigmaFile[]> {
    const data = await this.request(`/projects/${projectId}/files`);
    return data.files || [];
  }

  /**
   * Get a specific file by key
   */
  async getFile(fileKey: string) {
    return this.request(`/files/${fileKey}`);
  }

  /**
   * Get all files from a project (by project ID)
   * Also tries as a file key if project lookup fails
   */
  async getAllFilesFromProject(projectPath: string): Promise<FigmaFile[]> {
    // Clean project path: /project-id/ -> project-id
    const projectId = projectPath.replace(/^\//, '').replace(/\/$/, '');

    try {
      // First try: Access as a project
      try {
        const teamsData = await this.getTeams();
        
        for (const team of teamsData.teams || []) {
          try {
            const projectsData = await this.getProjects(team.id);
            
            // Check if this project ID matches
            const project = projectsData.projects?.find(
              (p: any) => p.id === projectId
            );

            if (project) {
              // Found the project! Get all files
              return await this.getProjectFiles(projectId);
            }
          } catch (error) {
            // Team might not have access, continue
            continue;
          }
        }
      } catch (teamsError: any) {
        // Teams endpoint might not work (personal account)
        // Try alternative: access as file or list all files
      }

      // Second try: Treat as file key and try to access directly
      try {
        const fileData = await this.getFile(projectId);
        // If it works, return as single file array
        return [{
          name: fileData.name || 'Unknown',
          key: projectId,
          lastModified: fileData.lastModified || new Date().toISOString(),
        }];
      } catch (fileError) {
        // Not a file either
      }

      // Third try: List all files from personal files
      // For personal accounts, we might need to access files differently
      // Try to get files from each accessible team/project
      const teamsData = await this.getTeams().catch(() => ({ teams: [] }));
      
      const allFiles: FigmaFile[] = [];
      
      for (const team of teamsData.teams || []) {
        try {
          const projectsData = await this.getProjects(team.id);
          for (const project of projectsData.projects || []) {
            try {
              const files = await this.getProjectFiles(project.id);
              allFiles.push(...files);
              
              // If this project matches, we found it!
              if (project.id === projectId) {
                return files;
              }
            } catch (error) {
              continue;
            }
          }
        } catch (error) {
          continue;
        }
      }

      // If we collected files but didn't find the specific project, return all
      if (allFiles.length > 0) {
        return allFiles;
      }

      throw new Error(`Project/file ${projectId} not found. Available files: ${allFiles.length}`);
    } catch (error: any) {
      throw new Error(`Cannot access project ${projectId}: ${error.message}`);
    }
  }

  /**
   * Extract design tokens from a file
   */
  async extractDesignTokens(fileKey: string): Promise<DesignToken[]> {
    const file = await this.getFile(fileKey);
    const tokens: DesignToken[] = [];

    // Recursively extract tokens from nodes
    const extractFromNode = (node: FigmaNode) => {
      // Extract colors from fills/strokes
      if (node.type === 'RECTANGLE' || node.type === 'TEXT') {
        // This is simplified - you'd need to parse fills, strokes, etc.
        // For now, we'll get the file structure
      }

      if (node.children) {
        node.children.forEach(extractFromNode);
      }
    };

    if (file.document) {
      extractFromNode(file.document);
    }

    return tokens;
  }

  /**
   * Get component specifications
   */
  async getComponentSpecs(fileKey: string, componentIds: string[]) {
    const response = await this.request(
      `/files/${fileKey}/nodes?ids=${componentIds.join(',')}`
    );
    return response.nodes;
  }

  /**
   * Sync design tokens to Tailwind config
   */
  async syncTokensToTailwind(fileKey: string, outputPath: string) {
    // This would extract colors, spacing, etc. and update tailwind.config.ts
    // Implementation would parse Figma variables/styles
    throw new Error('Not implemented yet - will create this');
  }
}

// Export singleton instance
let figmaClient: FigmaClient | null = null;

export function getFigmaClient(): FigmaClient {
  if (!figmaClient) {
    const token = process.env.FIGMA_API_TOKEN;
    if (!token) {
      throw new Error('FIGMA_API_TOKEN not set in environment');
    }
    figmaClient = new FigmaClient(token);
  }
  return figmaClient;
}

