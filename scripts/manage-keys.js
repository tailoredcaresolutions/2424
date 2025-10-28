#!/usr/bin/env node

/**
 * Key Management CLI Tool
 *
 * Usage:
 *   node scripts/manage-keys.js generate <key-id> <purpose>
 *   node scripts/manage-keys.js encrypt <key-id> <value> <purpose>
 *   node scripts/manage-keys.js decrypt <key-id>
 *   node scripts/manage-keys.js rotate <key-id>
 *   node scripts/manage-keys.js list
 *   node scripts/manage-keys.js check-rotation
 *
 * Environment:
 *   MASTER_KEY_PASSWORD - Master password for key encryption (required)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Simple console colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

class SimpleKeyManager {
  constructor() {
    this.keyStorePath = path.join(process.cwd(), '.keys', 'encrypted-keys.json');
    this.metadataPath = path.join(process.cwd(), '.keys', 'key-metadata.json');
    this.masterKey = null;

    const keysDir = path.dirname(this.keyStorePath);
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { mode: 0o700, recursive: true });
    }
  }

  initialize(masterPassword) {
    if (!masterPassword || masterPassword.length < 32) {
      throw new Error('Master password must be at least 32 characters');
    }

    const salt = this.getOrCreateMasterSalt();
    this.masterKey = crypto.pbkdf2Sync(masterPassword, salt, 310000, 32, 'sha256');
  }

  encryptKey(plaintext, keyId, purpose) {
    if (!this.masterKey) throw new Error('Not initialized');

    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(32);
    const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, 310000, 32, 'sha256');

    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    const encryptedData = {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex'),
    };

    this.saveEncryptedKey(keyId, encryptedData, purpose);
    return encryptedData;
  }

  decryptKey(keyId) {
    if (!this.masterKey) throw new Error('Not initialized');

    const encryptedData = this.loadEncryptedKey(keyId);
    if (!encryptedData) throw new Error(`Key not found: ${keyId}`);

    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const salt = Buffer.from(encryptedData.salt, 'hex');

    const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, 310000, 32, 'sha256');

    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  rotateKey(keyId) {
    const plaintext = this.decryptKey(keyId);
    const metadata = this.getKeyMetadata(keyId);

    if (metadata) {
      metadata.lastRotated = new Date().toISOString();
      metadata.rotationCount = (metadata.rotationCount || 0) + 1;
      this.saveKeyMetadataObject(keyId, metadata);
    }

    return this.encryptKey(plaintext, keyId, metadata?.purpose || 'unknown');
  }

  saveEncryptedKey(keyId, encryptedData, purpose) {
    let allKeys = {};
    if (fs.existsSync(this.keyStorePath)) {
      allKeys = JSON.parse(fs.readFileSync(this.keyStorePath, 'utf8'));
    }

    allKeys[keyId] = encryptedData;
    fs.writeFileSync(this.keyStorePath, JSON.stringify(allKeys, null, 2), { mode: 0o600 });

    const metadata = {
      keyId,
      createdAt: new Date().toISOString(),
      lastRotated: new Date().toISOString(),
      rotationCount: 0,
      algorithm: 'aes-256-gcm',
      purpose,
    };
    this.saveKeyMetadataObject(keyId, metadata);
  }

  loadEncryptedKey(keyId) {
    if (!fs.existsSync(this.keyStorePath)) return null;
    const allKeys = JSON.parse(fs.readFileSync(this.keyStorePath, 'utf8'));
    return allKeys[keyId] || null;
  }

  getKeyMetadata(keyId) {
    if (!fs.existsSync(this.metadataPath)) return null;
    const allMetadata = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
    return allMetadata[keyId] || null;
  }

  saveKeyMetadataObject(keyId, metadata) {
    let allMetadata = {};
    if (fs.existsSync(this.metadataPath)) {
      allMetadata = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
    }
    allMetadata[keyId] = metadata;
    fs.writeFileSync(this.metadataPath, JSON.stringify(allMetadata, null, 2), { mode: 0o600 });
  }

  listKeys() {
    if (!fs.existsSync(this.metadataPath)) return [];
    const allMetadata = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
    return Object.values(allMetadata);
  }

  shouldRotateKey(keyId) {
    const metadata = this.getKeyMetadata(keyId);
    if (!metadata) return false;

    const lastRotated = new Date(metadata.lastRotated);
    const daysSinceRotation = (Date.now() - lastRotated.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceRotation > 90;
  }

  getOrCreateMasterSalt() {
    const saltPath = path.join(process.cwd(), '.keys', 'master.salt');
    if (fs.existsSync(saltPath)) {
      return fs.readFileSync(saltPath);
    }
    const salt = crypto.randomBytes(32);
    fs.writeFileSync(saltPath, salt, { mode: 0o600 });
    return salt;
  }
}

async function readPassword(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Hide input
  const stdin = process.stdin;
  const wasRaw = stdin.isRaw;
  if (stdin.setRawMode) stdin.setRawMode(true);

  return new Promise((resolve) => {
    rl.question(prompt, (password) => {
      if (stdin.setRawMode) stdin.setRawMode(wasRaw);
      rl.close();
      console.log(); // New line after password
      resolve(password);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    console.log(`
${colors.cyan}PSW Key Management Tool${colors.reset}

${colors.dim}Usage:${colors.reset}
  node scripts/manage-keys.js ${colors.green}generate${colors.reset} <key-id> <purpose>
  node scripts/manage-keys.js ${colors.green}encrypt${colors.reset} <key-id> <value> <purpose>
  node scripts/manage-keys.js ${colors.green}decrypt${colors.reset} <key-id>
  node scripts/manage-keys.js ${colors.green}rotate${colors.reset} <key-id>
  node scripts/manage-keys.js ${colors.green}list${colors.reset}
  node scripts/manage-keys.js ${colors.green}check-rotation${colors.reset}

${colors.dim}Environment:${colors.reset}
  MASTER_KEY_PASSWORD - Master password (min 32 chars)

${colors.dim}Examples:${colors.reset}
  # Generate a new random key
  node scripts/manage-keys.js generate DATABASE_KEY "Database encryption"

  # Encrypt a specific value
  node scripts/manage-keys.js encrypt API_KEY "sk-abc123" "External API key"

  # Decrypt a key
  node scripts/manage-keys.js decrypt DATABASE_KEY

  # Rotate a key
  node scripts/manage-keys.js rotate DATABASE_KEY

  # List all keys
  node scripts/manage-keys.js list

  # Check which keys need rotation
  node scripts/manage-keys.js check-rotation
    `);
    process.exit(0);
  }

  try {
    const keyManager = new SimpleKeyManager();

    // Get master password
    let masterPassword = process.env.MASTER_KEY_PASSWORD;
    if (!masterPassword) {
      console.log(`${colors.yellow}⚠️  MASTER_KEY_PASSWORD not set${colors.reset}`);
      masterPassword = await readPassword('Enter master password (min 32 chars): ');
    }

    keyManager.initialize(masterPassword);

    switch (command) {
      case 'generate': {
        const keyId = args[1];
        const purpose = args[2] || 'General purpose';

        if (!keyId) {
          console.error(`${colors.red}Error: key-id required${colors.reset}`);
          process.exit(1);
        }

        const randomKey = crypto.randomBytes(32).toString('hex');
        keyManager.encryptKey(randomKey, keyId, purpose);

        console.log(`${colors.green}✅ Generated and encrypted key: ${keyId}${colors.reset}`);
        console.log(`${colors.dim}Purpose: ${purpose}${colors.reset}`);
        console.log(`\n${colors.cyan}Generated value:${colors.reset}`);
        console.log(randomKey);
        break;
      }

      case 'encrypt': {
        const keyId = args[1];
        const value = args[2];
        const purpose = args[3] || 'General purpose';

        if (!keyId || !value) {
          console.error(`${colors.red}Error: key-id and value required${colors.reset}`);
          process.exit(1);
        }

        keyManager.encryptKey(value, keyId, purpose);

        console.log(`${colors.green}✅ Encrypted key: ${keyId}${colors.reset}`);
        console.log(`${colors.dim}Purpose: ${purpose}${colors.reset}`);
        break;
      }

      case 'decrypt': {
        const keyId = args[1];

        if (!keyId) {
          console.error(`${colors.red}Error: key-id required${colors.reset}`);
          process.exit(1);
        }

        const decrypted = keyManager.decryptKey(keyId);

        console.log(`${colors.green}✅ Decrypted key: ${keyId}${colors.reset}`);
        console.log(`\n${colors.cyan}Value:${colors.reset}`);
        console.log(decrypted);
        break;
      }

      case 'rotate': {
        const keyId = args[1];

        if (!keyId) {
          console.error(`${colors.red}Error: key-id required${colors.reset}`);
          process.exit(1);
        }

        keyManager.rotateKey(keyId);

        console.log(`${colors.green}✅ Rotated key: ${keyId}${colors.reset}`);
        console.log(`${colors.dim}Key has been re-encrypted with new salt and IV${colors.reset}`);
        break;
      }

      case 'list': {
        const keys = keyManager.listKeys();

        if (keys.length === 0) {
          console.log(`${colors.yellow}No keys found${colors.reset}`);
          process.exit(0);
        }

        console.log(`${colors.cyan}Managed Keys:${colors.reset}\n`);

        keys.forEach((key) => {
          const needsRotation = keyManager.shouldRotateKey(key.keyId);
          const rotationIcon = needsRotation ? `${colors.red}⚠️ ` : `${colors.green}✓ `;

          console.log(`${rotationIcon}${colors.reset}${key.keyId}`);
          console.log(`  ${colors.dim}Purpose: ${key.purpose}${colors.reset}`);
          console.log(`  ${colors.dim}Created: ${new Date(key.createdAt).toLocaleDateString()}${colors.reset}`);
          console.log(`  ${colors.dim}Last Rotated: ${new Date(key.lastRotated).toLocaleDateString()}${colors.reset}`);
          console.log(`  ${colors.dim}Rotations: ${key.rotationCount}${colors.reset}`);
          console.log();
        });
        break;
      }

      case 'check-rotation': {
        const keys = keyManager.listKeys();
        const keysNeedingRotation = keys.filter((key) => keyManager.shouldRotateKey(key.keyId));

        if (keysNeedingRotation.length === 0) {
          console.log(`${colors.green}✅ All keys are up to date${colors.reset}`);
          process.exit(0);
        }

        console.log(`${colors.yellow}⚠️  ${keysNeedingRotation.length} key(s) need rotation (>90 days):${colors.reset}\n`);

        keysNeedingRotation.forEach((key) => {
          const lastRotated = new Date(key.lastRotated);
          const daysSince = Math.floor((Date.now() - lastRotated.getTime()) / (1000 * 60 * 60 * 24));

          console.log(`${colors.red}• ${key.keyId}${colors.reset}`);
          console.log(`  ${colors.dim}Last rotated: ${daysSince} days ago${colors.reset}`);
        });

        console.log(`\n${colors.dim}Run: node scripts/manage-keys.js rotate <key-id>${colors.reset}`);
        break;
      }

      default:
        console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
        console.log(`Run: node scripts/manage-keys.js help`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
