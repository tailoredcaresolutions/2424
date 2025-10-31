#!/usr/bin/env node
/**
 * Figma Integration - Complete Test
 * Uses Context7 best practices + current info
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const FIGMA_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || process.env.FIGMA_FILE_KEYS?.split(',')[0];
const FIGMA_BASE = 'https://api.figma.com/v1';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchFigma(endpoint, token = FIGMA_TOKEN) {
  try {
    const response = await fetch(`${FIGMA_BASE}${endpoint}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });
    
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: error.message,
    };
  }
}

async function main() {
  log('\n🎨 Figma Integration - Complete Test\n', 'cyan');
  log('Using Context7 best practices + current configuration', 'blue');
  log('='.repeat(70), 'cyan');

  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_API_TOKEN not set', 'red');
    return;
  }

  // 1. Verify account
  log('\n1️⃣  Account Verification...', 'cyan');
  const me = await fetchFigma('/me');
  if (me.ok) {
    log(`   ✅ Connected: ${me.data.email}`, 'green');
    log(`   👤 Handle: ${me.data.handle}`, 'blue');
    log(`   🆔 User ID: ${me.data.id}`, 'blue');
  } else {
    log(`   ❌ Failed: ${me.status}`, 'red');
    return;
  }

  // 2. Test OAuth2 credentials (if available)
  if (FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET) {
    log('\n2️⃣  OAuth2 Credentials Found...', 'cyan');
    log(`   ✅ Client ID: ${FIGMA_CLIENT_ID.substring(0, 10)}...`, 'green');
    log(`   ✅ Client Secret: ${FIGMA_CLIENT_SECRET.substring(0, 10)}...`, 'green');
    log(`   💡 OAuth2 requires authorization code flow (user consent)`, 'blue');
    log(`   💡 Personal token works for now - OAuth2 can be set up later`, 'blue');
  }

  // 3. File access strategy
  log('\n3️⃣  File Access Strategy...', 'cyan');
  
  if (FIGMA_FILE_KEY) {
    log(`   📄 File Key: ${FIGMA_FILE_KEY}`, 'blue');
    
    // Clean file key (remove slashes, spaces)
    const cleanKey = FIGMA_FILE_KEY.replace(/^\/|\/$/g, '').trim();
    
    log(`   Testing access...`, 'blue');
    const file = await fetchFigma(`/files/${cleanKey}`);
    
    if (file.ok) {
      log(`   ✅ FILE ACCESSIBLE!`, 'green');
      log(`   📄 Name: ${file.data.name}`, 'blue');
      log(`   🆔 Key: ${cleanKey}`, 'blue');
      log(`   📅 Modified: ${file.data.lastModified}`, 'blue');
      
      // Count components
      const countComponents = (node, count = 0) => {
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') count++;
        if (node.children) {
          node.children.forEach(child => {
            count = countComponents(child, count);
          });
        }
        return count;
      };
      
      const components = countComponents(file.data.document || {});
      log(`   🧩 Components: ${components}`, 'green');
      
      // Save file data
      fs.writeFileSync(
        join(__dirname, '..', `figma-file-${cleanKey}.json`),
        JSON.stringify(file.data, null, 2)
      );
      log(`   💾 Saved to figma-file-${cleanKey}.json`, 'green');
      
      // Extract design tokens
      log(`\n4️⃣  Extracting Design Tokens...`, 'cyan');
      const tokens = extractDesignTokens(file.data);
      
      log(`   🎨 Colors: ${Object.keys(tokens.colors).length}`, 'green');
      log(`   📏 Spacing: ${Object.keys(tokens.spacing).length}`, 'green');
      log(`   ✍️  Typography: ${Object.keys(tokens.typography).length}`, 'green');
      
      // Save tokens
      fs.writeFileSync(
        join(__dirname, '..', `figma-tokens-${cleanKey}.json`),
        JSON.stringify(tokens, null, 2)
      );
      log(`   💾 Tokens saved to figma-tokens-${cleanKey}.json`, 'green');
      
      // Generate Tailwind config snippet
      const tailwindConfig = generateTailwindConfig(tokens);
      log(`\n5️⃣  Tailwind Config Snippet...`, 'cyan');
      log(`   💾 Available in integration results`, 'blue');
      
      // Final summary
      const summary = {
        account: me.data,
        file: {
          key: cleanKey,
          name: file.data.name,
          components,
        },
        tokens,
        tailwindConfig,
        integration: {
          status: 'success',
          method: 'personal_token',
          oauth2Available: !!(FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET),
        },
      };
      
      fs.writeFileSync(
        join(__dirname, '..', 'figma-integration-complete.json'),
        JSON.stringify(summary, null, 2)
      );
      
      log(`\n${'='.repeat(70)}`, 'cyan');
      log(`\n✅ Integration Complete!`, 'green');
      log(`\n📊 Summary:`, 'cyan');
      log(`   ✅ Account: ${me.data.email}`, 'green');
      log(`   ✅ File: ${file.data.name}`, 'green');
      log(`   ✅ Components: ${components}`, 'green');
      log(`   ✅ Tokens: Extracted`, 'green');
      log(`   ✅ Tailwind Config: Generated`, 'green');
      
      log(`\n💡 Next Steps:`, 'cyan');
      log(`   1. Review figma-integration-complete.json`, 'blue');
      log(`   2. Use tokens in your Tailwind config`, 'blue');
      log(`   3. Access file anytime with: GET /v1/files/${cleanKey}`, 'blue');
      
      return summary;
    } else {
      log(`   ⚠️  File not accessible: ${file.status}`, 'yellow');
      log(`   Response: ${typeof file.data === 'string' ? file.data.substring(0, 200) : JSON.stringify(file.data)}`, 'yellow');
      
      log(`\n💡 To get correct file key:`, 'cyan');
      log(`   1. Open Figma file in browser`, 'blue');
      log(`   2. URL: https://www.figma.com/file/FILE_KEY/FileName`, 'blue');
      log(`   3. Copy FILE_KEY (long alphanumeric string)`, 'blue');
      log(`   4. Add to .env.local as FIGMA_FILE_KEY=your_actual_key`, 'blue');
    }
  } else {
    log(`   ⚠️  No file key configured`, 'yellow');
    log(`\n💡 To configure file access:`, 'cyan');
    log(`   1. Open Figma file in browser`, 'blue');
    log(`   2. Get file key from URL: https://www.figma.com/file/FILE_KEY/FileName`, 'blue');
    log(`   3. Add to .env.local: FIGMA_FILE_KEY=your_actual_key`, 'blue');
  }

  log(`\n✅ Integration test complete!\n`, 'green');
}

function extractDesignTokens(fileData) {
  const tokens = {
    colors: {},
    spacing: {},
    typography: {},
    shadows: {},
  };

  const extractRecursive = (node) => {
    if (!node) return;

    // Colors from fills
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill) => {
        if (fill.type === 'SOLID' && fill.color) {
          const rgb = fill.color;
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          tokens.colors[`${node.name || 'color'}-${hex}`] = hex;
        }
      });
    }

    // Typography
    if (node.style) {
      const style = node.style;
      if (style.fontFamily || style.fontSize) {
        tokens.typography[`${node.name || 'text'}`] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
        };
      }
    }

    // Shadows
    if (node.effects && Array.isArray(node.effects)) {
      node.effects.forEach((effect) => {
        if (effect.type === 'DROP_SHADOW') {
          const shadow = `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px rgba(${Math.round((effect.color?.r || 0) * 255)},${Math.round((effect.color?.g || 0) * 255)},${Math.round((effect.color?.b || 0) * 255)},${effect.color?.a || 1})`;
          tokens.shadows[`${node.name || 'shadow'}`] = shadow;
        }
      });
    }

    if (node.children) {
      node.children.forEach(extractRecursive);
    }
  };

  extractRecursive(fileData.document);
  return tokens;
}

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function generateTailwindConfig(tokens) {
  const colors = Object.entries(tokens.colors)
    .slice(0, 20) // Limit to first 20 for readability
    .map(([key, value]) => `    '${key}': '${value}',`)
    .join('\n');

  return `// Auto-generated from Figma
module.exports = {
  theme: {
    extend: {
      colors: {
${colors}
      },
    },
  },
};`;
}

main().catch(console.error);



