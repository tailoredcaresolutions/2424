#!/usr/bin/env node
/**
 * Complete Figma Exploration
 * Using Context7 knowledge + Official API docs
 * Tries all possible methods to access files
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

async function fetchFigma(endpoint, token = FIGMA_TOKEN) {
  try {
    const response = await fetch(`${FIGMA_BASE}${endpoint}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });
    
    const data = response.ok ? await response.json() : await response.text();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: error.message,
    };
  }
}

async function exploreAllOptions() {
  log('\n🔍 Complete Figma Exploration\n', 'cyan');
  log('Using Context7 knowledge + Official API docs', 'blue');
  log('='.repeat(70), 'cyan');

  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_API_TOKEN not set', 'red');
    return;
  }

  const results = {
    account: null,
    teams: null,
    projects: [],
    files: [],
    methods: [],
  };

  // 1. Verify account
  log('\n1️⃣  Verifying Account Access...', 'cyan');
  const me = await fetchFigma('/me');
  if (me.ok) {
    results.account = me.data;
    log(`   ✅ Connected: ${me.data.email}`, 'green');
    log(`   🆔 User ID: ${me.data.id}`, 'blue');
    results.methods.push('Personal token valid');
  } else {
    log(`   ❌ Failed: ${me.status}`, 'red');
    return;
  }

  // 2. Try OAuth2 token generation (if credentials available)
  let oauthToken = null;
  if (FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET) {
    log('\n2️⃣  Attempting OAuth2 Token Generation...', 'cyan');
    
    // Try multiple OAuth2 endpoints per Context7 research
    const oauthEndpoints = [
      'https://www.figma.com/api/oauth/token',
      'https://api.figma.com/v1/oauth/token',
      'https://www.figma.com/oauth/token',
    ];

    for (const endpoint of oauthEndpoints) {
      log(`   Trying: ${endpoint}`, 'blue');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: FIGMA_CLIENT_ID,
            client_secret: FIGMA_CLIENT_SECRET,
            grant_type: 'client_credentials',
          }),
        });

        if (response.ok) {
          const tokenData = await response.json();
          oauthToken = tokenData.access_token;
          log(`   ✅ OAuth2 token obtained!`, 'green');
          log(`   Token: ${oauthToken.substring(0, 20)}...`, 'blue');
          results.methods.push('OAuth2 client credentials');
          break;
        } else {
          log(`   ❌ ${response.status}: ${await response.text()}`, 'yellow');
        }
      } catch (error) {
        log(`   ❌ Error: ${error.message}`, 'yellow');
      }
    }

    if (!oauthToken) {
      log(`   💡 OAuth2 may require authorization code flow`, 'blue');
      log(`   💡 According to docs: needs redirect URL + user consent`, 'blue');
    }
  }

  // 3. Test teams with both tokens
  log('\n3️⃣  Testing Teams Access...', 'cyan');
  const teams = await fetchFigma('/teams');
  
  if (teams.ok) {
    log(`   ✅ Teams accessible!`, 'green');
    log(`   👥 Teams: ${teams.data.teams?.length || 0}`, 'blue');
    results.teams = teams.data.teams;
    
    // Explore each team
    for (const team of teams.data.teams || []) {
      log(`\n   📂 Team: ${team.name} (${team.id})`, 'magenta');
      
      const projects = await fetchFigma(`/teams/${team.id}/projects`);
      if (projects.ok) {
        log(`      Projects: ${projects.data.projects?.length || 0}`, 'green');
        
        for (const project of projects.data.projects || []) {
          log(`\n      📁 ${project.name} (${project.id})`, 'yellow');
          
          
          const files = await fetchFigma(`/projects/${project.id}/files`);
          if (files.ok) {
            const projectFiles = files.data.files || [];
            log(`         📄 Files: ${projectFiles.length}`, 'green');
            
            projectFiles.forEach(file => {
              log(`            • ${file.name} (${file.key})`, 'blue');
              results.files.push({
                key: file.key,
                name: file.name,
                project: project.name,
                projectId: project.id,
              });
            });
            
            results.projects.push({
              ...project,
              files: projectFiles,
            });
          }
        }
      }
    }
  } else {
    log(`   ⚠️  Teams: ${teams.status}`, 'yellow');
    log(`   💡 Personal accounts don't have teams`, 'blue');
    log(`   💡 Need organization account OR file keys directly`, 'blue');
  }

  // 4. File access information
  log('\n4️⃣  File Access Information...', 'cyan');
  log(`   💡 To access a file, use the file_key from the Figma URL`, 'blue');
  log(`      Example: https://www.figma.com/file/{file_key}/FileName`, 'blue');

  // 5. Try OAuth token if we got one
  if (oauthToken) {
    log('\n5️⃣  Testing OAuth Token Access...', 'cyan');
    const oauthMe = await fetchFigma('/me', oauthToken);
    if (oauthMe.ok) {
      log(`   ✅ OAuth token works for API!`, 'green');
      results.methods.push('OAuth2 API access');
    } else {
      log(`   ⚠️  OAuth token: ${oauthMe.status}`, 'yellow');
    }
  }

  // 6. Try discovery endpoints
  log('\n6️⃣  Testing Discovery/Alternative Methods...', 'cyan');
  
  // According to Context7, might be other endpoints
  const discoveryEndpoints = [
    '/files', // List all files? (probably won't work)
    '/me/files', // User files?
  ];

  for (const endpoint of discoveryEndpoints) {
    log(`   Testing: ${endpoint}`, 'blue');
    const test = await fetchFigma(endpoint);
    if (test.ok) {
      log(`   ✅ ${endpoint} works!`, 'green');
      results.methods.push(`Alternative endpoint: ${endpoint}`);
      
      // If it's a files list, extract keys
      if (test.data.files) {
        test.data.files.forEach(file => {
          results.files.push({
            key: file.key,
            name: file.name,
            source: endpoint,
          });
        });
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('\n📊 Exploration Summary:', 'cyan');
  log(`   ✅ Account: ${results.account?.email}`, 'green');
  log(`   ${results.teams ? '✅' : '⚠️ '} Teams: ${results.teams ? results.teams.length : 'Not accessible'}`, results.teams ? 'green' : 'yellow');
  log(`   📁 Projects Found: ${results.projects.length}`, 'blue');
  log(`   📄 Files Found: ${results.files.length}`, results.files.length > 0 ? 'green' : 'yellow');
  log(`   🔧 Methods: ${results.methods.join(', ')}`, 'blue');

  if (results.files.length > 0) {
    log(`\n🎯 Accessible Files:`, 'cyan');
    results.files.forEach((file, i) => {
      log(`   ${i + 1}. ${file.name} (key: ${file.key})`, 'green');
    });
  }

  // Save results
  fs.writeFileSync(
    join(__dirname, '..', 'figma-exploration-complete.json'),
    JSON.stringify(results, null, 2)
  );
  log(`\n💾 Complete results saved to figma-exploration-complete.json`, 'green');

  // Recommendations
  log('\n💡 Recommendations:', 'cyan');
  if (results.files.length === 0) {
    log(`   1. Get file keys from Figma URLs:`, 'blue');
    log(`      https://www.figma.com/file/FILE_KEY/FileName`, 'blue');
    log(`   2. Or upgrade to organization account for team access`, 'blue');
    log(`   3. Or complete OAuth2 authorization flow`, 'blue');
  } else {
    log(`   ✅ Files accessible! I can now extract design tokens.`, 'green');
  }

  log('\n✅ Exploration complete!\n', 'green');
}

exploreAllOptions().catch(console.error);


