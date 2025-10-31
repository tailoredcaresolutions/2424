#!/usr/bin/env node
/**
 * Complete Figma API Access Test
 * Tests both personal token and OAuth2
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

async function fetchFigma(endpoint, useOAuth = false) {
  let headers = {};
  
  if (useOAuth && FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET) {
    // Get OAuth token first
    try {
      const tokenRes = await fetch('https://www.figma.com/api/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: FIGMA_CLIENT_ID,
          client_secret: FIGMA_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      });
      
      if (tokenRes.ok) {
        const { access_token } = await tokenRes.json();
        headers['Authorization'] = `Bearer ${access_token}`;
      }
    } catch (error) {
      // Fallback to personal token
      headers['X-Figma-Token'] = FIGMA_TOKEN;
    }
  } else {
    headers['X-Figma-Token'] = FIGMA_TOKEN;
  }
  
  const response = await fetch(`${FIGMA_BASE}${endpoint}`, { headers });
  
  return {
    ok: response.ok,
    status: response.status,
    data: response.ok ? await response.json() : await response.text(),
  };
}

async function testAllEndpoints() {
  log('\n🚀 Complete Figma API Access Test\n', 'cyan');
  log('='.repeat(70), 'cyan');
  
  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_API_TOKEN not set', 'red');
    return;
  }
  
  const results = {
    personalToken: {},
    oauth2: {},
    filesFound: [],
  };
  
  // 1. Test account access
  log('\n📧 1. Testing Account Access...', 'cyan');
  const me = await fetchFigma('/me');
  if (me.ok) {
    log(`   ✅ Connected as: ${me.data.email || me.data.handle}`, 'green');
    results.account = me.data;
  } else {
    log(`   ❌ Failed: ${me.status}`, 'red');
    return;
  }
  
  // 2. Try to get teams
  log('\n👥 2. Testing Teams Access...', 'cyan');
  const teams = await fetchFigma('/teams');
  if (teams.ok) {
    log(`   ✅ Found ${teams.data.teams?.length || 0} team(s)`, 'green');
    results.personalToken.teams = teams.data.teams;
    
    // Get all projects and files
    if (teams.data.teams?.length > 0) {
      await exploreTeamsAndFiles(teams.data.teams, results);
    }
  } else {
    log(`   ⚠️  Teams endpoint: ${teams.status}`, 'yellow');
    log(`   Response: ${teams.data.substring(0, 200)}`, 'yellow');
    log(`   💡 Personal account might not have teams access`, 'blue');
  }
  
  // 3. File access information
  log('\n📄 3. File Access Information...', 'cyan');
  log(`   💡 To access a file, use the file_key from the Figma URL`, 'blue');
  log(`      Example: https://www.figma.com/file/{file_key}/FileName`, 'blue');
  
  // 4. Try OAuth2 if credentials available
  if (FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET) {
    log('\n🔐 4. Testing OAuth2 Access...', 'cyan');
    log('   Note: Figma OAuth2 may use different flow (authorization code)', 'blue');
    
    try {
      // Try client credentials
      const oauthRes = await fetch('https://www.figma.com/api/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: FIGMA_CLIENT_ID,
          client_secret: FIGMA_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      });
      
      if (oauthRes.ok) {
        const tokenData = await oauthRes.json();
        log(`   ✅ OAuth2 token obtained!`, 'green');
        log(`   Token: ${tokenData.access_token.substring(0, 20)}...`, 'blue');
        
        // Test API with OAuth token
        const oauthMe = await fetch(`${FIGMA_BASE}/me`, {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });
        
        if (oauthMe.ok) {
          const oauthData = await oauthMe.json();
          log(`   ✅ API access working with OAuth!`, 'green');
          log(`   Account: ${oauthData.email || oauthData.handle}`, 'blue');
          results.oauth2.working = true;
        } else {
          log(`   ⚠️  API access with OAuth: ${oauthMe.status}`, 'yellow');
        }
      } else {
        const error = await oauthRes.text();
        log(`   ⚠️  OAuth2 token request: ${oauthRes.status}`, 'yellow');
        log(`   ${error.substring(0, 300)}`, 'yellow');
        log(`   💡 Figma may require authorization code flow (user consent)`, 'blue');
      }
    } catch (error) {
      log(`   ⚠️  OAuth2 error: ${error.message}`, 'yellow');
    }
  }
  
  // 5. Try alternative endpoints
  log('\n🔍 5. Testing Alternative Endpoints...', 'cyan');
  
  // Try file nodes endpoint
  log('   Testing file nodes endpoint...', 'blue');
  const testNodes = await fetchFigma('/files/test/nodes?ids=0:1');
  if (!testNodes.ok && testNodes.status !== 404) {
    log(`   ⚠️  Status: ${testNodes.status}`, 'yellow');
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('\n📊 Test Summary:', 'cyan');
  log(`   ✅ Account Access: Working`, 'green');
  log(`   ${teams.ok ? '✅' : '⚠️ '} Teams Access: ${teams.ok ? 'Working' : teams.status}`, teams.ok ? 'green' : 'yellow');
  log(`   Files Found: ${results.filesFound.length}`, 'blue');
  
  // Save results
  fs.writeFileSync(
    join(__dirname, '..', 'figma-api-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  log(`\n💾 Results saved to figma-api-test-results.json`, 'green');
  
  if (results.filesFound.length > 0) {
    log(`\n🎯 Accessible Files:`, 'cyan');
    results.filesFound.forEach(file => {
      log(`   📄 ${file.name} (key: ${file.key})`, 'blue');
    });
  }
  
  log('\n✅ API test complete!\n', 'green');
}

async function exploreTeamsAndFiles(teams, results) {
  for (const team of teams) {
    log(`\n   📂 Exploring Team: ${team.name}`, 'magenta');
    
    const projects = await fetchFigma(`/teams/${team.id}/projects`);
    if (projects.ok) {
      log(`      Projects: ${projects.data.projects?.length || 0}`, 'blue');
      
      for (const project of projects.data.projects || []) {
        log(`\n      📁 Project: ${project.name} (${project.id})`, 'yellow');
        
        // Check if this is our target
        
        const files = await fetchFigma(`/projects/${project.id}/files`);
        if (files.ok) {
          const projectFiles = files.data.files || [];
          log(`         📄 Files: ${projectFiles.length}`, 'green');
          
          projectFiles.forEach(file => {
            log(`            • ${file.name} (${file.key})`, 'blue');
            results.filesFound.push({
              key: file.key,
              name: file.name,
              project: project.name,
              projectId: project.id,
              team: team.name,
            });
          });
        }
      }
    }
  }
}

function extractComponents(node, components = []) {
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    components.push({
      id: node.id,
      name: node.name,
      type: node.type,
    });
  }
  if (node.children) {
    node.children.forEach(child => extractComponents(child, components));
  }
  return components;
}

testAllEndpoints().catch(console.error);


