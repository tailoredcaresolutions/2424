#!/usr/bin/env node
/**
 * Guard against cloud AI usage in production code
 * Fails if blocklisted domains found in app/, lib/, or API routes
 */

const fs = require('fs');
const path = require('path');

const BLOCKLIST = [
  'api.openai.com',
  'api.v0.dev',
  'anthropic.com',
  'vertexai',
  'gemini',
  'together.ai',
  'replicate.com',
  'groq.com',
  'azureopenai',
  'cohere.com',
  'openrouter.ai',
  'ai-gateway.vercel'
];

const SCAN_DIRS = ['app', 'lib'];
const ALLOWED_DIRS = ['_v0_suggestions', 'scripts/dev', 'node_modules'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  for (const domain of BLOCKLIST) {
    if (content.includes(domain)) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(domain)) {
          violations.push({
            file: filePath,
            line: idx + 1,
            domain,
          });
        }
      });
    }
  }

  return violations;
}

function scanDirectory(dir) {
  const violations = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    // Skip allowed directories
    if (ALLOWED_DIRS.some(allowed => fullPath.includes(allowed))) {
      continue;
    }

    if (file.isDirectory()) {
      violations.push(...scanDirectory(fullPath));
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      violations.push(...scanFile(fullPath));
    }
  }

  return violations;
}

function main() {
  console.log('🛡️ Scanning for cloud AI usage in production code...\n');

  const allViolations = [];
  for (const dir of SCAN_DIRS) {
    if (fs.existsSync(dir)) {
      allViolations.push(...scanDirectory(dir));
    }
  }

  if (allViolations.length > 0) {
    console.error('❌ CLOUD AI DETECTED IN PRODUCTION CODE:\n');
    allViolations.forEach(v => {
      console.error(`  ${v.file}:${v.line} → ${v.domain}`);
    });
    console.error('\n⚠️ Production runtime MUST use local services only.');
    console.error('   Use lib/ai/llm.ts, lib/ai/stt.ts, lib/ai/tts.ts\n');
    process.exit(1);
  }

  console.log('✅ No cloud AI usage detected in production code');
  process.exit(0);
}

main();
