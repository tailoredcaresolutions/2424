/**
 * Key Manager - PSW Voice Documentation System
 *
 * Secure key management with encryption and rotation capabilities
 * Uses AES-256-GCM for encryption with key derivation via PBKDF2
 *
 * Security Features:
 * - AES-256-GCM encryption for sensitive keys
 * - PBKDF2 key derivation (310,000 iterations - OWASP 2025)
 * - Automatic key rotation tracking
 * - Audit logging for key access
 * - HIPAA 2025 compliant
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { log as logger } from '../logger.js';

// Encryption configuration (OWASP 2025 recommendations)
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 310000; // OWASP 2025: 310,000 iterations for PBKDF2-SHA256

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
  salt: string;
}

interface KeyMetadata {
  keyId: string;
  createdAt: string;
  lastRotated: string;
  rotationCount: number;
  algorithm: string;
  purpose: string;
}

export class KeyManager {
  private masterKey: Buffer | null = null;
  private keyStorePath: string;
  private metadataPath: string;

  constructor() {
    this.keyStorePath = path.join(
      process.cwd(),
      '.keys',
      'encrypted-keys.json'
    );
    this.metadataPath = path.join(process.cwd(), '.keys', 'key-metadata.json');

    // Ensure .keys directory exists
    const keysDir = path.dirname(this.keyStorePath);
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { mode: 0o700 }); // Only owner can read/write/execute
    }
  }

  /**
   * Initialize the key manager with a master password
   * In production, this should come from a secure source (HSM, KMS, etc.)
   */
  public initialize(masterPassword: string): void {
    if (!masterPassword || masterPassword.length < 32) {
      throw new Error('Master password must be at least 32 characters');
    }

    // Derive master key from password using PBKDF2
    const salt = this.getOrCreateMasterSalt();
    this.masterKey = crypto.pbkdf2Sync(
      masterPassword,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );

    logger.info(
      { type: 'key_manager_init' },
      'Key manager initialized successfully'
    );
  }

  /**
   * Encrypt a sensitive value (e.g., database encryption key, API key)
   */
  public encryptKey(
    plaintext: string,
    keyId: string,
    purpose: string
  ): EncryptedData {
    if (!this.masterKey) {
      throw new Error('Key manager not initialized. Call initialize() first.');
    }

    // Generate random IV and salt for this encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive encryption key from master key + salt (additional security layer)
    const derivedKey = crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );

    // Encrypt using AES-256-GCM
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag (GCM provides authenticated encryption)
    const authTag = cipher.getAuthTag();

    // Store metadata
    this.saveKeyMetadata(keyId, purpose);

    // Log encryption event (without sensitive data)
    logger.info(
      { type: 'key_encrypted', keyId, purpose },
      `Key encrypted: ${keyId}`
    );

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex'),
    };
  }

  /**
   * Decrypt a previously encrypted value
   */
  public decryptKey(encryptedData: EncryptedData): string {
    if (!this.masterKey) {
      throw new Error('Key manager not initialized. Call initialize() first.');
    }

    try {
      // Parse encrypted data
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const encrypted = encryptedData.encrypted;

      // Derive the same encryption key
      const derivedKey = crypto.pbkdf2Sync(
        this.masterKey,
        salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        'sha256'
      );

      // Decrypt using AES-256-GCM
      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error(
        {
          type: 'key_decryption_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to decrypt key'
      );
      throw new Error('Decryption failed: Invalid key or corrupted data');
    }
  }

  /**
   * Rotate a key (re-encrypt with new salt and IV)
   */
  public rotateKey(
    keyId: string,
    currentEncryptedData: EncryptedData
  ): EncryptedData {
    // Decrypt the current value
    const plaintext = this.decryptKey(currentEncryptedData);

    // Get metadata and update rotation count
    const metadata = this.getKeyMetadata(keyId);
    if (metadata) {
      metadata.lastRotated = new Date().toISOString();
      metadata.rotationCount += 1;
      this.saveKeyMetadataObject(keyId, metadata);
    }

    // Re-encrypt with new IV and salt
    const newEncrypted = this.encryptKey(
      plaintext,
      keyId,
      metadata?.purpose || 'unknown'
    );

    logger.info(
      { type: 'key_rotated', keyId, rotationCount: metadata?.rotationCount },
      `Key rotated: ${keyId}`
    );

    return newEncrypted;
  }

  /**
   * Generate a cryptographically secure random key
   */
  public static generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Check if a key should be rotated (>90 days old - OWASP recommendation)
   */
  public shouldRotateKey(keyId: string): boolean {
    const metadata = this.getKeyMetadata(keyId);
    if (!metadata) return false;

    const lastRotated = new Date(metadata.lastRotated);
    const daysSinceRotation =
      (Date.now() - lastRotated.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceRotation > 90; // 90-day rotation policy
  }

  /**
   * Get or create master salt for password derivation
   */
  private getOrCreateMasterSalt(): Buffer {
    const saltPath = path.join(process.cwd(), '.keys', 'master.salt');

    if (fs.existsSync(saltPath)) {
      return fs.readFileSync(saltPath);
    }

    // Create new salt
    const salt = crypto.randomBytes(SALT_LENGTH);
    fs.writeFileSync(saltPath, salt, { mode: 0o600 }); // Only owner can read/write
    return salt;
  }

  /**
   * Save key metadata for audit and rotation tracking
   */
  private saveKeyMetadata(keyId: string, purpose: string): void {
    const metadata: KeyMetadata = {
      keyId,
      createdAt: new Date().toISOString(),
      lastRotated: new Date().toISOString(),
      rotationCount: 0,
      algorithm: ALGORITHM,
      purpose,
    };

    this.saveKeyMetadataObject(keyId, metadata);
  }

  /**
   * Save key metadata object
   */
  private saveKeyMetadataObject(keyId: string, metadata: KeyMetadata): void {
    let allMetadata: Record<string, KeyMetadata> = {};

    if (fs.existsSync(this.metadataPath)) {
      const content = fs.readFileSync(this.metadataPath, 'utf8');
      allMetadata = JSON.parse(content);
    }

    allMetadata[keyId] = metadata;
    fs.writeFileSync(this.metadataPath, JSON.stringify(allMetadata, null, 2), {
      mode: 0o600,
    });
  }

  /**
   * Get key metadata
   */
  private getKeyMetadata(keyId: string): KeyMetadata | null {
    if (!fs.existsSync(this.metadataPath)) {
      return null;
    }

    const content = fs.readFileSync(this.metadataPath, 'utf8');
    const allMetadata: Record<string, KeyMetadata> = JSON.parse(content);
    return allMetadata[keyId] || null;
  }

  /**
   * List all managed keys (without revealing values)
   */
  public listKeys(): KeyMetadata[] {
    if (!fs.existsSync(this.metadataPath)) {
      return [];
    }

    const content = fs.readFileSync(this.metadataPath, 'utf8');
    const allMetadata: Record<string, KeyMetadata> = JSON.parse(content);
    return Object.values(allMetadata);
  }

  /**
   * Validate key strength
   */
  public static validateKeyStrength(key: string): {
    valid: boolean;
    reason?: string;
  } {
    if (key.length < 32) {
      return {
        valid: false,
        reason: 'Key must be at least 32 characters (256 bits)',
      };
    }

    // Check for hex format (if applicable)
    if (key.length === 64 && !/^[0-9a-f]{64}$/i.test(key)) {
      return { valid: false, reason: 'Invalid hex format for 256-bit key' };
    }

    return { valid: true };
  }
}

// Singleton instance
let keyManagerInstance: KeyManager | null = null;

/**
 * Get the global key manager instance
 */
export function getKeyManager(): KeyManager {
  if (!keyManagerInstance) {
    keyManagerInstance = new KeyManager();
  }
  return keyManagerInstance;
}

/**
 * Initialize key manager from environment
 * Loads the master password from MASTER_KEY_PASSWORD env variable
 */
export function initializeKeyManagerFromEnv(): KeyManager {
  const keyManager = getKeyManager();

  const masterPassword = process.env.MASTER_KEY_PASSWORD;
  if (!masterPassword) {
    throw new Error(
      'MASTER_KEY_PASSWORD environment variable not set. ' +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  keyManager.initialize(masterPassword);
  return keyManager;
}
