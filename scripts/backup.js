#!/usr/bin/env node

/**
 * Backup CLI Tool
 *
 * Usage:
 *   node scripts/backup.js create          - Create a backup now
 *   node scripts/backup.js list            - List all backups
 *   node scripts/backup.js restore <file>  - Restore from backup
 *   node scripts/backup.js verify <file>   - Verify backup integrity
 *   node scripts/backup.js cleanup         - Clean up old backups
 *   node scripts/backup.js setup-cron      - Setup automated backups (every 6 hours)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

class BackupCLI {
  constructor() {
    require('dotenv').config({ path: '.env.local' });
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.dbPath = process.env.LOCAL_DB_PATH || './data/psw_data.db';

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true, mode: 0o700 });
    }
  }

  async createBackup() {
    console.log(`\n${colors.cyan}Creating database backup...${colors.reset}\n`);

    try {
      // Dynamic import of BackupService
      const { getBackupService } = await import('../lib/backup/backupService.js');
      const backupService = getBackupService();

      const result = await backupService.createBackup();

      if (result.success) {
        console.log(`${colors.green}✅ Backup created successfully!${colors.reset}`);
        console.log(`${colors.dim}   File: ${path.basename(result.backupPath)}${colors.reset}`);
        console.log(`${colors.dim}   Size: ${(result.size / 1024 / 1024).toFixed(2)} MB${colors.reset}`);
        console.log(`${colors.dim}   Duration: ${result.duration}ms${colors.reset}`);
        console.log(`${colors.dim}   Checksum: ${result.checksum.substring(0, 16)}...${colors.reset}\n`);
      } else {
        console.log(`${colors.red}❌ Backup failed: ${result.error}${colors.reset}\n`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      process.exit(1);
    }
  }

  async listBackups() {
    console.log(`\n${colors.cyan}Available Backups:${colors.reset}\n`);

    try {
      const { getBackupService } = await import('../lib/backup/backupService.js');
      const backupService = getBackupService();

      const backups = backupService.listBackups();

      if (backups.length === 0) {
        console.log(`${colors.yellow}No backups found${colors.reset}\n`);
        return;
      }

      backups.forEach((backup, index) => {
        const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
        const date = backup.date.toLocaleString();

        console.log(`${colors.green}${index + 1}.${colors.reset} ${backup.filename}`);
        console.log(`   ${colors.dim}Size: ${sizeMB} MB${colors.reset}`);
        console.log(`   ${colors.dim}Date: ${date}${colors.reset}`);
        console.log();
      });

      console.log(`${colors.dim}Total backups: ${backups.length}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      process.exit(1);
    }
  }

  async restoreBackup(filename) {
    if (!filename) {
      console.error(`${colors.red}Error: Filename required${colors.reset}`);
      console.log(`Usage: node scripts/backup.js restore <filename>\n`);
      process.exit(1);
    }

    console.log(`\n${colors.yellow}⚠️  WARNING: This will overwrite the current database!${colors.reset}`);
    console.log(`${colors.dim}Restoring from: ${filename}${colors.reset}\n`);

    // In production, you'd want to add confirmation prompt here

    try {
      const { getBackupService } = await import('../lib/backup/backupService.js');
      const backupService = getBackupService();

      const success = await backupService.restoreBackup(filename);

      if (success) {
        console.log(`${colors.green}✅ Database restored successfully!${colors.reset}\n`);
      } else {
        console.log(`${colors.red}❌ Restore failed${colors.reset}\n`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      process.exit(1);
    }
  }

  async verifyBackup(filename) {
    if (!filename) {
      console.error(`${colors.red}Error: Filename required${colors.reset}`);
      console.log(`Usage: node scripts/backup.js verify <filename>\n`);
      process.exit(1);
    }

    console.log(`\n${colors.cyan}Verifying backup integrity...${colors.reset}\n`);

    try {
      const { getBackupService } = await import('../lib/backup/backupService.js');
      const backupService = getBackupService();

      const isValid = await backupService.verifyBackup(filename);

      if (isValid) {
        console.log(`${colors.green}✅ Backup integrity verified!${colors.reset}\n`);
      } else {
        console.log(`${colors.red}❌ Backup integrity check failed${colors.reset}\n`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      process.exit(1);
    }
  }

  async setupCron() {
    console.log(`\n${colors.cyan}Setting up automated backups...${colors.reset}\n`);

    const scriptPath = path.join(process.cwd(), 'scripts', 'backup.js');
    const cronExpression = '0 */6 * * *'; // Every 6 hours

    console.log(`${colors.dim}Backup schedule: Every 6 hours${colors.reset}`);
    console.log(`${colors.dim}Cron expression: ${cronExpression}${colors.reset}\n`);

    // Create a launchd plist for macOS
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.psw.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/opt/node@22/bin/node</string>
        <string>${scriptPath}</string>
        <string>create</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer>
    <key>StandardOutPath</key>
    <string>${path.join(process.cwd(), 'logs', 'backup.log')}</string>
    <key>StandardErrorPath</key>
    <string>${path.join(process.cwd(), 'logs', 'backup-error.log')}</string>
</dict>
</plist>`;

    const plistPath = path.join(process.env.HOME, 'Library', 'LaunchAgents', 'com.psw.backup.plist');

    // Create logs directory
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Write plist file
    fs.writeFileSync(plistPath, plistContent);

    console.log(`${colors.green}✅ Launchd plist created${colors.reset}`);
    console.log(`${colors.dim}   Location: ${plistPath}${colors.reset}\n`);

    console.log(`${colors.cyan}To activate the automated backup:${colors.reset}`);
    console.log(`${colors.dim}   launchctl load ${plistPath}${colors.reset}\n`);

    console.log(`${colors.cyan}To deactivate:${colors.reset}`);
    console.log(`${colors.dim}   launchctl unload ${plistPath}${colors.reset}\n`);

    console.log(`${colors.cyan}To check status:${colors.reset}`);
    console.log(`${colors.dim}   launchctl list | grep psw.backup${colors.reset}\n`);

    console.log(`${colors.cyan}Manual activation (recommended):${colors.reset}`);
    console.log(`${colors.yellow}   launchctl load ${plistPath}${colors.reset}\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const cli = new BackupCLI();

  if (!command || command === 'help') {
    console.log(`
${colors.cyan}PSW Database Backup Tool${colors.reset}

${colors.dim}Usage:${colors.reset}
  node scripts/backup.js ${colors.green}create${colors.reset}          - Create a backup now
  node scripts/backup.js ${colors.green}list${colors.reset}            - List all backups
  node scripts/backup.js ${colors.green}restore${colors.reset} <file>  - Restore from backup
  node scripts/backup.js ${colors.green}verify${colors.reset} <file>   - Verify backup integrity
  node scripts/backup.js ${colors.green}cleanup${colors.reset}         - Clean up old backups
  node scripts/backup.js ${colors.green}setup-cron${colors.reset}      - Setup automated backups

${colors.dim}Examples:${colors.reset}
  # Create a backup
  node scripts/backup.js create

  # List all available backups
  node scripts/backup.js list

  # Restore from a specific backup
  node scripts/backup.js restore psw_backup_2025-10-24T03-00-00-000Z.db.gz

  # Verify backup integrity
  node scripts/backup.js verify psw_backup_2025-10-24T03-00-00-000Z.db.gz

  # Setup automated backups (every 6 hours)
  node scripts/backup.js setup-cron
    `);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'create':
        await cli.createBackup();
        break;

      case 'list':
        await cli.listBackups();
        break;

      case 'restore':
        await cli.restoreBackup(args[1]);
        break;

      case 'verify':
        await cli.verifyBackup(args[1]);
        break;

      case 'setup-cron':
        await cli.setupCron();
        break;

      default:
        console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
        console.log(`Run: node scripts/backup.js help`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
