#!/usr/bin/env node
/**
 * V0 Component Generator - Programmatic Interface
 * 
 * This script allows AI assistants to generate components via V0 API
 * Usage: node scripts/generate-v0-component.js "Create a button with loading state"
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const V0_API_KEY = process.env.V0_API_KEY

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gold: '\x1b[38;5;220m',
  navy: '\x1b[38;5;17m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function generateComponent(prompt, options = {}) {
  // Validate API key
  if (!V0_API_KEY || V0_API_KEY === 'your_v0_api_key_here') {
    log('\n❌ ERROR: V0_API_KEY not configured!', 'red')
    log('\nTo use V0 API programmatically:', 'yellow')
    log('1. Get your API key from: https://v0.dev/chat/settings/keys', 'yellow')
    log('2. Edit .env.local and replace V0_API_KEY value', 'yellow')
    log('3. Run this script again\n', 'yellow')
    process.exit(1)
  }

  try {
    log('\n🎨 Generating component with V0 API...', 'blue')
    log(`📝 Prompt: "${prompt}"`, 'navy')
    
    // Create chat with component generation request
    const chat = await v0.chats.create({
      message: prompt,
      system: options.system || 'You are an expert React developer. Create clean, accessible components using Tailwind CSS with navy (#0E1535, #1B365D) and gold (#E3A248, #D4A574) colors for the Tailored Care Solutions brand.',
      chatPrivacy: options.privacy || 'private',
      modelConfiguration: {
        modelId: 'v0-1.5-md',
        imageGenerations: options.imageGenerations !== false,
      }
    })

    log('\n✅ Component generated successfully!', 'green')
    log('\n📊 Details:', 'bright')
    log(`   Chat ID: ${chat.id}`, 'navy')
    log(`   Web URL: ${chat.webUrl}`, 'blue')
    
    if (chat.latestVersion) {
      log(`   Version ID: ${chat.latestVersion.id}`, 'navy')
      log(`   Preview URL: ${chat.latestVersion.demoUrl}`, 'gold')
      log(`   Component ID: ${chat.id}`, 'navy')
    }

    log('\n📦 To add this component to your project:', 'bright')
    log(`   v0 add ${chat.id}`, 'green')
    
    log('\n🌐 Open in browser to view and customize:', 'bright')
    log(`   ${chat.webUrl}`, 'blue')

    return {
      success: true,
      chatId: chat.id,
      webUrl: chat.webUrl,
      previewUrl: chat.latestVersion?.demoUrl,
      versionId: chat.latestVersion?.id
    }

  } catch (error) {
    log('\n❌ ERROR generating component:', 'red')
    
    if (error.status === 403) {
      log('   Authentication error - Invalid API key', 'red')
      log('   Get a new key from: https://v0.dev/chat/settings/keys', 'yellow')
    } else if (error.status === 429) {
      log('   Rate limit exceeded - Please wait and try again', 'red')
    } else {
      log(`   ${error.message}`, 'red')
    }
    
    return {
      success: false,
      error: error.message
    }
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2]
  
  if (!prompt) {
    log('\n📘 Usage:', 'bright')
    log('   node scripts/generate-v0-component.js "Create a button with loading state"', 'blue')
    log('\n📖 Examples:', 'bright')
    log('   node scripts/generate-v0-component.js "Create a quality toggle with 3 options: Fast, Balanced, Maximum"', 'navy')
    log('   node scripts/generate-v0-component.js "Create a voice profile dropdown with Professional Female, Calm Male, Warm Female"', 'navy')
    log('   node scripts/generate-v0-component.js "Create a status badge with processing (gold), success (green), error (red)"', 'navy')
    log('\n✨ AI Assistant can call this programmatically!\n', 'gold')
    process.exit(0)
  }

  generateComponent(prompt)
    .then(result => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch(error => {
      log(`\n❌ Unexpected error: ${error.message}`, 'red')
      process.exit(1)
    })
}

export { generateComponent }
