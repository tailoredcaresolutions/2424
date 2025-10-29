#!/bin/bash

# PSW Voice Documentation System - Screenshot Capture Script
# This script captures screenshots of all pages for cataloguing and onboarding

echo "📸 Starting comprehensive screenshot capture..."
echo "================================================"

# Create screenshots directory
mkdir -p screenshots

# Array of all pages to capture
declare -a pages=(
    "http://localhost:3000|01-home-page|Home Page - Main Conversational Interface"
    "http://localhost:3000/reports|02-reports-page|Reports Page - View All Documentation"
    "http://localhost:3000/settings|03-settings-page|Settings Page - System Configuration"
    "http://localhost:3000/profile|04-profile-page|Profile Page - User Information"
    "http://localhost:3000/analytics|05-analytics-page|Analytics Page - Performance Metrics"
    "http://localhost:3000/search|06-search-page|Search Page - Find Reports"
    "http://localhost:3000/demo-dar|07-demo-dar-page|Demo DAR Page - Sample Reports"
    "http://localhost:3000/admin|08-admin-page|Admin Page - System Administration"
    "http://localhost:3000/admin/users|09-admin-users|Admin Users - User Management"
    "http://localhost:3000/admin/audit-logs|10-admin-audit|Admin Audit Logs - System Activity"
    "http://localhost:3000/admin/monitoring|11-admin-monitoring|Admin Monitoring - Health Dashboard"
    "http://localhost:3000/admin/backups|12-admin-backups|Admin Backups - Data Management"
)

# Function to capture screenshot using Node.js and Puppeteer
capture_screenshot() {
    local url=$1
    local filename=$2
    local description=$3
    
    echo "📸 Capturing: $description"
    echo "   URL: $url"
    echo "   File: screenshots/$filename.png"
    
    # Create a temporary Node.js script to capture screenshot
    cat > /tmp/capture_temp.js << 'ENDOFSCRIPT'
const puppeteer = require('puppeteer');

(async () => {
    const url = process.argv[2];
    const filename = process.argv[3];
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for animations
        await page.screenshot({ 
            path: filename,
            fullPage: true
        });
        console.log('✅ Screenshot captured successfully');
    } catch (error) {
        console.error('❌ Error capturing screenshot:', error.message);
    }
    
    await browser.close();
})();
ENDOFSCRIPT
    
    # Run the capture script
    node /tmp/capture_temp.js "$url" "screenshots/$filename.png"
    echo ""
}

# Capture all pages
for page_info in "${pages[@]}"; do
    IFS='|' read -r url filename description <<< "$page_info"
    capture_screenshot "$url" "$filename" "$description"
    sleep 2  # Brief pause between captures
done

# Clean up
rm -f /tmp/capture_temp.js

echo "================================================"
echo "✅ Screenshot capture complete!"
echo "📁 All screenshots saved to: ./screenshots/"
echo ""
echo "Total pages captured: ${#pages[@]}"
