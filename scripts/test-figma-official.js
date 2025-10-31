#!/usr/bin/env node
/**
 * Test Figma API Using Official Documentation
 * Based on: https://developers.figma.com/docs/rest-api/
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const FIGMA_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET;
const FIGMA_BASE = 'https://api.figma.com/v1';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchFigma(endpoint, options = {}) {
  const headers = {
    'X-Figma-Token': FIGMA_TOKEN,
    ...options.headers,
  };

  const response = await fetch(`${FIGMA_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return {
    ok: response.ok,
    status: response.status,
    data: response.ok ? await response.json() : await response.text(),
  };
}

async function testOfficialEndpoints() {
  log('\n🎨 Testing Figma API (Official Documentation)\n', 'cyan');
  log('Based on: https://developers.figma.com/docs/rest-api/', 'blue');
  log('='.repeat(70), 'cyan');

  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_API_TOKEN not set', 'red');
    return;
  }

  // 1. Test /me endpoint (official)
  log('\n1️⃣  Testing /me endpoint (User Info)...', 'cyan');
  const me = await fetchFigma('/me');
  if (me.ok) {
    log(`   ✅ Connected!`, 'green');
    log(`   👤 Email: ${me.data.email}`, 'blue');
    log(`   👤 Handle: ${me.data.handle}`, 'blue');
    log(`   🆔 ID: ${me.data.id}`, 'blue');
  } else {
    log(`   ❌ Failed: ${me.status} - ${me.data}`, 'red');
    return;
  }

  // 2. File access information
  log('\n2️⃣  File Access Information...', 'cyan');
  log('   Endpoint: GET /v1/files/{file_key}', 'blue');
  log(`   💡 To access a file, use the file_key from the Figma URL`, 'blue');
  log(`      Example: https://www.figma.com/file/{file_key}/FileName`, 'blue');

  // 3. Test teams endpoint (official)
  log('\n3️⃣  Testing Teams Endpoint...', 'cyan');
  log('   Endpoint: GET /v1/teams', 'blue');
  const teams = await fetchFigma('/teams');
  
  if (teams.ok) {
    log(`   ✅ Teams accessible!`, 'green');
    log(`   👥 Teams: ${teams.data.teams?.length || 0}`, 'blue');
    
    // List teams
    teams.data.teams?.forEach(team => {
      log(`      • ${team.name} (${team.id})`, 'blue');
    });
    
    // Try to get projects for each team
    if (teams.data.teams?.length > 0) {
      log(`\n4️⃣  Testing Projects Access...`, 'cyan');
      for (const team of teams.data.teams) {
        log(`\n   📂 Team: ${team.name}`, 'yellow');
        
        const projects = await fetchFigma(`/teams/${team.id}/projects`);
        if (projects.ok) {
          log(`      Projects: ${projects.data.projects?.length || 0}`, 'green');
          
          for (const project of projects.data.projects || []) {
            log(`\n      📁 ${project.name} (${project.id})`, 'cyan');
            
            
            // Get files in project
            const files = await fetchFigma(`/projects/${project.id}/files`);
            if (files.ok) {
              const projectFiles = files.data.files || [];
              log(`         📄 Files: ${projectFiles.length}`, 'green');
              
              projectFiles.slice(0, 5).forEach(file => {
                log(`            • ${file.name} (key: ${file.key})`, 'blue');
              });
              
              if (projectFiles.length > 5) {
                log(`            ... and ${projectFiles.length - 5} more`, 'blue');
              }
            }
          }
        }
      }
    }
  } else {
    log(`   ⚠️  Teams endpoint: ${teams.status}`, 'yellow');
    log(`   💡 Personal/Free accounts may not have teams`, 'blue');
    log(`   💡 According to docs: Teams require Figma organization account`, 'blue');
  }

  // 4. Try OAuth2 (if credentials available)
  if (FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET) {
    log('\n5️⃣  Testing OAuth2...', 'cyan');
    log('   Note: Figma OAuth2 uses authorization code flow', 'blue');
    log('   Requires user consent and redirect URL setup', 'blue');
    
    // According to docs, OAuth2 flow requires:
    // 1. Redirect user to authorization URL
    // 2. User grants permission
    // 3. Exchange authorization code for token
    log(`   💡 To use OAuth2:`, 'yellow');
    log(`      1. Configure redirect URL in Figma app settings`, 'blue');
    log(`      2. Redirect user to authorization URL`, 'blue');
    log(`      3. Exchange code for access token`, 'blue');
    log(`   💡 For now, using personal access token works!`, 'green');
  }

  log('\n' + '='.repeat(70), 'cyan');
  log('\n✅ Test Complete!', 'green');
  log('\n📚 Official Docs: https://developers.figma.com/docs/rest-api/', 'blue');
}

function countComponents(node, count = 0) {
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    count++;
  }
  if (node.children) {
    node.children.forEach(child => {
      count = countComponents(child, count);
    });
  }
  return count;
}

testOfficialEndpoints().catch(console.error);


