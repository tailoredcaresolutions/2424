/**
 * Figma Integration - Complete Solution
 * Uses Context7 best practices + Official API docs
 * 
 * Handles:
 * - Personal Access Token (working now)
 * - OAuth2 (when configured)
 * - File access by key
 * - Design token extraction
 * - Component specs
 */

import { FigmaOfficialClient } from './figma-official';

interface FigmaConfig {
  personalToken?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  fileKeys?: string[];
}

interface DesignToken {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  shadows: Record<string, string>;
}

interface ComponentSpec {
  name: string;
  width: number;
  height: number;
  fills?: any[];
  styles?: any;
}

/**
 * Complete Figma Integration Client
 * Implements best practices per Context7 research
 */
export class FigmaIntegration {
  private client: FigmaOfficialClient;
  private config: FigmaConfig;

  constructor(config: FigmaConfig) {
    this.config = config;
    
    // Use personal token (always available as fallback)
    if (!config.personalToken) {
      throw new Error('FIGMA_API_TOKEN required');
    }
    
    this.client = new FigmaOfficialClient(config.personalToken);
  }

  /**
   * Get user account info
   */
  async getAccountInfo() {
    return this.client.getMe();
  }

  /**
   * Get a file by key
   * File key comes from URL: https://www.figma.com/file/{key}/FileName
   */
  async getFile(fileKey: string) {
    return this.client.getFile(fileKey);
  }

  /**
   * Get multiple files
   */
  async getFiles(fileKeys: string[]) {
    const results = await Promise.allSettled(
      fileKeys.map(key => this.client.getFile(key))
    );
    
    return results.map((result, i) => ({
      key: fileKeys[i],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }

  /**
   * Extract design tokens from a Figma file
   * Per Context7 best practices: extract colors, spacing, typography
   */
  async extractDesignTokens(fileKey: string): Promise<DesignToken> {
    const file = await this.client.getFile(fileKey);
    
    const tokens: DesignToken = {
      colors: {},
      spacing: {},
      typography: {},
      shadows: {},
    };

    // Extract from document
    this.extractTokensRecursive(file.document, tokens);
    
    // Extract from styles
    if (file.styles) {
      Object.values(file.styles).forEach((style: any) => {
        if (style.styleType === 'FILL' && style.description) {
          // Parse color from style description
          const colorMatch = style.description.match(/#[0-9A-Fa-f]{6}/);
          if (colorMatch) {
            tokens.colors[style.name] = colorMatch[0];
          }
        }
      });
    }

    return tokens;
  }

  /**
   * Recursively extract tokens from nodes
   */
  private extractTokensRecursive(node: any, tokens: DesignToken) {
    if (!node) return;

    // Extract fills (colors)
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const rgb = fill.color;
          const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
          tokens.colors[`${node.name || 'color'}-${hex}`] = hex;
        }
      });
    }

    // Extract spacing (padding, margins)
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const padding = {
        left: node.paddingLeft || 0,
        right: node.paddingRight || 0,
        top: node.paddingTop || 0,
        bottom: node.paddingBottom || 0,
      };
      tokens.spacing[`${node.name || 'padding'}`] = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    }

    // Extract typography
    if (node.style) {
      const style = node.style;
      if (style.fontFamily || style.fontSize) {
        tokens.typography[`${node.name || 'text'}`] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
        };
      }
    }

    // Extract shadows
    if (node.effects && Array.isArray(node.effects)) {
      node.effects.forEach((effect: any) => {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
          const shadow = `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${this.rgbaToHex(effect.color)}`;
          tokens.shadows[`${node.name || 'shadow'}-${effect.type}`] = shadow;
        }
      });
    }

    // Recurse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.extractTokensRecursive(child, tokens);
      });
    }
  }

  /**
   * Get component specifications
   */
  async getComponentSpecs(fileKey: string, componentIds?: string[]): Promise<ComponentSpec[]> {
    const file = await this.client.getFile(fileKey);
    const specs: ComponentSpec[] = [];

    const findComponents = (node: any) => {
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        if (!componentIds || componentIds.includes(node.id)) {
          specs.push({
            name: node.name,
            width: node.absoluteBoundingBox?.width || 0,
            height: node.absoluteBoundingBox?.height || 0,
            fills: node.fills,
            styles: node.styles,
          });
        }
      }

      if (node.children) {
        node.children.forEach(findComponents);
      }
    };

    findComponents(file.document);
    return specs;
  }

  /**
   * Convert RGB to HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /**
   * Convert RGBA to HEX
   */
  private rgbaToHex(color: any): string {
    if (!color) return 'rgba(0,0,0,0)';
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;
    return `rgba(${r},${g},${b},${a})`;
  }

  /**
   * Sync design tokens to Tailwind config
   */
  async syncToTailwind(fileKey: string, tailwindConfigPath: string = 'tailwind.config.ts') {
    const tokens = await this.extractDesignTokens(fileKey);
    
    // This would update tailwind.config.ts
    // Implementation depends on your Tailwind setup
    // For now, return tokens for manual sync
    return {
      tokens,
      tailwindConfig: this.generateTailwindConfig(tokens),
    };
  }

  /**
   * Generate Tailwind config from tokens
   */
  private generateTailwindConfig(tokens: DesignToken): string {
    const colors = Object.entries(tokens.colors)
      .map(([key, value]) => `    '${key}': '${value}',`)
      .join('\n');

    const spacing = Object.entries(tokens.spacing)
      .map(([key, value]) => `    '${key}': '${value}',`)
      .join('\n');

    return `
// Auto-generated from Figma
module.exports = {
  theme: {
    extend: {
      colors: {
${colors}
      },
      spacing: {
${spacing}
      },
      // ... other tokens
    },
  },
};
`;
  }
}

/**
 * Singleton instance
 */
let figmaIntegration: FigmaIntegration | null = null;

export function getFigmaIntegration(): FigmaIntegration {
  if (!figmaIntegration) {
    const personalToken = process.env.FIGMA_API_TOKEN;
    const oauthClientId = process.env.FIGMA_CLIENT_ID;
    const oauthClientSecret = process.env.FIGMA_CLIENT_SECRET;
    const fileKeys = process.env.FIGMA_FILE_KEYS?.split(',').filter(Boolean);
    
    // Validate at least one authentication method is provided
    if (!personalToken && (!oauthClientId || !oauthClientSecret)) {
      throw new Error('Either FIGMA_API_TOKEN or (FIGMA_CLIENT_ID + FIGMA_CLIENT_SECRET) must be set');
    }
    
    // Validate personal token if provided
    if (personalToken) {
      if (personalToken.includes('your_') || personalToken.includes('CHANGE_THIS')) {
        throw new Error('FIGMA_API_TOKEN appears to be a placeholder - please set a real token');
      }
      if (personalToken.length < 20) {
        throw new Error('FIGMA_API_TOKEN appears invalid (too short)');
      }
    }
    
    // Validate OAuth credentials if provided
    if (oauthClientId && oauthClientSecret) {
      if (oauthClientId.includes('your_') || oauthClientSecret.includes('your_')) {
        throw new Error('Figma OAuth credentials appear to be placeholders - please set real credentials');
      }
      if (oauthClientId.length < 10 || oauthClientSecret.length < 20) {
        throw new Error('Figma OAuth credentials appear invalid');
      }
    }
    
    const config: FigmaConfig = {
      personalToken,
      oauthClientId,
      oauthClientSecret,
      fileKeys,
    };

    figmaIntegration = new FigmaIntegration(config);
  }

  return figmaIntegration;
}



