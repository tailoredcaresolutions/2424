#!/usr/bin/env tsx
/**
 * Extract Figma Design Tokens - iOS 26 Liquid Glass Compliance
 * 
 * Usage:
 *   tsx scripts/extract-figma-ios26-tokens.ts <file-key>
 * 
 * Validates all extracted tokens against iOS 26/macOS 26 strict specifications
 */

import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import { FigmaOfficialClient } from '../lib/integrations/figma-official.js';
import { FigmaIOS26Extractor } from '../lib/integrations/figma-ios26-extractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const FIGMA_TOKEN = process.env.FIGMA_API_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('❌ FIGMA_API_TOKEN not set in .env.local');
  process.exit(1);
}

const fileKey = process.argv[2];

if (!fileKey) {
  console.error('❌ Usage: tsx scripts/extract-figma-ios26-tokens.ts <file-key>');
  console.error('   Get file key from: https://www.figma.com/file/{file-key}/FileName');
  process.exit(1);
}

async function main() {
  console.log('\n🎨 Extracting Figma Tokens - iOS 26 Liquid Glass Compliance\n');
  console.log('=' .repeat(70));

  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_API_TOKEN is required');
  }
  const client = new FigmaOfficialClient(FIGMA_TOKEN);
  const extractor = new FigmaIOS26Extractor(client);

  console.log(`📄 File Key: ${fileKey}\n`);
  console.log('🔍 Extracting tokens...\n');

  try {
    const result = await extractor.extractTokens(fileKey);

    console.log(`✅ Extraction Complete!\n`);
    console.log(`📊 Compliance Report:`);
    console.log(`   Total Tokens: ${result.compliance.total}`);
    console.log(`   ✅ Compliant: ${result.compliance.compliant}`);
    console.log(`   ⚠️  Non-Compliant: ${result.compliance.nonCompliant}\n`);

    if (result.compliance.errors.length > 0) {
      console.log(`❌ Validation Errors:\n`);
      result.compliance.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
      console.log('');
    }

    // Save tokens
    const tokensFile = join(__dirname, '..', `figma-ios26-tokens-${fileKey}.json`);
    writeFileSync(
      tokensFile,
      JSON.stringify(result, null, 2)
    );
    console.log(`💾 Tokens saved to: figma-ios26-tokens-${fileKey}.json\n`);

    // Generate CSS if tokens are compliant
    if (result.compliance.compliant > 0) {
      const css = extractor.generateIOS26CSS(result.tokens);
      const cssFile = join(__dirname, '..', `figma-ios26-generated.css`);
      writeFileSync(cssFile, css);
      console.log(`💾 Generated CSS: figma-ios26-generated.css\n`);
    }

    // Show palette and specs
    console.log('📐 iOS 26 Specifications:\n');
    const specs = extractor.getSpecs();
    console.log(`   Blur: ${specs.blur}px`);
    console.log(`   Saturate: ${specs.saturate}%`);
    console.log(`   Background Opacity: ${specs.backgroundOpacity.min}-${specs.backgroundOpacity.max}`);
    console.log(`   Border Opacity: ${specs.borderOpacity.min}-${specs.borderOpacity.max}`);
    console.log(`   Border Radius: ${specs.borderRadius.small}px, ${specs.borderRadius.standard}px, ${specs.borderRadius.large}px\n`);

    const palette = extractor.getPalette();
    console.log('🎨 Approved Color Palette:\n');
    console.log('   Blue:');
    Object.entries(palette.blue).forEach(([name, color]) => {
      console.log(`     ${name}: ${color}`);
    });
    console.log('   Gold:');
    Object.entries(palette.gold).forEach(([name, color]) => {
      console.log(`     ${name}: ${color}`);
    });
    console.log('');

  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();


