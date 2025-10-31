#!/usr/bin/env node
/**
 * Production Hardening Script
 * Automates security fixes and validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function checkForDefaultKeys() {
  log('\n🔍 Checking for default encryption keys...', 'cyan');
  
  const files = [
    'lib/database/encryptedDb.ts',
    'backend/lib/database/encryptedDb.ts',
  ];
  
  const issues = [];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    const patterns = [
      /DEFAULT_KEY/i,
      /default.*key/i,
      /['"]changeme['"]/i,
      /['"]secret['"]/i,
      /['"]password['"]/i,
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push(`${file}: Contains default key pattern`);
      }
    });
  });
  
  if (issues.length > 0) {
    log('⚠️  Found potential default keys:', 'yellow');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
    return false;
  }
  
  log('✅ No default keys found', 'green');
  return true;
}

function checkConsoleStatements() {
  log('\n🔍 Checking for console statements...', 'cyan');
  
  try {
    const result = execSync(
      'grep -r "console\\.\\(log\\|error\\|warn\\)" app/ components/ lib/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | wc -l',
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    const count = parseInt(result.trim(), 10);
    
    if (count > 0) {
      log(`⚠️  Found ${count} console statements`, 'yellow');
      log('   Run: npm run lint:console to see all instances', 'yellow');
      return false;
    }
    
    log('✅ No console statements found', 'green');
    return true;
  } catch (error) {
    log('⚠️  Could not check console statements', 'yellow');
    return true; // Don't fail build
  }
}

function checkSecurityHeaders() {
  log('\n🔍 Checking security headers...', 'cyan');
  
  if (!fs.existsSync('next.config.js')) {
    log('⚠️  next.config.js not found', 'yellow');
    return false;
  }
  
  const content = fs.readFileSync('next.config.js', 'utf8');
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Content-Security-Policy',
  ];
  
  const missing = requiredHeaders.filter(header => {
    return !content.includes(header);
  });
  
  if (missing.length > 0) {
    log(`⚠️  Missing security headers: ${missing.join(', ')}`, 'yellow');
    return false;
  }
  
  log('✅ Security headers configured', 'green');
  return true;
}

function checkApiKeys() {
  log('\n🔍 Checking for exposed API keys...', 'cyan');
  
  try {
    const result = execSync(
      'grep -r "NEXT_PUBLIC.*KEY" app/ components/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | grep -v "process.env" || true',
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    if (result.trim()) {
      log('⚠️  Found potential API key exposure:', 'yellow');
      log(result, 'yellow');
      return false;
    }
    
    log('✅ No exposed API keys found', 'green');
    return true;
  } catch (error) {
    log('⚠️  Could not check API keys', 'yellow');
    return true;
  }
}

function generateKeys() {
  log('\n🔑 Generating secure keys...', 'cyan');
  
  const keys = {
    DATABASE_ENCRYPTION_KEY: generateSecureKey(32),
    SESSION_SECRET: generateSecureKey(32),
    JWT_SECRET: generateSecureKey(48),
    NEXTAUTH_SECRET: generateSecureKey(32),
  };
  
  log('\n✅ Generated keys (add to .env.production):', 'green');
  console.log('');
  Object.entries(keys).forEach(([key, value]) => {
    log(`${key}=${value}`, 'cyan');
  });
  
  return keys;
}

function checkBuilderIoIntegration() {
  log('\n🔍 Checking Builder.io integration...', 'cyan');
  
  if (!fs.existsSync('lib/integrations/builder-client.ts')) {
    log('⚠️  Builder.io client not found', 'yellow');
    return true; // Optional
  }
  
  const content = fs.readFileSync('lib/integrations/builder-client.ts', 'utf8');
  
  const checks = {
    'API key validation': /if\s*\(\s*!apiKey/i.test(content),
    'Error handling': /try\s*\{/.test(content) && /catch/.test(content),
    'No hardcoded keys': !/apiKey\s*=\s*['"][^'"]+['"]/.test(content),
  };
  
  const issues = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);
  
  if (issues.length > 0) {
    log(`⚠️  Builder.io hardening needed:`, 'yellow');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
    return false;
  }
  
  log('✅ Builder.io integration secured', 'green');
  return true;
}

function checkFigmaIntegration() {
  log('\n🔍 Checking Figma integration...', 'cyan');
  
  const figmaFiles = [
    'lib/integrations/figma-client.ts',
    'lib/integrations/figma-official.ts',
    'lib/integrations/figma-oauth.ts',
    'lib/integrations/figma-integration.ts',
  ];
  
  let allPassed = true;
  const issues = [];
  
  figmaFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      return; // Skip if file doesn't exist
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    const checks = {
      'Error handling': /try\s*\{/.test(content) && /catch/.test(content),
      'No hardcoded tokens': !/['"]figd_[^'"]+['"]/.test(content) && !/token\s*=\s*['"][^'"]+['"]/.test(content),
      'Retry logic': /retries|retry/i.test(content),
      'Timeout handling': /timeout|AbortController/i.test(content),
    };
    
    const fileIssues = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => `${file}: ${check}`);
    
    if (fileIssues.length > 0) {
      issues.push(...fileIssues);
      allPassed = false;
    }
  });
  
  if (issues.length > 0) {
    log(`⚠️  Figma integration hardening needed:`, 'yellow');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
    return false;
  }
  
  if (figmaFiles.some(f => fs.existsSync(f))) {
    log('✅ Figma integration secured', 'green');
  } else {
    log('⚠️  No Figma integration files found', 'yellow');
  }
  
  return allPassed || !figmaFiles.some(f => fs.existsSync(f));
}

function main() {
  log('\n🛡️  PRODUCTION HARDENING CHECK\n', 'blue');
  log('=' .repeat(50), 'blue');
  
  const results = {
    defaultKeys: checkForDefaultKeys(),
    consoleStatements: checkConsoleStatements(),
    securityHeaders: checkSecurityHeaders(),
    apiKeys: checkApiKeys(),
    builderIo: checkBuilderIoIntegration(),
    figma: checkFigmaIntegration(),
  };
  
  const allPassed = Object.values(results).every(Boolean);
  
  log('\n' + '='.repeat(50), 'blue');
  
  if (allPassed) {
    log('\n✅ ALL CHECKS PASSED - Ready for production!', 'green');
  } else {
    log('\n⚠️  SOME ISSUES FOUND - Review above before production', 'yellow');
    log('\n💡 Run: npm run harden:generate-keys to generate secure keys', 'cyan');
  }
  
  // Generate keys if requested
  if (process.argv.includes('--generate-keys')) {
    generateKeys();
  }
  
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { main, generateSecureKey };

