#!/usr/bin/env tsx
/**
 * Sync Figma Project Files
 * Lists all files in the project and extracts design tokens
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getFigmaClient } from '../lib/integrations/figma-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('🎨 Fetching Figma Project Files...\n', 'cyan');

  try {
    const client = getFigmaClient();
    const projectPath = process.env.FIGMA_FILE_KEY || '';

    if (!projectPath) {
      log('❌ FIGMA_FILE_KEY not set', 'red');
      process.exit(1);
    }

    log(`📁 Project Path: ${projectPath}`, 'blue');
    log('   Fetching all files...\n', 'yellow');

    // Get all files from project
    const files = await client.getAllFilesFromProject(projectPath);

    log(`✅ Found ${files.length} file(s) in project\n`, 'green');
    log('='.repeat(60), 'cyan');

    // List all files
    files.forEach((file, index) => {
      log(`\n${index + 1}. ${file.name}`, 'cyan');
      log(`   Key: ${file.key}`, 'blue');
      log(`   Modified: ${new Date(file.lastModified).toLocaleDateString()}`, 'blue');
      
      if (file.thumbnailUrl) {
        log(`   Thumbnail: ${file.thumbnailUrl}`, 'blue');
      }
    });

    log('\n' + '='.repeat(60), 'cyan');
    log('\n💡 Next Steps:', 'yellow');
    log('   1. Choose which files you want to sync', 'blue');
    log('   2. Run: npm run sync-figma-tokens <file-key>', 'blue');
    log('   3. Design tokens will be extracted to tailwind.config.ts', 'blue');

    // Save file list for reference
    const fs = await import('fs');
    const output = {
      projectPath,
      files: files.map(f => ({
        name: f.name,
        key: f.key,
        lastModified: f.lastModified,
      })),
      fetchedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      join(__dirname, '..', 'figma-files.json'),
      JSON.stringify(output, null, 2)
    );

    log('\n📄 File list saved to: figma-files.json', 'green');

  } catch (error: any) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();





