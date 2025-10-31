#!/usr/bin/env node
/**
 * Explore Figma Account - Find all accessible files/projects
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const FIGMA_TOKEN = process.env.FIGMA_API_TOKEN;
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

async function fetchFigma(endpoint) {
  const response = await fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });
  
  if (!response.ok) {
    const error = await response.text();
    return { error: `${response.status}: ${error.substring(0, 200)}` };
  }
  
  return await response.json();
}

async function exploreAccount() {
  log('🔍 Exploring Figma Account...\n', 'cyan');
  
  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_API_TOKEN not set', 'red');
    return;
  }
  
  // 1. Get user info
  log('1. Getting account info...', 'blue');
  const me = await fetchFigma('/me');
  if (me.error) {
    log(`   ❌ ${me.error}`, 'red');
  } else {
    log(`   ✅ Account: ${me.email || me.handle}`, 'green');
  }
  
  // 2. Try to get teams
  log('\n2. Getting teams...', 'blue');
  const teams = await fetchFigma('/teams');
  
  if (teams.error) {
    log(`   ⚠️  ${teams.error}`, 'yellow');
    log('   💡 Personal accounts might not have teams endpoint', 'blue');
    log('   💡 Trying alternative methods...\n', 'blue');
    
    // Try direct file access
    await tryDirectFileAccess();
    return;
  }
  
  log(`   ✅ Found ${teams.teams?.length || 0} team(s)`, 'green');
  
  // 3. For each team, get projects and files
  const allFiles = [];
  
  for (const team of teams.teams || []) {
    log(`\n   📂 Team: ${team.name} (${team.id})`, 'cyan');
    
    const projects = await fetchFigma(`/teams/${team.id}/projects`);
    
    if (projects.error) {
      log(`      ⚠️  ${projects.error}`, 'yellow');
      continue;
    }
    
    log(`      Projects: ${projects.projects?.length || 0}`, 'blue');
    
    for (const project of projects.projects || []) {
      log(`\n      📁 Project: ${project.name} (${project.id})`, 'yellow');
      
      
      const files = await fetchFigma(`/projects/${project.id}/files`);
      
      if (files.error) {
        log(`         ⚠️  ${files.error}`, 'yellow');
        continue;
      }
      
      const projectFiles = files.files || [];
      log(`         📄 Files: ${projectFiles.length}`, 'green');
      
      projectFiles.forEach(file => {
        log(`            • ${file.name} (key: ${file.key})`, 'blue');
        allFiles.push({
          name: file.name,
          key: file.key,
          project: project.name,
          projectId: project.id,
          team: team.name,
          lastModified: file.lastModified,
        });
      });
    }
  }
  
  // Save all files to JSON
  if (allFiles.length > 0) {
    fs.writeFileSync(
      join(__dirname, '..', 'figma-all-files.json'),
      JSON.stringify(allFiles, null, 2)
    );
    log(`\n✅ Saved ${allFiles.length} files to figma-all-files.json`, 'green');
  }
  
  // Check for target project
}

async function tryDirectFileAccess() {
  log('3. File Access Information...', 'blue');
  log(`   💡 To access a file, use the file_key from the Figma URL`, 'blue');
  log(`      Example: https://www.figma.com/file/{file_key}/FileName`, 'blue');
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

exploreAccount().catch(console.error);


