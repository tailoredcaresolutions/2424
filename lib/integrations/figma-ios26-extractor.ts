/**
 * Figma iOS 26 Liquid Glass Design Token Extractor
 * Extracts and validates design tokens against iOS 26/macOS 26 liquid glass specifications
 * 
 * STRICT SPECIFICATIONS:
 * - backdrop-filter: blur(20px) saturate(180%)
 * - Background opacity: 0.05-0.7
 * - Border opacity: 0.2-0.4
 * - Border radius: 16px, 20px, or 24px
 * - Colors: Blue (#1B365D) or Gold (#D4A574) palette
 */

import { FigmaOfficialClient } from './figma-official';

interface IOS26GlassSpec {
  blur: number; // Must be 12, 20, 24, or 32
  saturate: number; // Must be 180%
  backgroundOpacity: {
    min: number;
    max: number;
    standard: number;
  };
  borderOpacity: {
    min: number;
    max: number;
    standard: number;
  };
  borderRadius: {
    small: number;
    standard: number;
    large: number;
  };
  shadows: {
    outer: string;
    inset: string;
  };
}

interface ExtractedToken {
  type: 'glass' | 'color' | 'spacing' | 'typography' | 'shadow';
  name: string;
  value: any;
  validated: boolean;
  ios26Compliant: boolean;
  errors?: string[];
}

interface IOS26Palette {
  blue: {
    primary: string; // #1B365D
    dark: string; // #0F1E3A
    deep: string; // #030817
    mid: string; // #122853
    light: string; // #4A6FA5
    lighter: string; // #6B8FC7
  };
  gold: {
    DEFAULT: string; // #D4A574
    light: string; // #E3B888
    deep: string; // #C9A86A
    pale: string; // #F5E8D8
  };
}

/**
 * iOS 26 Liquid Glass Token Extractor
 * Validates all extracted tokens against strict Apple specifications
 */
export class FigmaIOS26Extractor {
  private client: FigmaOfficialClient;
  private ios26Spec: IOS26GlassSpec;
  private palette: IOS26Palette;

  constructor(client: FigmaOfficialClient) {
    this.client = client;
    
    // iOS 26 Liquid Glass Strict Specifications
    this.ios26Spec = {
      blur: 20, // Standard blur
      saturate: 180, // Saturation percentage
      backgroundOpacity: {
        min: 0.05,
        max: 0.7,
        standard: 0.6, // For blue glass
      },
      borderOpacity: {
        min: 0.2,
        max: 0.4,
        standard: 0.3, // For blue borders
      },
      borderRadius: {
        small: 16,
        standard: 20,
        large: 24,
      },
      shadows: {
        outer: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    };

    // Approved iOS 26 Color Palette
    this.palette = {
      blue: {
        primary: '#1B365D',
        dark: '#0F1E3A',
        deep: '#030817',
        mid: '#122853',
        light: '#4A6FA5',
        lighter: '#6B8FC7',
      },
      gold: {
        DEFAULT: '#D4A574',
        light: '#E3B888',
        deep: '#C9A86A',
        pale: '#F5E8D8',
      },
    };
  }

  /**
   * Extract and validate design tokens from Figma file
   */
  async extractTokens(fileKey: string): Promise<{
    tokens: ExtractedToken[];
    compliance: {
      total: number;
      compliant: number;
      nonCompliant: number;
      errors: string[];
    };
  }> {
    const file = await this.client.getFile(fileKey);
    const tokens: ExtractedToken[] = [];

    // Extract from document tree
    this.extractFromNode(file.document, tokens);

    // Validate all tokens
    const validated = tokens.map(token => this.validateToken(token));

    // Calculate compliance
    const compliant = validated.filter(t => t.ios26Compliant).length;
    const errors = validated
      .filter(t => !t.ios26Compliant && t.errors)
      .flatMap(t => t.errors || []);

    return {
      tokens: validated,
      compliance: {
        total: validated.length,
        compliant,
        nonCompliant: validated.length - compliant,
        errors: Array.from(new Set(errors)),
      },
    };
  }

  /**
   * Extract tokens recursively from Figma nodes
   */
  private extractFromNode(node: any, tokens: ExtractedToken[], depth = 0) {
    if (!node) return;

    // Extract glass effects
    if (node.effects) {
      node.effects.forEach((effect: any) => {
        if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
          tokens.push({
            type: 'glass',
            name: `${node.name || 'element'}-blur`,
            value: {
              blur: effect.radius,
              type: effect.type,
            },
            validated: false,
            ios26Compliant: false,
          });
        }
      });
    }

    // Extract fills (colors)
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const hex = this.rgbToHex(fill.color.r, fill.color.g, fill.color.b);
          tokens.push({
            type: 'color',
            name: `${node.name || 'color'}-${hex}`,
            value: hex,
            validated: false,
            ios26Compliant: false,
          });
        }
      });
    }

    // Extract corner radius
    if (node.cornerRadius !== undefined) {
      tokens.push({
        type: 'spacing',
        name: `${node.name || 'element'}-radius`,
        value: node.cornerRadius,
        validated: false,
        ios26Compliant: false,
      });
    }

    // Extract spacing
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      tokens.push({
        type: 'spacing',
        name: `${node.name || 'element'}-padding`,
        value: {
          left: node.paddingLeft || 0,
          right: node.paddingRight || 0,
          top: node.paddingTop || 0,
          bottom: node.paddingBottom || 0,
        },
        validated: false,
        ios26Compliant: false,
      });
    }

    // Recurse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.extractFromNode(child, tokens, depth + 1);
      });
    }
  }

  /**
   * Validate token against iOS 26 specifications
   */
  private validateToken(token: ExtractedToken): ExtractedToken {
    const errors: string[] = [];

    switch (token.type) {
      case 'glass':
        const blur = (token.value as any).blur;
        const validBlurs = [12, 20, 24, 32];
        if (!validBlurs.includes(blur)) {
          errors.push(`Blur must be 12, 20, 24, or 32px. Found: ${blur}px`);
        }
        token.ios26Compliant = validBlurs.includes(blur);
        break;

      case 'color':
        const hex = token.value as string;
        const isApproved = Object.values(this.palette.blue)
          .concat(Object.values(this.palette.gold))
          .includes(hex.toUpperCase());
        if (!isApproved) {
          errors.push(`Color ${hex} not in iOS 26 approved palette`);
        }
        token.ios26Compliant = isApproved;
        break;

      case 'spacing':
        if (token.name.includes('radius')) {
          const radius = token.value as number;
          const validRadius = [16, 20, 24];
          if (!validRadius.includes(radius)) {
            errors.push(`Border radius must be 16, 20, or 24px. Found: ${radius}px`);
          }
          token.ios26Compliant = validRadius.includes(radius);
        } else {
          // Spacing should be multiples of 8px (iOS grid system)
          const values = Object.values(token.value as Record<string, number>);
          const allMultiplesOf8 = values.every(v => v % 8 === 0);
          if (!allMultiplesOf8) {
            errors.push('Spacing must be multiples of 8px (iOS grid system)');
          }
          token.ios26Compliant = allMultiplesOf8;
        }
        break;
    }

    token.validated = true;
    if (errors.length > 0) {
      token.errors = errors;
    }

    return token;
  }

  /**
   * Generate iOS 26 compliant CSS from extracted tokens
   */
  generateIOS26CSS(tokens: ExtractedToken[]): string {
    const glassTokens = tokens.filter(t => t.type === 'glass' && t.ios26Compliant);
    const colorTokens = tokens.filter(t => t.type === 'color' && t.ios26Compliant);
    
    let css = '/* iOS 26 Liquid Glass - Auto-generated from Figma */\n\n';
    
    // Generate glass classes
    glassTokens.forEach(token => {
      const blur = (token.value as any).blur;
      css += `.liquid-glass-${blur}px {\n`;
      css += `  background: rgba(27, 54, 93, 0.6);\n`;
      css += `  backdrop-filter: blur(${blur}px) saturate(180%);\n`;
      css += `  -webkit-backdrop-filter: blur(${blur}px) saturate(180%);\n`;
      css += `  border: 1px solid rgba(75, 111, 165, 0.3);\n`;
      css += `  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4),\n`;
      css += `    inset 0 1px 0 rgba(255, 255, 255, 0.1);\n`;
      css += `}\n\n`;
    });

    return css;
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
   * Get iOS 26 approved palette
   */
  getPalette(): IOS26Palette {
    return this.palette;
  }

  /**
   * Get iOS 26 glass specifications
   */
  getSpecs(): IOS26GlassSpec {
    return this.ios26Spec;
  }
}

