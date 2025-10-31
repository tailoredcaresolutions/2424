#!/usr/bin/env node
/**
 * MCP Server for Figma Integration
 * Allows AI assistant to query Figma designs directly
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET;
const FIGMA_BASE_URL = 'https://api.figma.com/v1';

class FigmaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'figma-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_figma_file',
          description: 'Get a Figma file by its key. Returns file structure, components, and design tokens.',
          inputSchema: {
            type: 'object',
            properties: {
              fileKey: {
                type: 'string',
                description: 'The Figma file key',
              },
            },
            required: ['fileKey'],
          },
        },
        {
          name: 'list_figma_projects',
          description: 'List all accessible Figma projects and their files',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_design_tokens',
          description: 'Extract design tokens (colors, spacing, typography) from a Figma file',
          inputSchema: {
            type: 'object',
            properties: {
              fileKey: {
                type: 'string',
                description: 'The Figma file key',
              },
            },
            required: ['fileKey'],
          },
        },
        {
          name: 'get_component_specs',
          description: 'Get detailed specifications for Figma components',
          inputSchema: {
            type: 'object',
            properties: {
              fileKey: {
                type: 'string',
                description: 'The Figma file key',
              },
              componentIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of component node IDs',
              },
            },
            required: ['fileKey', 'componentIds'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!FIGMA_API_TOKEN) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: FIGMA_API_TOKEN not set in environment',
            },
          ],
          isError: true,
        };
      }

      try {
        switch (name) {
          case 'get_figma_file':
            return await this.getFigmaFile(args.fileKey);

          case 'list_figma_projects':
            return await this.listProjects();

          case 'get_design_tokens':
            return await this.getDesignTokens(args.fileKey);

          case 'get_component_specs':
            return await this.getComponentSpecs(args.fileKey, args.componentIds);

          default:
            return {
              content: [{ type: 'text', text: `Unknown tool: ${name}` }],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async fetchFigma(endpoint) {
    // Try OAuth2 first (if credentials available)
    if (FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET) {
      try {
        const token = await this.getOAuthToken();
        const response = await fetch(`${FIGMA_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          return response.json();
        }
      } catch (error) {
        console.error('OAuth2 failed, falling back to token:', error.message);
      }
    }

    // Fallback to personal token
    if (!FIGMA_API_TOKEN) {
      throw new Error('No Figma authentication available. Set FIGMA_API_TOKEN or FIGMA_CLIENT_ID/SECRET');
    }

    const response = await fetch(`${FIGMA_BASE_URL}${endpoint}`, {
      headers: {
        'X-Figma-Token': FIGMA_API_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} - ${await response.text()}`);
    }

    return response.json();
  }

  async getOAuthToken() {
    // Simple OAuth2 client credentials flow
    const response = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: FIGMA_CLIENT_ID,
        client_secret: FIGMA_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth error: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async getFigmaFile(fileKey) {
    const file = await this.fetchFigma(`/files/${fileKey}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            name: file.name,
            key: fileKey,
            lastModified: file.lastModified,
            document: file.document,
            components: this.extractComponents(file.document),
          }, null, 2),
        },
      ],
    };
  }

  async listProjects() {
    // Try teams endpoint first
    const teams = await this.fetchFigma('/teams').catch(() => ({ teams: [] }));
    const projects = [];

    for (const team of teams.teams || []) {
      try {
        const teamProjects = await this.fetchFigma(`/teams/${team.id}/projects`);
        for (const project of teamProjects.projects || []) {
          const files = await this.fetchFigma(`/projects/${project.id}/files`).catch(() => ({ files: [] }));
          projects.push({
            team: team.name,
            project: project.name,
            projectId: project.id,
            files: files.files || [],
          });
        }
      } catch (error) {
        // Continue to next team
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    };
  }

  async getDesignTokens(fileKey) {
    const file = await this.fetchFigma(`/files/${fileKey}`);
    const tokens = this.extractTokens(file.document);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tokens, null, 2),
        },
      ],
    };
  }

  async getComponentSpecs(fileKey, componentIds) {
    const nodes = await this.fetchFigma(`/files/${fileKey}/nodes?ids=${componentIds.join(',')}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(nodes.nodes, null, 2),
        },
      ],
    };
  }

  extractComponents(node, components = []) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        type: node.type,
      });
    }
    if (node.children) {
      node.children.forEach(child => this.extractComponents(child, components));
    }
    return components;
  }

  extractTokens(node, tokens = { colors: [], spacing: [] }) {
    // Simplified token extraction - would need more sophisticated parsing
    // This is a placeholder for actual token extraction logic
    return tokens;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Figma MCP server running on stdio');
  }
}

const server = new FigmaMCPServer();
server.run().catch(console.error);

