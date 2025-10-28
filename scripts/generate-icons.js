/**
 * Icon Generation Script
 * Generates PNG icons from SVG for PWA support
 *
 * Requirements: npm install sharp
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to load sharp, fall back to documentation if not available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Install with: npm install --save-dev sharp');
  console.log('📝 Generating icons requires sharp library for SVG to PNG conversion');
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SVG_PATH = path.join(PUBLIC_DIR, 'icon.svg');

const ICON_SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  // Read SVG file
  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const { size, name } of ICON_SIZES) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(PUBLIC_DIR, name));

      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate ICO file (favicon.ico) from 32x32 PNG
  try {
    const png32Path = path.join(PUBLIC_DIR, 'favicon-32x32.png');
    const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');

    // Copy 32x32 PNG as ICO (modern browsers support PNG-based ICO)
    fs.copyFileSync(png32Path, icoPath);
    console.log(`✅ Generated favicon.ico`);
  } catch (error) {
    console.error(`❌ Failed to generate favicon.ico:`, error.message);
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('📁 Generated files in public/ directory:');
  console.log('   - icon-192.png (PWA)');
  console.log('   - icon-512.png (PWA)');
  console.log('   - apple-touch-icon.png (iOS)');
  console.log('   - favicon.ico (Browser tab)');
  console.log('   - favicon-32x32.png');
  console.log('   - favicon-16x16.png');
}

// Run generation
generateIcons().catch(error => {
  console.error('❌ Icon generation failed:', error);
  process.exit(1);
});
