#!/usr/bin/env tsx
/**
 * v0 UI Generation Script (DEV-ONLY)
 * Calls Vercel v0 Models API to generate Next.js pages
 * ⚠️ DEVELOPMENT ASSISTANCE ONLY - Never used in production runtime
 */

import * as fs from 'fs';
import * as path from 'path';

// FIXED MEMORY CONSTANTS (PERMANENT)
const AI_MODEL_PATH = '/Volumes/AI/Models';
const OLLAMA_HOME = '/Volumes/AI/ollama';
const V0_API_KEY = process.env.V0_API_KEY;
const V0_BASE_URL = 'https://api.v0.dev/v1';
const OUTPUT_DIR = path.join(process.cwd(), '_v0_suggestions');

function enforceFixedMemory() {
  const envModels = process.env.OLLAMA_MODELS;
  const envHome = process.env.OLLAMA_HOME;
  
  if (envModels && envModels !== AI_MODEL_PATH) {
    console.error(`❌ FATAL: OLLAMA_MODELS mismatch! Expected: ${AI_MODEL_PATH}, Got: ${envModels}`);
    process.exit(1);
  }
  if (envHome && envHome !== OLLAMA_HOME) {
    console.error(`❌ FATAL: OLLAMA_HOME mismatch! Expected: ${OLLAMA_HOME}, Got: ${envHome}`);
    process.exit(1);
  }
}

function validateEnvironment() {
  console.log('🔍 Validating environment...\n');
  enforceFixedMemory();
  
  if (!V0_API_KEY || V0_API_KEY.length < 20) {
    console.error('❌ ERROR: V0_API_KEY not configured');
    process.exit(1);
  }
  console.log(`✅ V0_API_KEY: ${V0_API_KEY.slice(0,12)}****...****${V0_API_KEY.slice(-4)}`);
  
  if (!fs.existsSync(AI_MODEL_PATH)) {
    fs.mkdirSync(AI_MODEL_PATH, { recursive: true });
    console.log('✅ Created ' + AI_MODEL_PATH);
  } else {
    console.log('✅ AI_MODEL_PATH: ' + AI_MODEL_PATH);
  }
  
  if (!fs.existsSync(OLLAMA_HOME)) {
    console.error(`❌ ERROR: ${OLLAMA_HOME} does not exist`);
    process.exit(1);
  }
  console.log('✅ OLLAMA_HOME: ' + OLLAMA_HOME);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('\n✅ Environment validation complete\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  v0 UI Generation Script (DEV-ONLY)        ║');
  console.log('╚════════════════════════════════════════════╝\n');
  validateEnvironment();
  console.log('✅ Ready to generate UI with v0\n');
  console.log('⚠️  Remember: v0 is DEV-ONLY, never in production runtime\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

export { validateEnvironment };
