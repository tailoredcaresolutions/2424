#!/usr/bin/env node
/**
 * Test Figma OAuth2 Connection
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

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

async function testOAuth2() {
  log('\n🔐 Testing Figma OAuth2...', 'cyan');
  
  const clientId = process.env.FIGMA_CLIENT_ID;
  const clientSecret = process.env.FIGMA_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    log('   ❌ OAuth2 credentials missing', 'red');
    return null;
  }
  
  log(`   Client ID: ${clientId.substring(0, 8)}...`, 'blue');
  
  try {
    // Get OAuth2 token
    log('   Requesting access token...', 'blue');
    const tokenResponse = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      log(`   ❌ OAuth2 Error: ${tokenResponse.status}`, 'red');
      log(`   ${error}`, 'yellow');
      return null;
    }
    
    const tokenData = await tokenResponse.json();
    log(`   ✅ OAuth2 token obtained!`, 'green');
    log(`   Token: ${tokenData.access_token.substring(0, 20)}...`, 'blue');
    log(`   Expires in: ${tokenData.expires_in}s`, 'blue');
    
    // Test API access with OAuth token
    log('\n   Testing API access with OAuth token...', 'blue');
    const meResponse = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (meResponse.ok) {
      const me = await meResponse.json();
      log(`   ✅ API access working!`, 'green');
      log(`   Account: ${me.email || me.handle || 'Connected'}`, 'blue');
      
      // Try to get teams with OAuth token
      const teamsResponse = await fetch('https://api.figma.com/v1/teams', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (teamsResponse.ok) {
        const teams = await teamsResponse.json();
        log(`   👥 Teams: ${teams.teams?.length || 0}`, 'green');
        
        // List all projects and files
        for (const team of teams.teams || []) {
          log(`\n   📂 Team: ${team.name}`, 'cyan');
          
          try {
            const projectsRes = await fetch(`https://api.figma.com/v1/teams/${team.id}/projects`, {
              headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
            });
            
            if (projectsRes.ok) {
              const projects = await projectsRes.json();
              log(`      Projects: ${projects.projects?.length || 0}`, 'blue');
              
              for (const project of projects.projects || []) {
                log(`\n      📁 Project: ${project.name} (${project.id})`, 'yellow');
                
                
                // Get files
                try {
                  const filesRes = await fetch(`https://api.figma.com/v1/projects/${project.id}/files`, {
                    headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
                  });
                  
                  if (filesRes.ok) {
                    const files = await filesRes.json();
                    log(`         Files: ${files.files?.length || 0}`, 'green');
                    
                    files.files?.slice(0, 5).forEach(file => {
                      log(`         📄 ${file.name} (key: ${file.key})`, 'blue');
                    });
                    
                    if (files.files?.length > 5) {
                      log(`         ... and ${files.files.length - 5} more`, 'blue');
                    }
                  }
                } catch (error) {
                  log(`         ⚠️  Could not list files: ${error.message}`, 'yellow');
                }
              }
            }
          } catch (error) {
            log(`      ⚠️  Could not list projects: ${error.message}`, 'yellow');
          }
        }
      } else {
        log(`   ⚠️  Teams endpoint: ${teamsResponse.status}`, 'yellow');
        const error = await teamsResponse.text();
        log(`   ${error.substring(0, 200)}`, 'yellow');
      }
      
      return tokenData.access_token;
    } else {
      log(`   ❌ API access failed: ${meResponse.status}`, 'red');
      return null;
    }
    
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function tryDirectFileAccess() {
  log('\n📄 File Access Information...', 'cyan');
  log('   To access a file, use the file_key from the Figma URL', 'blue');
  log('   Example: https://www.figma.com/file/{file_key}/FileName', 'blue');
}

async function main() {
  log('🚀 Testing Figma OAuth2 Integration\n', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const token = await testOAuth2();
  
  if (token) {
    await tryDirectFileAccess();
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  log('\n✅ OAuth2 test complete!\n', 'green');
}

main().catch(console.error);


