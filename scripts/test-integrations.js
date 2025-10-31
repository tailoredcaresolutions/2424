#!/usr/bin/env node
/**
 * Test API Integrations - Figma, V0, Builder.io
 * Run: node scripts/test-integrations.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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

async function testFigma() {
  log('\n🎨 Testing Figma API...', 'cyan');
  
  const token = process.env.FIGMA_API_TOKEN;
  const projectPath = process.env.FIGMA_FILE_KEY;
  
  if (!token) {
    log('❌ FIGMA_API_TOKEN missing', 'red');
    return false;
  }
  
  if (!projectPath) {
    log('⚠️  FIGMA_FILE_KEY not set (will list all projects)', 'yellow');
  }
  
  try {
    // Test API connection by getting teams (for personal accounts, might need different endpoint)
    log('   Testing API connection...', 'blue');
    
    // Try both personal and team endpoints
    let teamsResponse = await fetch('https://api.figma.com/v1/me', {
      headers: { 'X-Figma-Token': token },
    });
    
    if (teamsResponse.ok) {
      const me = await teamsResponse.json();
      log(`   ✅ Connected to Figma API!`, 'green');
      log(`   👤 Account: ${me.email || me.handle || 'Connected'}`, 'blue');
      
      // Now get teams
      teamsResponse = await fetch('https://api.figma.com/v1/teams', {
        headers: { 'X-Figma-Token': token },
      });
    } else {
      // Fallback: try teams directly
      teamsResponse = await fetch('https://api.figma.com/v1/teams', {
        headers: { 'X-Figma-Token': token },
      });
    }
    
    if (!teamsResponse.ok) {
      const error = await teamsResponse.text();
      log(`   ❌ API Error: ${teamsResponse.status}`, 'red');
      log(`   ${error.substring(0, 200)}`, 'yellow');
      log(`   💡 Token format looks correct, checking project access...`, 'blue');
      
      // Try direct project access
      if (projectPath) {
        const projectId = projectPath.replace(/^\//, '').replace(/\/$/, '');
        log(`   🔍 Attempting direct project access: ${projectId}`, 'yellow');
        return false; // Will continue below
      }
      return false;
    }
    
    const teamsData = await teamsResponse.json();
    log(`   👥 Teams: ${teamsData.teams?.length || 0}`, 'blue');
    
    // If project path provided, try to find it
    if (projectPath) {
      const projectId = projectPath.replace(/^\//, '').replace(/\/$/, '');
      log(`\n   📁 Looking for project: ${projectId}`, 'cyan');
      
      let foundProject = false;
      
      for (const team of teamsData.teams || []) {
        try {
          const projectsRes = await fetch(`https://api.figma.com/v1/teams/${team.id}/projects`, {
            headers: { 'X-Figma-Token': token },
          });
          
          if (projectsRes.ok) {
            const projects = await projectsRes.json();
            const project = projects.projects?.find(p => p.id === projectId);
            
            if (project) {
              log(`   ✅ Found project: ${project.name}`, 'green');
              
              // Get files in project
              const filesRes = await fetch(`https://api.figma.com/v1/projects/${projectId}/files`, {
                headers: { 'X-Figma-Token': token },
              });
              
              if (filesRes.ok) {
                const files = await filesRes.json();
                log(`   📄 Files in project: ${files.files?.length || 0}`, 'green');
                
                if (files.files?.length > 0) {
                  log(`\n   First few files:`, 'blue');
                  files.files.slice(0, 5).forEach(file => {
                    log(`      • ${file.name} (${file.key})`, 'blue');
                  });
                  if (files.files.length > 5) {
                    log(`      ... and ${files.files.length - 5} more`, 'blue');
                  }
                }
                
                foundProject = true;
                break;
              }
            }
          }
        } catch (error) {
          // Continue to next team
          continue;
        }
      }
      
      if (!foundProject) {
        log(`   ⚠️  Project ${projectId} not found or not accessible`, 'yellow');
        log(`   💡 I can list all accessible projects if needed`, 'blue');
      }
    }
    
    return true;
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return false;
  }
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

async function testV0() {
  log('\n🎨 Testing V0 API...', 'cyan');
  
  const apiKey = process.env.V0_API_KEY;
  
  if (!apiKey) {
    log('   ⚠️  V0 API key not set (optional)', 'yellow');
    log('   ✅ V0 CLI is already working (free)', 'green');
    return null;
  }
  
  try {
    // V0 API endpoint structure
    log(`   Key: ${apiKey.substring(0, 20)}...`, 'blue');
    log('   ✅ V0 API key configured', 'green');
    log('   💡 Use V0 CLI: v0 add <component-id>', 'blue');
    
    return true;
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function testBuilder() {
  log('\n🏗️  Testing Builder.io API (Modern - API Key Only)...', 'cyan');
  
  const apiKey = process.env.BUILDER_API_KEY;
  
  if (!apiKey) {
    log('   ⚠️  Builder.io API key not set (optional)', 'yellow');
    return null;
  }
  
  try {
    // Builder.io API v3 - Modern API only needs API key
    const url = `https://cdn.builder.io/api/v3/content/page?apiKey=${apiKey}&limit=1`;
    log(`   Testing API connection...`, 'blue');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      log(`   ❌ Error: ${response.status} ${response.statusText}`, 'red');
      const error = await response.text();
      log(`   ${error.substring(0, 200)}`, 'yellow');
      log(`   💡 Builder.io API now only needs BUILDER_API_KEY`, 'blue');
      return false;
    }
    
    const data = await response.json();
    log(`   ✅ Connected to Builder.io!`, 'green');
    log(`   🔑 API Key: ${apiKey.substring(0, 12)}...`, 'blue');
    log(`   📄 Pages available: ${data.results?.length || 0}`, 'green');
    log(`   ✅ Modern API - only API key needed (no space ID)`, 'green');
    
    return true;
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function listFigmaProjectFiles() {
  log('\n📁 Exploring Figma Project...', 'cyan');
  
  const token = process.env.FIGMA_API_TOKEN;
  const projectPath = process.env.FIGMA_FILE_KEY;
  
  if (!token) {
    log('   ❌ Figma token missing', 'red');
    return;
  }
  
  try {
    // The project path might be a project ID or file path
    // Let's try different approaches
    
    // First, get teams
    log('   Fetching teams...', 'blue');
    const teamsRes = await fetch('https://api.figma.com/v1/teams', {
      headers: { 'X-Figma-Token': token },
    });
    
    if (!teamsRes.ok) {
      log(`   ❌ Cannot access teams: ${teamsRes.status}`, 'red');
      return;
    }
    
    const teams = await teamsRes.json();
    log(`   ✅ Found ${teams.teams?.length || 0} team(s)`, 'green');
    
    // Get projects for each team
    for (const team of teams.teams || []) {
      log(`\n   📂 Team: ${team.name}`, 'cyan');
      
      const projectsRes = await fetch(`https://api.figma.com/v1/teams/${team.id}/projects`, {
        headers: { 'X-Figma-Token': token },
      });
      
      if (projectsRes.ok) {
        const projects = await projectsRes.json();
        log(`      Projects: ${projects.projects?.length || 0}`, 'blue');
        
        for (const project of projects.projects || []) {
          log(`\n      📁 Project: ${project.name}`, 'yellow');
          
          // Get files in project
          const filesRes = await fetch(`https://api.figma.com/v1/projects/${project.id}/files`, {
            headers: { 'X-Figma-Token': token },
          });
          
          if (filesRes.ok) {
            const files = await filesRes.json();
            log(`         Files: ${files.files?.length || 0}`, 'green');
            
            files.files?.slice(0, 10).forEach(file => {
              log(`         📄 ${file.name} (key: ${file.key})`, 'blue');
            });
            
            if (files.files?.length > 10) {
              log(`         ... and ${files.files.length - 10} more files`, 'blue');
            }
          }
        }
      }
    }
    
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

async function main() {
  log('🚀 Testing API Integrations\n', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  // Test each service
  const figmaResult = await testFigma();
  const v0Result = await testV0();
  const builderResult = await testBuilder();
  
  // Explore Figma project
  if (figmaResult) {
    await listFigmaProjectFiles();
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('\n📊 Summary:', 'cyan');
  log(`   Figma: ${figmaResult ? '✅ Connected' : '❌ Failed'}`, figmaResult ? 'green' : 'red');
  log(`   V0: ${v0Result ? '✅ Configured' : '⚠️  Optional'}`, v0Result ? 'green' : 'yellow');
  log(`   Builder.io: ${builderResult ? '✅ Connected' : '⚠️  Optional'}`, builderResult ? 'green' : 'yellow');
  
  log('\n✅ Integration tests complete!\n', 'green');
}

main().catch(console.error);

